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
    .from("categories")
    .select("*, products:products(*, images:product_images(*))")
    .order("sort_order");

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  return NextResponse.json({ categories: data ?? [] });
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
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" && body.slug.trim()
    ? slugify(body.slug)
    : slugify(name);

  const { data: cat, error: insertError } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description: body.description || null,
      image_url: body.image_url || null,
      sort_order: Number(body.sort_order) || 0,
      is_active: body.is_active !== false,
    })
    .select()
    .single();

  if (insertError || !cat) {
    return NextResponse.json(
      { error: insertError?.message || "Failed to create category." },
      { status: 400 }
    );
  }

  return NextResponse.json({ category: cat });
}