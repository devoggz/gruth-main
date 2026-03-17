// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?error=missing", req.url),
    );
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid", req.url),
      );
    }

    if (record.expiresAt < new Date()) {
      // Clean up the expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(
        new URL("/verify-email?error=expired", req.url),
      );
    }

    // Stamp emailVerified and delete the used token in one transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    return NextResponse.redirect(new URL("/verify-email?success=1", req.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=server", req.url),
    );
  }
}
