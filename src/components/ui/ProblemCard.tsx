// src/components/ui/ProblemCard.tsx
//
// Reusable card for surfacing a specific problem, risk, or pain point.
// Accepts any ReactNode icon, supports two visual variants, optional stat,
// and an optional href for linking to a service or detail page.
//
// Usage:
//   <ProblemCard
//     icon={<MyIcon />}
//     title="Construction Fraud"
//     description="Contractors report progress that hasn't happened."
//     stat="60%"
//     statLabel="of projects affected"
//     variant="default"
//   />

import Link from "next/link";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProblemCardVariant = "default" | "dark";

export interface ProblemCardProps {
  /** Any ReactNode — ideally a 20×20 SVG */
  icon: ReactNode;
  title: string;
  description: string;
  /** Optional stat figure shown prominently (e.g. "40%") */
  stat?: string;
  /** Label that accompanies the stat (e.g. "above market rate") */
  statLabel?: string;
  /** Wraps card in a Next.js Link when provided */
  href?: string;
  variant?: ProblemCardVariant;
  className?: string;
}

// ─── Icon well ────────────────────────────────────────────────────────────────

function IconWell({
  children,
  variant,
}: {
  children: ReactNode;
  variant: ProblemCardVariant;
}) {
  const styles: Record<ProblemCardVariant, string> = {
    default: "bg-charcoal-950 text-orange-400",
    dark: "bg-white/10 text-orange-400 ring-1 ring-white/10",
  };
  return (
    <div
      className={`
        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
        transition-transform duration-300 ease-out group-hover:-translate-y-0.5
        ${styles[variant]}
      `}
    >
      {children}
    </div>
  );
}

// ─── Stat badge ───────────────────────────────────────────────────────────────

function StatBadge({
  stat,
  statLabel,
  variant,
}: {
  stat: string;
  statLabel?: string;
  variant: ProblemCardVariant;
}) {
  const labelColor =
    variant === "dark" ? "text-charcoal-400" : "text-charcoal-400";

  return (
    <div className="mt-auto pt-4 border-t border-charcoal-100/50 flex items-baseline gap-2">
      <span className="font-display text-2xl font-bold text-orange-500 leading-none">
        {stat}
      </span>
      {statLabel && (
        <span className={`text-xs font-medium leading-tight ${labelColor}`}>
          {statLabel}
        </span>
      )}
    </div>
  );
}

// ─── Card inner ───────────────────────────────────────────────────────────────

function CardInner({
  icon,
  title,
  description,
  stat,
  statLabel,
  variant,
}: Required<
  Pick<ProblemCardProps, "icon" | "title" | "description" | "variant">
> &
  Pick<ProblemCardProps, "stat" | "statLabel">) {
  const titleColor: Record<ProblemCardVariant, string> = {
    default: "text-charcoal-950 group-hover:text-orange-600",
    dark: "text-white",
  };
  const descColor: Record<ProblemCardVariant, string> = {
    default: "text-charcoal-500",
    dark: "text-charcoal-400",
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <IconWell variant={variant}>{icon}</IconWell>

      <h3
        className={`
          font-display text-sm font-semibold leading-snug
          transition-colors duration-200
          ${titleColor[variant]}
        `}
      >
        {title}
      </h3>

      <p className={`text-xs leading-relaxed flex-1 ${descColor[variant]}`}>
        {description}
      </p>

      {stat && (
        <StatBadge stat={stat} statLabel={statLabel} variant={variant} />
      )}
    </div>
  );
}

// ─── Root card styles ─────────────────────────────────────────────────────────

const rootBase =
  "group relative p-5 rounded-2xl transition-all duration-300 ease-out flex flex-col";

const rootVariant: Record<ProblemCardVariant, string> = {
  default: [
    "bg-white border border-charcoal-100",
    "hover:border-orange-200",
    "hover:shadow-lg hover:shadow-orange-500/5",
    "hover:-translate-y-0.5",
  ].join(" "),
  dark: [
    "bg-charcoal-900 border border-charcoal-800",
    "hover:border-orange-500/30",
    "hover:shadow-lg hover:shadow-black/30",
    "hover:-translate-y-0.5",
  ].join(" "),
};

// ─── Exported HOC ─────────────────────────────────────────────────────────────

export default function ProblemCard({
  icon,
  title,
  description,
  stat,
  statLabel,
  href,
  variant = "default",
  className = "",
}: ProblemCardProps) {
  const cls = `${rootBase} ${rootVariant[variant]} ${className}`;

  const inner = (
    <CardInner
      icon={icon}
      title={title}
      description={description}
      stat={stat}
      statLabel={statLabel}
      variant={variant}
    />
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return <div className={cls}>{inner}</div>;
}
