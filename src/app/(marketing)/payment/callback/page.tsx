// src/app/(marketing)/payment/callback/page.tsx
// Paystack redirects here after payment (success OR failure).
// This page verifies the transaction server-side before doing anything.
// Only on verified SUCCESS does it create the VerificationRequest record.

import { redirect }  from "next/navigation";
import { auth }      from "@/lib/auth";
import { prisma }    from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import Link          from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment · GRUTH" };

// Prevent page from being cached — each visit must re-verify
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ reference?: string }>;
}

export default async function PaymentCallbackPage({ searchParams }: Props) {
  const { reference } = await searchParams;

  // No reference — bad URL
  if (!reference) redirect("/request-verification");

  // Must be logged in
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?redirect=/payment/callback?reference=${reference}`);

  // ── Look up the pending payment ──────────────────────────────────────────────
  const pending = await prisma.pendingPayment.findUnique({
    where: { paystackRef: reference },
  });

  if (!pending) {
    return <CallbackResult status="not_found" />;
  }

  // Ownership check — prevent users from claiming others' payments
  if (pending.userId !== session.user.id) {
    return <CallbackResult status="not_found" />;
  }

  // Already processed
  if (pending.status === "PAID") {
    return <CallbackResult status="already_paid" />;
  }

  if (pending.status === "FAILED") {
    return <CallbackResult status="failed" reference={reference} />;
  }

  // Expired
  if (new Date() > pending.expiresAt && pending.status === "PENDING") {
    await prisma.pendingPayment.update({
      where: { paystackRef: reference },
      data:  { status: "EXPIRED" },
    });
    return <CallbackResult status="expired" />;
  }

  // ── Verify with Paystack ─────────────────────────────────────────────────────
  let verification: Awaited<ReturnType<typeof verifyTransaction>>;
  try {
    verification = await verifyTransaction(reference);
  } catch (err) {
    console.error("[callback] verify error:", err);
    return <CallbackResult status="verify_error" reference={reference} />;
  }

  // ── Handle non-success statuses ──────────────────────────────────────────────
  if (verification.status !== "success") {
    await prisma.pendingPayment.update({
      where: { paystackRef: reference },
      data:  { status: "FAILED" },
    });
    return <CallbackResult status="failed" reference={reference} />;
  }

  // ── Double-check amount matches what we stored ───────────────────────────────
  if (verification.amountKes !== pending.amountKes) {
    console.error(
      `[callback] amount mismatch ref=${reference} ` +
      `expected=${pending.amountKes} got=${verification.amountKes}`
    );
    return <CallbackResult status="amount_mismatch" reference={reference} />;
  }

  // ── Create the VerificationRequest — ONLY after confirmed payment ────────────
  let snapshot: Record<string, unknown>;
  try {
    snapshot = JSON.parse(pending.formSnapshot);
  } catch {
    return <CallbackResult status="verify_error" reference={reference} />;
  }

  // Use a transaction to update pending + create request atomically
  const verificationRequest = await prisma.$transaction(async tx => {
    // Mark pending as paid
    await tx.pendingPayment.update({
      where: { paystackRef: reference },
      data:  { status: "PAID" },
    });

    // Create the verification request
    return tx.verificationRequest.create({
      data: {
        name:             String(snapshot.name            ?? ""),
        email:            String(snapshot.email           ?? session.user.email),
        phone:            snapshot.phone    ? String(snapshot.phone)    : null,
        country:          snapshot.country  ? String(snapshot.country)  : null,
        projectLocation:  String(snapshot.projectLocation ?? ""),
        county:           snapshot.county   ? String(snapshot.county)   : null,
        serviceType:      String(snapshot.serviceType     ?? ""),
        description:      String(snapshot.description     ?? ""),
        urgency:          String(snapshot.urgency         ?? "standard"),
        specificConcerns: snapshot.specificConcerns ? String(snapshot.specificConcerns) : null,
        onGroundContact:  snapshot.onGroundContact  ? String(snapshot.onGroundContact)  : null,
        filesJson:        snapshot.uploadedFiles    ? JSON.stringify(snapshot.uploadedFiles) : null,
        status:           "NEW",
        paymentRef:       reference,
        paymentStatus:    "PAID",
        amountKes:        pending.amountKes,
        paidAt:           new Date(verification.paidAt ?? Date.now()),
      },
    });
  });

  // ── Send payment confirmation email (non-blocking) ───────────────────────
  sendPaymentConfirmationEmail({
    to:          String(snapshot.email  ?? session.user.email ?? ""),
    name:        String(snapshot.name   ?? session.user.name  ?? ""),
    serviceType: String(snapshot.serviceType ?? ""),
    reference,
    amountKes:   pending.amountKes,
    channel:     verification.channel,
  }).catch(e => console.error("[callback] confirmation email error:", e));

  return <CallbackResult status="success" requestId={verificationRequest.id} channel={verification.channel} amountKes={pending.amountKes} />;
}

// ─── Result screens ───────────────────────────────────────────────────────────

function CallbackResult({
  status,
  reference,
  requestId,
  channel,
  amountKes,
}: {
  status:     "success" | "failed" | "expired" | "not_found" | "verify_error" | "already_paid" | "amount_mismatch";
  reference?: string;
  requestId?: string;
  channel?:   string;
  amountKes?: number;
}) {
  if (status === "success") {
    const channelLabel = channel === "mobile_money" ? "M-Pesa" : channel === "apple_pay" ? "Apple Pay" : "Card";
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50">
            <svg className="w-12 h-12 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal-950 mb-3 tracking-tight">Payment confirmed.</h1>
          <p className="text-charcoal-600 mb-2 leading-relaxed">
            Your payment of <strong>KES {amountKes?.toLocaleString()}</strong> via <strong>{channelLabel}</strong> was received.
          </p>
          <p className="text-charcoal-500 text-sm mb-8">
            Your verification request has been submitted. Our team will contact you within <strong>2 business hours</strong>.
          </p>

          <div className="bg-white border border-charcoal-100 rounded-2xl p-5 mb-8 space-y-3">
            {[
              { icon: "📋", label: "Request submitted"    },
              { icon: "🔍", label: "Inspector being assigned" },
              { icon: "🔔", label: "You'll be notified"   },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-left">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <span className="text-sm text-charcoal-600">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-charcoal-950 hover:bg-charcoal-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all">
              View Dashboard →
            </Link>
            <Link href="/"
              className="inline-flex items-center justify-center border border-charcoal-200 hover:border-charcoal-300 text-charcoal-700 font-medium text-sm px-6 py-3 rounded-xl transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const configs = {
    failed:          { icon: "❌", color: "bg-red-100 text-red-600",    title: "Payment failed",          body: "Your payment was not completed. No charge was made. Please try again.",         action: "/request-verification", cta: "Try again" },
    expired:         { icon: "⏰", color: "bg-amber-100 text-amber-600", title: "Session expired",         body: "Your payment session expired. Please start a new verification request.",        action: "/request-verification", cta: "Start again" },
    not_found:       { icon: "🔍", color: "bg-charcoal-100 text-charcoal-600", title: "Request not found", body: "We couldn't find this payment. If you believe this is an error, contact us.", action: "/contact",                cta: "Contact support" },
    verify_error:    { icon: "⚠️", color: "bg-amber-100 text-amber-600", title: "Verification pending",   body: "Your payment may have been received but we couldn't confirm it yet. Please contact support with your reference.",  action: "/contact", cta: "Contact support" },
    already_paid:    { icon: "✅", color: "bg-emerald-100 text-emerald-600", title: "Already processed",   body: "This payment has already been confirmed and your request submitted.",            action: "/dashboard",              cta: "View Dashboard" },
    amount_mismatch: { icon: "⚠️", color: "bg-amber-100 text-amber-600", title: "Payment query",          body: "There was an issue with the payment amount. Please contact support immediately with your reference number.", action: "/contact", cta: "Contact support" },
  };

  const cfg = configs[status];

  return (
    <div className="min-h-screen bg-charcoal-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className={`w-24 h-24 ${cfg.color} rounded-full flex items-center justify-center mx-auto mb-8 text-4xl`}>
          {cfg.icon}
        </div>
        <h1 className="font-display text-2xl font-bold text-charcoal-950 mb-3">{cfg.title}</h1>
        <p className="text-charcoal-600 text-sm leading-relaxed mb-2">{cfg.body}</p>
        {reference && (
          <p className="text-xs text-charcoal-400 font-mono mb-8">Ref: {reference}</p>
        )}
        <Link href={cfg.action}
          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all">
          {cfg.cta} →
        </Link>
      </div>
    </div>
  );
}
