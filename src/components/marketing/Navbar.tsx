"use client";
// src/components/marketing/Navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import UserMenu from "@/components/shared/UserMenu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [bannerH,    setBannerH]     = useState(0);
  const pathname  = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  // Only show transparent navbar on the homepage — everywhere else it's always white
  const isHomePage  = pathname === "/";
  // Transparent when: homepage AND not yet scrolled
  const transparent = isHomePage && !scrolled;

  useEffect(() => {
    // Throttled scroll handler — max once per animation frame (prevents mobile jank)
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    // Initialise scrolled state immediately on mount
    setScrolled(window.scrollY > 24);
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
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener("resize", measure);
    return () => { obs.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    ["Services",     "/services"    ],
    ["How It Works", "/how-it-works"],
    ["About",        "/about"       ],
    ["Contact",      "/contact"     ],
  ] as const;

  return (
      <>
        <nav
            className={[
              "fixed left-0 right-0 z-50 transition-all duration-300",
              transparent
                  ? "bg-transparent border-b border-transparent"
                  : "bg-white border-b border-charcoal-100 shadow-[0_2px_16px_rgba(0,0,0,0.08)]",
            ].join(" ")}
            style={{ top: bannerH }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* ── Logo ─────────────────────────────────────────────────────── */}
              <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
                <Image
                    src={transparent ? "/images/logo-w.svg" : "/images/logo-t.svg"}
                    alt="GRUTH"
                    width={90}
                    height={30}
                    style={{ width: "auto", height: "30px" }}
                    priority
                />
              </Link>

              {/* ── Desktop nav links ─────────────────────────────────────────── */}
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
                                ? transparent ? "text-white"          : "text-charcoal-950"
                                : transparent ? "text-white/80 hover:text-white" : "text-charcoal-500 hover:text-charcoal-900",
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

              {/* ── Desktop right ─────────────────────────────────────────────── */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                {!session ? (
                    <div className="flex items-center gap-2.5">
                      <Link
                          href="/login"
                          className={`text-sm font-medium transition-colors duration-150 px-1 ${
                              transparent
                                  ? "text-white/80 hover:text-white"
                                  : "text-charcoal-500 hover:text-charcoal-900"
                          }`}
                      >
                        Sign in
                      </Link>
                      <Link
                          href="/request-verification"
                          className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                      >
                        Get it Verified
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                             className="transition-transform duration-200 group-hover:translate-x-0.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                ) : (
                    <UserMenu name={user?.name} email={user?.email} role={user?.role} image={user?.image} />
                )}
              </div>

              {/* ── Mobile: hamburger ─────────────────────────────────────────── */}
              <div className="md:hidden flex items-center gap-2">
                {/* Show avatar when logged in on mobile so user knows they're signed in */}
                {session && (
                    <button
                        onClick={() => setMobileOpen(v => !v)}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-charcoal-950 text-white text-xs font-bold"
                        aria-label="Open user menu"
                    >
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </button>
                )}
                <button
                    className={`p-2 rounded-lg transition-colors ${
                        transparent
                            ? "text-white/80 hover:text-white"
                            : "text-charcoal-500 hover:text-charcoal-900"
                    }`}
                    onClick={() => setMobileOpen(v => !v)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

          {/* ── Mobile drawer ─────────────────────────────────────────────────────
            IMPORTANT: overflow-visible so the UserMenu dropdown is not clipped.
            Height is animated via max-h but we need visible overflow for the
            absolute-positioned user menu panel — handled via padding instead. */}
          <div
              className={[
                "md:hidden transition-all duration-300 ease-in-out bg-white border-t border-charcoal-100",
                mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
              ].join(" ")}
              style={{
                // Use max-height on the inner content div (below), not here —
                // this outer div must NOT have overflow:hidden so dropdowns work
                display: mobileOpen ? "block" : "none",
              }}
          >
            <div className="px-4 pt-4 pb-6 space-y-1">
              {/* Nav links */}
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
                        onClick={() => setMobileOpen(false)}
                    >
                      {label}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    </Link>
                );
              })}

              {/* Auth section */}
              <div className="pt-3 border-t border-charcoal-100">
                {!session ? (
                    <div className="space-y-2.5">
                      <Link
                          href="/login"
                          className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal-700 border border-charcoal-200 hover:border-charcoal-300 transition-all"
                          onClick={() => setMobileOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                          href="/request-verification"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all"
                          onClick={() => setMobileOpen(false)}
                      >
                        Get a Verification
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                ) : (
                    // ── Logged-in mobile user panel ───────────────────────────────
                    // Rendered inline (not in a dropdown) so nothing gets clipped.
                    <div className="space-y-1">
                      {/* User identity */}
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-charcoal-50 mb-2">
                        <div className="w-9 h-9 rounded-full bg-charcoal-950 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-charcoal-900 truncate">{user?.name ?? "User"}</p>
                          <p className="text-xs text-charcoal-400 truncate">{user?.email}</p>
                        </div>
                        {user?.role && user.role !== "CLIENT" && (
                            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                                user.role === "ADMIN" ? "text-violet-600 bg-violet-50" : "text-emerald-600 bg-emerald-50"
                            }`}>
                        {user.role === "ADMIN" ? "Admin" : "Inspector"}
                      </span>
                        )}
                      </div>

                      {/* Dashboard / portal link */}
                      {user?.role === "ADMIN" && (
                          <Link href="/admin" onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
                            <svg className="w-4 h-4 text-charcoal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                              <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                            </svg>
                            Admin Console
                          </Link>
                      )}
                      {user?.role === "INSPECTOR" && (
                          <Link href="/inspector" onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
                            <svg className="w-4 h-4 text-charcoal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                            </svg>
                            My Projects
                          </Link>
                      )}
                      {(!user?.role || user.role === "CLIENT") && (
                          <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
                            <svg className="w-4 h-4 text-charcoal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                            Dashboard
                          </Link>
                      )}
                      <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
                        <svg className="w-4 h-4 text-charcoal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        Account Settings
                      </Link>

                      {/* Sign out — always visible, never clipped */}
                      <button
                          onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        Sign Out
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </>
  );
}