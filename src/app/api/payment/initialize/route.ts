// src/app/api/payment/initialize/route.ts
// POST — validates the form snapshot, calculates the correct price,
// initialises a Paystack transaction, saves a PendingPayment record,
// and returns the authorization_url for the client to redirect to.
//
// Security:
//   - Auth required: must be logged in
//   - Amount is computed SERVER-SIDE from serviceType + county + urgency
//     (client cannot pass or manipulate the price)
//   - PendingPayment expires in 1 hour
//   - Reference is server-generated and unique

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initializeTransaction, generateRef } from "@/lib/paystack";
import { calculatePrice, SERVICES } from "@/data/pricing";

const schema = z.object({
  // Core form fields needed to price correctly — server re-calculates price
  serviceType: z.string().min(1).max(100),
  county: z.string().min(1).max(100),
  urgency: z.enum(["urgent", "standard", "flexible"]),
  // Full form snapshot stored in PendingPayment for use after callback
  formSnapshot: z.string().max(50_000), // JSON string
});

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // 2. Content-length guard
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 60_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // 3. Validate input
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { serviceType, county, urgency, formSnapshot } = parsed.data;

  // 4. Validate the formSnapshot is valid JSON (don't parse it — just store it)
  try {
    JSON.parse(formSnapshot);
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  // 5. Server-side price calculation — client cannot override this
  const { totalKes, baseKes, countySurcharge, urgencySurcharge } =
    calculatePrice({
      serviceId: serviceType,
      county,
      urgency,
    });

  if (totalKes < 1_000) {
    return NextResponse.json({ error: "Invalid price." }, { status: 400 });
  }

  // 6. Generate reference and expiry
  const paystackRef = generateRef("GRUTH");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://gruth-main.vercel.app";
  const callbackUrl = `${appUrl}/payment/callback?reference=${paystackRef}`;

  try {
    // 7. Initialize Paystack transaction
    const paystack = await initializeTransaction({
      email: session.user.email,
      amountKes: totalKes,
      reference: paystackRef,
      callbackUrl,
      metadata: {
        userId: session.user.id,
        serviceType,
        county,
        urgency,
        baseKes,
        countySurcharge,
        urgencySurcharge,
        custom_fields: [
          {
            display_name: "Service",
            variable_name: "service",
            value: serviceType,
          },
          { display_name: "County", variable_name: "county", value: county },
          { display_name: "Urgency", variable_name: "urgency", value: urgency },
        ],
      },
    });

    // 8. Save PendingPayment — so we can retrieve form data in the callback
    await prisma.pendingPayment.create({
      data: {
        userId: session.user.id,
        paystackRef,
        amountKes: totalKes,
        formSnapshot,
        status: "PENDING",
        expiresAt,
      },
    });

    // 9. Return authorization URL — client redirects there
    return NextResponse.json({
      authorizationUrl: paystack.authorizationUrl,
      reference: paystackRef,
      amountKes: totalKes,
      breakdown: { baseKes, countySurcharge, urgencySurcharge },
    });
  } catch (err) {
    console.error("[payment/initialize] error:", err);
    return NextResponse.json(
      { error: "Payment initialisation failed. Please try again." },
      { status: 502 },
    );
  }
}
