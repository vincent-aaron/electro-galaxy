"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  Package,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { getUser, clearUser } from "@/lib/auth";
import type { Category } from "@/types/database";

interface HeaderProps {
  categories: Category[];
}

export function Header({ categories }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, [pathname]);

  const handleSignOut = () => {
    clearUser();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/products?featured=true", label: "Deals" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
  ];

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
<div className="flex items-center gap-4 lg:gap-8">
          {/* Logo */}
          <Logo />

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
            <div className="relative flex w-full max-w-2xl">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="input-field rounded-r-none py-3"
              />
              <button type="submit" className="btn-primary rounded-l-none px-5">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link href="/account/wishlist" className="btn-ghost hidden sm:inline-flex">
              <Heart className="h-5 w-5" />
            </Link>
{user ? (
              <>
                <Link href="/account" className="btn-ghost hidden sm:inline-flex">
                  <User className="h-5 w-5" />
                  <span className="ml-1.5 hidden lg:inline">{user.full_name || user.email.split("@")[0]}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-ghost hidden sm:inline-flex text-xs text-gray-400 hover:text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/account" className="btn-ghost hidden sm:inline-flex">
                <User className="h-5 w-5" />
                <span className="ml-1.5 hidden lg:inline">Account</span>
              </Link>
            )}
            <Link href="/cart" className="btn-ghost relative">
              <ShoppingCart className="h-5 w-5" />
{mounted && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-galaxy-gold text-xs font-bold text-galaxy-black">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative flex">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field rounded-r-none"
            />
            <button type="submit" className="btn-primary rounded-l-none px-4">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="hidden border-t border-galaxy-border md:block">
        <div className="container-main flex items-center gap-1 py-0">
          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoryOpen(true)}
            onMouseLeave={() => setCategoryOpen(false)}
          >
            <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-white hover:text-galaxy-gold">
              <Package className="h-4 w-4" />
              Categories
              <ChevronDown className={cn("h-4 w-4 transition-transform", categoryOpen && "rotate-180")} />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full z-50 w-64 rounded-b-xl border border-galaxy-border bg-galaxy-card py-2 shadow-card animate-fade-in">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-galaxy-dark hover:text-galaxy-gold"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-galaxy-border bg-galaxy-dark md:hidden animate-slide-up">
          <div className="container-main space-y-1 py-4">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Categories</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-galaxy-card hover:text-galaxy-gold"
              >
                {cat.name}
              </Link>
            ))}
            <hr className="my-2 border-galaxy-border" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm hover:bg-galaxy-card",
                  pathname === link.href ? "text-galaxy-gold" : "text-gray-300"
                )}
              >
                {link.label}
              </Link>
            ))}
<Link href="/account" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-galaxy-card">
              My Account
            </Link>
            {user && (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-galaxy-card"
              >
                Sign Out
              </button>
            )}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-galaxy-card">
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
