// src/middleware.ts — GRUTH route guard
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  // ── Admin routes — ADMIN only ──────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "ADMIN") {
      const dest = role === "INSPECTOR" ? "/inspector" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // ── Inspector routes — INSPECTOR or ADMIN ──────────────────────────────────
  if (pathname.startsWith("/inspector")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "INSPECTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ── Dashboard — CLIENT only (admins/inspectors have their own portals) ─────
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role === "ADMIN")
      return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "INSPECTOR")
      return NextResponse.redirect(new URL("/inspector", req.url));
    return NextResponse.next();
  }

  // ── Auth pages — redirect logged-in users to their portal ─────────────────
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      if (role === "ADMIN")
        return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "INSPECTOR")
        return NextResponse.redirect(new URL("/inspector", req.url));
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/inspector/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
