"use client";
// src/components/shared/UserMenu.tsx
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function UserMenu({ name, email, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Settings link is role-aware
  const settingsHref =
    role === "ADMIN"
      ? "/admin/settings"
      : role === "INSPECTOR"
        ? "/inspector/settings"
        : "/dashboard/settings";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatarColor =
    role === "ADMIN"
      ? "bg-violet-600"
      : role === "INSPECTOR"
        ? "bg-emerald-600"
        : "bg-charcoal-950";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 group"
      >
        <div className="hidden sm:block text-right">
          <div className="text-sm font-semibold text-charcoal-900 leading-tight">
            {name ?? "User"}
          </div>
          <div className="text-xs text-charcoal-400 leading-tight">{email}</div>
        </div>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ring-2 ring-transparent group-hover:ring-orange-300 ${avatarColor}`}
        >
          {initials}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200 hidden sm:block ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-charcoal-100 shadow-xl shadow-charcoal-900/10 overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-charcoal-100 bg-charcoal-50/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor}`}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-charcoal-900 truncate">
                  {name}
                </div>
                <div className="text-xs text-charcoal-400 truncate">
                  {email}
                </div>
              </div>
            </div>
            {role && role !== "CLIENT" && (
              <div
                className={`mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                  role === "ADMIN"
                    ? "text-violet-600 bg-violet-50"
                    : role === "INSPECTOR"
                      ? "text-emerald-600 bg-emerald-50"
                      : ""
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    role === "ADMIN" ? "bg-violet-500" : "bg-emerald-500"
                  }`}
                />
                {role === "ADMIN" ? "Administrator" : "Field Inspector"}
              </div>
            )}
          </div>

          <div className="py-1.5">
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
            >
              <svg
                className="w-4 h-4 text-charcoal-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              Account Settings
            </Link>

            {role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-charcoal-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
                Admin Console
              </Link>
            )}

            {role === "INSPECTOR" && (
              <Link
                href="/inspector"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-charcoal-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
                My Projects
              </Link>
            )}

            {role === "CLIENT" && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-charcoal-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-charcoal-100 py-1.5">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
