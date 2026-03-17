// src/app/inspector/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, formatRelativeDate, getStatusColor } from "@/lib/utils";

export const metadata = { title: "My Projects | GRUTH Inspector" };

export default async function InspectorDashboardPage() {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string };

  const projects = await prisma.project.findMany({
    where: { inspectorId: user?.id },
    include: {
      client: { select: { name: true, email: true, country: true } },
      inspections: {
        orderBy: { scheduledDate: "desc" },
        take: 1,
        select: { id: true, status: true, scheduledDate: true },
      },
      _count: { select: { inspections: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const pending = projects.filter((p) => p.inspectorStatus === "PENDING");
  const accepted = projects.filter((p) => p.inspectorStatus === "ACCEPTED");
  const upcoming = accepted.filter(
    (p) => p.inspections[0]?.status === "SCHEDULED",
  );
  const active = accepted.filter((p) => p.status === "ACTIVE");
  const completed = accepted.filter((p) => p.status === "COMPLETED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-950">
          Welcome back, {user?.name?.split(" ")[0] ?? "Inspector"}
        </h1>
        <p className="text-charcoal-500 text-sm mt-1">
          {active.length} active project{active.length !== 1 ? "s" : ""} ·{" "}
          {upcoming.length} scheduled inspection
          {upcoming.length !== 1 ? "s" : ""}
          {pending.length > 0 && ` · ${pending.length} awaiting your response`}
        </p>
      </div>

      {/* ── Pending assignments ─────────────────────────────────────────────── */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-charcoal-900">New Assignments</h2>
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" />
              {pending.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {pending.map((p) => (
              <Link
                key={p.id}
                href={`/inspector/projects/${p.id}`}
                className="card p-5 border-orange-200 bg-orange-50/30 flex items-start gap-4 hover:border-orange-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-charcoal-900 group-hover:text-orange-700 transition-colors">
                      {p.name}
                    </p>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Action required
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-sm mt-0.5">
                    {p.location}
                  </p>
                  <p className="text-charcoal-400 text-xs mt-0.5">
                    Client: {p.client.name} ({p.client.country})
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-orange-600 text-xs font-semibold flex-shrink-0">
                  Accept / Decline
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Assigned",
            value: accepted.length,
            color: "bg-charcoal-950 text-white",
          },
          {
            label: "Active",
            value: active.length,
            color: "bg-orange-500 text-white",
          },
          {
            label: "Completed",
            value: completed.length,
            color: "bg-emerald-500 text-white",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-5`}>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm opacity-80 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming inspections */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="font-semibold text-charcoal-900 mb-4">
            Upcoming Inspections
          </h2>
          <div className="space-y-3">
            {upcoming.map((p) => (
              <Link
                key={p.id}
                href={`/inspector/projects/${p.id}`}
                className="card p-5 flex items-center gap-4 hover:border-orange-200 transition-colors group"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal-900 group-hover:text-orange-700 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-charcoal-400 text-sm">{p.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-charcoal-800">
                    {formatDate(p.inspections[0]!.scheduledDate)}
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {formatRelativeDate(p.inspections[0]!.scheduledDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All projects */}
      <div>
        <h2 className="font-semibold text-charcoal-900 mb-4">All Projects</h2>
        {accepted.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-charcoal-400">
              No active projects yet. Accept an assignment above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accepted.map((p) => (
              <Link
                key={p.id}
                href={`/inspector/projects/${p.id}`}
                className="card p-5 flex items-start gap-4 hover:border-emerald-200 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h3 className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                      {p.name}
                    </h3>
                    <span
                      className={`status-badge ${getStatusColor(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-sm">{p.location}</p>
                  <p className="text-charcoal-400 text-xs mt-1">
                    Client: {p.client.name} ({p.client.country}) ·{" "}
                    {p._count.inspections} inspection
                    {p._count.inspections !== 1 ? "s" : ""}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-charcoal-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
