// src/app/admin/messages/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatRelativeDate } from "@/lib/utils";

export const revalidate = 3600;

export default async function AdminMessagesPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  const messages = await prisma.message.findMany({
    where: { isFromClient: true },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = messages.filter((m) => !m.readAt).length;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-display text-[26px] font-bold text-charcoal-950 tracking-tight">
          Client Messages
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">
          {unread} unread · {messages.length} total
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        {messages.length === 0 ? (
          <div className="py-24 text-center text-sm text-charcoal-300">
            No messages yet.
          </div>
        ) : (
          <div className="divide-y divide-charcoal-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-orange-50/20 transition-colors ${!msg.readAt ? "bg-orange-50/10" : ""}`}
              >
                <div className="w-9 h-9 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">
                    {msg.user.name?.charAt(0).toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-semibold text-charcoal-900 text-sm">
                        {msg.user.name}
                      </span>
                      {msg.project && (
                        <span className="ml-2 text-xs text-charcoal-400">
                          re: {msg.project.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!msg.readAt && (
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      )}
                      <span className="text-[10px] text-charcoal-400">
                        {formatRelativeDate(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">
                    {msg.content}
                  </p>
                  <a
                    href={`mailto:${msg.user.email}`}
                    className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-semibold mt-1.5 transition-colors"
                  >
                    Reply to {msg.user.email} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
