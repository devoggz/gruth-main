// src/app/admin/projects/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { type Prisma } from "@prisma/client";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getStatusColor,
  getProjectTypeLabel,
  getBudgetRisk,
} from "@/lib/utils";
import AdminProjectActions from "@/components/admin/AdminProjectActions";
import AdminAssignInspector from "@/components/admin/AdminAssignInspector";

// ── Derived Prisma payload types ─────────────────────────────────────────────

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    client: {
      select: { id: true; name: true; email: true; phone: true; country: true };
    };
    inspector: { select: { id: true; name: true; email: true } };
    inspections: { include: { media: true; report: true } };
    materialPrices: { include: { supplier: true } };
    vendors: true;
    alerts: true;
    messages: { include: { user: { select: { name: true } } } };
    progressStages: true;
  };
}>;

type InspectionMedia =
  ProjectWithRelations["inspections"][number]["media"][number];
type Alert = ProjectWithRelations["alerts"][number];
type Message = ProjectWithRelations["messages"][number];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: project ? `${project.name} — Admin | GRUTH` : "Project" };
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (userRole !== "ADMIN") redirect("/dashboard");

  const [project, inspectors] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
          },
        },
        inspector: { select: { id: true, name: true, email: true } },
        inspections: {
          orderBy: { scheduledDate: "desc" },
          include: { media: true, report: true },
        },
        materialPrices: { include: { supplier: true } },
        vendors: { orderBy: { createdAt: "asc" } },
        alerts: { orderBy: { createdAt: "desc" } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { user: { select: { name: true } } },
        },
        progressStages: { orderBy: { order: "asc" } },
      },
    }) as Promise<ProjectWithRelations | null>,
    prisma.user.findMany({
      where: { role: "INSPECTOR" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  if (!project) notFound();

  const budget =
    project.estimatedBudget && project.amountSpent
      ? getBudgetRisk(project.estimatedBudget, project.amountSpent)
      : null;

  const allPhotos = project.inspections.flatMap((inspection) =>
    inspection.media
      .filter((m: InspectionMedia) => m.type === "PHOTO")
      .map((m: InspectionMedia) => ({
        ...m,
        inspectionDate: inspection.scheduledDate,
      })),
  );

  const completedStages = project.progressStages.filter(
    (s) => s.completed,
  ).length;
  const progressPct =
    project.progressStages.length > 0
      ? Math.round((completedStages / project.progressStages.length) * 100)
      : 0;

  const unreadAlerts = project.alerts.filter((a: Alert) => !a.isRead).length;
  const unreadMessages = project.messages.filter(
    (m: Message) => m.isFromClient && !m.readAt,
  ).length;

  return (
    <div className="space-y-6 pb-16 max-w-6xl">
      {/* ── Breadcrumb + header ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mb-3">
          <Link
            href="/admin"
            className="hover:text-orange-500 transition-colors"
          >
            Admin
          </Link>
          <span>/</span>
          <Link
            href="/admin/projects"
            className="hover:text-orange-500 transition-colors"
          >
            Projects
          </Link>
          <span>/</span>
          <span className="text-charcoal-600 font-medium truncate max-w-[200px]">
            {project.name}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-[26px] font-bold text-charcoal-950 tracking-tight leading-none">
                {project.name}
              </h1>
              <span
                className={`status-badge ${getStatusColor(project.status)}`}
              >
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-charcoal-400 flex-wrap">
              <span>{getProjectTypeLabel(project.type)}</span>
              <span>·</span>
              <span>{project.location}</span>
              {project.startDate && (
                <>
                  <span>·</span>
                  <span>Started {formatDate(project.startDate)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href={`/admin/projects/${project.id}/messages`}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                unreadMessages > 0
                  ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  : "bg-white border border-charcoal-200 hover:border-charcoal-300 text-charcoal-700 shadow-sm"
              }`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
              </svg>
              {unreadMessages > 0
                ? `${unreadMessages} unread`
                : "Message client"}
            </Link>
            {/* Status updater — client component */}
            <AdminProjectActions
              projectId={project.id}
              currentStatus={project.status}
            />
          </div>
        </div>
      </div>

      {/* ── Active alerts ────────────────────────────────────────────────────── */}
      {unreadAlerts > 0 && (
        <div className="space-y-2">
          {project.alerts
            .filter((a) => !a.isRead)
            .map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  alert.severity === "CRITICAL"
                    ? "bg-red-50 border-red-200"
                    : alert.severity === "WARNING"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <span className="text-lg flex-shrink-0">
                  {alert.severity === "CRITICAL"
                    ? "🔴"
                    : alert.severity === "WARNING"
                      ? "⚠️"
                      : "ℹ️"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal-900 text-sm">
                    {alert.title}
                  </div>
                  <div className="text-charcoal-600 text-xs mt-0.5 leading-relaxed">
                    {alert.message}
                  </div>
                </div>
                <span className="text-[10px] text-charcoal-400 flex-shrink-0">
                  {formatRelativeDate(alert.createdAt)}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* ── Top info grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Client info */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-4">
            Client
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {project.client.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <div className="font-semibold text-charcoal-900">
                {project.client.name}
              </div>
              <div className="text-xs text-charcoal-400">
                {project.client.email}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {project.client.phone && (
              <a
                href={`tel:${project.client.phone}`}
                className="flex items-center gap-2 text-xs text-charcoal-600 hover:text-orange-500 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 text-charcoal-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.25 7.76a16 16 0 006 6l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
                </svg>
                {project.client.phone}
              </a>
            )}
            <a
              href={`mailto:${project.client.email}`}
              className="flex items-center gap-2 text-xs text-charcoal-600 hover:text-orange-500 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 text-charcoal-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {project.client.email}
            </a>
            {project.client.country && (
              <div className="flex items-center gap-2 text-xs text-charcoal-400">
                <svg
                  className="w-3.5 h-3.5 text-charcoal-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                </svg>
                {project.client.country}
              </div>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-4">
            Budget
          </p>
          {project.estimatedBudget ? (
            <div className="space-y-3">
              {[
                {
                  label: "Estimated",
                  value: formatCurrency(
                    project.estimatedBudget,
                    project.currency,
                  ),
                  color: "text-charcoal-900",
                },
                {
                  label: "Spent",
                  value: formatCurrency(
                    project.amountSpent ?? 0,
                    project.currency,
                  ),
                  color: "text-charcoal-700",
                },
                {
                  label: "Remaining",
                  value: formatCurrency(
                    project.estimatedBudget - (project.amountSpent ?? 0),
                    project.currency,
                  ),
                  color: "text-emerald-600",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-charcoal-400">{label}</span>
                  <span className={`font-semibold font-mono ${color}`}>
                    {value}
                  </span>
                </div>
              ))}
              {budget && (
                <div className="pt-1">
                  <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budget.level === "low"
                          ? "bg-emerald-500"
                          : budget.level === "medium"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-charcoal-400">
                      {budget.percentage.toFixed(0)}% used
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        budget.level === "low"
                          ? "text-emerald-600"
                          : budget.level === "medium"
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {budget.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-charcoal-300">No budget set.</p>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em]">
              Progress
            </p>
            {project.progressStages.length > 0 && (
              <span className="text-xs font-bold text-charcoal-700">
                {progressPct}%
              </span>
            )}
          </div>
          {project.progressStages.length > 0 ? (
            <>
              <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="space-y-2.5">
                {project.progressStages.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        stage.completed ? "bg-emerald-500" : "bg-charcoal-100"
                      }`}
                    >
                      {stage.completed && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-xs flex-1 ${stage.completed ? "text-charcoal-700 font-medium" : "text-charcoal-400"}`}
                    >
                      {stage.stageName}
                    </span>
                    {stage.completedAt && (
                      <span className="text-[10px] text-charcoal-300">
                        {formatDate(stage.completedAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-charcoal-300">No stages defined.</p>
          )}
        </div>
      </div>

      {/* ── Inspector assignment ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
        <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-4">
          Assigned Inspector
        </p>
        {project.inspector && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {project.inspector.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() ?? "IN"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-charcoal-900 text-sm">
                {project.inspector.name}
              </p>
              <p className="text-xs text-charcoal-400 truncate">
                {project.inspector.email}
              </p>
            </div>
            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full flex-shrink-0">
              ASSIGNED
            </span>
          </div>
        )}
        <AdminAssignInspector
          projectId={project.id}
          currentInspectorId={project.inspectorId ?? null}
          inspectors={inspectors}
        />
      </div>

      {/* ── Description ──────────────────────────────────────────────────────── */}
      {project.description && (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-3">
            Project Description
          </p>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            {project.description}
          </p>
        </div>
      )}

      {/* ── Inspection Timeline ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-charcoal-950">
              Inspection Timeline
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              {project.inspections.length} inspection
              {project.inspections.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="px-6 py-5">
          {project.inspections.length === 0 ? (
            <p className="text-sm text-charcoal-300 py-8 text-center">
              No inspections recorded yet.
            </p>
          ) : (
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-charcoal-100" />
              <div className="space-y-8">
                {project.inspections.map((inspection) => (
                  <div key={inspection.id} className="relative pl-10">
                    <div
                      className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                        inspection.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : inspection.status === "IN_PROGRESS"
                            ? "bg-orange-500"
                            : "bg-charcoal-300"
                      }`}
                    />
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="font-semibold text-charcoal-900 text-sm">
                          {inspection.inspectorName}
                        </div>
                        <div className="text-xs text-charcoal-400 mt-0.5">
                          {formatDate(inspection.scheduledDate)} ·{" "}
                          {formatRelativeDate(inspection.scheduledDate)}
                        </div>
                      </div>
                      <span
                        className={`status-badge text-[10px] ${getStatusColor(inspection.status)}`}
                      >
                        {inspection.status}
                      </span>
                    </div>
                    {inspection.summary && (
                      <p className="text-charcoal-600 text-sm mt-3 leading-relaxed bg-charcoal-50 rounded-xl p-3">
                        {inspection.summary}
                      </p>
                    )}
                    {inspection.observations && (
                      <p className="text-charcoal-500 text-xs mt-2 leading-relaxed pl-1">
                        <span className="font-semibold text-charcoal-600">
                          Observations:{" "}
                        </span>
                        {inspection.observations}
                      </p>
                    )}
                    {inspection.media.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {inspection.media
                          .filter((m) => m.type === "PHOTO")
                          .slice(0, 6)
                          .map((media) => (
                            <div
                              key={media.id}
                              className="relative w-16 h-16 rounded-lg overflow-hidden bg-charcoal-100 flex-shrink-0"
                            >
                              <Image
                                src={media.url}
                                alt={media.caption ?? media.filename}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                    {inspection.report && (
                      <a
                        href={inspection.report.fileUrl ?? "#"}
                        className="inline-flex items-center gap-1.5 text-orange-500 text-xs font-semibold mt-3 hover:text-orange-600 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Report
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Evidence Gallery ─────────────────────────────────────────────────── */}
      {allPhotos.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-4">
            Evidence Gallery · {allPhotos.length} photo
            {allPhotos.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {allPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-charcoal-100"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption ?? photo.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[9px] leading-tight">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Material prices ──────────────────────────────────────────────────── */}
      {project.materialPrices.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-100">
            <h2 className="font-display font-semibold text-charcoal-950">
              Material Price Intelligence
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                  {[
                    "Material",
                    "Unit",
                    "Market Range",
                    "Quoted",
                    "Verified",
                    "Supplier",
                    "Status",
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
                {project.materialPrices.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-charcoal-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-charcoal-900">
                      {item.materialName}
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-500">
                      {item.unit}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-charcoal-600">
                      {formatCurrency(item.marketPriceLow)} –{" "}
                      {formatCurrency(item.marketPriceHigh)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-charcoal-700">
                      {item.quotedPrice
                        ? formatCurrency(item.quotedPrice)
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-charcoal-700">
                      {item.verifiedPrice
                        ? formatCurrency(item.verifiedPrice)
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-500 text-xs">
                      {item.supplier?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`status-badge text-[10px] ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Vendors ──────────────────────────────────────────────────────────── */}
      {project.vendors.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.12em] mb-4">
            Vendors & Contractors · {project.vendors.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="border border-charcoal-100 rounded-xl p-4 hover:border-charcoal-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="font-semibold text-charcoal-900 text-sm">
                      {vendor.name}
                    </div>
                    <div className="text-orange-500 text-xs font-medium mt-0.5">
                      {vendor.role}
                    </div>
                  </div>
                  <span
                    className={`status-badge text-[10px] ${getStatusColor(vendor.verifiedStatus)}`}
                  >
                    {vendor.verifiedStatus}
                  </span>
                </div>
                <div className="space-y-1 mt-3">
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="block text-xs text-charcoal-500 hover:text-orange-500 transition-colors"
                    >
                      📞 {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="block text-xs text-charcoal-500 hover:text-orange-500 transition-colors"
                    >
                      ✉️ {vendor.email}
                    </a>
                  )}
                  {vendor.contractValue && (
                    <div className="text-xs text-charcoal-400 pt-1">
                      Contract:{" "}
                      <span className="font-semibold text-charcoal-700">
                        {formatCurrency(vendor.contractValue)}
                      </span>
                    </div>
                  )}
                </div>
                {vendor.performanceNotes && (
                  <p className="text-charcoal-500 text-xs mt-3 bg-charcoal-50 rounded-lg p-2.5 leading-relaxed">
                    {vendor.performanceNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All alerts log ───────────────────────────────────────────────────── */}
      {project.alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-100">
            <h2 className="font-display font-semibold text-charcoal-950">
              Alert Log
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              {project.alerts.length} total · {unreadAlerts} unread
            </p>
          </div>
          <div className="divide-y divide-charcoal-50">
            {project.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-6 py-3.5 flex items-start gap-3 transition-colors ${alert.isRead ? "hover:bg-charcoal-50/30" : "bg-orange-50/20 hover:bg-orange-50/30"}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-500"
                      : alert.severity === "WARNING"
                        ? "bg-amber-500"
                        : "bg-blue-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${alert.isRead ? "text-charcoal-600" : "text-charcoal-900"}`}
                    >
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-charcoal-400 flex-shrink-0">
                      {formatRelativeDate(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent messages preview ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-charcoal-950">
              Messages
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              {unreadMessages > 0
                ? `${unreadMessages} unread from client`
                : "Recent thread"}
            </p>
          </div>
          <Link
            href={`/admin/projects/${project.id}/messages`}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              unreadMessages > 0
                ? "text-violet-600 hover:text-violet-700"
                : "text-orange-500 hover:text-orange-600"
            }`}
          >
            {unreadMessages > 0
              ? `Reply (${unreadMessages} unread)`
              : "Open thread"}
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

        {project.messages.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-charcoal-300">No messages yet.</p>
            <Link
              href={`/admin/projects/${project.id}/messages`}
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              Send first message →
            </Link>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-3">
            {project.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromClient ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.isFromClient
                      ? "bg-charcoal-100 text-charcoal-900 rounded-bl-md"
                      : "bg-violet-600 text-white rounded-br-md"
                  }`}
                >
                  {!msg.isFromClient && (
                    <div className="text-[10px] font-bold text-violet-200 mb-1 uppercase tracking-wide">
                      GRUTH Team
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.content}</p>
                  <div
                    className={`text-[10px] mt-1.5 ${msg.isFromClient ? "text-charcoal-400" : "text-violet-300"}`}
                  >
                    {formatRelativeDate(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-1 text-center">
              <Link
                href={`/admin/projects/${project.id}/messages`}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
              >
                Open full thread →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
