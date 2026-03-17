"use client";
// src/app/(auth)/verify-email/page.tsx
// Handles four states driven by ?token=, ?success=1, ?error=invalid|expired|missing|server
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

// ─── State icons ──────────────────────────────────────────────────────────────

const IconMail = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-orange-500"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const IconSuccess = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-emerald-500"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-5" />
  </svg>
);

const IconError = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-500"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

// ─── Main view ────────────────────────────────────────────────────────────────

function VerifyEmailView() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <Card>
        <IconWell color="emerald">
          <IconSuccess />
        </IconWell>
        <h1 className="font-display text-2xl font-bold text-charcoal-950 mb-2">
          Email verified!
        </h1>
        <p className="text-charcoal-500 text-sm mb-8">
          Your GRUTH account is now active. You can sign in and start monitoring
          your projects.
        </p>
        <Link
          href="/login"
          className="btn-primary justify-center w-full text-center"
        >
          Sign in to your account →
        </Link>
      </Card>
    );
  }

  // ── Expired token ──────────────────────────────────────────────────────────
  if (error === "expired") {
    return (
      <Card>
        <IconWell color="red">
          <IconError />
        </IconWell>
        <h1 className="font-display text-2xl font-bold text-charcoal-950 mb-2">
          Link expired
        </h1>
        <p className="text-charcoal-500 text-sm mb-6">
          Your verification link is more than 24 hours old. Enter your email to
          get a fresh one.
        </p>
        <ResendForm
          email={resendEmail}
          setEmail={setResendEmail}
          onResend={handleResend}
          loading={resendLoading}
          sent={resendSent}
        />
      </Card>
    );
  }

  // ── Invalid / missing token ────────────────────────────────────────────────
  if (error === "invalid" || error === "missing") {
    return (
      <Card>
        <IconWell color="red">
          <IconError />
        </IconWell>
        <h1 className="font-display text-2xl font-bold text-charcoal-950 mb-2">
          Invalid link
        </h1>
        <p className="text-charcoal-500 text-sm mb-6">
          This verification link is invalid or has already been used. Request a
          new one below.
        </p>
        <ResendForm
          email={resendEmail}
          setEmail={setResendEmail}
          onResend={handleResend}
          loading={resendLoading}
          sent={resendSent}
        />
      </Card>
    );
  }

  // ── Server error ───────────────────────────────────────────────────────────
  if (error === "server") {
    return (
      <Card>
        <IconWell color="red">
          <IconError />
        </IconWell>
        <h1 className="font-display text-2xl font-bold text-charcoal-950 mb-2">
          Something went wrong
        </h1>
        <p className="text-charcoal-500 text-sm mb-6">
          We couldn&apos;t process your verification. Please try again or
          contact us.
        </p>
        <Link
          href="/contact"
          className="btn-secondary w-full text-center justify-center"
        >
          Contact support
        </Link>
      </Card>
    );
  }

  // ── Default: check your inbox ──────────────────────────────────────────────
  return (
    <Card>
      <IconWell color="orange">
        <IconMail />
      </IconWell>
      <h1 className="font-display text-2xl font-bold text-charcoal-950 mb-2">
        Check your inbox
      </h1>
      <p className="text-charcoal-500 text-sm mb-2">
        We&apos;ve sent a verification link to your email address. Click it to
        activate your account.
      </p>
      <p className="text-charcoal-400 text-xs mb-8">
        The link expires in 24 hours.
      </p>

      {/* Checklist */}
      <div className="bg-charcoal-50 rounded-xl p-4 mb-8 text-left space-y-2">
        {[
          "Check your spam or junk folder",
          "Make sure you used the right email address",
          "Allow a minute or two for delivery",
        ].map((tip) => (
          <div
            key={tip}
            className="flex items-start gap-2 text-xs text-charcoal-500"
          >
            <span className="text-orange-400 mt-0.5">•</span> {tip}
          </div>
        ))}
      </div>

      <div className="border-t border-charcoal-100 pt-6">
        <p className="text-xs text-charcoal-400 mb-3 text-center">
          Didn&apos;t receive it?
        </p>
        <ResendForm
          email={resendEmail}
          setEmail={setResendEmail}
          onResend={handleResend}
          loading={resendLoading}
          sent={resendSent}
        />
      </div>
    </Card>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
        {children}
      </div>
    </div>
  );
}

function IconWell({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "orange" | "emerald" | "red";
}) {
  const bg = {
    orange: "bg-orange-50",
    emerald: "bg-emerald-50",
    red: "bg-red-50",
  }[color];
  return (
    <div
      className={`w-20 h-20 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}
    >
      {children}
    </div>
  );
}

function ResendForm({
  email,
  setEmail,
  onResend,
  loading,
  sent,
}: {
  email: string;
  setEmail: (v: string) => void;
  onResend: () => void;
  loading: boolean;
  sent: boolean;
}) {
  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 font-medium">
        ✓ Email sent — check your inbox
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="input-field flex-1 text-sm"
      />
      <button
        onClick={onResend}
        disabled={loading || !email}
        className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "…" : "Resend"}
      </button>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div />}>
      <VerifyEmailView />
    </Suspense>
  );
}
