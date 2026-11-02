"use client";

import { useTenant } from "@/hooks/useTenant";
import { LiveShowcase } from "@/components/vitrine/live-showcase";
import { SiteHome } from "@/components/site/site-home";
import { StaysHome } from "@/components/stays/stays-home";

export default function TenantHomePage() {
  const tenant = useTenant();

  if (tenant.sector === "EVENT") {
    return (
      <main className="min-h-screen bg-[#090b0e]">
        <LiveShowcase />
      </main>
    );
  }

  if (tenant.sector === "ACCOMMODATION") return <StaysHome />;

  return <SiteHome />;
}
