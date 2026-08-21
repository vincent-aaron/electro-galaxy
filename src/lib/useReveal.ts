"use client";

import { useEffect, useRef } from "react";

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const { threshold = 0.15, rootMargin = "0px 0px -40px 0px", once = true } =
      options;
    const element = ref.current;
    if (!element) return;

    element.classList.add("reveal-init");

    if (!("IntersectionObserver" in window)) {
      element.classList.add("reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("reveal-visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
