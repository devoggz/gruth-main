// src/app/api/messages/threads/route.ts
// GET /api/messages/threads
// Returns all message threads for the authenticated client, grouped by project.
// Each thread includes the full message list, unread count, and last message preview.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getProjectTypeLabel } from "@/lib/utils";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all projects belonging to this client that have at least one message
  const projects = await prisma.project.findMany({
    where: {
      clientId: userId,
      messages: { some: {} },
    },
    select: {
      id: true,
      name: true,
      type: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Mark all GRUTH-team messages as read now that the client has fetched them
  await prisma.message.updateMany({
    where: {
      project: { clientId: userId },
      isFromClient: false,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const threads = projects.map((project) => {
    const messages = project.messages;
    const lastMsg = messages[messages.length - 1];

    // Unread = messages from GRUTH team that haven't been read yet
    const unreadCount = messages.filter(
      (m) => !m.isFromClient && !m.readAt,
    ).length;

    return {
      projectId: project.id,
      projectName: project.name,
      projectType: getProjectTypeLabel(project.type),
      lastMessage: lastMsg?.content ?? "",
      lastMessageAt: lastMsg?.createdAt ?? new Date(0),
      unreadCount,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        isFromClient: m.isFromClient,
        createdAt: m.createdAt,
        readAt: m.readAt,
        senderName: m.isFromClient ? "You" : (m.sender?.name ?? "GRUTH Team"),
      })),
    };
  });

  return NextResponse.json(threads);
}
