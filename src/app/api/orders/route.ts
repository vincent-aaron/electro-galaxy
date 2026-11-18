import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { containsCardNumber } from "@/lib/card-check";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const PAYMENT_METHODS = ["cod", "gcash", "maya", "credit_card", "bank_transfer"] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OrderPayload {
  items?: { product_id?: unknown; quantity?: unknown }[];
  payment_method?: unknown;
  shipping_address?: Record<string, unknown>;
  notes?: unknown;
}

const text = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

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

/**
 * Places an order. The client only sends product IDs + quantities and the
 * shipping details; prices, totals, product names/images and the order number
 * are decided by the database (`place_order` in supabase/admin-policies.sql),
 * which also decrements stock in the same transaction.
 */
export async function POST(request: Request) {
  if (!rateLimit(`orders:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Too many demo orders. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: OrderPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return NextResponse.json(
      { success: false, error: "Order must contain between 1 and 50 items." },
      { status: 400 }
    );
  }

  const items = body.items.map((item) => ({
    product_id: typeof item?.product_id === "string" ? item.product_id : "",
    quantity: Number(item?.quantity),
  }));
  if (items.some((i) => !i.product_id || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99)) {
    return NextResponse.json(
      { success: false, error: "One or more cart items are invalid." },
      { status: 400 }
    );
  }

  const paymentMethod = PAYMENT_METHODS.includes(body.payment_method as (typeof PAYMENT_METHODS)[number])
    ? (body.payment_method as string)
    : "cod";

  // Store the address in the same shape as saved addresses (types/database.ts).
  const a = body.shipping_address ?? {};
  const shippingAddress = {
    full_name: text(a.fullName ?? a.full_name),
    email: text(a.email),
    phone: text(a.phone, 40),
    street_address: text(a.street ?? a.street_address, 300),
    city: text(a.city),
    province: text(a.province),
    postal_code: text(a.postalCode ?? a.postal_code, 20),
    country: "Philippines",
  };
  const required = [
    shippingAddress.full_name,
    shippingAddress.email,
    shippingAddress.phone,
    shippingAddress.street_address,
    shippingAddress.city,
    shippingAddress.province,
    shippingAddress.postal_code,
  ];
  if (required.some((v) => !v)) {
    return NextResponse.json(
      { success: false, error: "Please complete every shipping field." },
      { status: 400 }
    );
  }

  // This is a demo store: card numbers must never reach the database.
  const notes = text(body.notes, 1000);
  const freeText = [shippingAddress.full_name, shippingAddress.street_address, shippingAddress.city, shippingAddress.province, notes];
  if (freeText.some(containsCardNumber)) {
    return NextResponse.json(
      { success: false, error: "This is a demo store. Please remove the card number and do not enter payment details." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Mock mode (no backend configured): acknowledge so local demos still work.
  if (!supabase) {
    return NextResponse.json({ success: true, order_number: generateOrderNumber() });
  }

  // Real products always have UUID ids; anything else is a stale mock-mode cart.
  if (items.some((i) => !UUID_RE.test(i.product_id))) {
    return NextResponse.json(
      { success: false, error: "Your cart has items that are no longer available. Please remove them and try again." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_items: items,
    p_shipping_address: shippingAddress,
    p_payment_method: paymentMethod,
    p_notes: notes || null,
  });

  if (error || !data) {
    console.error("Failed to place order:", error?.message);
    // P0001 = a RAISE EXCEPTION message from place_order, written for shoppers.
    const message =
      error?.code === "P0001"
        ? error.message
        : "We couldn't save your order. Please try again in a moment.";
    return NextResponse.json({ success: false, error: message }, { status: error?.code === "P0001" ? 400 : 500 });
  }

  return NextResponse.json({ success: true, order_number: (data as { order_number: string }).order_number });
}
