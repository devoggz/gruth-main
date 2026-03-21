// src/app/api/payment/webhook/route.ts
// Paystack sends charge.success events here — critical for M-Pesa which is async.
// Must be unauthenticated (Paystack calls this, not the user).
// Security: validate HMAC-SHA512 signature on every request.

import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature, verifyTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

// Disable body parsing — we need raw bytes for HMAC verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Read raw body for signature validation
  const rawBody  = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // 2. Validate signature — reject anything that doesn't match
  if (!validateWebhookSignature(rawBody, signature)) {
    console.warn("[webhook] invalid signature — ignoring request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Only handle charge.success
  if (event.event !== "charge.success") {
    // Acknowledge other events so Paystack doesn't retry
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "No reference" }, { status: 400 });
  }

  // 4. Find the pending payment
  const pending = await prisma.pendingPayment.findUnique({
    where: { paystackRef: reference },
  });

  // Already processed or doesn't exist — idempotent
  if (!pending || pending.status === "PAID") {
    return NextResponse.json({ received: true });
  }

  // 5. Re-verify with Paystack API (never trust webhook payload alone)
  let verification: Awaited<ReturnType<typeof verifyTransaction>>;
  try {
    verification = await verifyTransaction(reference);
  } catch (err) {
    console.error("[webhook] verify error:", err);
    return NextResponse.json({ error: "Verify failed" }, { status: 502 });
  }

  if (verification.status !== "success") {
    return NextResponse.json({ received: true });
  }

  // Amount check
  if (verification.amountKes !== pending.amountKes) {
    console.error(`[webhook] amount mismatch ref=${reference}`);
    return NextResponse.json({ received: true });
  }

  // 6. Already have a VerificationRequest? Then just mark paid (idempotent)
  const existing = await prisma.verificationRequest.findFirst({
    where: { paymentRef: reference },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.pendingPayment.update({
        where: { paystackRef: reference },
        data:  { status: "PAID" },
      }),
      prisma.verificationRequest.update({
        where: { id: existing.id },
        data:  { paymentStatus: "PAID", paidAt: new Date(verification.paidAt ?? Date.now()) },
      }),
    ]);
    return NextResponse.json({ received: true });
  }

  // 7. No VerificationRequest yet (e.g. M-Pesa user didn't wait for callback page)
  // Create it now from the stored snapshot
  let snapshot: Record<string, unknown>;
  try {
    snapshot = JSON.parse(pending.formSnapshot);
  } catch {
    console.error("[webhook] invalid snapshot for ref:", reference);
    return NextResponse.json({ received: true });
  }

  await prisma.$transaction(async tx => {
    await tx.pendingPayment.update({
      where: { paystackRef: reference },
      data:  { status: "PAID" },
    });
    await tx.verificationRequest.create({
      data: {
        name:             String(snapshot.name            ?? ""),
        email:            String(snapshot.email           ?? ""),
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

  console.log(`[webhook] request created via webhook for ref=${reference}`);
  return NextResponse.json({ received: true });
}
