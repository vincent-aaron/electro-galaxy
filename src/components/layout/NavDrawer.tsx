"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Heart, LogOut, Mail, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  navLinks: { href: string; label: string }[];
  pathname: string;
  signedIn: boolean;
  onSignOut: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

const rowClass =
  "flex min-h-11 items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-galaxy-card hover:text-galaxy-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-galaxy-gold";
const headingClass = "px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500";

export function NavDrawer({
  open,
  onClose,
  categories,
  navLinks,
  pathname,
  signedIn,
  onSignOut,
  returnFocusRef,
}: NavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock page scroll without shifting the layout when the scrollbar disappears.
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  // Move focus in on open, and back to the menu button on close.
  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef.current;
    closeRef.current?.focus();
    return () => returnTo?.focus();
  }, [open, returnFocusRef]);

  // Esc closes; Tab stays inside the drawer.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panelRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")} aria-hidden={!open} inert={!open}>
      <div
        data-testid="nav-drawer-overlay"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/70 transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        ref={panelRef}
        id="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nav-drawer-title"
        className={cn(
          "absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r border-galaxy-border bg-galaxy-dark shadow-card duration-300 ease-out motion-reduce:transition-none",
          // Visibility only animates on close, so focus can move in as soon as it opens.
          open ? "visible translate-x-0 transition-transform" : "invisible -translate-x-full transition-[transform,visibility]"
        )}
      >
        <div className="flex items-center justify-between border-b border-galaxy-border px-4 py-3">
          <Logo size="sm" />
          <h2 id="nav-drawer-title" className="sr-only">
            Store menu
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} className="btn-ghost h-11 w-11 p-0" aria-label="Close menu">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Store menu" className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 py-5">
          <section>
            <h3 className={headingClass}>Categories</h3>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/products?category=${category.slug}`} onClick={onClose} className={rowClass}>
                    {category.name}
                    <ChevronRight className="h-4 w-4 text-gray-600" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="md:hidden">
            <h3 className={headingClass}>Browse</h3>
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(rowClass, pathname === link.href && "text-galaxy-gold")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="sm:hidden">
            <h3 className={headingClass}>Your account</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/account" onClick={onClose} className={rowClass}>
                  <span className="flex items-center gap-3"><User className="h-4 w-4" aria-hidden="true" /> My Account</span>
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" onClick={onClose} className={rowClass}>
                  <span className="flex items-center gap-3"><Heart className="h-4 w-4" aria-hidden="true" /> Wishlist</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={onClose} className={rowClass}>
                  <span className="flex items-center gap-3"><Mail className="h-4 w-4" aria-hidden="true" /> Contact Us</span>
                </Link>
              </li>
              {signedIn && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className={cn(rowClass, "w-full text-red-400 hover:text-red-400")}
                  >
                    <span className="flex items-center gap-3"><LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out</span>
                  </button>
                </li>
              )}
            </ul>
          </section>
        </nav>
      </div>
    </div>,
    document.body
  );
}
