"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

// Panne backend lors du chargement de la vitrine (voir lib/tenant.ts) :
// message clair + nouvel essai, jamais de fausse vitrine.
export default function TenantError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <ServerCrash className="size-7" />
      </div>
      <h1 className="font-display text-xl font-bold">Boutique momentanément indisponible</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Le service ne répond pas pour le moment. Réessayez dans quelques instants.
      </p>
      <Button onClick={reset} className="gap-2 rounded-xl">
        <RefreshCw className="size-4" />
        Réessayer
      </Button>
    </main>
  );
}
