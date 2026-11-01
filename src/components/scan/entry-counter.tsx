"use client";

import { Users } from "lucide-react";
import { useEventTickets } from "@/hooks/useEvents";

// Compteur d'entrées de l'événement contrôlé : billets scannés / billets
// émis. Source : GET /admin/events/:id/tickets (ouvert au rôle Scanner),
// rafraîchi toutes les 15 s et après chaque scan accepté (pas de canal push
// côté serveur pour la billetterie).
export function EntryCounter({ eventId, enabled }: { eventId: string | null; enabled: boolean }) {
  const { data } = useEventTickets(enabled ? eventId : null);
  if (!eventId || !data) return null;

  const issued = data.filter((t) => t.status === "VALID" || t.status === "USED").length;
  const entered = data.filter((t) => t.status === "USED").length;
  const pct = issued > 0 ? Math.round((entered / issued) * 100) : 0;

  return (
    <div className="rounded-xl bg-black/70 px-3 py-2 text-white backdrop-blur" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm">
          <Users className="size-4" /> Entrées
        </span>
        <span className="font-mono text-lg font-bold">
          {entered} <span className="text-sm text-white/70">/ {issued}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
