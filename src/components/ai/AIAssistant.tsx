"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Bot, User, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What products do you have?",
  "Any discounts or promos?",
  "What payment methods do you accept?",
  "How much is shipping?",
  "What is your return policy?",
  "How do I track my order?",
];

const SYSTEM_PROMPT = `You are Galaxy Assistant, the helpful AI shopping assistant for Electro Galaxy, a premium electronics and smart appliance store in the Philippines.

Your job is to help customers:
- Find the right products (electronics, appliances: kitchen, office, smart home, entertainment, personal care)
- Understand discounts, promos, and deals
- Learn about payment methods (COD, GCash, Maya, Credit/Debit Card, Bank Transfer)
- Understand shipping (free shipping on orders over ₱5,000)
- Understand the return/refund policy
- Track their orders
- Navigate the store

Store facts:
- Electro Galaxy sells premium electronics and smart appliances.
- Free shipping on orders over ₱5,000 across the Philippines.
- Payment methods: Cash on Delivery (COD), GCash, Maya, Credit/Debit card, Bank transfer.
- Categories: Kitchen Appliances, Office Appliances, Smart Appliances, Entertainment, Personal Care.
- Products include refrigerators, microwaves, printers, monitors, smart speakers, robot vacuums, TVs, speakers, toothbrushes, hair dryers, and more.
- Users can browse products at /products, check their account at /account, and contact support at /contact.

Be friendly, concise, and helpful. Answer in short paragraphs. If the user asks about a specific product, ask what category they're interested in or what features they need. If you don't know, suggest they browse /products or contact support.`;

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm Galaxy Assistant. I can help you find products, check discounts, explain payments, and more. What can I help you with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: trimmed }] }),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't generate a response. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or contact support via the Contact page.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-galaxy-gold to-galaxy-accent text-galaxy-black shadow-glow transition-transform hover:scale-110"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-galaxy-border bg-galaxy-card shadow-card">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-galaxy-border bg-galaxy-dark px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-galaxy-gold to-galaxy-accent">
              <Bot className="h-5 w-5 text-galaxy-black" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Galaxy Assistant</p>
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] items-start gap-2 ${
                    m.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      m.role === "user"
                        ? "bg-galaxy-gold/20 text-galaxy-gold"
                        : "bg-galaxy-gold/10 text-galaxy-gold"
                    }`}
                  >
                    {m.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-galaxy-gold text-galaxy-black"
                        : "bg-galaxy-dark text-gray-200"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-galaxy-dark px-3 py-2 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-red-400">{error}</p>}
          </div>

          {/* Quick prompts */}
          <div className="scrollbar-hide flex gap-2 overflow-x-auto border-t border-galaxy-border px-3 py-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                disabled={loading}
                className="shrink-0 rounded-full border border-galaxy-border bg-galaxy-dark px-3 py-1 text-xs text-gray-300 transition-colors hover:border-galaxy-gold hover:text-galaxy-gold disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-galaxy-border bg-galaxy-dark px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask me anything..."
              className="input-field py-2"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-galaxy-gold text-galaxy-black transition-colors hover:bg-galaxy-accent disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
