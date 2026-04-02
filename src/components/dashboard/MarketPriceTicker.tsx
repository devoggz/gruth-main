"use client";
// src/components/dashboard/MarketPriceTicker.tsx
// Infinite scrolling price ticker — animates right-to-left in a continuous loop.
// Duplicates the item list so the scroll is seamless (no gap at the end).

import { useEffect, useRef, useState } from "react";

interface TickerItem {
  county:       string;
  material:     string;
  priceKes:     number;
  priceLow:     number | null;
  priceHigh:    number | null;
  trend:        "UP" | "DOWN" | "STABLE";
}

interface Props {
  items:   TickerItem[];
  speed?:  number;   // pixels per second, default 40
  paused?: boolean;  // pause on hover
}

const TREND_STYLE = {
  UP:     { label: "↑", color: "text-red-400"     },
  DOWN:   { label: "↓", color: "text-emerald-400" },
  STABLE: { label: "→", color: "text-charcoal-400"},
};

function TickerCard({ item }: { item: TickerItem }) {
  const t = TREND_STYLE[item.trend];
  return (
    <div className="flex items-center gap-3 flex-shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 mx-2">
      {/* County pill */}
      <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
        {item.county}
      </span>
      {/* Material */}
      <span className="text-xs font-medium text-charcoal-300 whitespace-nowrap max-w-[160px] truncate">
        {item.material}
      </span>
      {/* Price */}
      <span className="text-sm font-display font-bold text-white whitespace-nowrap">
        KES {item.priceKes.toLocaleString()}
      </span>
      {/* Range */}
      {item.priceLow != null && item.priceHigh != null && (
        <span className="text-[10px] text-charcoal-500 whitespace-nowrap hidden sm:inline">
          {item.priceLow.toLocaleString()}–{item.priceHigh.toLocaleString()}
        </span>
      )}
      {/* Trend */}
      <span className={`text-xs font-bold ${t.color}`}>{t.label}</span>
    </div>
  );
}

export default function MarketPriceTicker({ items, speed = 40, paused = false }: Props) {
  const trackRef   = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number | undefined>(undefined);
  const posRef     = useRef(0);
  const [hovering, setHovering] = useState(false);

  // Double the items for seamless loop
  const doubled = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    let last: number | null = null;

    function animate(ts: number) {
      if (!track) return;

      if (last !== null && !hovering && !paused) {
        const delta = ts - last;
        posRef.current += (speed * delta) / 1000;

        // Reset when we've scrolled exactly half (one set of items)
        const halfWidth = track.scrollWidth / 2;
        if (posRef.current >= halfWidth) {
          posRef.current -= halfWidth;
        }

        track.style.transform = `translateX(-${posRef.current}px)`;
      }

      last = ts;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [items, speed, hovering, paused]);

  if (items.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden bg-charcoal-950 border border-charcoal-800 rounded-2xl"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #1a1916, transparent)" }}
      />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #1a1916, transparent)" }}
      />

      
      {/* Pause indicator */}
      {hovering && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <span className="text-[10px] text-charcoal-600 font-medium">Paused</span>
        </div>
      )}

      {/* Scrolling track */}
      <div className="py-3 pl-28 pr-4">
        <div ref={trackRef} className="flex will-change-transform">
          {doubled.map((item, i) => (
            <TickerCard key={`${item.county}-${item.material}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Server-side data helper ──────────────────────────────────────────────────
// Call this in your page/layout to get ticker items from the DB.
// Import and use in dashboard/page.tsx or market-prices/page.tsx.

export type { TickerItem };
