"use client";

import { Armchair, ClipboardList, Users } from "lucide-react";
import { freeSeats, type TableOccupancy } from "@/hooks/usePublicTable";

// Occupation de la table scannée : couverts déjà installés, commandes en
// cours (plusieurs convives peuvent commander séparément) et places libres
// restantes une fois les personnes de cette commande comptées.
export function TableStatusCard({ table, guests }: { table: TableOccupancy; guests: number }) {
  const free = freeSeats(table);
  const after = free - guests;
  const tone = after < 0 ? "border-destructive/50 bg-destructive/5" : "border-primary/30 bg-primary/5";

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold">Table {String(table.number).padStart(2, "0")}</p>
        <span className="font-mono text-sm text-muted-foreground">{table.capacity} places</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-card p-2">
          <Users className="mx-auto size-4 text-primary" />
          <p className="font-mono text-lg font-bold">{table.seatedGuests}</p>
          <p className="text-xs text-muted-foreground">installé(s)</p>
        </div>
        <div className="rounded-xl bg-card p-2">
          <ClipboardList className="mx-auto size-4 text-accent" />
          <p className="font-mono text-lg font-bold">{table.openOrders}</p>
          <p className="text-xs text-muted-foreground">commande(s) en cours</p>
        </div>
        <div className="rounded-xl bg-card p-2">
          <Armchair className="mx-auto size-4 text-success" />
          <p className={`font-mono text-lg font-bold ${after < 0 ? "text-destructive" : ""}`}>{Math.max(0, after)}</p>
          <p className="text-xs text-muted-foreground">libre(s) après vous</p>
        </div>
      </div>
      {after < 0 && (
        <p className="mt-3 text-sm font-medium text-destructive">
          Plus assez de places à cette table ({free} libre{free > 1 ? "s" : ""}). Demandez une autre table au
          personnel.
        </p>
      )}
    </div>
  );
}
