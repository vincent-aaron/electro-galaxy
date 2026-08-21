"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImage from "../../../img/ecom_logo-.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const box =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2 group", className)}>
      <div className={cn("relative overflow-hidden rounded-xl bg-galaxy-card shadow-glow transition-transform group-hover:scale-105", box)}>
        <Image src={logoImage} alt="Electro Galaxy" fill sizes="48px" className="object-cover" priority />
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="hidden sm:block">
          <span
            className={cn(
              "font-black tracking-tight text-white text-glow select-none",
              textSize
            )}
          >
            Electro<span className="text-galaxy-gold">Galaxy</span>
          </span>
        </div>
      )}
    </Link>
  );
}
