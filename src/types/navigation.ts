// src/types/navigation.ts
// Shared navigation types used across dashboard, inspector, and admin portals.

import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
  badge?: number;
}

export type PortalAccent = "orange" | "emerald" | "violet";
