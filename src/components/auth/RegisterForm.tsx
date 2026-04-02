"use client";
// src/components/auth/RegisterForm.tsx

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js";
import "react-phone-number-input/style.css";

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-5">
      {(["Account", "Security"] as const).map((label, i) => {
        const n = (i + 1) as 1 | 2;
        const done = step > n;
        const active = step === n;
        return (
          <React.Fragment key={n}>
            {i > 0 && (
              <div
                className={`h-px w-10 transition-colors duration-300 ${
                  done ? "bg-orange-400" : "bg-charcoal-200"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-300"
                      : "bg-charcoal-100 text-charcoal-400"
                }`}
              >
                {done ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`text-[10px] font-semibold leading-none ${
                  active
                    ? "text-orange-600"
                    : done
                      ? "text-charcoal-400"
                      : "text-charcoal-300"
                }`}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Inline field error ───────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-[11px] mt-1">
      <svg
        className="w-3 h-3 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {msg}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RegisterForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refFromUrl = searchParams?.get("ref") ?? "";
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "" as E164Number | "",
    hearAboutUs: "",
    referralCode: refFromUrl,
  });

  const set = (field: string, value: any) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setSubmitError(null);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  // ── Step 1 validation: name + email ──────────────────────────────────────
  const validateStep1 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    return e;
  };

  // ── Step 2 validation: password + phone ──────────────────────────────────
  const validateStep2 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (form.phone && !isValidPhoneNumber(form.phone as string))
      e.phone = "Enter a valid phone number";
    return e;
  };

  const goToStep2 = () => {
    const e = validateStep1();
    if (Object.keys(e).length) {
      setFieldErrors(e);
      return;
    }
    setFieldErrors({});
    setSubmitError(null);
    setStep(2);
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    const e = validateStep2();
    if (Object.keys(e).length) {
      setFieldErrors(e);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          hearAboutUs: form.hearAboutUs || undefined,
          referralCode: form.referralCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Registration failed.");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Phone input styles — matches request-verification form */}
      <style>{`
        .reg-phone .PhoneInput {
          display: flex; align-items: center; width: 100%;
          padding: 0 14px; height: 44px;
          border: 1px solid #d3d2cf; border-radius: 0.75rem;
          background: #fff;
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          font-size: 14px; color: #3d3b36;
          transition: all 0.15s ease; gap: 10px;
        }
        .reg-phone .PhoneInput:focus-within {
          border-color: transparent;
          box-shadow: 0 0 0 2px rgba(249,115,22,0.4);
        }
        .reg-phone.has-error .PhoneInput { border-color: #fca5a5; }
        .reg-phone.has-error .PhoneInput:focus-within {
          border-color: transparent;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.4);
        }
        .reg-phone .PhoneInputCountry {
          display: flex; align-items: center; gap: 6px;
          flex-shrink: 0; padding-right: 10px;
          border-right: 1px solid #e5e7eb;
          position: relative; cursor: pointer;
        }
        .reg-phone .PhoneInputCountryFlag {
          width: 20px; height: 14px;
          border-radius: 2px; overflow: hidden;
        }
        .reg-phone .PhoneInputCountrySelect {
          position: absolute; inset: 0;
          opacity: 0; cursor: pointer; z-index: 2;
        }
        .reg-phone .PhoneInputCountrySelectArrow {
          width: 5px; height: 5px;
          border-right: 1.5px solid #9ca3af;
          border-bottom: 1.5px solid #9ca3af;
          transform: rotate(45deg) translateY(-2px);
          margin-left: 2px;
        }
        .reg-phone .PhoneInputInput {
          flex: 1; border: none; outline: none;
          background: transparent;
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          font-size: 14px; color: #3d3b36;
          padding: 0; min-width: 0;
        }
        .reg-phone .PhoneInputInput::placeholder { color: #9ca3af; }
      `}</style>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center border-b border-charcoal-100">
            <div className="flex justify-center mb-3">
              <Image
                src="/images/icon.svg"
                alt="GRUTH"
                width={36}
                height={36}
              />
            </div>
            <h1 className="font-display text-xl font-bold text-charcoal-950 leading-tight">
              Create your account
            </h1>
            <p className="text-charcoal-400 text-xs mt-0.5">
              Start monitoring your Kenyan investments
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <StepDots step={step} />

            {/* Submit error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-xs text-red-700 flex items-start gap-2 mb-4">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 mt-px"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {submitError}
              </div>
            )}

            {/* ── Step 1: Name + Email ──────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-3">
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
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
                  {googleLoading ? "Redirecting…" : "Sign up with Google"}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-charcoal-100" />
                  <span className="text-[11px] text-charcoal-400 font-medium">
                    or with email
                  </span>
                  <div className="flex-1 h-px bg-charcoal-100" />
                </div>

                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goToStep2()}
                    className={`input-field ${fieldErrors.name ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                  />
                  <FieldError msg={fieldErrors.name} />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goToStep2()}
                    className={`input-field ${fieldErrors.email ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                    placeholder="james@example.com"
                  />
                  <FieldError msg={fieldErrors.email} />
                </div>

                <button
                  type="button"
                  onClick={goToStep2}
                  className="btn-primary w-full justify-center py-2.5 text-sm mt-1"
                >
                  Continue
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── Step 2: Password + Phone ──────────────────────────────── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className={`input-field ${fieldErrors.password ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                    placeholder="Minimum 8 characters"
                    autoFocus
                  />
                  <FieldError msg={fieldErrors.password} />
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    className={`input-field ${fieldErrors.confirmPassword ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
                    placeholder="Repeat your password"
                  />
                  <FieldError msg={fieldErrors.confirmPassword} />
                </div>

                <div>
                  <label className="label">
                    Phone / WhatsApp
                    <span className="font-normal text-charcoal-400 text-[11px] ml-1.5">
                      optional
                    </span>
                  </label>
                  <div
                    className={`reg-phone ${fieldErrors.phone ? "has-error" : ""}`}
                  >
                    <PhoneInput
                      international
                      defaultCountry="GB"
                      countryCallingCodeEditable={false}
                      value={form.phone as E164Number}
                      onChange={(val) => set("phone", val ?? "")}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <FieldError msg={fieldErrors.phone} />
                  <p className="text-[11px] text-charcoal-400 mt-1">
                    For WhatsApp project updates
                  </p>
                </div>

                {/* How did you hear about us */}
                <div>
                  <label className="label">
                    How did you hear about GRUTH?
                    <span className="font-normal text-charcoal-400 text-[11px] ml-1.5">
                      optional
                    </span>
                  </label>
                  <select
                    value={form.hearAboutUs}
                    onChange={(e) => set("hearAboutUs", e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Select one…</option>
                    <option value="Friend or family">Friend or family</option>
                    <option value="Facebook Group">Facebook Group</option>
                    <option value="WhatsApp Group">WhatsApp Group</option>
                    <option value="YouTube">YouTube</option>
                    <option value="X / Twitter">X / Twitter</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Solicitor / lawyer">
                      Solicitor / lawyer
                    </option>
                    <option value="Bank or remittance service">
                      Bank or remittance service
                    </option>
                    <option value="Community event">Community event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Referral code — pre-filled from URL, editable */}
                {form.referralCode && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-800">
                        Referral code applied
                      </p>
                      <p className="text-[10px] text-emerald-600 font-mono">
                        {form.referralCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set("referralCode", "")}
                      className="text-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFieldErrors({});
                      setStep(1);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm font-semibold text-charcoal-600 hover:border-charcoal-300 hover:text-charcoal-900 transition-all"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 justify-center py-2.5 text-sm disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Creating…
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-2 text-center space-y-2 border-t border-charcoal-50">
            <p className="text-[11px] text-charcoal-400 leading-relaxed">
              By signing up you agree to our{" "}
              <Link
                href="/terms"
                className="text-charcoal-600 hover:text-orange-600 underline underline-offset-2 transition-colors"
              >
                Terms
              </Link>{" "}
              &amp;{" "}
              <Link
                href="/privacy"
                className="text-charcoal-600 hover:text-orange-600 underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
            <p className="text-xs text-charcoal-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
              >
                Sign in
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
    </>
  );
}
