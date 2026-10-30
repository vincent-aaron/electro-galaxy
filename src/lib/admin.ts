import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminResult {
  supabase: SupabaseClient | null;
  error: NextResponse | null;
}

/**
 * Verifies the current signed-in user is an admin and returns a ready server
 * Supabase client. All admin API routes must call this first.
 */
export async function requireAdmin(): Promise<AdminResult> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      supabase: null,
      error: NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, run supabase/admin-policies.sql, then sign in as an admin.",
        },
        { status: 503 }
      ),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase: null,
      error: NextResponse.json({ error: "Not authorized: sign in to continue." }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return {
      supabase: null,
      error: NextResponse.json({ error: "Forbidden: admin access required." }, { status: 403 }),
    };
  }

  return { supabase, error: null };
}

/** Returns the admin's own profile (used by the admin session endpoint). */
export async function getAdminInfo() {
  const supabase = await createClient();
  if (!supabase) return { user: null, admin: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, admin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: profile ?? null, admin: profile?.role === "admin" };
}