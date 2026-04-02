"use client";
// src/components/auth/LoginForm.tsx

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ─── Inner form — uses useSearchParams so wrapped in Suspense by parent ───────

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const registered = searchParams.get("registered");

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Card header */}
        <div className="px-6 pt-6 pb-5 text-center">
          <div className="flex justify-center mb-3">
            <Image src="/images/icon.svg" alt="GRUTH" width={36} height={36} />
          </div>
          <h1 className="font-display text-xl font-bold text-charcoal-950 leading-tight">
            Welcome back
          </h1>
          <p className="text-charcoal-400 text-xs mt-0.5">
            Sign in to your GRUTH account
          </p>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4">
          {/* Success banner */}
          {registered && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs text-emerald-700 flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Account created! Check your email to verify, then sign in.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-xs text-red-700 flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          {/* Email + Password */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="label !mb-0">Email</label>

            <div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link
                  prefetch={true}
                  href="/forgot-password"
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full justify-center py-2.5 text-sm disabled:opacity-60 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-charcoal-100" />
            <span className="text-[11px] text-charcoal-400 font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-charcoal-100" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-charcoal-200 bg-white hover:bg-charcoal-50 hover:border-charcoal-300 transition-all text-sm font-semibold text-charcoal-800 disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-charcoal-300 border-t-charcoal-800 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>
        </div>

        {/* Card footer */}
        <div className="px-6 pb-5 pt-1 text-center space-y-2 border-t border-charcoal-50">
          <p className="text-xs text-charcoal-500">
            No account?{" "}
            <Link
              prefetch={true}
              href="/register"
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
            >
              Create Account
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-charcoal-400 hover:text-charcoal-600 transition-colors"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M10 19l-7-7 7-7M3 12h18" />
            </svg>
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Exported component — wraps in Suspense for useSearchParams ───────────────

export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[360px] mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 h-[420px] animate-pulse" />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
