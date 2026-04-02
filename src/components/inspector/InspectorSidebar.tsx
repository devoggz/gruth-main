"use client";
// src/components/inspector/InspectorSidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  {
    label: "My Projects",
    href: "/inspector",
    exact: true,
    icon: (
      <svg
        width="15"
        height="15"
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
    label: "Scheduled",
    href: "/inspector/scheduled",
    exact: false,
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/inspector/reports",
    exact: false,
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/inspector/settings",
    exact: false,
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

export default function InspectorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[220px] bg-charcoal-950 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 h-16 px-5 border-b border-white/5 flex-shrink-0">
        <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/40">
          <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="9" cy="9" r="2" fill="white" />
          </svg>
        </div>
        <div>
          <div className="font-display font-bold text-white text-sm tracking-tight leading-tight">
            GRUTH
          </div>
          <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.12em]">
            Inspector Portal
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, exact, icon }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium",
                "transition-all duration-150",
                active
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : "text-charcoal-400 hover:text-white hover:bg-white/7",
              ].join(" ")}
            >
              <span
                className={[
                  "flex-shrink-0 transition-colors",
                  active ? "text-white" : "text-charcoal-500",
                ].join(" ")}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-3 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-charcoal-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
