// src/app/api/mobile/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { z } from "zod";

const postSchema = z.object({
  projectId: z.string().min(1).max(128),
  content: z.string().min(1).max(4000).trim(),
});

export async function GET(req: NextRequest) {
  const session = await verifyMobileToken(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional projectId filter; limit to 100 most recent
  const projectId = req.nextUrl.searchParams.get("projectId");

  const messages = await prisma.message.findMany({
    where: {
      userId: session.userId,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const { projectId, content } = parsed.data;

  // Verify project belongs to this user
  const project = await prisma.project.findUnique({
    where: { id: projectId, clientId: session.userId },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      userId: session.userId,
      projectId,
      content,
      isFromClient: true,
      senderId: session.userId,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
