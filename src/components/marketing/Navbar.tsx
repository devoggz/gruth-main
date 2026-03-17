"use client";
// src/components/marketing/Navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UserMenu from "@/components/shared/UserMenu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerH, setBannerH] = useState(0);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Track PWA banner height so navbar slides below it on mobile
  useEffect(() => {
    const measure = () => {
      const el = document.getElementById("pwa-install-banner");
      setBannerH(el ? el.offsetHeight : 0);
    };
    measure();
    const obs = new MutationObserver(measure);
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    window.addEventListener("resize", measure);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    ["Services", "/services"],
    ["How It Works", "/how-it-works"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ] as const;

  return (
    <>
      <nav
        className={[
          "fixed left-0 right-0 z-50 bg-white",
          "border-b border-charcoal-100",
          "transition-all duration-300",
          scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.08)]" : "",
        ].join(" ")}
        style={{ top: bannerH }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ───────────────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <Image
                src="/images/logo-t.svg"
                alt="GRUTH"
                width={180}
                height={44}
                priority
              />
            </Link>

            {/* ── Desktop nav links ───────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(([label, href]) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                      active
                        ? "text-charcoal-950"
                        : "text-charcoal-500 hover:text-charcoal-900",
                    ].join(" ")}
                  >
                    {label}
                    {active && (
                      <span className="absolute bottom-1 left-3.5 right-3.5 h-px bg-orange-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── Desktop right: CTA / user menu ──────────────────────────── */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {!session ? (
                <div className="flex items-center gap-2.5">
                  {/* Ghost sign-in */}
                  <Link
                    href="/login"
                    className="text-sm font-medium text-charcoal-500 hover:text-charcoal-900 transition-colors duration-150 px-1"
                  >
                    Sign in
                  </Link>

                  {/* Primary CTA */}
                  <Link
                    href="/request-verification"
                    className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                  >
                    Get a Verification
                    {/* Arrow animates right on hover */}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <UserMenu
                  name={user?.name}
                  email={user?.email}
                  role={user?.role}
                />
              )}
            </div>

            {/* ── Mobile: user avatar (shown when logged in) + hamburger ── */}
            <div className="md:hidden flex items-center gap-2">
              {session && (
                <UserMenu
                  name={user?.name}
                  email={user?.email}
                  role={user?.role}
                />
              )}
              <button
                className="p-2 rounded-lg text-charcoal-500 hover:text-charcoal-900 transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  {mobileOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <>
                      <line x1="3" y1="7" x2="21" y2="7" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="17" x2="21" y2="17" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
          style={{
            background: "#ffffff",
            borderTop: "1px solid #e8e8e6",
          }}
        >
          <div className="px-4 pt-4 pb-6 space-y-1">
            {navLinks.map(([label, href]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "text-charcoal-950 bg-charcoal-50"
                      : "text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-50",
                  ].join(" ")}
                >
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="pt-3 border-t border-charcoal-100 space-y-2.5">
              {!session ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal-700 hover:text-charcoal-950 border border-charcoal-200 hover:border-charcoal-300 transition-all duration-150"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/request-verification"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all duration-150"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get a Verification
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  {/* Dashboard quick-link */}
                  <Link
                    href={
                      user?.role === "ADMIN"
                        ? "/admin"
                        : user?.role === "INSPECTOR"
                          ? "/inspector"
                          : "/dashboard"
                    }
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all duration-150"
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    {user?.role === "ADMIN"
                      ? "Admin Console"
                      : user?.role === "INSPECTOR"
                        ? "Inspector Portal"
                        : "My Dashboard"}
                  </Link>

                  {/* New verification CTA */}
                  <Link
                    href="/request-verification"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal-700 hover:text-charcoal-950 border border-charcoal-200 hover:border-charcoal-300 transition-all duration-150"
                    onClick={() => setMobileOpen(false)}
                  >
                    New Verification Request
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
