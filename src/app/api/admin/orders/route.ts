import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { data, error: listError } = await supabase
    .from("orders")
    .select("*, items:order_items(*), customer:profiles!orders_user_id_fkey(id, email, full_name)")
    .order("created_at", { ascending: false });

  if (listError) {
    return NextResponse.json({ error: "The request could not be completed." }, { status: 400 });
  }

  return NextResponse.json({ orders: data ?? [] });
}