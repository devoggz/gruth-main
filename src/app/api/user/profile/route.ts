// src/app/api/user/profile/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? undefined,
      whatsapp: parsed.data.whatsapp ?? undefined,
      country: parsed.data.country ?? undefined,
      bio: parsed.data.bio ?? undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      country: true,
      bio: true,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      country: true,
      bio: true,
      role: true,
    },
  });

  return NextResponse.json({ user });
}
