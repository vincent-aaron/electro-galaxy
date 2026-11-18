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

  const { data: cat, error: updateError } = await supabase
    .from("categories")
    .update({
      name: body.name || undefined,
      slug: body.slug || undefined,
      description: body.description !== undefined ? body.description : undefined,
      image_url: body.image_url !== undefined ? body.image_url : undefined,
      sort_order: body.sort_order !== undefined ? Number(body.sort_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !cat) {
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 400 }
    );
  }

  return NextResponse.json({ category: cat });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { id } = await params;
  const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: "The request could not be completed." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}