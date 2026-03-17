// src/app/dashboard/projects/[id]/page.tsx
// Updated: shows assigned inspector, PDF report download, full inspection reports with media
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getStatusColor,
  getProjectTypeLabel,
  getBudgetRisk,
} from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const p = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: p ? `${p.name} | GroundTruth` : "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id!;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const project = await prisma.project.findFirst({
    where: isAdmin ? { id } : { id, clientId: userId },
    include: {
      inspector: {
        select: { id: true, name: true, email: true, phone: true, bio: true },
      },
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

  const budget =
    project.estimatedBudget && project.amountSpent
      ? getBudgetRisk(project.estimatedBudget, project.amountSpent)
      : null;

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

  const completedInspections = project.inspections.filter(
    (i) => i.status === "COMPLETED",
  );
  const upcomingInspections = project.inspections.filter(
    (i) => i.status === "SCHEDULED",
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/projects"
              className="text-charcoal-400 text-sm hover:text-charcoal-700"
            >
              Projects
            </Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-700 text-sm">{project.name}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal-950">
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
        <div className="flex items-center gap-3">
          {/* PDF Report download */}
          {project.reportFileUrl && (
            <a
              href={project.reportFileUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download Report
            </a>
          )}
          <Link
            href="/request-verification"
            className="btn-primary text-sm flex-shrink-0"
          >
            + New Verification
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {project.alerts.filter((a) => !a.isRead).length > 0 && (
        <div className="space-y-2">
          {project.alerts
            .filter((a) => !a.isRead)
            .map((alert) => (
              <div
                key={alert.id}
                className={`alert-banner ${
                  alert.severity === "CRITICAL"
                    ? "bg-red-50 border-red-200"
                    : alert.severity === "WARNING"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <span className="text-xl flex-shrink-0">
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

      {/* Overview grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overview */}
        <div className="card p-6">
          <h2 className="font-semibold text-charcoal-900 text-xs uppercase tracking-wide mb-4">
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
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-charcoal-400">{k}</dt>
                <dd className="font-medium text-charcoal-800 text-right max-w-[60%]">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Budget */}
        {project.estimatedBudget && (
          <div className="card p-6">
            <h2 className="font-semibold text-charcoal-900 text-xs uppercase tracking-wide mb-4">
              Budget
            </h2>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                {[
                  [
                    "Estimated",
                    formatCurrency(project.estimatedBudget, project.currency),
                  ],
                  [
                    "Spent",
                    formatCurrency(project.amountSpent ?? 0, project.currency),
                  ],
                  [
                    "Remaining",
                    formatCurrency(
                      project.estimatedBudget - (project.amountSpent ?? 0),
                      project.currency,
                    ),
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-charcoal-400">{k}</span>
                    <span
                      className={`font-semibold ${k === "Remaining" ? "text-emerald-700" : "text-charcoal-900"}`}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              {budget && (
                <div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${budget.level === "low" ? "bg-emerald-500" : budget.level === "medium" ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs text-charcoal-400">
                      {budget.percentage.toFixed(0)}% used
                    </span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        budget.level === "low"
                          ? "bg-emerald-50 text-emerald-700"
                          : budget.level === "medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {budget.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress */}
        {project.progressStages.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-charcoal-900 text-xs uppercase tracking-wide mb-4">
              Progress — {progressPct}%
            </h2>
            <div className="space-y-2.5">
              {project.progressStages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${stage.completed ? "bg-emerald-500" : "bg-gray-200"}`}
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
                    className={`text-sm ${stage.completed ? "text-charcoal-800 font-medium" : "text-charcoal-400"}`}
                  >
                    {stage.stageName}
                  </span>
                  {stage.completedAt && (
                    <span className="text-xs text-charcoal-300 ml-auto">
                      {formatDate(stage.completedAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assigned Inspector */}
      {project.inspector && (
        <div className="card p-6">
          <h2 className="font-semibold text-charcoal-900 mb-4 text-xs uppercase tracking-wide">
            Your Assigned Inspector
          </h2>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {project.inspector.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "IN"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-charcoal-900">
                {project.inspector.name}
              </p>
              <p className="text-charcoal-400 text-sm">
                Verified GRUTH Inspector
              </p>
              {project.inspector.bio && (
                <p className="text-charcoal-600 text-sm mt-2 leading-relaxed">
                  {project.inspector.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {project.inspector.email && (
                  <a
                    href={`mailto:${project.inspector.email}`}
                    className="text-sm text-orange-600 hover:underline flex items-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    {project.inspector.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Inspections */}
      {upcomingInspections.length > 0 && (
        <div className="card p-6 border-orange-200 bg-orange-50/30">
          <h2 className="font-semibold text-charcoal-900 mb-4">
            Upcoming Inspection
          </h2>
          {upcomingInspections.map((i) => (
            <div key={i.id} className="flex items-center gap-4">
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
                <p className="font-semibold text-charcoal-900">
                  {formatDate(i.scheduledDate)}
                </p>
                <p className="text-charcoal-500 text-sm">
                  {formatRelativeDate(i.scheduledDate)} · Inspector:{" "}
                  {i.inspectorName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspection Timeline — full reports */}
      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-900 mb-6">
          Inspection Reports
        </h2>
        {project.inspections.length === 0 ? (
          <p className="text-charcoal-400 text-sm">
            No inspections yet. Your inspector will submit reports after each
            visit.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-10">
              {project.inspections.map((inspection) => (
                <div key={inspection.id} className="relative pl-12">
                  <div
                    className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-white ${
                      inspection.status === "COMPLETED"
                        ? "bg-emerald-500"
                        : inspection.status === "IN_PROGRESS"
                          ? "bg-orange-500"
                          : "bg-gray-300"
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
                    <p className="text-charcoal-600 text-sm mt-3 leading-relaxed bg-gray-50 rounded-lg p-3">
                      {inspection.summary}
                    </p>
                  )}

                  {inspection.observations && (
                    <div className="mt-3">
                      <p className="text-xs text-charcoal-400 font-medium uppercase tracking-wide mb-1.5">
                        Observations
                      </p>
                      <p className="text-charcoal-700 text-sm leading-relaxed bg-charcoal-50 rounded-lg p-3 whitespace-pre-line">
                        {inspection.observations}
                      </p>
                    </div>
                  )}

                  {inspection.recommendations && (
                    <div className="mt-3">
                      <p className="text-xs text-charcoal-400 font-medium uppercase tracking-wide mb-1.5">
                        Recommendations
                      </p>
                      <p className="text-charcoal-700 text-sm leading-relaxed bg-orange-50 border border-orange-100 rounded-lg p-3 whitespace-pre-line">
                        {inspection.recommendations}
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  {inspection.overallRating && (
                    <div className="flex items-center gap-3 mt-3">
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
                      <span
                        className={`text-xs ${inspection.safetyCompliance ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {inspection.safetyCompliance
                          ? "✓ Safety compliant"
                          : "⚠ Safety concerns"}
                      </span>
                    </div>
                  )}

                  {/* Next steps */}
                  {inspection.nextSteps && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-charcoal-600">
                      <span className="text-orange-500 font-semibold flex-shrink-0">
                        →
                      </span>
                      <span>{inspection.nextSteps}</span>
                    </div>
                  )}

                  {/* Photos */}
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
                            className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 group"
                          >
                            <Image
                              src={media.url}
                              alt={media.caption ?? media.filename}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                            {media.caption && (
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-1">
                                <p className="text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity leading-tight">
                                  {media.caption}
                                </p>
                              </div>
                            )}
                          </a>
                        ))}
                    </div>
                  )}

                  {/* Report PDF link */}
                  {inspection.report?.fileUrl && (
                    <div className="mt-3">
                      <a
                        href={inspection.report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-orange-600 text-xs font-medium hover:text-orange-700"
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Evidence Gallery */}
      {allPhotos.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-charcoal-900 mb-5">
            Evidence Gallery ({allPhotos.length} photos)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allPhotos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption ?? photo.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
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

      {/* Material Prices */}
      {project.materialPrices.length > 0 && (
        <div className="card p-6 overflow-x-auto">
          <h2 className="font-semibold text-charcoal-900 mb-5">
            Material Price Intelligence
          </h2>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
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
                    className="text-left text-xs text-charcoal-400 uppercase tracking-wide font-medium py-2 pr-4 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {project.materialPrices.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
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

      {/* Messages */}
      {project.messages.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-charcoal-900 mb-5">
            Communication Panel
          </h2>
          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
            {project.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromClient ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.isFromClient
                      ? "bg-charcoal-950 text-white rounded-br-md"
                      : "bg-gray-100 text-charcoal-800 rounded-bl-md"
                  }`}
                >
                  {!msg.isFromClient && (
                    <div className="text-xs font-semibold text-orange-600 mb-1">
                      GroundTruth Team
                    </div>
                  )}
                  {msg.content}
                  <div
                    className={`text-xs mt-1.5 ${msg.isFromClient ? "text-white/50" : "text-charcoal-400"}`}
                  >
                    {formatRelativeDate(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-charcoal-400 text-xs text-center">
              To send a message, use the{" "}
              <Link
                href="/dashboard/messages"
                className="text-orange-600 hover:underline"
              >
                Messages
              </Link>{" "}
              section.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
