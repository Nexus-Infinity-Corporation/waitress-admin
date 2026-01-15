"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for client-side operations
 * This client properly handles cookies for authentication in Next.js App Router
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_KEY environment variable is not set");
  }

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
