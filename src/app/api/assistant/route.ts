import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are Galaxy Assistant, the helpful AI shopping assistant for Electro Galaxy, a portfolio demo of an electronics and smart appliance store. Electro Galaxy is not a real shop: products are sample data, and no real payments, orders, or deliveries are processed. Say so whenever someone asks about buying, paying, shipping, or returns. Help visitors find products, understand the demo's deals, simulated payment options, shipping rules, returns page, order history, and site navigation. In the demo, shipping is free for orders over PHP 5,000. Simulated payment options at checkout: cash on delivery, GCash, Maya, and card. Never ask for card numbers, CVV codes, passwords, or other sensitive information. Be friendly, concise, and helpful. If you do not know an answer, suggest /products or /contact.`;
type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  // Server-only key. Never read a NEXT_PUBLIC_ variant: those get bundled for browsers.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "The assistant is not configured." }, { status: 503 });

  // Protect the Gemini quota from scripted abuse.
  if (!rateLimit(`assistant:${clientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please wait a few minutes." }, { status: 429 });
  }

  let messages: Message[];
  try {
    const body = await request.json();
    messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validMessages = messages.filter(
    (message): message is Message =>
      (message?.role === "user" || message?.role === "assistant") &&
      typeof message.content === "string" && message.content.trim().length > 0 && message.content.length <= 2000
  );
  if (!validMessages.length) return NextResponse.json({ error: "Enter a message." }, { status: 400 });

  let response: Response;
  try {
    response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: validMessages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    }),
    });
  } catch (err) {
    console.error("Gemini assistant network error:", err);
    return NextResponse.json({ error: "The assistant is unavailable." }, { status: 502 });
  }
  if (!response.ok) {
    console.error("Gemini assistant request failed:", response.status);
    return NextResponse.json({ error: "The assistant is unavailable." }, { status: 502 });
  }
  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
  return NextResponse.json({ reply: reply || "Sorry, I couldn't generate a response." });
}
