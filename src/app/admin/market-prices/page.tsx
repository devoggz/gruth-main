// src/app/admin/market-prices/page.tsx
// Admin page to review and approve/reject supplier price submissions.
// Only accessible to users with ADMIN role.

import { auth }    from "@/lib/auth";
import { prisma }  from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatRelativeDate } from "@/lib/utils";
import AdminPriceActions from "./AdminPriceActions";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Price Submissions | GRUTH Admin" };

export default async function AdminMarketPricesPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  // Pending submissions — unverified supplier-submitted prices
  const pending = await prisma.countyMaterialPrice.findMany({
    where:   { verified: false, dataSource: "supplier" },
    include: { material: true, county: true, source: true },
    orderBy: { createdAt: "desc" },
  });

  // Scraper runs summary — last 10 verified scraper entries per county
  const scraperStats = await prisma.countyMaterialPrice.groupBy({
    by:        ["dataSource"],
    _count:    { id: true },
    _max:      { updatedAt: true },
    where:     { verified: true },
    orderBy:   { _count: { id: "desc" } },
  });

  const totalVerified = await prisma.countyMaterialPrice.count({
    where: { verified: true },
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="font-display text-[26px] font-bold text-charcoal-950 tracking-tight">
          Market Price Management
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">
          Review supplier submissions and monitor scraper health.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Verified Prices",     value: totalVerified,       color: "text-emerald-600" },
          { label: "Pending Review",       value: pending.length,      color: pending.length > 0 ? "text-amber-600" : "text-charcoal-400" },
          { label: "Scraper Records",      value: scraperStats.find(s => s.dataSource === "scraper")?._count.id ?? 0, color: "text-blue-600" },
          { label: "Supplier Submissions", value: scraperStats.find(s => s.dataSource === "supplier")?._count.id ?? 0, color: "text-violet-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-charcoal-100 rounded-2xl p-4">
            <p className={`font-display font-bold text-2xl ${color}`}>{value.toLocaleString()}</p>
            <p className="text-charcoal-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Scraper health */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
        <h2 className="font-display font-semibold text-charcoal-900 mb-4">Scraper Status</h2>
        <div className="space-y-2">
          {scraperStats.map(s => (
            <div key={s.dataSource} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.dataSource === "scraper" ? "bg-emerald-400" : "bg-blue-400"}`} />
                <span className="font-medium text-charcoal-700 capitalize">{s.dataSource}</span>
              </div>
              <div className="flex items-center gap-6 text-charcoal-500">
                <span>{s._count.id.toLocaleString()} records</span>
                <span>Last update: {s._max.updatedAt ? formatRelativeDate(s._max.updatedAt) : "never"}</span>
              </div>
            </div>
          ))}
          {scraperStats.length === 0 && (
            <p className="text-charcoal-400 text-sm">No scraper data yet. Run POST /api/scrape to populate.</p>
          )}
        </div>

        {/* Manual trigger */}
        <div className="mt-5 pt-4 border-t border-charcoal-100">
          <p className="text-xs text-charcoal-400 mb-2">
            Scrapers run automatically every Monday at 6am UTC. To trigger manually:
          </p>
          <code className="text-xs bg-charcoal-50 border border-charcoal-100 rounded-lg px-3 py-2 block font-mono text-charcoal-700 overflow-x-auto">
            curl -X POST {process.env.NEXT_PUBLIC_APP_URL}/api/scrape -H "Authorization: Bearer $CRON_SECRET"
          </code>
        </div>
      </div>

      {/* Pending submissions */}
      <div className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-charcoal-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-charcoal-900">
            Pending Supplier Submissions
          </h2>
          {pending.length > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {pending.length} awaiting review
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-10 h-10 text-charcoal-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <p className="text-charcoal-500 text-sm font-medium">No pending submissions</p>
            <p className="text-charcoal-400 text-xs mt-1">Supplier price submissions will appear here for review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  {["Material", "Category", "County", "Price (KES)", "Supplier", "Submitted", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-widest text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {pending.map(p => (
                  <tr key={p.id} className="hover:bg-charcoal-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-charcoal-900">{p.material.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-charcoal-100 text-charcoal-600 px-2 py-0.5 rounded-full font-medium">
                        {p.material.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{p.county.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-display font-bold text-charcoal-950">
                        {p.priceKes.toLocaleString()}
                      </span>
                      {p.priceLow != null && p.priceHigh != null && (
                        <span className="block text-[10px] text-charcoal-300">
                          {p.priceLow.toLocaleString()} – {p.priceHigh.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-charcoal-500 text-xs">
                      {p.source?.name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-charcoal-400 text-xs whitespace-nowrap">
                      {formatRelativeDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {/* Client component handles approve/reject actions */}
                      <AdminPriceActions priceId={p.id} notes={p.notes} />
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
