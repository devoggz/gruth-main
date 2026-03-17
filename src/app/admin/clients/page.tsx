// src/app/admin/clients/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatRelativeDate } from "@/lib/utils";

export default async function AdminClientsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: {
      projects: { select: { id: true, status: true } },
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-display text-[26px] font-bold text-charcoal-950 tracking-tight">
          Clients
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">
          {clients.length} registered accounts
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        {clients.length === 0 ? (
          <div className="py-24 text-center text-sm text-charcoal-300">
            No clients registered yet.
          </div>
        ) : (
          <div className="divide-y divide-charcoal-50">
            {clients.map((client) => {
              const active = client.projects.filter(
                (p) => p.status === "ACTIVE",
              ).length;
              const completed = client.projects.filter(
                (p) => p.status === "COMPLETED",
              ).length;
              return (
                <div
                  key={client.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/20 transition-colors"
                >
                  <div className="w-10 h-10 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {client.name?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-charcoal-900">
                      {client.name}
                    </div>
                    <div className="text-sm text-charcoal-400">
                      {client.email}
                    </div>
                    {(client as any).country && (
                      <div className="text-xs text-charcoal-400 mt-0.5">
                        {(client as any).country}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <div className="text-sm font-semibold text-charcoal-700">
                      {client._count.projects} project
                      {client._count.projects !== 1 ? "s" : ""}
                    </div>
                    {active > 0 && (
                      <div className="text-xs text-emerald-600 font-semibold">
                        {active} active
                      </div>
                    )}
                    {completed > 0 && (
                      <div className="text-xs text-blue-500">
                        {completed} completed
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 pl-4 border-l border-charcoal-100 ml-2">
                    <div className="text-xs text-charcoal-400">Joined</div>
                    <div className="text-xs font-medium text-charcoal-600">
                      {formatRelativeDate((client as any).createdAt)}
                    </div>
                    <div
                      className={`text-[10px] font-bold mt-1 ${(client as any).emailVerified ? "text-emerald-600" : "text-amber-500"}`}
                    >
                      {(client as any).emailVerified
                        ? "✓ Verified"
                        : "⚠ Unverified"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
