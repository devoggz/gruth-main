// src/app/dashboard/projects/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getStatusColor,
  getProjectTypeLabel,
} from "@/lib/utils";
import BudgetManager from "@/components/dashboard/BudgetManager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const p = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: p ? `${p.name} | GRUTH` : "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id!;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const project = await prisma.project.findFirst({
    where: isAdmin ? { id } : { id, clientId: userId },
    include: {
      inspector: { select: { id: true, name: true, email: true, bio: true } },
      inspections: {
        orderBy: { scheduledDate: "desc" },
        include: { media: { orderBy: { sortOrder: "asc" } }, report: true },
      },
      materialPrices: { include: { supplier: true } },
      vendors: true,
      alerts: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
      progressStages: { orderBy: { order: "asc" } },
    },
  });

  if (!project) notFound();

  const allPhotos = project.inspections.flatMap((i) =>
    i.media
      .filter((m) => m.type === "PHOTO")
      .map((m) => ({ ...m, inspectionDate: i.scheduledDate })),
  );

  const completedStages = project.progressStages.filter(
    (s) => s.completed,
  ).length;
  const progressPct =
    project.progressStages.length > 0
      ? Math.round((completedStages / project.progressStages.length) * 100)
      : 0;
  const upcomingInspections = project.inspections.filter(
    (i) => i.status === "SCHEDULED",
  );
  const unreadAlerts = project.alerts.filter((a) => !a.isRead);

  return (
    <div className="space-y-6 w-full px-4 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Link
              prefetch={true}
              href="/dashboard/projects"
              className="text-charcoal-400 hover:text-charcoal-700 transition-colors"
            >
              Projects
            </Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-700 truncate max-w-[200px]">
              {project.name}
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-charcoal-950 tracking-tight">
            {project.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`status-badge ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className="text-charcoal-400 text-sm">
              {getProjectTypeLabel(project.type)}
            </span>
            <span className="text-charcoal-400 text-sm">
              · {project.location}
            </span>
          </div>
        </div>
      </div>

      {/* ── Unread alerts ──────────────────────────────────────────────────── */}
      {unreadAlerts.length > 0 && (
        <div className="space-y-2">
          {unreadAlerts.map((alert) => (
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
              <div>
                <div className="font-semibold text-charcoal-900 text-sm">
                  {alert.title}
                </div>
                <div className="text-charcoal-600 text-xs mt-0.5 leading-relaxed">
                  {alert.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Overview + Progress ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Project info */}
        <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
          <h2 className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-4">
            Project Overview
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              ["Type", getProjectTypeLabel(project.type)],
              ["Location", project.location],
              ["County", project.county ?? "—"],
              ...(project.startDate
                ? [["Started", formatDate(project.startDate)]]
                : []),
              ["Inspections", String(project.inspections.length)],
              ["Inspector", project.inspector?.name ?? "Not yet assigned"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-charcoal-400">{k}</dt>
                <dd className="font-medium text-charcoal-800 text-right max-w-[60%] truncate">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Progress stages */}
        {project.progressStages.length > 0 ? (
          <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest">
                Progress
              </h2>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  progressPct >= 100
                    ? "bg-emerald-50 text-emerald-700"
                    : progressPct >= 60
                      ? "bg-orange-50 text-orange-700"
                      : "bg-charcoal-100 text-charcoal-600"
                }`}
              >
                {progressPct}%
              </span>
            </div>
            {/* Overall bar */}
            <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct >= 80 ? "#16a34a" : "#f97316",
                }}
              />
            </div>
            <div className="space-y-2.5">
              {project.progressStages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${stage.completed ? "bg-emerald-500" : "bg-charcoal-100"}`}
                  >
                    {stage.completed && (
                      <svg
                        className="w-3 h-3 text-white"
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
                    className={`text-sm flex-1 ${stage.completed ? "text-charcoal-800 font-medium" : "text-charcoal-400"}`}
                  >
                    {stage.stageName}
                  </span>
                  {stage.completedAt && (
                    <span className="text-xs text-charcoal-300">
                      {formatDate(stage.completedAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* If no stages, show inspector card here */
          project.inspector && (
            <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
              <h2 className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-4">
                Assigned Inspector
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {project.inspector.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() ?? "IN"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal-900 text-sm">
                    {project.inspector.name}
                  </p>
                  {project.inspector.bio && (
                    <p className="text-charcoal-600 text-xs mt-2 leading-relaxed">
                      {project.inspector.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Upcoming inspection banner ─────────────────────────────────────── */}
      {upcomingInspections.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 text-sm">
                Upcoming Inspection
              </p>
              <p className="text-charcoal-600 text-xs mt-0.5">
                {formatDate(upcomingInspections[0].scheduledDate)} ·{" "}
                {formatRelativeDate(upcomingInspections[0].scheduledDate)} ·{" "}
                {upcomingInspections[0].inspectorName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Budget Tracker ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-charcoal-950">
              Budget Tracker
            </h2>
            <p className="text-charcoal-400 text-xs mt-0.5">
              Track spend by category, month, and against your total estimate
            </p>
          </div>
        </div>
        <BudgetManager
          projectId={project.id}
          projectName={project.name}
          estimatedBudget={project.estimatedBudget}
          currency={project.currency ?? "KES"}
        />
      </div>

      {/* ── Inspection Reports ─────────────────────────────────────────────── */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6">
        <h2 className="font-display font-semibold text-charcoal-950 mb-5">
          Inspection Reports
        </h2>
        {project.inspections.length === 0 ? (
          <p className="text-charcoal-400 text-sm">
            No inspections yet. Your inspector will submit reports after each
            visit.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-charcoal-100" />
            <div className="space-y-10">
              {project.inspections.map((inspection) => (
                <div key={inspection.id} className="relative pl-12">
                  <div
                    className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-white ${
                      inspection.status === "COMPLETED"
                        ? "bg-emerald-500"
                        : inspection.status === "IN_PROGRESS"
                          ? "bg-orange-500"
                          : "bg-charcoal-200"
                    }`}
                  />
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-semibold text-charcoal-900 text-sm">
                        Inspection by {inspection.inspectorName}
                      </div>
                      <div className="text-xs text-charcoal-400 mt-0.5">
                        {formatDate(inspection.scheduledDate)} ·{" "}
                        {formatRelativeDate(inspection.scheduledDate)}
                      </div>
                    </div>
                    <span
                      className={`status-badge ${getStatusColor(inspection.status)}`}
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
                    <div className="mt-3">
                      <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mb-1.5">
                        Observations
                      </p>
                      <p className="text-charcoal-700 text-sm leading-relaxed bg-charcoal-50 rounded-xl p-3 whitespace-pre-line">
                        {inspection.observations}
                      </p>
                    </div>
                  )}
                  {inspection.recommendations && (
                    <div className="mt-3">
                      <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mb-1.5">
                        Recommendations
                      </p>
                      <p className="text-charcoal-700 text-sm leading-relaxed bg-orange-50 border border-orange-100 rounded-xl p-3 whitespace-pre-line">
                        {inspection.recommendations}
                      </p>
                    </div>
                  )}

                  {inspection.overallRating && (
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <svg
                            key={n}
                            className={`w-4 h-4 ${n <= inspection.overallRating! ? "text-orange-400" : "text-charcoal-200"}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      {inspection.workQuality && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            inspection.workQuality === "EXCELLENT"
                              ? "bg-emerald-50 text-emerald-700"
                              : inspection.workQuality === "GOOD"
                                ? "bg-blue-50 text-blue-700"
                                : inspection.workQuality === "FAIR"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                          }`}
                        >
                          {inspection.workQuality}
                        </span>
                      )}
                    </div>
                  )}

                  {inspection.nextSteps && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-charcoal-600">
                      <span className="text-orange-500 font-semibold flex-shrink-0">
                        →
                      </span>
                      <span>{inspection.nextSteps}</span>
                    </div>
                  )}

                  {inspection.media.filter((m) => m.type === "PHOTO").length >
                    0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                      {inspection.media
                        .filter((m) => m.type === "PHOTO")
                        .map((media) => (
                          <a
                            key={media.id}
                            href={media.url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-charcoal-100 group"
                          >
                            <Image
                              src={media.url}
                              alt={media.caption ?? media.filename}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              unoptimized
                            />
                          </a>
                        ))}
                    </div>
                  )}

                  {inspection.report?.fileUrl && (
                    <a
                      href={inspection.report.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-orange-600 text-xs font-semibold hover:text-orange-700 mt-3 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Download Full Report (PDF)
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Evidence Gallery ───────────────────────────────────────────────── */}
      {allPhotos.length > 0 && (
        <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6">
          <h2 className="font-display font-semibold text-charcoal-950 mb-5">
            Evidence Gallery ({allPhotos.length} photos)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allPhotos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-charcoal-100"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption ?? photo.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs">{photo.caption}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Material Prices ────────────────────────────────────────────────── */}
      {project.materialPrices.length > 0 && (
        <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6 overflow-x-auto">
          <h2 className="font-display font-semibold text-charcoal-950 mb-5">
            Material Price Intelligence
          </h2>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-charcoal-100">
                {[
                  "Material",
                  "Unit",
                  "Market Range",
                  "Quoted",
                  "Verified",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-charcoal-400 uppercase tracking-widest py-2.5 pr-4 whitespace-nowrap"
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
                  className="hover:bg-charcoal-50/50 transition-colors"
                >
                  <td className="py-3 pr-4 font-medium text-charcoal-900">
                    {item.materialName}
                  </td>
                  <td className="py-3 pr-4 text-charcoal-500">{item.unit}</td>
                  <td className="py-3 pr-4 text-charcoal-600 font-mono text-xs">
                    {formatCurrency(item.marketPriceLow)} –{" "}
                    {formatCurrency(item.marketPriceHigh)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-charcoal-700">
                    {item.quotedPrice ? formatCurrency(item.quotedPrice) : "—"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-charcoal-700">
                    {item.verifiedPrice
                      ? formatCurrency(item.verifiedPrice)
                      : "—"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`status-badge ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Messages preview ───────────────────────────────────────────────── */}
      {project.messages.length > 0 && (
        <div className="bg-white border border-charcoal-100 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-charcoal-950">
              Recent Messages
            </h2>
            <Link
              prefetch={true}
              href="/dashboard/messages"
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Open full thread →
            </Link>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {project.messages.slice(-6).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromClient ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.isFromClient
                      ? "bg-charcoal-950 text-white rounded-br-sm"
                      : "bg-charcoal-100 text-charcoal-800 rounded-bl-sm"
                  }`}
                >
                  {!msg.isFromClient && (
                    <div className="text-[10px] font-bold text-orange-500 mb-1 uppercase tracking-widest">
                      GRUTH Team
                    </div>
                  )}
                  {msg.content}
                  <div
                    className={`text-xs mt-1.5 ${msg.isFromClient ? "text-white/40" : "text-charcoal-400"}`}
                  >
                    {formatRelativeDate(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
