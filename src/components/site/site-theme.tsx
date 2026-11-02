"use client";

import type { CSSProperties } from "react";
import { useTenant } from "@/hooks/useTenant";
import { siteOf, siteThemeStyle, type SiteConfig } from "@/lib/site";

// Police de titre du site : variables chargées par app/[tenant]/layout.tsx.
const DISPLAY_FONT: Record<SiteConfig["font"], string> = {
  classique: "var(--font-site-serif)",
  moderne: "var(--font-site-sans)",
  audacieux: "var(--font-site-bold)",
};

export function siteStyle(site: Pick<SiteConfig, "palette" | "mode" | "font">): CSSProperties {
  return { ...siteThemeStyle(site), "--font-display": DISPLAY_FONT[site.font] } as CSSProperties;
}

// Applique l'apparence choisie dans le back-office (couleurs, mode, police)
// à tout le site public d'un restaurant / d'une boutique.
export function SiteTheme({ children }: { children: React.ReactNode }) {
  const tenant = useTenant();
  if (tenant.sector === "EVENT") return <>{children}</>;
  return (
    <div style={siteStyle(siteOf(tenant))} className="flex min-h-dvh flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
