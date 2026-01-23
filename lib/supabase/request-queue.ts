/**
 * Global request queue to limit concurrent Supabase requests
 * This prevents connection pool exhaustion by limiting simultaneous connections
 *
 * All Supabase requests (both admin and server clients) should use this queue
 * to prevent overwhelming the connection pool with too many concurrent requests.
 */

class GlobalRequestQueue {
  private queue: Array<{
    fn: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn,
        resolve: resolve as (value: unknown) => void,
        reject: reject as (error: unknown) => void,
      });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();

    if (task) {
      try {
        const result = await task.fn();
        task.resolve(result);
      } catch (error) {
        task.reject(error);
      } finally {
        this.running--;
        // Process next task after a delay to prevent overwhelming
        // This gives the connection pool time to recover
        setTimeout(() => this.process(), 200);
      }
    }
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Global request queue for ALL Supabase requests (limits to 2 concurrent requests)
// This is shared across all Supabase clients to prevent connection pool exhaustion
export const globalSupabaseQueue = new GlobalRequestQueue(2);

/**
 * Wraps any Supabase operation in the global request queue
 * Use this for all Supabase operations to prevent connection pool exhaustion
 *
 * @param operation Function that performs the Supabase operation
 * @returns Result of the operation
 */
export async function withSupabaseQueue<T>(
  operation: () => Promise<T>
): Promise<T> {
  return globalSupabaseQueue.add(operation);
}
