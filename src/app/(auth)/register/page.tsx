"use client";
// src/app/(auth)/register/page.tsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phone: "",
  });

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          country: form.country,
          phone: form.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-11 h-11  rounded-xl flex items-center justify-center mx-auto mb-4">
            <Image src="/images/icon.svg" alt="logo" width={100} height={100} />
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal-950 mb-1">
            Create account
          </h1>
          <p className="text-charcoal-500 text-sm">
            Start monitoring your Kenyan investments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 text-sm text-red-700 flex items-start gap-2.5">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
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

        {/* Google Sign Up */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-charcoal-200 bg-white hover:bg-charcoal-50 hover:border-charcoal-300 transition-all text-sm font-semibold text-charcoal-800 disabled:opacity-60 mb-5"
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-charcoal-300 border-t-charcoal-800 rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
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
          {googleLoading ? "Redirecting..." : "Sign up with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-charcoal-100" />
          <span className="text-xs text-charcoal-400 font-medium">
            or with email
          </span>
          <div className="flex-1 h-px bg-charcoal-100" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              placeholder="James Mwangi"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className="input-field"
              placeholder="james@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="label">Confirm</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="label">Country of Residence</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) =>
                setForm((p) => ({ ...p, country: e.target.value }))
              }
              className="input-field"
              placeholder="United Kingdom"
            />
          </div>
          <div>
            <label className="label">Phone / WhatsApp</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              className="input-field"
              placeholder="+44 7700 900123"
            />
          </div>
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-charcoal-400 mt-4 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="text-charcoal-600 hover:text-orange-600 underline underline-offset-2"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-charcoal-600 hover:text-orange-600 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </p>

        <p className="text-center text-sm text-charcoal-500 mt-5">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 font-semibold hover:text-orange-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
