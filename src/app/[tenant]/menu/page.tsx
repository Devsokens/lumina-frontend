"use client";

import { MenuGrid } from "@/components/vitrine/menu-grid";
import { SiteFooter } from "@/components/site/site-home";
import { useTenant } from "@/hooks/useTenant";
import { siteOf } from "@/lib/site";

export default function TenantMenuPage() {
  const tenant = useTenant();
  const site = siteOf(tenant);
  const isShop = tenant.sector === "SHOP";

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-12">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {site.eyebrow || tenant.name}
          </p>
          <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
            {isShop ? "Catalogue" : "La carte"}
          </h1>
        </header>
        <MenuGrid tenantSlug={tenant.slug} />
      </main>
      <SiteFooter />
    </>
  );
}
