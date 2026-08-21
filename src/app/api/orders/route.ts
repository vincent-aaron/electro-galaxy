import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ orders: [] });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ orders: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: body.order_number,
        user_id: user?.id || null,
        subtotal: body.subtotal,
        shipping_fee: body.shipping_fee,
        total: body.total,
        payment_method: body.payment_method,
        shipping_address: body.shipping_address,
        status: "pending",
        payment_status: body.payment_method === "cod" ? "pending" : "pending",
      })
      .select()
      .single();

    if (!error && data) {
      await supabase.from("order_items").insert(
        body.items.map((item: { product_id: string; product_name: string; product_image: string; quantity: number; unit_price: number; total_price: number }) => ({
          order_id: data.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }))
      );
    }
  }

  return NextResponse.json({ success: true, order_number: body.order_number });
}
