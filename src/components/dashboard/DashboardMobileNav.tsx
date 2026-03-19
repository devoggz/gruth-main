"use client";
// src/components/dashboard/DashboardMobileNav.tsx

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
  badge?: number;
  icon: React.ReactNode;
}

const NAV_ITEMS: Omit<NavItem, "badge">[] = [
  {
    label: "Home",
    href: "/dashboard",
    exact: true,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      </svg>
    ),
  },
  {
    label: "Alerts",
    href: "/dashboard/notifications",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Markets",
    href: "/dashboard/market-prices",
    exact: true,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-6" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

// Extra items shown in the expanded sheet but not in the 5-tab bar
const EXTRA_ITEMS: Omit<NavItem, "badge">[] = [
  {
    label: "Request Verification",
    href: "/request-verification",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    label: "Back to website",
    href: "/",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 19l-7-7 7-7M3 12h18" />
      </svg>
    ),
  },
];

interface Props {
  unreadMessages?: number;
  unreadAlerts?: number;
}

export default function DashboardMobileNav({
  unreadMessages = 0,
  unreadAlerts = 0,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: NavItem[] = NAV_ITEMS.map((item) => ({
    ...item,
    badge:
      item.href === "/dashboard/messages"
        ? unreadMessages
        : item.href === "/dashboard/notifications"
          ? unreadAlerts
          : undefined,
  }));

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* ── Bottom tab bar ─────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-charcoal-950 border-t border-charcoal-800 pb-safe">
        <div className="flex items-stretch h-16">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                  active
                    ? "text-orange-400"
                    : "text-charcoal-500 hover:text-charcoal-300"
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-400 rounded-full" />
                )}
                {/* Badge */}
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute top-2 right-[calc(50%-10px)] translate-x-full -translate-y-0.5 min-w-[16px] h-4 px-1 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
                <span className="w-5 h-5">{item.icon}</span>
                <span className="text-[10px] font-semibold tracking-wide leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* "More" button */}
          <button
            onClick={() => setOpen(true)}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 text-charcoal-500 hover:text-charcoal-300 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="5" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
            <span className="text-[10px] font-semibold tracking-wide leading-none">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ── Slide-up sheet for extra items ─────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-charcoal-950 rounded-t-3xl border-t border-charcoal-800 pb-safe">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-charcoal-700 rounded-full" />
            </div>

            {/* Logo header */}
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-charcoal-800">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle cx="9" cy="9" r="2" fill="white" />
                </svg>
              </div>
              <span className="font-display font-semibold text-white text-base tracking-tight">
                GroundTruth
              </span>
            </div>

            {/* All nav items */}
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {[...NAV_ITEMS, ...EXTRA_ITEMS].map((item) => {
                const active = isActive(item as NavItem);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-white"
                    }`}
                  >
                    <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Close */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-2xl bg-charcoal-800 text-charcoal-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
