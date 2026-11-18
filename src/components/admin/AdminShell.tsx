"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Mail,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

// Internal badge to avoid shipping the gate logic to the shopfront bundle.
function AdminBadge() {
  return (
    <span className="ml-2 rounded-full bg-galaxy-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-galaxy-gold">
      Admin
    </span>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container-main py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="lg:min-h-[calc(100vh-8rem)]">
          <div className="card-surface sticky top-24 p-3">
            <div className="mb-3 flex items-center gap-2 border-b border-galaxy-border px-2 pb-3">
              <Logo showText={false} size="sm" />
              <div>
                <p className="text-sm font-bold text-white">Store Admin</p>
                <p className="text-xs text-gray-500">Manage your shop</p>
              </div>
            </div>
            <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
              {adminLinks.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-galaxy-gold text-galaxy-black"
                        : "text-gray-300 hover:bg-galaxy-dark hover:text-galaxy-gold"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Logo showText={false} size="sm" />
              <div>
                <p className="flex items-center text-sm font-bold text-white">
                  Electro Galaxy
                  <AdminBadge />
                </p>
                <p className="text-xs text-gray-500">Administration panel</p>
              </div>
            </div>
            <Link href="/" className="btn-ghost text-sm">
              ← Back to store
            </Link>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}