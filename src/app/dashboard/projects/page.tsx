// src/app/dashboard/projects/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, getStatusColor, getProjectTypeLabel } from "@/lib/utils";

export const metadata = { title: "Projects | GRUTH" };

const TYPE_ICONS: Record<string, string> = {
  CONSTRUCTION: "🏗️",
  LAND_PROPERTY: "🏡",
  WEDDING_EVENT: "💒",
  FUNERAL_EVENT: "🕊️",
  BUSINESS_INVESTMENT: "📊",
  MATERIAL_PRICING: "🧱",
};

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session?.user?.id!;

  const projects = await prisma.project.findMany({
    where: { clientId: userId },
    include: {
      inspections: {
        orderBy: { scheduledDate: "desc" },
        take: 1,
        include: { media: { where: { type: "PHOTO" }, take: 1 } },
      },
      alerts: { where: { isRead: false } },
      progressStages: true,
      _count: { select: { inspections: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-950">
            Projects
          </h1>
          <p className="text-charcoal-500 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/request-verification" className="btn-primary text-sm">
          + New Request
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="font-display text-xl font-bold text-charcoal-950 mb-2">
            No projects yet
          </h2>
          <p className="text-charcoal-500 mb-6">
            Submit a verification request to get started.
          </p>
          <Link href="/request-verification" className="btn-primary">
            Request Verification
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => {
            const lastInspection = project.inspections[0];
            const coverPhoto = lastInspection?.media[0];
            const completedStages = project.progressStages.filter(
              (s: any) => s.completed,
            ).length;
            const progressPct =
              project.progressStages.length > 0
                ? (completedStages / project.progressStages.length) * 100
                : null;

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="card block hover:border-orange-200 transition-all group overflow-hidden"
              >
                {/* Cover image or placeholder */}
                <div className="h-32 bg-charcoal-50 relative overflow-hidden">
                  {coverPhoto ? (
                    <img
                      src={coverPhoto.url}
                      alt={coverPhoto.caption ?? project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-30">
                        {TYPE_ICONS[project.type] ?? "📁"}
                      </span>
                    </div>
                  )}
                  {/* Status overlay */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`status-badge ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-charcoal-950 text-white flex items-center justify-center text-sm flex-shrink-0">
                      {TYPE_ICONS[project.type] ?? "📁"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-charcoal-950 text-sm truncate group-hover:text-orange-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-charcoal-400 text-xs mt-0.5">
                        {getProjectTypeLabel(project.type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-charcoal-500 text-xs mb-4">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
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
                  {progressPct !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-charcoal-400 mb-1.5">
                        <span>Completion</span>
                        <span className="font-semibold text-charcoal-700">
                          {progressPct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-charcoal-500 pt-3 border-t border-gray-50">
                    <div>
                      <span className="text-charcoal-300">
                        Last inspection ·{" "}
                      </span>
                      <span className="font-medium text-charcoal-600">
                        {lastInspection
                          ? formatDate(lastInspection.scheduledDate)
                          : "None yet"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-charcoal-400 font-semibold">
                      {project._count.inspections}
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>

                  {project.alerts.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                      <span>⚠️</span>
                      {project.alerts.length} unread alert
                      {project.alerts.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
