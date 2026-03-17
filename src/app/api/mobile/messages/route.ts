// src/app/api/mobile/messages/route.ts  (add to your Next.js app)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const session = await verifyMobileToken(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  // Mark team messages as read
  await prisma.message.updateMany({
    where: { userId: session.userId, isFromClient: false, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await verifyMobileToken(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim())
    return NextResponse.json(
      { error: "Message cannot be empty." },
      { status: 400 },
    );

  const message = await prisma.message.create({
    data: {
      userId: session.userId,
      content: content.trim(),
      isFromClient: true,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
