// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatCurrency,
  formatRelativeDate,
  getStatusColor,
  getProjectTypeLabel,
} from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

export const revalidate = 3600;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id!;

  const [
    projects,
    unreadAlerts,
    unreadMessages,
    recentInspections,
    inspectionHistory,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { clientId: userId },
      include: {
        inspections: { orderBy: { scheduledDate: "desc" }, take: 1 },
        alerts: { where: { isRead: false } },
        progressStages: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.alert.count({
      where: { project: { clientId: userId }, isRead: false },
    }),
    prisma.message.count({
      where: { userId, isFromClient: false, readAt: null },
    }),
    prisma.inspection.findMany({
      where: { project: { clientId: userId } },
      orderBy: { scheduledDate: "desc" },
      take: 6,
      include: { project: { select: { name: true, id: true } } },
    }),
    prisma.inspection.findMany({
      where: {
        project: { clientId: userId },
        scheduledDate: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
        },
      },
      orderBy: { scheduledDate: "asc" },
      select: { scheduledDate: true, status: true },
    }),
  ]);

  const totalBudget = projects.reduce(
    (s, p) => s + (p.estimatedBudget ?? 0),
    0,
  );
  const totalInspections = await prisma.inspection.count({
    where: { project: { clientId: userId } },
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = session?.user?.name?.split(" ")[0] ?? "there";

  // ── Real spend data from BudgetEntry ──────────────────────────────────────
  // Last 12 months of entries across all of this client's projects
  const MONTHS_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();

  const budgetEntries = await prisma.budgetEntry.findMany({
    where: {
      project: { clientId: userId },
      entryDate: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
    },
    select: { amount: true, entryDate: true },
  });

  // Build monthly buckets for last 12 months
  const monthBuckets: Record<
    string,
    { month: string; budget: number; spent: number }
  > = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets[key] = {
      month: `${MONTHS_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      budget: totalBudget > 0 ? Math.round(totalBudget / 12) : 0,
      spent: 0,
    };
  }

  budgetEntries.forEach((e) => {
    const d = new Date(e.entryDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthBuckets[key]) monthBuckets[key].spent += e.amount;
  });

  const spendingHistory = Object.values(monthBuckets);
  const hasRealSpendData = budgetEntries.length > 0;

  const typeMap: Record<string, number> = {};
  projects.forEach((p) => {
    const k = getProjectTypeLabel(p.type);
    typeMap[k] = (typeMap[k] ?? 0) + 1;
  });
  const projectsByType = Object.entries(typeMap).map(([name, value]) => ({
    name,
    value,
  }));

  const weekMap: Record<string, number> = {};
  inspectionHistory.forEach((ins) => {
    const ws = new Date(ins.scheduledDate);
    ws.setDate(ws.getDate() - ws.getDay());
    const key = ws.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
    });
    weekMap[key] = (weekMap[key] ?? 0) + 1;
  });
  const inspectionTimeline = Object.entries(weekMap)
    .slice(-5)
    .map(([date, count]) => ({ date, count }));

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-charcoal-950 tracking-tight">
            {greeting}, {name}
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""} · last
            updated just now
          </p>
        </div>
        <Link
          prefetch={true}
          href="/request-verification"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 flex-shrink-0 whitespace-nowrap"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Request
        </Link>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Projects */}
        <div className="bg-white border border-charcoal-100 rounded-2xl p-4 sm:p-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <IconFolder />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-charcoal-950 tracking-tight leading-none mb-1">
            {projects.length}
          </div>
          <div className="text-charcoal-700 text-sm font-medium">
            Total Projects
          </div>
          <div className="flex items-center justify-between mt-1 gap-1 flex-wrap">
            <span className="text-charcoal-400 text-xs">
              {projects.filter((p) => p.status === "COMPLETED").length}{" "}
              completed
            </span>
            {projects.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0">
                ↑ 25%
              </span>
            )}
          </div>
        </div>

        {/* Inspections */}
        <div className="bg-white border border-charcoal-100 rounded-2xl p-4 sm:p-5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-3">
            <IconSearch />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-charcoal-950 tracking-tight leading-none mb-1">
            {totalInspections}
          </div>
          <div className="text-charcoal-700 text-sm font-medium">
            Inspections
          </div>
          <div className="mt-1">
            <span className="text-charcoal-400 text-xs">
              Across all projects
            </span>
          </div>
        </div>

        {/* Alerts */}
        <Link
          prefetch={true}
          href="/dashboard/notifications"
          className="bg-white border border-charcoal-100 rounded-2xl p-4 sm:p-5 block hover:border-amber-200 hover:shadow-md transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
            <IconBell />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-charcoal-950 tracking-tight leading-none mb-1">
            {unreadAlerts}
          </div>
          <div className="text-charcoal-700 text-sm font-medium group-hover:text-amber-600 transition-colors">
            Notifications
          </div>
          <div className="flex items-center justify-between mt-1 gap-1 flex-wrap">
            <span className="text-charcoal-400 text-xs">
              {unreadAlerts > 0 ? "Need attention" : "All clear"}
            </span>
            {unreadAlerts > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
                {unreadAlerts} new
              </span>
            )}
          </div>
        </Link>

        {/* Messages */}
        <Link
          prefetch={true}
          href="/dashboard/messages"
          className="bg-white border border-charcoal-100 rounded-2xl p-4 sm:p-5 block hover:border-orange-200 hover:shadow-md transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-3">
            <IconMessage />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-charcoal-950 tracking-tight leading-none mb-1">
            {unreadMessages}
          </div>
          <div className="text-charcoal-700 text-sm font-medium group-hover:text-orange-600 transition-colors">
            Messages
          </div>
          <div className="flex items-center justify-between mt-1 gap-1 flex-wrap">
            <span className="text-charcoal-400 text-xs">From GRUTH team</span>
            {unreadMessages > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex-shrink-0">
                {unreadMessages} unread
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <DashboardCharts
        spendingHistory={spendingHistory}
        projectsByType={projectsByType}
        inspectionTimeline={inspectionTimeline}
        currency="KES"
        hasRealSpendData={hasRealSpendData}
      />

      {/* ── Projects + Sidebar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_296px] gap-6">
        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-charcoal-950">
              Your Projects
            </h2>
            <Link
              prefetch={true}
              href="/dashboard/projects"
              className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition-colors"
            >
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border border-charcoal-100 rounded-2xl p-10 sm:p-12 text-center">
              <div className="w-12 h-12 bg-charcoal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-charcoal-400">
                <IconFolder />
              </div>
              <h3 className="font-display font-semibold text-charcoal-900 text-sm mb-1.5">
                No projects yet
              </h3>
              <p className="text-charcoal-500 text-sm mb-5">
                Submit your first verification request to get started.
              </p>
              <Link
                prefetch={true}
                href="/request-verification"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Request Verification
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {projects.slice(0, 6).map((project) => {
                const completedStages = project.progressStages.filter(
                  (s: any) => s.completed,
                ).length;
                const progressPct =
                  project.progressStages.length > 0
                    ? (completedStages / project.progressStages.length) * 100
                    : 0;
                const lastInspection = project.inspections[0];

                return (
                  <Link
                    prefetch={true}
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="bg-white border border-charcoal-100 rounded-2xl p-4 sm:p-5 block hover:border-orange-200 hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Project name + status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-charcoal-950 text-sm truncate group-hover:text-orange-600 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-charcoal-400 text-xs mt-0.5">
                          {getProjectTypeLabel(project.type)}
                        </p>
                      </div>
                      <span
                        className={`status-badge flex-shrink-0 ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-charcoal-400 text-xs mb-3">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{project.location}</span>
                    </div>

                    {/* Progress bar */}
                    {project.progressStages.length > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-charcoal-400 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold text-charcoal-700">
                            {progressPct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${progressPct}%`,
                              background:
                                progressPct >= 80 ? "#16a34a" : "#f97316",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs pt-2.5 border-t border-charcoal-50 gap-2">
                      <span className="text-charcoal-400 truncate">
                        {lastInspection
                          ? `Inspected ${formatRelativeDate(lastInspection.scheduledDate)}`
                          : "No inspection yet"}
                      </span>
                      {project.alerts.length > 0 && (
                        <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                          {project.alerts.length} alert
                          {project.alerts.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent activity */}
          <div className="bg-white border border-charcoal-100 rounded-2xl p-4 sm:p-5">
            <h2 className="font-display text-sm font-semibold text-charcoal-950 mb-4">
              Recent Activity
            </h2>
            {recentInspections.length === 0 ? (
              <p className="text-charcoal-400 text-sm text-center py-4">
                No inspections yet.
              </p>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-charcoal-100" />
                <div className="space-y-4">
                  {recentInspections.map((ins) => (
                    <Link
                      prefetch={true}
                      key={ins.id}
                      href={`/dashboard/projects/${ins.project.id}`}
                      className="flex gap-3 relative hover:opacity-70 transition-opacity group"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white ${
                          ins.status === "COMPLETED"
                            ? "bg-emerald-500"
                            : ins.status === "IN_PROGRESS"
                              ? "bg-orange-500"
                              : "bg-charcoal-200"
                        }`}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          {ins.status === "COMPLETED" ? (
                            <path d="M20 6L9 17l-5-5" />
                          ) : (
                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="font-semibold text-charcoal-900 text-xs group-hover:text-orange-600 transition-colors truncate">
                          {ins.project.name}
                        </div>
                        <div className="text-charcoal-400 text-xs mt-0.5">
                          {formatRelativeDate(ins.scheduledDate)}
                        </div>
                        <span
                          className={`inline-flex mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(ins.status)}`}
                        >
                          {ins.status.replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-charcoal-100 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-widest mb-3">
              Quick Actions
            </h3>
            <div className="space-y-0.5">
              {[
                {
                  label: "New verification request",
                  href: "/request-verification",
                  icon: <IconPlus />,
                  badge: undefined,
                },
                {
                  label: "All projects",
                  href: "/dashboard/projects",
                  icon: <IconFolder />,
                  badge: undefined,
                },
                {
                  label: "Messages",
                  href: "/dashboard/messages",
                  icon: <IconMessage />,
                  badge: unreadMessages,
                },
                {
                  label: "Market prices",
                  href: "/dashboard/market-prices",
                  icon: <IconBox />,
                  badge: undefined,
                },
                {
                  label: "Notifications",
                  href: "/dashboard/notifications",
                  icon: <IconBell />,
                  badge: unreadAlerts,
                },
                {
                  label: "Settings",
                  href: "/dashboard/settings",
                  icon: <IconSettings />,
                  badge: undefined,
                },
              ].map(({ label, href, icon, badge }) => (
                <Link
                  prefetch={true}
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-charcoal-50 transition-colors group"
                >
                  <span className="w-4 h-4 text-charcoal-400 group-hover:text-orange-500 transition-colors flex-shrink-0">
                    {icon}
                  </span>
                  <span className="flex-1 text-sm text-charcoal-700 font-medium group-hover:text-charcoal-950 transition-colors truncate">
                    {label}
                  </span>
                  {badge != null && badge > 0 && (
                    <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconFolder = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);
const IconSearch = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconBell = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const IconMessage = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconPlus = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconBox = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconSettings = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
