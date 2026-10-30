import { NextResponse } from "next/server";
import { getAdminInfo } from "@/lib/admin";

// Returns whether the current signed-in user is an admin.
export async function GET() {
  const { user, profile, admin } = await getAdminInfo();

  if (!user) {
    return NextResponse.json({ user: null, admin: false });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: profile?.email ?? user.email,
      full_name: profile?.full_name ?? null,
    },
    admin,
  });
}