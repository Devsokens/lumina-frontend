"use client";

import { useEffect } from "react";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";

export function OrganizationThemeProvider({ children }: { children: React.ReactNode }) {
  useOrganizationSettings(); // Ensures theme variables are injected upon hydration and kept in sync

  return <>{children}</>;
}
