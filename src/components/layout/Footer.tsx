"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
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
            <p className="mb-4 text-sm text-gray-400">
              Your trusted destination for premium electronics and smart appliances in the Philippines.
            </p>
            <div className="flex gap-3">
              <a href="#" className="rounded-lg bg-galaxy-card p-2 text-gray-400 hover:text-galaxy-gold" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-galaxy-card p-2 text-gray-400 hover:text-galaxy-gold" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-galaxy-card p-2 text-gray-400 hover:text-galaxy-gold" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
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

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-galaxy-gold" />
                <span>123 Galaxy Street, Makati City, Metro Manila, Philippines</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-galaxy-gold" />
                <a href="tel:+63281234567" className="hover:text-galaxy-gold">+63 2 8123 4567</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-galaxy-gold" />
                <a href="mailto:support@electrogalaxy.ph" className="hover:text-galaxy-gold">support@electrogalaxy.ph</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-galaxy-border pt-8 sm:flex-row">
<p className="text-sm text-gray-500">
            &copy; {year} Electro Galaxy. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/policies/privacy" className="hover:text-galaxy-gold">Privacy</Link>
            <Link href="/policies/returns" className="hover:text-galaxy-gold">Terms</Link>
            <Link href="/policies/returns" className="hover:text-galaxy-gold">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
