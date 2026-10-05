"use client";

import { CustomersList } from "@/components/dashboard/customers-list";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">Fiches créées automatiquement à chaque commande.</p>
      </div>
      <CustomersList />
    </div>
  );
}
