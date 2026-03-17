// src/app/api/messages/send/route.ts
// POST /api/messages/send
// Sends a message from an authenticated client to the GRUTH team on a project thread.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface SendMessageBody {
  projectId: string;
  content: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SendMessageBody;
  try {
    body = (await req.json()) as SendMessageBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { projectId, content } = body;

  if (!projectId || !content?.trim()) {
    return NextResponse.json(
      { error: "projectId and content are required" },
      { status: 400 },
    );
  }

  // Ensure the project belongs to this user — prevents spoofed projectId
  const project = await prisma.project.findUnique({
    where: { id: projectId, clientId: session.user.id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      isFromClient: true,
      projectId,
      // userId = thread owner (the client)
      userId: session.user.id,
      // senderId = actual author of this message (also the client here)
      senderId: session.user.id,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
