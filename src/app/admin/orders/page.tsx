"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem } from "@/types/database";

interface AdminOrder extends Order {
  items?: OrderItem[];
  customer?: { id: string; email: string; full_name: string | null } | null;
}

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  shipped: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  delivered: "bg-green-500/10 text-green-500 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
  refunded: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, { status: string; payment_status: string; tracking_number: string; notes: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) setError(d.error);
        else setOrders(d.orders || []);
      })
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const draftFor = (o: AdminOrder) => {
    if (!drafts[o.id]) {
      return {
        status: o.status,
        payment_status: o.payment_status,
        tracking_number: o.tracking_number ?? "",
        notes: o.notes ?? "",
      };
    }
    return drafts[o.id];
  };

  const saveOrder = async (o: AdminOrder) => {
    const d = draftFor(o);
    setSavingId(o.id);
    setError("");
    const res = await fetch(`/api/admin/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    const data = await res.json();
    setSavingId(null);
    if (!res.ok) {
      setError(data?.error || "Failed to update order.");
    } else {
      setNotice(`Order ${o.order_number} updated.`);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[o.id];
        return next;
      });
      load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Orders</h1>
          <p className="mt-1 text-sm text-gray-400">{orders.length} total</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm">Refresh</button>
      </div>

      {notice && <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">{notice}</p>}
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="card-surface space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-galaxy-dark" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <p className="text-lg font-semibold text-white">No orders yet</p>
          <p className="mt-2 text-sm text-gray-400">Customer orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const isOpen = expanded[o.id];
            const d = draftFor(o);
            const customerEmail = o.customer?.email ?? "Guest checkout";
            return (
              <div key={o.id} className="card-surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-galaxy-border bg-galaxy-dark px-5 py-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-galaxy-gold">{o.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })} · {customerEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${statusStyles[o.status] || statusStyles.pending}`}>{o.status}</span>
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [o.id]: !prev[o.id] }))}
                      className="btn-ghost p-1.5"
                      title={isOpen ? "Collapse" : "Expand"}
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <p className="text-sm text-gray-400">
                    {o.items?.length ?? 0} item(s) ·{" "}
                    <span className="font-semibold text-white">{formatPrice(o.total)}</span>
                  </p>
                  <span className="text-xs text-gray-500">
                    Payment: <span className="capitalize text-gray-300">{o.payment_method}</span> · {o.payment_status}
                  </span>
                </div>

                {isOpen && (
                  <div className="space-y-4 border-t border-galaxy-border px-5 py-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Items</p>
                      <div className="space-y-1.5">
                        {o.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate text-gray-300">
                              {item.product_name} <span className="text-gray-500">× {item.quantity}</span>
                            </span>
                            <span className="shrink-0 text-white">{formatPrice(item.total_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Ship To</p>
                      <p className="text-sm text-gray-300">
                        {o.shipping_address?.full_name} · {o.shipping_address?.city}, {o.shipping_address?.province}
                      </p>
                      <p className="text-xs text-gray-500">{o.shipping_address?.street_address} · {o.shipping_address?.phone}</p>
                      {o.shipping_address?.email && (
                        <p className="text-xs text-gray-500">{o.shipping_address.email}</p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Order Status</label>
                        <select
                          className="input-field"
                          value={d.status}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [o.id]: { ...(drafts[o.id] ?? d), status: e.target.value } }))}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Payment Status</label>
                        <select
                          className="input-field"
                          value={d.payment_status}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [o.id]: { ...(drafts[o.id] ?? d), payment_status: e.target.value } }))}
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Tracking Number</label>
                        <input
                          className="input-field"
                          value={d.tracking_number}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [o.id]: { ...(drafts[o.id] ?? d), tracking_number: e.target.value } }))}
                          placeholder="J&T / LBC / JRS tracking #"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Internal Notes</label>
                        <input
                          className="input-field"
                          value={d.notes}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [o.id]: { ...(drafts[o.id] ?? d), notes: e.target.value } }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={() => saveOrder(o)} disabled={savingId === o.id} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">
                        <Save className="mr-2 h-4 w-4" />
                        {savingId === o.id ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}