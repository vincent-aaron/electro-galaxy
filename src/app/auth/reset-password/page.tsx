"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/Logo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 6) return setError("Your new password must be at least 6 characters.");
    if (password !== confirmation) return setError("The passwords do not match.");
    if (!isSupabaseConfigured()) return setError("Password recovery is unavailable until Supabase is configured.");
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase!.auth.updateUser({ password });
    if (updateError) setError(updateError.message); else setSuccess(true);
    setLoading(false);
  }

  return <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12"><div className="auth-orb auth-orb--one" /><div className="auth-orb auth-orb--two" /><div className="relative w-full max-w-md"><div className="mb-8 text-center"><Logo className="mx-auto mb-5 w-fit" showText={false} size="lg" /> <h1 className="text-2xl font-bold text-white">Choose a new password</h1></div><form onSubmit={handleSubmit} className="card-surface space-y-4 p-6 sm:p-8">{error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}{success ? <div className="space-y-4 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" /><p className="text-sm text-gray-300">Your password has been updated.</p><Link className="btn-primary w-full" href="/auth/login">Sign in</Link></div> : <><div><label htmlFor="password" className="mb-1.5 block text-sm text-gray-400">New password</label><input id="password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" /></div><div><label htmlFor="confirmation" className="mb-1.5 block text-sm text-gray-400">Confirm password</label><input id="confirmation" type="password" minLength={6} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="input-field" /></div><button disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50"><KeyRound className="mr-2 h-4 w-4" />{loading ? "Updating..." : "Update password"}</button></>}</form></div></div>;
}
