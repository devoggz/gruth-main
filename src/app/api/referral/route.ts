// src/app/api/referral/route.ts
// GET  — returns the user's referral code (generates one if missing) + stats
// POST — called during registration to link a referral code to a new user

import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Deterministic code from name + userId suffix — e.g. "JAMES-4A2F"
function generateCode(name: string | null, id: string): string {
    const prefix = (name ?? "GRUTH").split(" ")[0].toUpperCase().slice(0, 8).replace(/[^A-Z]/g, "");
    const suffix = id.slice(-4).toUpperCase();
    return `${prefix}-${suffix}`;
}

export async function GET(): Promise<NextResponse> {
    const session = await auth();
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await prisma.user.findUnique({
        where:  { id: session.user.id },
        select: { id: true, name: true, referralCode: true, referredBy: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Generate code if missing
    if (!user.referralCode) {
        const code = generateCode(user.name, user.id);
        user = await prisma.user.update({
            where:  { id: user.id },
            data:   { referralCode: code },
            select: { id: true, name: true, referralCode: true, referredBy: true },
        });
    }

    // Count referrals and credits
    const [totalReferred, unusedCredits] = await Promise.all([
        prisma.referralCredit.count({ where: { referrerId: user!.id } }),
        prisma.referralCredit.count({ where: { referrerId: user!.id, used: false } }),
    ]);

    return NextResponse.json({
        referralCode: user!.referralCode,
        referralUrl:  `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gruth-main.vercel.app"}/register?ref=${user!.referralCode}`,
        totalReferred,
        unusedCredits,
    });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { referralCode, newUserId } = await req.json();
    if (!referralCode || !newUserId)
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Find the referrer
    const referrer = await prisma.user.findUnique({
        where:  { referralCode },
        select: { id: true },
    });
    if (!referrer) return NextResponse.json({ ok: false }); // silently ignore bad codes

    // Save referredBy on the new user + create the credit
    await Promise.all([
        prisma.user.update({
            where: { id: newUserId },
            data:  { referredBy: referralCode },
        }),
        prisma.referralCredit.upsert({
            where:  { referredId: newUserId },
            update: {},
            create: { referrerId: referrer.id, referredId: newUserId },
        }),
    ]);

    return NextResponse.json({ ok: true });
}