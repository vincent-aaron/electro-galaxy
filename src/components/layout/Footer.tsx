"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const [year, setYear] = useState(2024);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-galaxy-border bg-galaxy-dark">
      <div className="container-main py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
{/* Brand */}
          <div>
            <Logo showText={false} className="mb-4" />
            <p className="text-sm text-gray-400">
              A portfolio demo of a full-stack electronics store.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Shop</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-galaxy-gold">All Products</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-galaxy-gold">Featured Deals</Link></li>
              <li><Link href="/products?category=kitchen-appliances" className="hover:text-galaxy-gold">Kitchen</Link></li>
              <li><Link href="/products?category=smart-appliances" className="hover:text-galaxy-gold">Smart Home</Link></li>
              <li><Link href="/products?category=entertainment" className="hover:text-galaxy-gold">Entertainment</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Customer Care</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-galaxy-gold">Contact Us</Link></li>
              <li><Link href="/account/orders" className="hover:text-galaxy-gold">Track Order</Link></li>
              <li><Link href="/policies/returns" className="hover:text-galaxy-gold">Returns & Refunds</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-galaxy-gold">Privacy Policy</Link></li>
              <li><Link href="/services" className="hover:text-galaxy-gold">Installation Services</Link></li>
            </ul>
          </div>

          {/* About this demo */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">About This Demo</h3>
            <p className="text-sm text-gray-400">
              Designed and built by Vincent Aaron Vicente. Products and prices are sample data, and brand names belong to their respective owners.
            </p>
            <Link href="/about" className="mt-3 inline-block text-sm text-galaxy-gold hover:underline">About the project</Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-galaxy-border pt-8 sm:flex-row">
<p className="text-sm text-gray-500">
            &copy; {year} Electro Galaxy. Portfolio demo, not a real store.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/policies/privacy" className="hover:text-galaxy-gold">Privacy</Link>
            <Link href="/policies/terms" className="hover:text-galaxy-gold">Terms</Link>
            <Link href="/policies/returns" className="hover:text-galaxy-gold">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
