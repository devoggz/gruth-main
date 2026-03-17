"use client";
// src/hooks/useFadeIn.ts
// Shared scroll-triggered fade-in hook for all marketing sections.
// Adds `in-view` class to the element when it enters the viewport.

import { useEffect, useRef } from "react";

export function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          obs.disconnect();
        }
      },
      { threshold },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}
