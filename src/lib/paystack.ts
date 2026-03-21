// src/lib/paystack.ts
// Server-side only — never import this in client components.
// All Paystack API calls are made here using the secret key.

const BASE = "https://api.paystack.co";

function headers() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export interface InitializeParams {
  email:        string;
  amountKes:    number;          // in KES (whole shillings — we convert to kobo)
  reference:    string;          // your unique ref
  callbackUrl:  string;          // where Paystack redirects after payment
  metadata?:    Record<string, unknown>;
  currency?:    string;          // defaults to KES
}

export interface InitializeResult {
  authorizationUrl: string;
  accessCode:       string;
  reference:        string;
}

/**
 * Initialize a Paystack transaction server-side.
 * Returns the authorization_url to redirect the user to.
 * Paystack's Kenya checkout automatically shows Card + M-Pesa + Apple Pay.
 */
export async function initializeTransaction(
  params: InitializeParams
): Promise<InitializeResult> {
  const amountKobo = Math.round(params.amountKes * 100); // KES uses kobo (cents)

  const res = await fetch(`${BASE}/transaction/initialize`, {
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify({
      email:        params.email,
      amount:       amountKobo,
      reference:    params.reference,
      currency:     params.currency ?? "KES",
      callback_url: params.callbackUrl,
      metadata:     {
        cancel_action: params.callbackUrl.replace("/callback", "/cancelled"),
        ...params.metadata,
      },
      // Let Paystack show all channels available in Kenya
      // (card, mobile_money/mpesa, apple_pay) — no restriction needed
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack initialize failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack initialize error");

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode:       json.data.access_code,
    reference:        json.data.reference,
  };
}

export interface VerifyResult {
  status:    "success" | "failed" | "abandoned" | "reversed";
  reference: string;
  amountKes: number;
  email:     string;
  paidAt:    string | null;
  channel:   string;   // "card" | "mobile_money" | "apple_pay" etc
  metadata:  Record<string, unknown>;
}

/**
 * Verify a Paystack transaction server-side.
 * Always call this before delivering value — never trust client-side status.
 */
export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const res = await fetch(
    `${BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: headers(), cache: "no-store" }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack verify failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack verify error");

  const d = json.data;
  return {
    status:    d.status,
    reference: d.reference,
    amountKes: Math.round(d.amount / 100), // kobo → KES
    email:     d.customer?.email ?? "",
    paidAt:    d.paid_at ?? null,
    channel:   d.channel ?? "card",
    metadata:  d.metadata ?? {},
  };
}

/**
 * Validate a Paystack webhook signature.
 * Call this in your webhook route before processing any event.
 */
export function validateWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  // Node built-in crypto — no external dep needed
  const crypto = require("crypto") as typeof import("crypto");
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}

/** Generate a unique transaction reference */
export function generateRef(prefix = "GRUTH"): string {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}
