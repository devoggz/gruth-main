// src/app/admin/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  formatRelativeDate,
  formatCurrency,
  getStatusColor,
  getProjectTypeLabel,
} from "@/lib/utils";
import RequestsInbox from "@/components/admin/RequestsInbox";

export default async function AdminDashboardPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  const [
    clients,
    projects,
    openMessages,
    recentAlerts,
    newRequestsCount,
    totalRequestsCount,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        projects: { select: { id: true, status: true } },
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      include: {
        client: { select: { name: true, email: true } },
        inspections: { orderBy: { scheduledDate: "desc" }, take: 1 },
        alerts: { where: { isRead: false } },
        messages: {
          where: { isFromClient: true, readAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.message.count({ where: { isFromClient: true, readAt: null } }),
    prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        project: { select: { name: true, client: { select: { name: true } } } },
      },
    }),
    prisma.verificationRequest.count({ where: { status: "NEW" } }),
    prisma.verificationRequest.count(),
  ]);

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const pendingProjects = projects.filter((p) => p.status === "PENDING").length;
  const completedProjects = projects.filter(
    (p) => p.status === "COMPLETED",
  ).length;
  const onHoldProjects = projects.filter((p) => p.status === "ON_HOLD").length;

  const serviceBreakdown = Object.entries(
    projects.reduce(
      (acc, p) => {
        acc[p.type] = (acc[p.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).sort((a, b) => b[1] - a[1]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newClientsThisMonth = clients.filter(
    (c) => new Date((c as any).createdAt) > thirtyDaysAgo,
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em]">
              Live
            </span>
          </div>
          <h1 className="font-display text-[26px] font-bold text-charcoal-950 tracking-tight leading-none">
            Operations Dashboard
          </h1>
          <p className="text-charcoal-400 text-sm mt-2">
            {clients.length} clients · {projects.length} projects ·{" "}
            {totalRequestsCount} intake submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/market-prices"
            className="inline-flex items-center gap-2 bg-white border border-charcoal-200 hover:border-charcoal-300 text-charcoal-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <svg
              className="w-3.5 h-3.5 text-charcoal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 3v18h18" />
              <path d="M7 16l4-4 4 4 4-7" />
            </svg>
            Prices
          </Link>
          <Link
            href="/request-verification"
            className="inline-flex items-center gap-2 bg-charcoal-950 hover:bg-charcoal-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
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
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(
          [
            {
              label: "Registered Clients",
              value: clients.length,
              sub: `+${newClientsThisMonth} this month`,
              href: "/admin/clients",
              dot: "bg-blue-500",
              urgent: false,
            },
            {
              label: "Total Projects",
              value: projects.length,
              sub: `${activeProjects} active · ${pendingProjects} pending`,
              href: "/admin/projects",
              dot: "bg-emerald-500",
              urgent: false,
            },
            {
              label: "New Requests",
              value: newRequestsCount,
              sub: `${totalRequestsCount} total submissions`,
              href: "/admin/requests",
              dot: "bg-orange-500",
              urgent: newRequestsCount > 0,
            },
            {
              label: "Unread Messages",
              value: openMessages,
              sub: "From client threads",
              href: "/admin/messages",
              dot: "bg-violet-500",
              urgent: openMessages > 0,
            },
          ] as const
        ).map(({ label, value, sub, href, dot, urgent }) => (
          <Link
            key={label}
            href={href}
            className={`group bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-px cursor-pointer ${
              urgent
                ? "border-orange-200 ring-1 ring-orange-100"
                : "border-charcoal-100 hover:border-charcoal-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${dot} ${urgent && value > 0 ? "animate-pulse" : ""}`}
              />
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
                {label}
              </span>
            </div>
            <div className="font-display text-[38px] font-bold text-charcoal-950 leading-none tracking-tight tabular-nums">
              {value}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-charcoal-400">{sub}</span>
              <svg
                className="w-3.5 h-3.5 text-charcoal-200 group-hover:text-orange-400 transition-colors"
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

      {/* ── Middle row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-5">
            Project Status
          </p>
          <div className="space-y-3.5">
            {[
              {
                label: "Active",
                count: activeProjects,
                bar: "bg-emerald-500",
                txt: "text-emerald-600",
              },
              {
                label: "Pending",
                count: pendingProjects,
                bar: "bg-amber-400",
                txt: "text-amber-600",
              },
              {
                label: "On Hold",
                count: onHoldProjects,
                bar: "bg-orange-400",
                txt: "text-orange-600",
              },
              {
                label: "Completed",
                count: completedProjects,
                bar: "bg-blue-400",
                txt: "text-blue-600",
              },
            ].map(({ label, count, bar, txt }) => {
              const pct = projects.length
                ? Math.round((count / projects.length) * 100)
                : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[11px] text-charcoal-500 w-16 flex-shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 bg-charcoal-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums w-4 text-right ${txt}`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service mix */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-5">
            Service Mix
          </p>
          <div className="space-y-3">
            {serviceBreakdown.length > 0 ? (
              serviceBreakdown.slice(0, 5).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-[11px] text-charcoal-600 truncate flex-1">
                    {getProjectTypeLabel(type)}
                  </span>
                  <div className="w-16 bg-charcoal-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{
                        width: `${projects.length ? (count / projects.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-charcoal-500 tabular-nums w-4 text-right">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-charcoal-300 py-6 text-center">
                No projects yet
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-charcoal-950 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-charcoal-600 uppercase tracking-[0.12em] mb-4">
            Quick Actions
          </p>
          <div className="space-y-1">
            {[
              { label: "All Projects", href: "/admin/projects", emoji: "📁" },
              { label: "All Clients", href: "/admin/clients", emoji: "👥" },
              {
                label: "Intake Requests",
                href: "/admin/requests",
                emoji: "📋",
              },
              { label: "Messages", href: "/admin/messages", emoji: "💬" },
              {
                label: "Market Prices",
                href: "/dashboard/market-prices",
                emoji: "📊",
              },
            ].map(({ label, href, emoji }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 text-charcoal-400 hover:text-white text-[13px] transition-all group"
              >
                <span>{emoji}</span>
                <span className="flex-1 font-medium">{label}</span>
                <svg
                  className="w-3 h-3 text-charcoal-700 group-hover:text-charcoal-400 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Requests Inbox ────────────────────────────────────────────────────── */}
      <RequestsInbox />

      {/* ── Projects table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-charcoal-950">
              Recent Projects
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              {projects.length} total · showing latest 10
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
          >
            View all
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-charcoal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-5 h-5 text-charcoal-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <p className="text-sm text-charcoal-300">No projects yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                  {[
                    "Project",
                    "Client",
                    "Type",
                    "Status",
                    "Last Inspection",
                    "Budget",
                    "Alerts",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {projects.slice(0, 10).map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-orange-50/15 group transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-charcoal-900 text-sm truncate max-w-[160px]">
                        {project.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[9px] font-bold">
                            {project.client.name?.charAt(0).toUpperCase() ??
                              "?"}
                          </span>
                        </div>
                        <span className="text-charcoal-600 text-xs truncate max-w-[100px]">
                          {project.client.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-charcoal-400 text-xs">
                        {getProjectTypeLabel(project.type)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`status-badge text-[10px] ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-400 text-xs">
                      {project.inspections[0] ? (
                        formatRelativeDate(project.inspections[0].scheduledDate)
                      ) : (
                        <span className="text-charcoal-200">None yet</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-charcoal-600 text-xs">
                        {project.estimatedBudget ? (
                          formatCurrency(project.estimatedBudget)
                        ) : (
                          <span className="text-charcoal-200">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {project.alerts.length > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                          {project.alerts.length}
                        </span>
                      ) : (
                        <span className="text-charcoal-200 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-orange-500 hover:text-orange-600"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Bottom: Clients + Alerts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-100 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-charcoal-950">
                Clients
              </h2>
              <p className="text-xs text-charcoal-400 mt-0.5">
                {clients.length} registered accounts
              </p>
            </div>
            <Link
              href="/admin/clients"
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              Manage
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {clients.length === 0 ? (
            <div className="py-16 text-center text-sm text-charcoal-300">
              No clients yet.
            </div>
          ) : (
            <div className="divide-y divide-charcoal-50">
              {clients.slice(0, 6).map((client) => {
                const active = client.projects.filter(
                  (p) => p.status === "ACTIVE",
                ).length;
                return (
                  <Link
                    key={client.id}
                    href="/admin/clients"
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-orange-50/30 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {client.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-charcoal-900 text-sm truncate group-hover:text-orange-500 transition-colors">
                        {client.name}
                      </div>
                      <div className="text-xs text-charcoal-400 truncate">
                        {client.email}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-charcoal-700">
                        {client._count.projects} project
                        {client._count.projects !== 1 ? "s" : ""}
                      </div>
                      {active > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          {active} active
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-display font-semibold text-charcoal-950">
              Recent Alerts
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Last {recentAlerts.length} sent
            </p>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="py-16 text-center text-sm text-charcoal-300">
              No alerts sent yet.
            </div>
          ) : (
            <div className="divide-y divide-charcoal-50">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-5 py-3.5 flex items-start gap-3 hover:bg-charcoal-50/30 transition-colors"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-500"
                        : alert.severity === "WARNING"
                          ? "bg-amber-500"
                          : "bg-blue-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-charcoal-900 text-sm truncate">
                        {alert.title}
                      </span>
                      <span className="text-[10px] text-charcoal-400 flex-shrink-0">
                        {formatRelativeDate(alert.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-charcoal-500 mt-0.5 truncate">
                      {alert.project.client?.name} · {alert.project.name}
                    </div>
                    <span
                      className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 uppercase tracking-wide ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-50 text-red-600"
                          : alert.severity === "WARNING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
