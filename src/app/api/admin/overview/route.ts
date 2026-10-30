import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const [
    productsRes,
    categoriesRes,
    ordersRes,
    customersRes,
    messagesRes,
    lowStockRes,
    recentRes,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("orders").select("total, status", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("contact_messages").select("id, is_read", { count: "exact" }),
    supabase
      .from("products")
      .select("id, name, slug, stock_quantity, price")
      .lt("stock_quantity", 10)
      .order("stock_quantity", { ascending: true })
      .limit(10),
    supabase
      .from("orders")
      .select("id, order_number, status, payment_status, total, created_at, items:order_items(product_name, quantity, total_price)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const orders = ordersRes.data ?? [];
  const revenue = orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const messages = messagesRes.data ?? [];

  return NextResponse.json({
    counts: {
      products: productsRes.count ?? 0,
      categories: categoriesRes.count ?? 0,
      orders: ordersRes.count ?? 0,
      customers: customersRes.count ?? 0,
      revenue,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      unreadMessages: messages.filter((m) => !m.is_read).length,
    },
    lowStock: lowStockRes.data ?? [],
    recentOrders: recentRes.data ?? [],
  });
}