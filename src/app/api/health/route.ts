import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Health check, also called once a day by the Vercel cron in vercel.json. The
 * single-row read counts as database activity, which stops a free Supabase
 * project from being paused after a week without traffic.
 */
export async function GET() {
  const config = supabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Demo mode is a valid way to run the app, so this is not reported as a failure.
  if (!config) {
    return NextResponse.json({ status: "ok", database: "not_configured" }, { headers: NO_STORE });
  }

  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { error } = await supabase
      .from("categories")
      .select("id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(8000));

    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("Health check could not read from Supabase:", err);
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503, headers: NO_STORE });
  }

  return NextResponse.json({ status: "ok", database: "reachable" }, { headers: NO_STORE });
}
