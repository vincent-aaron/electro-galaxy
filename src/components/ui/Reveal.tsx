"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={cn("reveal-init", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
