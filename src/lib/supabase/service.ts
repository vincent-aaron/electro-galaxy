import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/env";

/**
 * Server-only Supabase client using the service-role key (bypasses RLS).
 * Use it ONLY in route handlers, for writes the public API must not allow
 * directly (e.g. publishing a review after it passed moderation).
 * The "server-only" import makes the build fail if a client component imports this.
 */
export function createServiceClient() {
  const config = supabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!config) return null;

  return createSupabaseClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
