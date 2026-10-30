import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { data, error: listError } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .order("created_at", { ascending: false });

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" && body.slug.trim()
    ? slugify(body.slug)
    : slugify(name);
  const imageUrl = typeof body.image_url === "string" ? body.image_url : "";

  const payload: Record<string, unknown> = {
    name,
    slug,
    category_id: body.category_id || null,
    description: body.description || null,
    short_description: body.short_description || null,
    price: Number(body.price) || 0,
    compare_at_price: body.compare_at_price != null ? Number(body.compare_at_price) : null,
    sku: body.sku || null,
    stock_quantity: Number(body.stock_quantity) || 0,
    brand: body.brand || null,
    specs: (body.specs && typeof body.specs === "object" ? body.specs : {}) as Record<string, string>,
    is_featured: Boolean(body.is_featured),
    is_active: body.is_active !== false,
  };

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (insertError || !product) {
    return NextResponse.json(
      { error: insertError?.message || "Failed to create product." },
      { status: 400 }
    );
  }

  if (imageUrl) {
    await supabase.from("product_images").insert({
      product_id: product.id,
      url: imageUrl,
      alt_text: name,
      sort_order: 0,
      is_primary: true,
    });
  }

  return NextResponse.json({ product });
}