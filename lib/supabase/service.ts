/**
 * Centralized Supabase Service Layer
 *
 * This module provides a unified interface for all Supabase operations.
 * It handles:
 * - Automatic client selection (admin vs regular)
 * - Request queuing
 * - Retry logic
 * - Error handling
 *
 * Services should use these functions instead of creating clients directly.
 */

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient, withAdminClient } from "@/lib/supabase/admin";
import { SupabaseClient } from "@supabase/supabase-js";
import { withSupabaseQueue } from "./request-queue";

/**
 * Determines if admin client should be used
 * Admin client bypasses RLS and should be used when service role key is available
 */
function shouldUseAdminClient(): boolean {
  return !!(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Gets the appropriate Supabase client for the operation
 * - Uses admin client if service role key is available (bypasses RLS)
 * - Falls back to regular server client otherwise
 */
async function getSupabaseClient(): Promise<SupabaseClient> {
  if (shouldUseAdminClient()) {
    return createAdminClient();
  }
  return await createServerClient();
}

/**
 * Executes a Supabase operation with automatic client selection, queuing, and retry logic
 *
 * @param operation Function that performs the Supabase operation
 * @param options Configuration options
 * @returns Result of the operation
 */
export async function executeSupabaseOperation<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  options: {
    useAdminClient?: boolean; // Force admin client usage
    retries?: number; // Number of retries (default: 0, uses fetch-level retries)
  } = {}
): Promise<T> {
  const { useAdminClient = shouldUseAdminClient(), retries = 0 } = options;

  // Wrap in retry logic if specified
  const executeWithRetries = async (): Promise<T> => {
    if (retries === 0) {
      // No service-level retries, rely on fetch-level retries
      return executeOperation();
    }

    // Service-level retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await executeOperation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRetryableError =
          error instanceof Error &&
          (error.message.includes("503") ||
            error.message.includes("Could not query the database") ||
            error.message.includes("connection") ||
            error.message.includes("pool"));

        if (!isRetryableError || attempt === retries) {
          throw lastError;
        }

        const delay = 1000 * Math.pow(2, attempt);
        console.warn(
          `[Supabase Service] Operation failed (attempt ${attempt + 1}/${retries + 1}), ` +
            `retrying in ${delay}ms... Error: ${lastError.message}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error("Unknown error in retry logic");
  };

  const executeOperation = async (): Promise<T> => {
    if (useAdminClient) {
      // Use admin client with queue wrapper
      return withAdminClient(operation);
    } else {
      // Use regular client with queue
      const client = await getSupabaseClient();
      return withSupabaseQueue(() => operation(client));
    }
  };

  return executeWithRetries();
}

/**
 * Convenience function for read operations
 * Automatically uses admin client if available
 */
export async function readFromSupabase<T>(
  operation: (
    client: SupabaseClient
  ) => Promise<{ data: T | null; error: Error | null }>,
  options: { retries?: number } = {}
): Promise<T> {
  const { data, error } = await executeSupabaseOperation(operation, {
    useAdminClient: shouldUseAdminClient(),
    retries: options.retries,
  });

  if (error) {
    throw new Error(`Supabase read operation failed: ${error.message}`);
  }

  return data as T;
}

/**
 * Convenience function for write operations
 * Automatically uses admin client if available
 */
export async function writeToSupabase<T>(
  operation: (
    client: SupabaseClient
  ) => Promise<{ data: T | null; error: Error | null }>,
  options: { retries?: number } = {}
): Promise<T> {
  const { data, error } = await executeSupabaseOperation(operation, {
    useAdminClient: shouldUseAdminClient(),
    retries: options.retries,
  });

  if (error) {
    throw new Error(`Supabase write operation failed: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase write operation returned no data");
  }

  return data;
}

/**
 * Convenience function for admin-only operations
 * Forces admin client usage (throws if admin key not available)
 */
export async function adminOperation<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  options: { retries?: number } = {}
): Promise<T> {
  if (!shouldUseAdminClient()) {
    throw new Error(
      "Admin operation requires SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return executeSupabaseOperation(operation, {
    useAdminClient: true,
    retries: options.retries,
  });
}
