"use client";

import { useState } from "react";
import { Info, Mail, Send } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast, useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setForm({ name: "", email: "", subject: "", message: "" });
      showToast("Message sent. Thanks for trying the demo!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <div className="mb-12 text-center">
        <h1 className="section-title mb-4">Contact Us</h1>
        <p className="mx-auto max-w-2xl text-gray-400">
          Have a question or feedback about this demo project? Send a message using the form below.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Info, title: "Demo Store", lines: ["This is a portfolio project.", "There is no physical store or customer support line."] },
            { icon: Mail, title: "Messages", lines: ["Messages are saved to the demo database.", "Please do not include sensitive information."] },
          ].map(({ icon: Icon, title, lines }) => (
            <div key={title} className="card-surface flex gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-galaxy-gold/10">
                <Icon className="h-5 w-5 text-galaxy-gold" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
                {lines.map((line) => (
                  <p key={line} className="text-sm text-gray-400">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6 sm:p-8 lg:col-span-2">
          <h2 className="text-lg font-bold text-white">Send us a message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-gray-400">Full Name *</label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-400">Email *</label>
              <input
                required
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-400">Subject</label>
            <input
              className="input-field"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="How can we help?"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-400">Message *</label>
            <textarea
              required
              rows={5}
              className="input-field resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us more about your inquiry..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-8 py-3 disabled:opacity-50">
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <Toast message={toast.message} show={toast.show} onClose={hideToast} />
    </div>
  );
}
