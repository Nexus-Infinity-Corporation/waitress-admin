import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { withSupabaseQueue } from "./request-queue";

/**
 * Global admin client instance (singleton pattern)
 * This prevents connection pool exhaustion by reusing the same client instance
 */
let adminClient: SupabaseClient | null = null;

/**
 * Custom fetch implementation with connection pooling and aggressive retry logic
 * This helps prevent 503 errors by properly managing HTTP connections
 *
 * Implements exponential backoff retry strategy for 503 errors:
 * - Retry up to 3 times
 * - Exponential backoff: 1s, 2s, 4s
 * - Total max wait: ~7 seconds before giving up
 */
function createFetchWithPooling(): typeof fetch {
  const MAX_RETRIES = 5; // Increased from 3 to 5
  const INITIAL_RETRY_DELAY = 2000; // Increased from 1s to 2s for first retry

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    // Wrap the entire fetch operation in the global queue to limit concurrency
    return withSupabaseQueue(async () => {
      return await performFetchWithRetry(input, init);
    });
  };

  async function performFetchWithRetry(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    // Properly merge headers - handle both Headers object and plain object
    const headers = new Headers(init?.headers);
    headers.set("Connection", "keep-alive");

    // Retry logic with exponential backoff (longer delays for pool recovery)
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Increased to 45s timeout per attempt

      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
          // Enable keepAlive for connection reuse
          keepalive: true,
          // Use properly merged headers (preserves all Supabase headers including API key)
          headers,
        });

        // If successful or non-503 error, return immediately
        if (response.status !== 503) {
          clearTimeout(timeoutId);
          return response;
        }

        // 503 error - log and retry with exponential backoff (longer delays)
        if (attempt < MAX_RETRIES) {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s (total ~62s max wait)
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.warn(
            `[Supabase Admin] Received 503 (attempt ${attempt + 1}/${MAX_RETRIES + 1}), ` +
              `retrying in ${delay}ms... (${url})`
          );

          clearTimeout(timeoutId);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue; // Retry
        } else {
          // Last attempt failed
          clearTimeout(timeoutId);
          console.error(
            `[Supabase Admin] All ${MAX_RETRIES + 1} attempts failed with 503 error (${url})`
          );
          return response; // Return the 503 response
        }
      } catch (error) {
        clearTimeout(timeoutId);

        // If it's the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          throw error instanceof Error ? error : new Error(String(error));
        }

        // For network errors, retry with exponential backoff
        if (error instanceof Error && error.name === "AbortError") {
          // Timeout - don't retry
          throw error;
        }

        lastError = error instanceof Error ? error : new Error(String(error));
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.warn(
          `[Supabase Admin] Request error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), ` +
            `retrying in ${delay}ms... (${url})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new Error("Unknown error in fetch retry logic");
  }
}

/**
 * Creates or returns the singleton Supabase admin client with service role/secret key
 * This client bypasses Row-Level Security (RLS) policies
 *
 * ⚠️ WARNING: Only use this for server-side admin operations
 * Never expose the service role/secret key in client-side code
 *
 * Uses singleton pattern to prevent connection pool exhaustion (503 errors)
 *
 * @returns Supabase admin client (singleton instance)
 * @throws Error if service role key is not configured
 */
export function createAdminClient(): SupabaseClient {
  // Return existing client if already created (singleton pattern)
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Support both new (SUPABASE_SECRET_KEY) and legacy (SUPABASE_SERVICE_ROLE_KEY) naming
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is not set. " +
        "Admin operations require a service role key."
    );
  }

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  }

  // Create singleton client with connection pooling configuration
  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Use custom fetch with connection pooling and retry logic
      // Note: We don't set global.headers here to avoid overriding Supabase's API key headers
      fetch: createFetchWithPooling(),
    },
    db: {
      schema: "public",
    },
  });

  return adminClient;
}

/**
 * Wraps admin client operations in the global request queue to limit concurrent requests
 * This prevents overwhelming the connection pool with too many simultaneous requests
 *
 * Note: The fetch layer already queues requests, but this provides an additional
 * layer of control for complex operations that make multiple queries.
 *
 * @param operation Function that performs the Supabase operation
 * @returns Result of the operation
 */
export async function withAdminClient<T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const client = createAdminClient();
  // Use global queue (fetch is already queued, but this adds extra safety for multi-query operations)
  return withSupabaseQueue(() => operation(client));
}
