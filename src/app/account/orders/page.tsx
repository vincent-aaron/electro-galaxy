"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, MapPin, CreditCard } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/database";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  shipped: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  delivered: "bg-green-500/10 text-green-500 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
  refunded: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Orders" }]} />
      <h1 className="section-title mb-8">My Orders</h1>

      {loading ? (
        <div className="card-surface space-y-4 p-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-galaxy-dark" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-surface py-16 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <h2 className="mb-2 text-lg font-semibold text-white">No orders yet</h2>
          <p className="mb-6 text-sm text-gray-400">When you place an order, it will appear here.</p>
          <Link href="/products" className="btn-primary px-8 py-3">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="card-surface overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-galaxy-border bg-galaxy-dark px-6 py-4">
                <div>
                  <p className="text-sm text-gray-400">Order</p>
                  <p className="font-mono text-sm font-semibold text-galaxy-gold">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</p>
                  <span className={`mt-1 inline-block rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${statusStyles[order.status] || statusStyles.pending}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-galaxy-border">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    {item.product_image ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-galaxy-dark">
                        <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="56px" />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-galaxy-dark">
                        <Package className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.product_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-galaxy-border bg-galaxy-dark/50 px-6 py-4">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> {order.payment_method.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {order.shipping_address?.city || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-lg font-bold text-galaxy-gold">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
