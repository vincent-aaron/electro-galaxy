import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminInfo } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The middleware already answers 404 for non-admins; this is the second check.
  const { admin } = await getAdminInfo();
  if (!admin) notFound();

  return <AdminShell>{children}</AdminShell>;
}
