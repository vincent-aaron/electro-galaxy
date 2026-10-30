import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
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

  const imageUrl = typeof body.image_url === "string" ? body.image_url : "";

  const payload: Record<string, unknown> = {};
  if (body.name) payload.name = String(body.name);
  if (body.slug) payload.slug = String(body.slug);
  if ("category_id" in body) payload.category_id = body.category_id || null;
  if (body.description !== undefined) payload.description = body.description || null;
  if (body.short_description !== undefined) payload.short_description = body.short_description || null;
  if (body.price !== undefined) payload.price = Number(body.price) || 0;
  if (body.compare_at_price !== undefined) payload.compare_at_price = body.compare_at_price != null ? Number(body.compare_at_price) : null;
  if (body.sku !== undefined) payload.sku = body.sku || null;
  if (body.stock_quantity !== undefined) payload.stock_quantity = Number(body.stock_quantity) || 0;
  if (body.brand !== undefined) payload.brand = body.brand || null;
  if (body.specs !== undefined) payload.specs = body.specs;
  if ("is_featured" in body) payload.is_featured = Boolean(body.is_featured);
  if ("is_active" in body) payload.is_active = Boolean(body.is_active);

  const { data: product, error: updateError } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !product) {
    return NextResponse.json(
      { error: updateError?.message || "Failed to update product." },
      { status: 400 }
    );
  }

  if (imageUrl) {
    const { data: existing } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", id)
      .eq("is_primary", true)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("product_images")
        .update({ url: imageUrl, alt_text: product.name })
        .eq("id", existing.id);
    } else {
      await supabase.from("product_images").insert({
        product_id: product.id,
        url: imageUrl,
        alt_text: product.name,
        sort_order: 0,
        is_primary: true,
      });
    }
  }

  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { id } = await params;

  const { error: deleteError } = await supabase.from("products").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}