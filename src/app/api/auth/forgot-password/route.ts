import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody } from "@/lib/api-guard";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";

const successMessage = "If an account exists for that email, a recovery link has been sent.";

export async function POST(request: NextRequest) {
  if (!(await rateLimit(`forgot:${clientIp(request)}`, 5, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  const { data: body, response } = await readJsonBody(request, 2 * 1024);
  if (response) return response;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 200 || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Password recovery is unavailable until Supabase is configured." },
      { status: 503 }
    );
  }

  // The link always points at this site's configured address, never at a
  // host taken from the request.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/reset-password`,
  });

  // The reply is the same either way, so it can't reveal who has an account.
  if (error) console.error("Password recovery email error:", error.status);

  return NextResponse.json({ message: successMessage });
}
