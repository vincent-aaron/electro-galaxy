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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.role !== "admin" && body.role !== "customer") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const { data: customer, error: updateError } = await supabase
    .from("profiles")
    .update({ role: body.role })
    .eq("id", id)
    .select("id, email, full_name, phone, role, created_at")
    .single();

  if (updateError || !customer) {
    return NextResponse.json(
      { error: updateError?.message || "Failed to update customer." },
      { status: 400 }
    );
  }

  return NextResponse.json({ customer });
}