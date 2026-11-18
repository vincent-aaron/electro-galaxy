import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { readJsonBody } from "@/lib/api-guard";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!(await rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const { data: body, response } = await readJsonBody(request, 16 * 1024);
  if (response) return response;

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

  // The service role is the only writer once security-hardening.sql is applied.
  const supabase = createServiceClient() ?? (await createClient());

  if (supabase) {
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
    });

    if (error) {
      console.error("Failed to save contact message:", error.code);
      return NextResponse.json(
        { error: "We couldn't send your message. Please try again later." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
