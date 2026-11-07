"use client";

import { useTenant } from "@/hooks/useTenant";
import { PublicEventSiteHome } from "@/components/event-site/event-site";
import { SiteHome } from "@/components/site/site-home";
import { StaysHome } from "@/components/stays/stays-home";

export default function TenantHomePage() {
  const tenant = useTenant();

  // Événementiel : site vitrine Nuit ou Lumière (refonte 2026-11).
  if (tenant.sector === "EVENT") return <PublicEventSiteHome />;

  if (tenant.sector === "ACCOMMODATION") return <StaysHome />;

  return <SiteHome />;
}
