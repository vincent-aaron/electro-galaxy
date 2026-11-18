import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody, UUID_RE } from "@/lib/api-guard";
import { rateLimit } from "@/lib/rate-limit";

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ addresses: [] });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ addresses: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  if (error) {
    console.error("Failed to load addresses:", error.code);
    return NextResponse.json({ error: "We couldn't load your addresses." }, { status: 500 });
  }

  return NextResponse.json({ addresses: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  if (!(await rateLimit(`addresses:${user.id}`, 20, 10 * 60 * 1000))) {
    return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { data: body, response } = await readJsonBody(request, 8 * 1024);
  if (response) return response;

  const address = {
    label: text(body.label, 50) || "Home",
    full_name: text(body.full_name, 200),
    phone: text(body.phone, 40),
    street_address: text(body.street_address, 300),
    city: text(body.city, 200),
    province: text(body.province, 200),
    postal_code: text(body.postal_code, 20),
    country: text(body.country, 100) || "Philippines",
  };
  const isDefault = body.is_default === true;

  if (!address.full_name || !address.phone || !address.street_address || !address.city || !address.province || !address.postal_code) {
    return NextResponse.json(
      { success: false, error: "Required address fields are missing." },
      { status: 400 }
    );
  }

  // If setting as default, clear existing defaults
  if (isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...address, user_id: user.id, is_default: isDefault })
    .select()
    .single();

  if (error) {
    console.error("Failed to save address:", error.code);
    return NextResponse.json({ success: false, error: "We couldn't save your address." }, { status: 500 });
  }

  return NextResponse.json({ success: true, address: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ success: false, error: "Missing address id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete address:", error.code);
    return NextResponse.json({ success: false, error: "We couldn't delete that address." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
