"use client";
// src/components/shared/MobileBottomNav.tsx
// Shared mobile bottom navigation bar used across Client, Inspector and Admin portals.
// Hidden on md+ where the sidebar handles navigation.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, PortalAccent } from "@/types/navigation";

interface MobileBottomNavProps {
  items: NavItem[];
  accent?: PortalAccent;
}

const ACTIVE_COLORS: Record<PortalAccent, string> = {
  orange: "text-orange-500",
  emerald: "text-emerald-600",
  violet: "text-violet-600",
};

const ACTIVE_BG: Record<PortalAccent, string> = {
  orange: "bg-orange-50",
  emerald: "bg-emerald-50",
  violet: "bg-violet-50",
};

const INDICATOR_COLOR: Record<PortalAccent, string> = {
  orange: "bg-orange-500",
  emerald: "bg-emerald-600",
  violet: "bg-violet-600",
};

export default function MobileBottomNav({
  items,
  accent = "orange",
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const activeColor = ACTIVE_COLORS[accent];
  const activeBg = ACTIVE_BG[accent];
  const indicatorColor = INDICATOR_COLOR[accent];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.07)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-stretch justify-around px-1">
        {items.map(({ label, href, icon, exact, badge }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex flex-col items-center justify-center gap-1
                flex-1 min-h-[60px] pt-2 pb-1 px-1
                text-[10px] font-semibold tracking-wide
                transition-colors duration-150
                ${active ? `${activeColor} ${activeBg} rounded-xl mx-0.5 my-1` : "text-charcoal-400"}
              `}
            >
              {/* Active indicator dot at top */}
              {active && (
                <span
                  className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${indicatorColor}`}
                />
              )}

              {/* Icon with scale animation on active */}
              <span
                className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </span>

              {/* Label */}
              <span className="leading-none">{label}</span>

              {/* Badge */}
              {badge != null && badge > 0 && (
                <span
                  className="absolute top-1 right-[calc(50%-16px)] min-w-[16px] h-4 px-1
                    bg-orange-500 text-white text-[9px] font-bold rounded-full
                    flex items-center justify-center leading-none"
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
