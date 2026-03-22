
import { prisma }   from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link         from "next/link";
import type { Metadata } from "next";

interface Props { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { code } = await params;
    const project = await prisma.project.findFirst({
        where:  { id: { startsWith: code.length >= 10 ? code : "" } },
        select: { name: true },
    });
    return {
        title:       project ? `${project.name} · GRUTH Verified` : "Verification · GRUTH",
        description: "Independent on-the-ground verification by GRUTH.",
    };
}

export default async function VerificationBadgePage({ params }: Props) {
    const { code } = await params;

    // Support both full ID and first-12-chars short code
    const project = await prisma.project.findFirst({
        where: { id: { startsWith: code } },
        include: {
            inspections: {
                where:   { status: "COMPLETED" },
                orderBy: { completedDate: "desc" },
                take: 1,
                include: { media: { where: { type: "PHOTO" }, take: 4, orderBy: { sortOrder: "asc" } } },
            },
            client:   { select: { name: true, country: true } },
            inspector: { select: { name: true } },
        },
    });

    if (!project) notFound();

    const latest     = project.inspections[0];
    const photoCount = project.inspections.reduce((s, i) => s + i.media.length, 0);
    const firstPhotos = latest?.media ?? [];

    const statusLabel: Record<string, string> = {
        COMPLETED: "Verified",
        ACTIVE:    "In Progress",
        PENDING:   "Pending Inspection",
    };

    const completedDate = latest?.completedDate
        ? new Date(latest.completedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        : null;

    return (
        <div className="min-h-screen bg-charcoal-950 pt-16">
            {/* Grid bg */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
                 style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }}
            />

            <div className="relative max-w-2xl mx-auto px-4 py-12 sm:py-20">

                {/* Badge header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/logo-w.svg" alt="GRUTH" className="h-7" />
                    </Link>

                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Independently Verified
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                        {project.name}
                    </h1>
                    <p className="text-charcoal-400 text-sm">
                        {project.location}{project.county ? ` · ${project.county}` : ""}
                    </p>
                </div>

                {/* Main card */}
                <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden mb-6">

                    {/* Photo strip */}
                    {firstPhotos.length > 0 && (
                        <div className="grid grid-cols-4 gap-px">
                            {firstPhotos.map((photo, i) => (
                                <div key={photo.id} className={`relative bg-charcoal-800 overflow-hidden ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photo.url} alt={photo.caption ?? photo.filename}
                                         className="w-full h-full object-cover" />
                                    {i === 0 && photoCount > 4 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                                            <span className="text-white text-xs font-semibold">+{photoCount - 4} more photos</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {firstPhotos.length === 0 && (
                                <div className="col-span-4 aspect-[4/1] bg-charcoal-800 flex items-center justify-center">
                                    <span className="text-charcoal-600 text-sm">No photos in this verification</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details */}
                    <div className="p-6 sm:p-8 space-y-5">

                        {/* Status + date row */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
              <span className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${
                  project.status === "COMPLETED"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-orange-500/10 border-orange-500/30 text-orange-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${project.status === "COMPLETED" ? "bg-emerald-500" : "bg-orange-500"}`} />
                  {statusLabel[project.status] ?? project.status}
              </span>
                            {completedDate && (
                                <span className="text-charcoal-400 text-xs">Verified on {completedDate}</span>
                            )}
                        </div>

                        {/* Summary */}
                        {latest?.summary && (
                            <div>
                                <p className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-2">Inspector Summary</p>
                                <p className="text-charcoal-200 text-sm leading-relaxed">{latest.summary}</p>
                            </div>
                        )}

                        {/* Rating */}
                        {latest?.overallRating && (
                            <div>
                                <p className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-2">Overall Rating</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(n => (
                                            <svg key={n} className={`w-4 h-4 ${n <= latest.overallRating! ? "text-orange-400" : "text-charcoal-700"}`}
                                                 viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                        ))}
                                    </div>
                                    {latest.workQuality && (
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            latest.workQuality === "EXCELLENT" ? "bg-emerald-500/10 text-emerald-400"
                                                : latest.workQuality === "GOOD"    ? "bg-blue-500/10 text-blue-400"
                                                    : latest.workQuality === "FAIR"    ? "bg-amber-500/10 text-amber-400"
                                                        : "bg-red-500/10 text-red-400"
                                        }`}>
                      {latest.workQuality}
                    </span>
                                    )}
                                    {latest.safetyCompliance !== null && (
                                        <span className={`text-xs ${latest.safetyCompliance ? "text-emerald-400" : "text-red-400"}`}>
                      {latest.safetyCompliance ? "✓ Safety compliant" : "⚠ Safety concerns noted"}
                    </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Inspector + GPS row */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
                            {project.inspector && (
                                <div>
                                    <p className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-1.5">Inspector</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-bold">
                        {project.inspector.name?.charAt(0) ?? "I"}
                      </span>
                                        </div>
                                        <span className="text-charcoal-300 text-xs font-medium">{project.inspector.name}</span>
                                    </div>
                                </div>
                            )}
                            {project.latitude && project.longitude && (
                                <div>
                                    <p className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-1.5">GPS Location</p>
                                    <a href={`https://www.openstreetmap.org/?mlat=${project.latitude}&mlon=${project.longitude}&zoom=16`}
                                       target="_blank" rel="noreferrer"
                                       className="text-orange-400 hover:text-orange-300 text-xs font-mono transition-colors">
                                        {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trust footer */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-6 text-xs text-charcoal-500">
                        {[
                            "GPS-tagged evidence",
                            "Timestamped report",
                            "Independent inspector",
                        ].map(t => (
                            <div key={t} className="flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M20 6L9 17l-5-5"/>
                                </svg>
                                {t}
                            </div>
                        ))}
                    </div>

                    {/* Share CTA */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <p className="text-charcoal-300 text-sm mb-3">
                            Need your own independent verification?
                        </p>
                        <Link href="/request-verification"
                              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/25">
                            Get a Verification — from $80
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>

                    <p className="text-charcoal-600 text-xs">
                        This page is publicly accessible.{" "}
                        <Link href="/" className="text-charcoal-500 hover:text-charcoal-300 transition-colors">gruth.ke</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}