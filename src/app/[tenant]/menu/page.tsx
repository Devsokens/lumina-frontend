"use client";

import { MenuGrid } from "@/components/vitrine/menu-grid";
import { useTenant } from "@/hooks/useTenant";

export default function TenantMenuPage() {
  const tenant = useTenant();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-semibold">Menu</h1>
      <MenuGrid tenantSlug={tenant.slug} />
    </main>
  );
}
