import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const successMessage = "If an account exists for that email, a recovery link has been sent.";

export async function POST(request: NextRequest) {
  let email = "";

  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Password recovery is unavailable until Supabase is configured." },
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    console.error("Password recovery email error:", error.message);
    return NextResponse.json({ error: "We could not send the recovery email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: successMessage });
}
