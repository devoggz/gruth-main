// src/app/inspector/reports/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatDate,
  formatRelativeDate,
  getProjectTypeLabel,
} from "@/lib/utils";

export const metadata = { title: "My Reports | GRUTH Inspector" };

export default async function InspectorReportsPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };

  const inspections = await prisma.inspection.findMany({
    where: {
      status: "COMPLETED",
      project: { inspectorId: user?.id },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          location: true,
          type: true,
          client: { select: { name: true } },
        },
      },
      media: { where: { type: "PHOTO" }, take: 3 },
      report: true,
    },
    orderBy: { scheduledDate: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-950">
          Submitted Reports
        </h1>
        <p className="text-charcoal-500 text-sm mt-1">
          {inspections.length} completed inspection report
          {inspections.length !== 1 ? "s" : ""}
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-charcoal-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-charcoal-400 font-medium">
            No reports submitted yet
          </p>
          <p className="text-charcoal-300 text-sm mt-1">
            Completed inspection reports will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((insp) => (
            <Link
              key={insp.id}
              href={`/inspector/projects/${insp.project.id}`}
              className="card p-5 flex items-start gap-4 hover:border-emerald-200 transition-colors group"
            >
              {/* Status dot */}
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                      {insp.project.name}
                    </p>
                    <p className="text-charcoal-400 text-sm mt-0.5">
                      {getProjectTypeLabel(insp.project.type)} ·{" "}
                      {insp.project.location}
                    </p>
                    <p className="text-charcoal-400 text-xs mt-0.5">
                      Client: {insp.project.client.name} ·{" "}
                      {formatDate(insp.scheduledDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {insp.overallRating && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <svg
                            key={n}
                            className={`w-3.5 h-3.5 ${n <= insp.overallRating! ? "text-orange-400" : "text-charcoal-200"}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-charcoal-400">
                      {formatRelativeDate(insp.scheduledDate)}
                    </span>
                  </div>
                </div>

                {insp.summary && (
                  <p className="text-charcoal-500 text-xs mt-2 line-clamp-2">
                    {insp.summary}
                  </p>
                )}

                {/* Photo strip */}
                {insp.media.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {insp.media.map((m) => (
                      <div
                        key={m.id}
                        className="w-12 h-12 rounded-lg overflow-hidden bg-charcoal-100 flex-shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt={m.caption ?? ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="text-xs text-charcoal-400 self-center ml-1">
                      {insp.media.length} photo
                      {insp.media.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                )}
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
  );
}
