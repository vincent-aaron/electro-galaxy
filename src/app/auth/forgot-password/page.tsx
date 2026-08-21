"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send recovery email.");
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send recovery email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12">
      <div className="auth-orb auth-orb--one" />
      <div className="auth-orb auth-orb--two" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center"><Logo className="mx-auto mb-5 w-fit" showText={false} size="lg" /><h1 className="text-2xl font-bold text-white">Reset your password</h1><p className="mt-2 text-sm text-gray-400">We&apos;ll send a secure recovery link to your inbox.</p></div>
        <form onSubmit={handleSubmit} className="card-surface space-y-5 p-6 sm:p-8">
          {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p>}
          <div><label htmlFor="email" className="mb-1.5 block text-sm text-gray-400">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-field pl-10" placeholder="you@example.com" /></div></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50"><Send className="mr-2 h-4 w-4" />{loading ? "Sending link..." : "Send recovery link"}</button>
          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 transition-colors hover:text-galaxy-gold"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>
        </form>
      </div>
    </div>
  );
}
