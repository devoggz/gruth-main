// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    PENDING: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    ON_HOLD: "bg-orange-100 text-orange-800",
    CANCELLED: "bg-red-100 text-red-800",
    OVERPRICED: "bg-red-100 text-red-700",
    FAIR: "bg-emerald-100 text-emerald-700",
    GOOD_DEAL: "bg-blue-100 text-blue-700",
    UNVERIFIED: "bg-gray-100 text-gray-600",
    VERIFIED: "bg-emerald-100 text-emerald-700",
    FLAGGED: "bg-red-100 text-red-700",
    WARNING: "bg-amber-100 text-amber-800",
    CRITICAL: "bg-red-100 text-red-800",
    INFO: "bg-blue-100 text-blue-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export function getBudgetRisk(
  estimated: number,
  spent: number,
): {
  level: "low" | "medium" | "high";
  percentage: number;
  label: string;
} {
  const percentage = (spent / estimated) * 100;
  if (percentage < 60) return { level: "low", percentage, label: "On Track" };
  if (percentage < 85) return { level: "medium", percentage, label: "Monitor" };
  return { level: "high", percentage, label: "At Risk" };
}

export function getProjectTypeLabel(type: string): string {
  const map: Record<string, string> = {
    CONSTRUCTION: "Construction",
    LAND_PROPERTY: "Land & Property",
    WEDDING_EVENT: "Wedding / Event",
    FUNERAL_EVENT: "Funeral / Event",
    BUSINESS_INVESTMENT: "Business Investment",
    MATERIAL_PRICING: "Material Pricing",
  };
  return map[type] ?? type;
}
