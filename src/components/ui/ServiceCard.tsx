// src/components/ui/ServiceCard.tsx
//
// Reusable higher-order card component for service offerings.
// Accepts any ReactNode icon, supports three visual variants,
// optional badge, optional href, and full className escape hatch.
//
// Usage:
//   <ServiceCard
//     icon={<MyIcon />}
//     title="Construction Verification"
//     description="We visit your site..."
//     href="/services#construction"
//     variant="default"
//     badge="Popular"
//   />

import Link from "next/link";
import type { ReactNode } from "react";

// ─── Public types (export so consumers can type-check their data arrays) ───────

export type ServiceCardVariant = "default" | "dark" | "outlined";

export interface ServiceCardProps {
  /** Any ReactNode — ideally a 20×20 SVG icon */
  icon: ReactNode;
  title: string;
  description: string;
  /** Wraps the card in a Next.js Link when provided */
  href?: string;
  /** 'default' = white card | 'dark' = charcoal card | 'outlined' = bordered */
  variant?: ServiceCardVariant;
  /** Small pill badge rendered top-right of the icon well row */
  badge?: string;
  /** Forwarded to the card root for one-off overrides */
  className?: string;
}

// ─── Internal sub-components ──────────────────────────────────────────────────

function IconWell({
  children,
  variant,
}: {
  children: ReactNode;
  variant: ServiceCardVariant;
}) {
  const base =
    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 " +
    "transition-transform duration-300 ease-out group-hover:-translate-y-0.5";

  const variantStyles: Record<ServiceCardVariant, string> = {
    default: "bg-charcoal-950 text-white shadow-sm",
    dark: "bg-white/10 text-white ring-1 ring-white/10",
    outlined: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
  };

  return <div className={`${base} ${variantStyles[variant]}`}>{children}</div>;
}

function Badge({
  text,
  variant,
}: {
  text: string;
  variant: ServiceCardVariant;
}) {
  const variantStyles: Record<ServiceCardVariant, string> = {
    default: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
    dark: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/20",
    outlined: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-[10px] font-bold tracking-widest uppercase
        ${variantStyles[variant]}
      `}
    >
      {text}
    </span>
  );
}

// Tiny animated arrow that slides in on hover
function LearnMoreArrow({ variant }: { variant: ServiceCardVariant }) {
  const color = variant === "dark" ? "text-orange-400" : "text-orange-600";

  return (
    <div
      className={`
        mt-5 flex items-center gap-1.5
        opacity-0 translate-y-1
        group-hover:opacity-100 group-hover:translate-y-0
        transition-all duration-200 ease-out
        ${color}
      `}
    >
      <span className="text-xs font-semibold">Learn more</span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}

// ─── Card content (layout shared between linked and static cards) ─────────────

function CardInner({
  icon,
  title,
  description,
  badge,
  variant,
}: Required<
  Pick<ServiceCardProps, "icon" | "title" | "description" | "variant">
> &
  Pick<ServiceCardProps, "badge">) {
  const titleColor: Record<ServiceCardVariant, string> = {
    default: "text-charcoal-950 group-hover:text-orange-600",
    dark: "text-white",
    outlined: "text-charcoal-950 group-hover:text-orange-600",
  };
  const descColor: Record<ServiceCardVariant, string> = {
    default: "text-charcoal-500",
    dark: "text-charcoal-300",
    outlined: "text-charcoal-500",
  };

  return (
    <>
      {/* Icon row */}
      <div className="flex items-center justify-between mb-5">
        <IconWell variant={variant}>{icon}</IconWell>
        {badge && <Badge text={badge} variant={variant} />}
      </div>

      {/* Text */}
      <h3
        className={`
          font-display text-[15px] font-semibold leading-snug mb-2.5
          transition-colors duration-200
          ${titleColor[variant]}
        `}
      >
        {title}
      </h3>

      <p className={`text-sm leading-relaxed ${descColor[variant]}`}>
        {description}
      </p>

      {/* Hover CTA */}
      <LearnMoreArrow variant={variant} />
    </>
  );
}

// ─── Root card styles ─────────────────────────────────────────────────────────

const rootBase =
  "group relative p-6 rounded-2xl transition-all duration-300 ease-out";

const rootVariant: Record<ServiceCardVariant, string> = {
  default: [
    "bg-white",
    "border border-charcoal-100",
    "hover:border-orange-200",
    "hover:shadow-xl hover:shadow-orange-500/5",
    "hover:-translate-y-0.5",
  ].join(" "),

  dark: [
    "bg-charcoal-900",
    "border border-charcoal-800",
    "hover:border-orange-500/30",
    "hover:shadow-xl hover:shadow-orange-500/10",
    "hover:-translate-y-0.5",
  ].join(" "),

  outlined: [
    "bg-white",
    "border-2 border-charcoal-100",
    "hover:border-orange-400",
    "hover:shadow-xl hover:shadow-orange-500/5",
    "hover:-translate-y-0.5",
  ].join(" "),
};

// ─── Exported component ───────────────────────────────────────────────────────

export default function ServiceCard({
  icon,
  title,
  description,
  href,
  variant = "default",
  badge,
  className = "",
}: ServiceCardProps) {
  const cls = `${rootBase} ${rootVariant[variant]} ${className}`;
  const inner = (
    <CardInner
      icon={icon}
      title={title}
      description={description}
      badge={badge}
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
