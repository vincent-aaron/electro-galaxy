import { AdminGate } from "@/components/admin/AdminGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Electro Galaxy",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Blocks search engines and shows the permission gate on the client.
  return <AdminGate>{children}</AdminGate>;
}