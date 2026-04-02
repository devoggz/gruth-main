// src/app/api/auth/mobile-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

// Restrict CORS to your own mobile app bundle ID / known origin.
// Never use "*" for an authenticated endpoint.
const ALLOWED_ORIGINS = [
  "https://gruth.ke",
  "capacitor://localhost", // Capacitor/Ionic
  "ionic://localhost",
  "http://localhost:8081", // Expo dev
  "http://localhost:19006", // Expo web dev
];

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  const hdrs = corsHeaders(req);

  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 4096) {
    return NextResponse.json(
      { error: "Payload too large." },
      { status: 413, headers: hdrs },
    );
  }

  try {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400, headers: hdrs },
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always run bcrypt to prevent timing-based account enumeration
    const hash =
      user?.passwordHash ??
      "$2a$12$invalidhashpadding000000000000000000000000000000000000000";
    const ok = await bcrypt.compare(password, hash);

    if (!user || !user.passwordHash || !ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401, headers: hdrs },
      );
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token = await new SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // Shortened from 30d to 7d
      .sign(secret);

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { headers: hdrs },
    );
  } catch (err) {
    console.error("Mobile login error:", err);
    return NextResponse.json(
      { error: "Login failed." },
      { status: 500, headers: hdrs },
    );
  }
}
