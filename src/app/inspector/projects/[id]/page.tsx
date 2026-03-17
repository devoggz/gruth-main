// src/app/inspector/projects/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  formatDate,
  formatRelativeDate,
  getStatusColor,
  getProjectTypeLabel,
} from "@/lib/utils";
import InspectorFieldReport from "@/components/inspector/InspectorFieldReport";
import InspectorRespondButtons from "@/components/inspector/InspectorRespondButtons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const p = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: p ? `${p.name} — Inspector | GRUTH` : "Project" };
}

export default async function InspectorProjectDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as
    | { id?: string; role?: string; name?: string }
    | undefined;
  if (!session || (user?.role !== "INSPECTOR" && user?.role !== "ADMIN"))
    redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: { name: true, email: true, phone: true, country: true },
      },
      inspections: {
        orderBy: { scheduledDate: "desc" },
        include: { media: { orderBy: { sortOrder: "asc" } }, report: true },
      },
      progressStages: { orderBy: { order: "asc" } },
      alerts: { orderBy: { createdAt: "desc" }, take: 5 },
      materialPrices: true,
    },
  });

  if (!project) notFound();
  // Non-admin inspectors can only see their assigned projects
  if (user?.role === "INSPECTOR" && project.inspectorId !== user.id)
    redirect("/inspector");

  const latestScheduled = project.inspections.find(
    (i) => i.status === "SCHEDULED",
  );
  const completedInspections = project.inspections.filter(
    (i) => i.status === "COMPLETED",
  );
  const allPhotos = project.inspections.flatMap((i) =>
    i.media.filter((m) => m.type === "PHOTO"),
  );
  const isPending = project.inspectorStatus === "PENDING";

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mb-3">
          <Link
            href="/inspector"
            className="hover:text-emerald-600 transition-colors"
          >
            My Projects
          </Link>
          <span>/</span>
          <span className="text-charcoal-700">{project.name}</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal-950">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`status-badge ${getStatusColor(project.status)}`}
              >
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
      </div>

      {/* ── Accept / Decline banner ───────────────────────────────────────────── */}
      {(isPending || project.inspectorStatus === "DECLINED") && (
        <div
          className={`card p-5 border-2 ${isPending ? "border-orange-300 bg-orange-50/40" : "border-red-200 bg-red-50/30"}`}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPending ? "bg-orange-500" : "bg-red-400"}`}
            >
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">
                {isPending
                  ? "New Project Assignment"
                  : "You declined this project"}
              </h3>
              <p className="text-charcoal-500 text-sm">
                {isPending
                  ? "Review the project details below, then confirm your availability."
                  : "You previously declined. Contact the admin if your availability changed."}
              </p>
            </div>
          </div>
          <InspectorRespondButtons
            projectId={project.id}
            currentStatus={project.inspectorStatus}
          />
        </div>
      )}
      <div className="card p-5 flex items-center gap-5">
        <div className="w-12 h-12 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
          {project.client.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-charcoal-900">
            {project.client.name}
          </p>
          <p className="text-charcoal-400 text-sm">
            {project.client.country} diaspora
          </p>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            {project.client.email && (
              <a
                href={`mailto:${project.client.email}`}
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
                {project.client.email}
              </a>
            )}
            {project.client.phone && (
              <a
                href={`https://wa.me/${project.client.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-charcoal-400">Project started</p>
          <p className="font-semibold text-charcoal-800 text-sm">
            {project.startDate ? formatDate(project.startDate) : "—"}
          </p>
        </div>
      </div>

      {/* Project description */}
      {project.description && (
        <div className="card p-5">
          <h2 className="font-semibold text-charcoal-900 mb-2 text-sm uppercase tracking-wide">
            Client Brief
          </h2>
          <p className="text-charcoal-700 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
      )}

      {/* Progress stages */}
      {project.progressStages.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-charcoal-900 mb-4 text-sm uppercase tracking-wide">
            Project Stages
          </h2>
          <div className="space-y-2.5">
            {project.progressStages.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${s.completed ? "bg-emerald-500" : "bg-charcoal-100"}`}
                >
                  {s.completed && (
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
                  className={`text-sm ${s.completed ? "text-charcoal-800 font-medium" : "text-charcoal-400"}`}
                >
                  {s.stageName}
                </span>
                {s.completedAt && (
                  <span className="text-xs text-charcoal-300 ml-auto">
                    {formatDate(s.completedAt)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing inspection reports */}
      {completedInspections.length > 0 && (
        <div>
          <h2 className="font-semibold text-charcoal-900 mb-4">
            Previous Inspection Reports
          </h2>
          <div className="space-y-5">
            {completedInspections.map((insp) => (
              <div key={insp.id} className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-charcoal-900 text-sm">
                      Inspection — {formatDate(insp.scheduledDate)}
                    </p>
                    <p className="text-charcoal-400 text-xs mt-0.5">
                      {formatRelativeDate(insp.scheduledDate)}
                    </p>
                  </div>
                  <span
                    className={`status-badge ${getStatusColor(insp.status)}`}
                  >
                    {insp.status}
                  </span>
                </div>
                {insp.summary && (
                  <div className="mb-3">
                    <p className="text-xs text-charcoal-400 mb-1 font-medium uppercase tracking-wide">
                      Summary
                    </p>
                    <p className="text-charcoal-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                      {insp.summary}
                    </p>
                  </div>
                )}
                {insp.media.filter((m) => m.type === "PHOTO").length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {insp.media
                      .filter((m) => m.type === "PHOTO")
                      .map((m) => (
                        <div
                          key={m.id}
                          className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
                        >
                          <Image
                            src={m.url}
                            alt={m.caption ?? m.filename}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                  </div>
                )}
                {insp.overallRating && (
                  <div className="flex items-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <svg
                        key={n}
                        className={`w-4 h-4 ${n <= insp.overallRating! ? "text-orange-400" : "text-charcoal-200"}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    {insp.workQuality && (
                      <span className="text-xs text-charcoal-500 ml-1">
                        {insp.workQuality}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Gallery */}
      {allPhotos.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-charcoal-900 mb-4">
            Evidence Gallery ({allPhotos.length} photos)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allPhotos.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
              >
                <Image
                  src={m.url}
                  alt={m.caption ?? m.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {m.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs">{m.caption}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Field Report Form */}
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-charcoal-950 mb-1">
            {latestScheduled
              ? "Submit Inspection Report"
              : "Log New Inspection"}
          </h2>
          <p className="text-charcoal-500 text-sm">
            Your report will be immediately visible to the client in their
            project dashboard.
          </p>
        </div>
        <InspectorFieldReport
          projectId={project.id}
          inspectionId={latestScheduled?.id}
          inspectorName={user?.name ?? "Inspector"}
        />
      </div>
    </div>
  );
}
