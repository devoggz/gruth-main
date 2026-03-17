// src/app/inspector/scheduled/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatDate,
  formatRelativeDate,
  getStatusColor,
  getProjectTypeLabel,
} from "@/lib/utils";

export const metadata = { title: "Scheduled Inspections | GRUTH Inspector" };

export default async function InspectorScheduledPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; name?: string };

  const inspections = await prisma.inspection.findMany({
    where: {
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      project: { inspectorId: user?.id },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          location: true,
          type: true,
          client: { select: { name: true, country: true } },
        },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-950">
          Scheduled Inspections
        </h1>
        <p className="text-charcoal-500 text-sm mt-1">
          {inspections.length === 0
            ? "No upcoming inspections."
            : `${inspections.length} inspection${inspections.length !== 1 ? "s" : ""} scheduled`}
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
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="text-charcoal-400 font-medium">
            No scheduled inspections
          </p>
          <p className="text-charcoal-300 text-sm mt-1">
            When inspections are scheduled they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((insp) => {
            const isPast = insp.scheduledDate < new Date();
            return (
              <Link
                key={insp.id}
                href={`/inspector/projects/${insp.project.id}`}
                className="card p-5 flex items-start gap-4 hover:border-orange-200 transition-colors group"
              >
                {/* Date badge */}
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white ${isPast ? "bg-charcoal-400" : "bg-orange-500"}`}
                >
                  <span className="text-xl font-bold leading-none">
                    {insp.scheduledDate.getDate()}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                    {insp.scheduledDate.toLocaleDateString("en-GB", {
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-charcoal-900 group-hover:text-orange-700 transition-colors">
                        {insp.project.name}
                      </p>
                      <p className="text-charcoal-400 text-sm mt-0.5">
                        {getProjectTypeLabel(insp.project.type)} ·{" "}
                        {insp.project.location}
                      </p>
                      <p className="text-charcoal-400 text-xs mt-0.5">
                        Client: {insp.project.client.name} (
                        {insp.project.client.country})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`status-badge ${getStatusColor(insp.status)}`}
                      >
                        {insp.status}
                      </span>
                      <span className="text-xs text-charcoal-400">
                        {formatRelativeDate(insp.scheduledDate)}
                      </span>
                    </div>
                  </div>
                  {insp.summary && (
                    <p className="text-charcoal-500 text-xs mt-2 line-clamp-1">
                      {insp.summary}
                    </p>
                  )}
                </div>

                <svg
                  className="w-4 h-4 text-charcoal-300 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
