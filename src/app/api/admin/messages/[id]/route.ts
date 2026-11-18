import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { id } = await params;
  const { data: message, error: updateError } = await supabase
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !message) {
    return NextResponse.json(
      { error: "Failed to update message." },
      { status: 400 }
    );
  }

  return NextResponse.json({ message });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 500 });
  }

  const { id } = await params;
  const { error: deleteError } = await supabase.from("contact_messages").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: "The request could not be completed." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}