import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error("SUPABASE_KEY environment variable is not set");
}

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is not set");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
