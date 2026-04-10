import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dixwmxaismhucrynflkk.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error("CRITICAL: VITE_SUPABASE_ANON_KEY is not set!");
  console.error("Please add it to Netlify environment variables");
  console.error("Get the anon key from: Supabase Dashboard → Settings → API → anon/public key");
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey || "dummy-key-to-prevent-crash"
);
