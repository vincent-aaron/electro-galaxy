import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const field = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const name = field(body.name);
  const email = field(body.email);
  const subject = field(body.subject);
  const message = field(body.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email) || name.length > 100 || email.length > 200 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json(
      { error: "Please check your details: use a valid email and keep the message under 5,000 characters." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  if (supabase) {
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
    });

    if (error) {
      console.error("Failed to save contact message:", error.message);
      return NextResponse.json(
        { error: "We couldn't send your message. Please try again later." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
