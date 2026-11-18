import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase/env";

function browserConfig() {
  return supabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createClient() {
  const config = browserConfig();
  if (!config) return null;

  return createBrowserClient(config.url, config.key);
}

export function isSupabaseConfigured(): boolean {
  return browserConfig() !== null;
}
