// src/app/dashboard/notifications/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/utils";
import { MarkAlertsRead } from "@/components/dashboard/MarkAlertsRead";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id!;

  const alerts = await prisma.alert.findMany({
    where: { project: { clientId: userId } },
    include: { project: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const unread = alerts.filter((a) => !a.isRead).length;

  const grouped = {
    CRITICAL: alerts.filter((a) => a.severity === "CRITICAL"),
    WARNING: alerts.filter((a) => a.severity === "WARNING"),
    INFO: alerts.filter((a) => a.severity === "INFO"),
  };

  return (
    <div className="space-y-8 pb-12 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-950 tracking-tight">
            Notifications
          </h1>
          <p className="text-charcoal-500 text-sm mt-1">
            {unread > 0 ? `${unread} unread` : "You're all caught up"} ·{" "}
            {alerts.length} total
          </p>
        </div>
        {unread > 0 && <MarkAlertsRead />}
      </div>

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-charcoal-900 mb-2">
            No notifications yet
          </h3>
          <p className="text-charcoal-500 text-sm">
            Alerts about your projects will appear here.
          </p>
        </div>
      )}

      {/* Critical */}
      {grouped.CRITICAL.length > 0 && (
        <AlertGroup
          title="Critical"
          count={grouped.CRITICAL.filter((a) => !a.isRead).length}
          alerts={grouped.CRITICAL}
          dotColor="bg-red-500"
          borderColor="border-red-200"
          bgColor="bg-red-50"
          iconColor="text-red-600"
        />
      )}

      {/* Warning */}
      {grouped.WARNING.length > 0 && (
        <AlertGroup
          title="Warnings"
          count={grouped.WARNING.filter((a) => !a.isRead).length}
          alerts={grouped.WARNING}
          dotColor="bg-amber-500"
          borderColor="border-amber-200"
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      )}

      {/* Info */}
      {grouped.INFO.length > 0 && (
        <AlertGroup
          title="Updates"
          count={grouped.INFO.filter((a) => !a.isRead).length}
          alerts={grouped.INFO}
          dotColor="bg-blue-500"
          borderColor="border-blue-200"
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
      )}
    </div>
  );
}

// ─── Alert group ──────────────────────────────────────────────────────────────
function AlertGroup({
  title,
  count,
  alerts,
  dotColor,
  borderColor,
  bgColor,
  iconColor,
}: {
  title: string;
  count: number;
  alerts: any[];
  dotColor: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h2 className="font-display font-semibold text-charcoal-950 text-sm">
          {title}
        </h2>
        {count > 0 && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${bgColor} ${iconColor}`}
          >
            {count} new
          </span>
        )}
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl border p-4 flex gap-3 transition-opacity ${
              alert.isRead ? "opacity-60" : ""
            } ${borderColor} ${bgColor}`}
          >
            {/* Severity icon */}
            <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
              {alert.severity === "CRITICAL" ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : alert.severity === "WARNING" ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {alert.project.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-charcoal-400">
                    {formatRelativeDate(alert.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-charcoal-600 text-sm mt-2 leading-relaxed">
                {alert.message}
              </p>
              {alert.actionUrl && (
                <a
                  href={alert.actionUrl}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold mt-3 ${iconColor} hover:underline`}
                >
                  View details →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
