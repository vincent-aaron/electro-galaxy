"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) setError(d.error);
        else setMessages(d.messages || []);
      })
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (m: Message) => {
    if (m.is_read) return;
    const res = await fetch(`/api/admin/messages/${m.id}`, { method: "PATCH" });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to update message.");
    } else {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
    }
  };

  const handleDelete = async (m: Message) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    const res = await fetch(`/api/admin/messages/${m.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to delete message.");
    } else {
      setNotice("Message deleted.");
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
    }
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Contact Messages</h1>
          <p className="mt-1 text-sm text-gray-400">
            {messages.length} total · {unread} unread
          </p>
        </div>
      </div>

      {notice && <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">{notice}</p>}
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="card-surface space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-galaxy-dark" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <Mail className="mx-auto mb-4 h-10 w-10 text-gray-600" />
          <p className="text-lg font-semibold text-white">No messages yet</p>
          <p className="mt-2 text-sm text-gray-400">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => markRead(m)}
              className={`card-surface cursor-pointer p-5 transition-colors ${m.is_read ? "" : "border-galaxy-gold/40"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${m.is_read ? "bg-gray-600" : "bg-galaxy-gold"}`} />
                    <p className="font-semibold text-white">{m.name}</p>
                    {!m.is_read && (
                      <span className="rounded-full bg-galaxy-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase text-galaxy-gold">New</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {m.email} · {new Date(m.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {m.subject && <p className="mt-2 text-sm font-medium text-gray-300">{m.subject}</p>}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-400">{m.message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!m.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(m);
                      }}
                      className="btn-ghost p-2"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4 text-galaxy-gold" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(m);
                    }}
                    className="btn-ghost p-2 text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}