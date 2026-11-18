"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, User, Menu, Heart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { NavDrawer } from "@/components/layout/NavDrawer";
import { getUser, signOut, type StoredUser } from "@/lib/auth";
import type { Category } from "@/types/database";

interface HeaderProps {
  categories: Category[];
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/products?featured=true", label: "Deals" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

export function Header({ categories }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const itemCount = useCartStore((s) => s.getItemCount());
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    let active = true;
    setMounted(true);
    getUser().then((current) => {
      if (active) setUser(current);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-galaxy-border bg-galaxy-dark/95 backdrop-blur-md">
      {/* Top bar */}
      <div className="hidden border-b border-galaxy-border bg-galaxy-black py-1.5 text-xs text-gray-400 sm:block">
        <div className="container-main flex items-center justify-between">
          <span>Free shipping on orders over ₱5,000</span>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-galaxy-gold">Help Center</Link>
            <Link href="/account/orders" className="hover:text-galaxy-gold">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-main py-3">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn-ghost h-11 w-11 shrink-0 p-0"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            aria-controls="nav-drawer"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <Logo />

          {/* Search */}
          <form onSubmit={handleSearch} role="search" className="hidden flex-1 md:flex">
            <div className="relative flex w-full max-w-2xl">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                aria-label="Search products"
                className="input-field rounded-r-none py-3"
              />
              <button type="submit" className="btn-primary rounded-l-none px-5" aria-label="Search">
                <Search className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link href="/account/wishlist" className="btn-ghost hidden sm:inline-flex" aria-label="Wishlist">
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>
            {user ? (
              <>
                <Link href="/account" className="btn-ghost hidden sm:inline-flex" aria-label="My account">
                  <User className="h-5 w-5" aria-hidden="true" />
                  <span className="ml-1.5 hidden max-w-32 truncate lg:inline">{user.full_name || user.email.split("@")[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-ghost hidden text-xs text-gray-400 hover:text-red-400 sm:inline-flex"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/account" className="btn-ghost hidden sm:inline-flex" aria-label="Account">
                <User className="h-5 w-5" aria-hidden="true" />
                <span className="ml-1.5 hidden lg:inline">Account</span>
              </Link>
            )}
            <Link
              href="/cart"
              className="btn-ghost relative"
              aria-label={mounted && itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-galaxy-gold text-xs font-bold text-galaxy-black">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} role="search" className="mt-3 md:hidden">
          <div className="relative flex">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="input-field rounded-r-none"
            />
            <button type="submit" className="btn-primary rounded-l-none px-4" aria-label="Search">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav aria-label="Main" className="hidden border-t border-galaxy-border md:block">
        <div className="container-main flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors hover:text-galaxy-gold",
                pathname === link.href ? "text-galaxy-gold" : "text-gray-300"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <NavDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        categories={categories}
        navLinks={navLinks}
        pathname={pathname}
        signedIn={Boolean(user)}
        onSignOut={handleSignOut}
        returnFocusRef={menuButtonRef}
      />
    </header>
  );
}
