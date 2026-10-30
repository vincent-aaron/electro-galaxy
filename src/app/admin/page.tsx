"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Tags,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/database";

interface OverviewData {
  counts: {
    products: number;
    categories: number;
    orders: number;
    customers: number;
    revenue: number;
    pendingOrders: number;
    unreadMessages: number;
  };
  lowStock: Product[];
  recentOrders: Array<{
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    created_at: string;
    items?: Array<{ product_name: string; quantity: number }>;
  }>;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  shipped: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  delivered: "bg-green-500/10 text-green-500 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
  refunded: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((d) => {
        if (d?.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-surface space-y-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-galaxy-dark" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm text-gray-300">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Products", value: String(data.counts.products), icon: Package, href: "/admin/products" },
    { label: "Categories", value: String(data.counts.categories), icon: Tags, href: "/admin/categories" },
    { label: "Orders", value: String(data.counts.orders), icon: ShoppingCart, href: "/admin/orders" },
    { label: "Customers", value: String(data.counts.customers), icon: Users, href: "/admin/customers" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card-surface hover-lift group block p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-galaxy-gold/10">
              <Icon className="h-5 w-5 text-galaxy-gold" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      {/* Revenue + pending */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="h-4 w-4 text-galaxy-gold" /> Total Revenue
          </div>
          <p className="mt-2 text-2xl font-bold text-galaxy-gold">{formatPrice(data.counts.revenue)}</p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ShoppingCart className="h-4 w-4 text-galaxy-gold" /> Pending Orders
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data.counts.pendingOrders}</p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Inbox className="h-4 w-4 text-galaxy-gold" /> Unread Messages
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data.counts.unreadMessages}</p>
        </div>
      </div>

      {/* Low stock */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-galaxy-border bg-galaxy-dark px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-yellow-500" /> Low Stock (&lt; 10)
          </h2>
          <Link href="/admin/products" className="text-xs text-galaxy-gold hover:underline">
            Manage products
          </Link>
        </div>
        {data.lowStock.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">All products are well stocked. 🎉</p>
        ) : (
          <div className="divide-y divide-galaxy-border">
            {data.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <p className="min-w-0 truncate text-sm font-medium text-white">{p.name}</p>
                <span className="shrink-0 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-500">
                  {p.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

{/* Recent orders */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-galaxy-border bg-galaxy-dark px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-galaxy-gold hover:underline">
            View all
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No orders yet.</p>
        ) : (
          <div className="divide-y divide-galaxy-border">
            {data.recentOrders.map((o) => {
              const firstItem = o.items?.[0]?.product_name;
              const totalItems = o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
              return (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-galaxy-gold">{o.order_number}</p>
                    <p className="truncate text-sm text-gray-300">
                      {firstItem ?? "Order"} {totalItems > 1 ? `+${totalItems - 1} more` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${statusStyles[o.status] || statusStyles.pending}`}>
                      {o.status}
                    </span>
                    <span className="text-sm font-semibold text-white">{formatPrice(o.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}