"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/useTenant";

export default function TenantHomePage() {
  const tenant = useTenant();
  const config = tenant.config as { description?: string };

  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{tenant.name}</h1>
        {config.description && (
          <p className="max-w-xl text-muted-foreground">{config.description}</p>
        )}
        <Button asChild size="lg">
          <Link href={`/${tenant.slug}/menu`}>Voir le menu</Link>
        </Button>
      </section>
    </main>
  );
}
