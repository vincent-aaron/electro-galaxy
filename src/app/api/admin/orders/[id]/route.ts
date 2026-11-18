import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

interface Params {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};

  if (body.status !== undefined && body.status !== null) {
    if (!VALID_STATUSES.includes(String(body.status))) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }
    payload.status = body.status;
  }
  if (body.payment_status !== undefined && body.payment_status !== null) {
    if (!VALID_PAYMENT_STATUSES.includes(String(body.payment_status))) {
      return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
    }
    payload.payment_status = body.payment_status;
  }
  if (body.tracking_number !== undefined) {
    payload.tracking_number = body.tracking_number ? String(body.tracking_number) : null;
  }
  if (body.notes !== undefined) {
    payload.notes = body.notes ? String(body.notes) : null;
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data: order, error: updateError } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !order) {
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 400 }
    );
  }

  return NextResponse.json({ order });
}