"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) setError(d.error);
        else setCustomers(d.customers || []);
      })
      .catch(() => setError("Failed to load customers."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        (c.full_name ?? "").toLowerCase().includes(q)
    );
  }, [customers, query]);

  const toggleRole = async (c: Customer) => {
    const newRole = c.role === "admin" ? "customer" : "admin";
    const res = await fetch(`/api/admin/customers/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to update customer.");
    } else {
      setNotice(`${c.email} is now ${newRole}.`);
      setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, role: newRole } : x)));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">Customers</h1>
        <p className="mt-1 text-sm text-gray-400">{customers.length} total</p>
      </div>

      {notice && <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">{notice}</p>}
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          className="input-field pl-9"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card-surface space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-galaxy-dark" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <Users className="mx-auto mb-4 h-10 w-10 text-gray-600" />
          <p className="text-lg font-semibold text-white">No customers found</p>
          <p className="mt-2 text-sm text-gray-400">{query ? "Try a different search." : "Customers appear after they sign up."}</p>
        </div>
      ) : (
        <div className="card-surface divide-y divide-galaxy-border overflow-hidden">
          {filtered.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-galaxy-gold/10 text-sm font-bold text-galaxy-gold">
                {(c.full_name ?? c.email).slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{c.full_name || "—"}</p>
                <p className="truncate text-xs text-gray-500">
                  {c.email} · joined {new Date(c.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short" })}
                </p>
              </div>
              <button
                onClick={() => toggleRole(c)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  c.role === "admin"
                    ? "bg-galaxy-gold text-galaxy-black hover:bg-galaxy-accent"
                    : "border border-galaxy-border text-gray-400 hover:border-galaxy-gold hover:text-galaxy-gold"
                }`}
                title={c.role === "admin" ? "Click to demote to customer" : "Click to promote to admin"}
              >
                {c.role === "admin" ? "Admin" : "Customer"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}