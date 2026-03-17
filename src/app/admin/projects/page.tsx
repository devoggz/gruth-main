// src/app/admin/projects/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  formatCurrency,
  formatRelativeDate,
  getStatusColor,
  getProjectTypeLabel,
} from "@/lib/utils";

export default async function AdminProjectsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { name: true, email: true } },
      inspections: { orderBy: { scheduledDate: "desc" }, take: 1 },
      alerts: { where: { isRead: false } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold text-charcoal-950 tracking-tight">
            All Projects
          </h1>
          <p className="text-charcoal-400 text-sm mt-1">
            {projects.length} total projects
          </p>
        </div>
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
          New Project
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        {projects.length === 0 ? (
          <div className="py-24 text-center text-sm text-charcoal-300">
            No projects yet.
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
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-orange-50/15 group transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-charcoal-900 text-sm truncate max-w-[180px]">
                        {project.name}
                      </div>
                      <div className="text-xs text-charcoal-400 mt-0.5">
                        {project.location}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-charcoal-950 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">
                            {project.client.name?.charAt(0).toUpperCase() ??
                              "?"}
                          </span>
                        </div>
                        <div>
                          <div className="text-charcoal-700 font-medium text-xs">
                            {project.client.name}
                          </div>
                          <div className="text-charcoal-400 text-xs">
                            {project.client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-charcoal-500 text-xs">
                      {getProjectTypeLabel(project.type)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`status-badge text-[10px] ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-charcoal-400 text-xs">
                      {project.inspections[0] ? (
                        formatRelativeDate(project.inspections[0].scheduledDate)
                      ) : (
                        <span className="text-charcoal-200">None</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-charcoal-600 text-xs">
                        {project.estimatedBudget ? (
                          formatCurrency(project.estimatedBudget)
                        ) : (
                          <span className="text-charcoal-200">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {project.alerts.length > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                          {project.alerts.length}
                        </span>
                      ) : (
                        <span className="text-charcoal-200 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
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
    </div>
  );
}
