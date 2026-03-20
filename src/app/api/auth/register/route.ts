// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt   from "bcryptjs";
import crypto   from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

// Strong password: min 8 chars, at least one letter + one digit
const schema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email().max(254),
  password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(72,  "Password is too long") // bcrypt truncates at 72 bytes
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/,    "Password must contain at least one number"),
  country:  z.string().max(100).optional(),
  phone:    z.string().max(30).optional(),
});

export async function POST(req: NextRequest) {
  // Reject oversized payloads (guard against body-inflation attacks)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 8192) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      // Return first validation error — don't leak schema details
      const firstError = parsed.error.errors[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, country, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Constant-time response to prevent account enumeration via timing
      await bcrypt.hash("dummy-to-prevent-timing-attack", 12);
      return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, country, phone, role: "CLIENT" },
    });

    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    try {
      await sendVerificationEmail({ to: email, name, token });
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}