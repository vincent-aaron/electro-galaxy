import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Galaxy Assistant, the helpful AI shopping assistant for Electro Galaxy, a premium electronics and smart appliance store in the Philippines. Help customers find products, understand deals, payments, shipping, returns, order tracking, and store navigation. Shipping is free for orders over PHP 5,000 nationwide. Payments: COD, GCash, Maya, credit/debit card, and bank transfer. Be friendly, concise, and helpful. If you do not know an answer, suggest /products or /contact.`;
type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "The assistant is not configured." }, { status: 503 });

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

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: validMessages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    }),
  });
  if (!response.ok) {
    console.error("Gemini assistant request failed:", response.status);
    return NextResponse.json({ error: "The assistant is unavailable." }, { status: 502 });
  }
  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
  return NextResponse.json({ reply: reply || "Sorry, I couldn't generate a response." });
}
