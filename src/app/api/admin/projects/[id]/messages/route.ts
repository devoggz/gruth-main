// src/app/api/admin/projects/[id]/messages/route.ts
// GET  /api/admin/projects/:id/messages  — fetch thread + project info
// POST /api/admin/projects/:id/messages  — send a message as GRUTH team
// Both endpoints require ADMIN role.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── Auth guard ───────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── GET — load thread ────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: projectId } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      type: true,
      client: { select: { name: true, email: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { projectId },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Mark all client messages as read (admin has now seen them)
  await prisma.message.updateMany({
    where: { projectId, isFromClient: true, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      type: project.type,
      clientName: project.client.name ?? "Client",
      clientEmail: project.client.email,
    },
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      isFromClient: m.isFromClient,
      createdAt: m.createdAt,
      readAt: m.readAt,
      senderName: m.isFromClient
        ? (project.client.name ?? "Client")
        : (m.sender?.name ?? "GRUTH Team"),
    })),
  });
}

// ─── POST — send a message as admin ──────────────────────────────────────────
export async function POST(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: projectId } = await context.params;

  let body: { content?: string };
  try {
    body = (await req.json()) as { content?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Look up the project to get the clientId (needed for userId field)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, clientId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      content: body.content.trim(),
      isFromClient: false,
      projectId,
      // userId = the client who owns the thread
      userId: project.clientId,
      // senderId = the admin who is actually sending this message
      senderId: session.user.id,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
