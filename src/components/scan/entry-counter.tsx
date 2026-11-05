"use client";

import { Users } from "lucide-react";
import { useEventTickets } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";

// Compteur d'entrées de l'événement contrôlé : billets scannés / billets
// émis. Source : GET /admin/events/:id/tickets (ouvert au rôle Scanner),
// rafraîchi toutes les 15 s et après chaque scan accepté (pas de canal push
// côté serveur pour la billetterie).
// "overlay" : sur l'image de la caméra (mobile) ; "card" : panneau latéral
// de la console (ordinateur).
export function EntryCounter({
  eventId,
  enabled,
  variant = "overlay",
}: {
  eventId: string | null;
  enabled: boolean;
  variant?: "overlay" | "card";
}) {
  const { data } = useEventTickets(enabled ? eventId : null);
  if (!eventId || !data) return null;

  const issued = data.filter((t) => t.status === "VALID" || t.status === "USED").length;
  const entered = data.filter((t) => t.status === "USED").length;
  const pct = issued > 0 ? Math.round((entered / issued) * 100) : 0;
  const card = variant === "card";

  return (
    <div
      className={cn(
        card
          ? "rounded-2xl border border-border bg-card p-4 shadow-xs"
          : "rounded-xl bg-black/70 px-3 py-2 text-white backdrop-blur"
      )}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn("flex items-center gap-2 text-sm", card && "font-medium text-muted-foreground")}>
          <Users className="size-4" /> Entrées
        </span>
        <span className={cn("font-mono font-bold", card ? "text-2xl" : "text-lg")}>
          {entered}{" "}
          <span className={cn("text-sm", card ? "text-muted-foreground" : "text-white/70")}>/ {issued}</span>
        </span>
      </div>
      <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", card ? "bg-muted" : "bg-white/20")}>
        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
      </div>
      {card && <p className="mt-2 text-xs text-muted-foreground">{pct} % des billets émis sont entrés</p>}
    </div>
  );
}
