"use client";

import { TicketsManager } from "@/components/events/tickets-manager";

export default function EventTicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Billetterie & Catégories de Tarifs
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gérez vos types de billets (Standard, VIP, Tables), vos quotas et vos prix en FCFA.
        </p>
      </div>

      <TicketsManager />
    </div>
  );
}
