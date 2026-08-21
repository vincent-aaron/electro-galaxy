"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  LogIn,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useWishlistStore } from "@/store/wishlist-store";
import { getUser, clearUser } from "@/lib/auth";
import dashboardImage from "../../../img/featured-bg.png";
import avatarImage from "../../../img/avatar.gif";

const menuItems = [
  { href: "/account/orders", icon: Package, label: "My Orders", desc: "Track and manage orders", accent: "from-amber-400/20 to-transparent" },
  { href: "/account/wishlist", icon: Heart, label: "Wishlist", desc: "Saved items you love", accent: "from-rose-400/20 to-transparent" },
  { href: "/account/addresses", icon: MapPin, label: "Addresses", desc: "Manage shipping addresses", accent: "from-sky-400/20 to-transparent" },
];

interface StoredUser {
  email: string;
  full_name?: string | null;
}

export default function AccountPage() {
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const handleSignOut = () => {
    clearUser();
    setUser(null);
  };

  const handleSignOutNav = () => {
    clearUser();
    setUser(null);
  };

  const displayName = user?.full_name || (user?.email ? user.email.split("@")[0] : "Guest");
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const stats = [
    { label: "Orders", value: "0", icon: Package, href: "/account/orders", delta: "+2% this month" },
    { label: "Wishlist", value: String(wishlistCount), icon: Heart, href: "/account/wishlist", delta: wishlistCount > 0 ? `${wishlistCount} saved` : "Browse & save" },
    { label: "Addresses", value: "0", icon: MapPin, href: "/account/addresses", delta: "Add for faster checkout" },
  ];

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "My Account" }]} />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">My Account</h1>
          <p className="mt-1 text-sm text-gray-400">Manage your orders, wishlist, and shipping details.</p>
        </div>
        {user && (
          <button
            onClick={handleSignOutNav}
            className="btn-secondary px-4 py-2 text-sm text-red-400 hover:border-red-500/50 hover:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </button>
        )}
      </div>

      {/* Hero banner */}
      <div className="dashboard-hero gradient-border-top relative mb-8 overflow-hidden rounded-3xl border border-galaxy-border">
        <Image src={dashboardImage} alt="Electronics collection" fill priority className="dashboard-hero-image" sizes="(max-width: 1280px) 100vw, 1280px" />
        <div className="dashboard-hero-overlay" />
        <div className="aurora-orb aurora-orb--gold" />
        <div className="aurora-orb aurora-orb--orange" />
        <div className="aurora-orb aurora-orb--violet" />
        <div className="aurora-particle" style={{ top: "18%", left: "12%", width: 6, height: 6, animationDelay: "0s" }} />
        <div className="aurora-particle" style={{ top: "70%", left: "20%", width: 4, height: 4, animationDelay: "-2s" }} />
        <div className="aurora-particle" style={{ top: "30%", right: "15%", width: 5, height: 5, animationDelay: "-3s" }} />
        <div className="aurora-particle" style={{ bottom: "20%", right: "25%", width: 7, height: 7, animationDelay: "-1s" }} />

        <div className="relative z-10 flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="dashboard-avatar flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-galaxy-gold to-galaxy-accent shadow-glow">
            {user ? <span className="text-2xl font-black text-galaxy-black">{initials}</span> : <Image src={avatarImage} alt="Electro Galaxy member" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-galaxy-gold/10 px-2.5 py-0.5 text-xs font-semibold text-galaxy-gold">
                <Sparkles className="h-3 w-3" /> {user ? "Member" : "Guest"}
              </span>
            </div>
            <h2 className="mb-1 text-2xl font-bold text-white">
              Welcome, <span className="text-gradient-shift">{displayName}</span>
            </h2>
            <p className="text-sm text-gray-300">
              {user
                ? user.email
                : "Sign in to track orders, manage addresses, and unlock member perks."}
            </p>
          </div>
          {!user ? (
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/login" className="btn-primary px-6 py-2.5 text-sm">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Link>
              <Link href="/auth/register" className="btn-secondary px-6 py-2.5 text-sm">
                Create Account
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary px-6 py-2.5 text-sm">
                <ShoppingBag className="mr-2 h-4 w-4" /> Shop Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href, delta }, i) => (
          <Link
            key={label}
            href={href}
            className="dashboard-card hover-lift card-surface group relative overflow-hidden p-5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-galaxy-gold/5 blur-2xl" />
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-galaxy-gold/10">
                <Icon className="h-5 w-5 text-galaxy-gold" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-galaxy-gold" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs font-medium text-gray-400">{label}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-galaxy-gold/80">
              <TrendingUp className="h-3 w-3" /> {delta}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {menuItems.map(({ href, icon: Icon, label, desc }) => {
            const showCount = href === "/account/wishlist" && wishlistCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className="dashboard-card hover-lift card-surface group overflow-hidden p-5"
              >
                <div className={"pointer-events-none absolute inset-0 bg-gradient-to-br " + (menuItems.find((m) => m.href === href)?.accent || "")} />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-galaxy-gold/10 transition-colors group-hover:bg-galaxy-gold group-hover:text-galaxy-black">
                      <Icon className="h-5 w-5 text-galaxy-gold transition-colors group-hover:text-galaxy-black" />
                    </div>
                    {showCount && (
                      <span className="rounded-full bg-galaxy-gold px-2.5 py-0.5 text-xs font-bold text-galaxy-black">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-white">{label}</h4>
                  <p className="mt-1 text-xs text-gray-400">{desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-galaxy-gold">
                    Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Support perks */}
      <div className="card-surface p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Electro Galaxy Perks
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over ₱5,000 nationwide" },
            { icon: ShieldCheck, title: "2-Year Warranty", desc: "On all major appliances" },
            { icon: CreditCard, title: "Flexible Payments", desc: "COD, GCash, Maya & cards" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-galaxy-gold/10">
                <Icon className="h-5 w-5 text-galaxy-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
