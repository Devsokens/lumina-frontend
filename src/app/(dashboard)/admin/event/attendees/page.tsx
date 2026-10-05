"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AttendeesTable } from "@/components/events/attendees-table";
import { useAdminEvents, useEventTickets } from "@/hooks/useEvents";
import { toAttendees } from "@/lib/events";
import { API_URL } from "@/lib/constants";
import type { Attendee } from "@/types/api";

export default function EventAttendeesPage() {
  const { data: events } = useAdminEvents();

  const [pickedEventId, setEventId] = useState<string | null>(null);
  // Événement le plus récent sélectionné par défaut.
  const latestEventId = useMemo(
    () =>
      [...(events ?? [])].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0]?.id ?? null,
    [events]
  );
  const eventId = pickedEventId ?? latestEventId;

  const { data: tickets, isLoading } = useEventTickets(eventId);
  const attendees = useMemo(() => toAttendees(tickets ?? []), [tickets]);
  const qrCodeById = useMemo(
    () => new Map((tickets ?? []).map((t) => [t.id, t.qrCode])),
    [tickets]
  );

  function openTicket(attendee: Attendee) {
    const code = qrCodeById.get(attendee.id);
    if (!code) return;
    window.open(`${API_URL}/tickets/${encodeURIComponent(code)}/pdf`, "_blank", "noopener");
    toast.info("Billet PDF ouvert : l'envoi automatique par WhatsApp n'est pas encore disponible.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Participants & Émargement
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Billets payés, statuts de scan aux entrées (mise à jour toutes les 15 s).
          </p>
        </div>
        <select
          aria-label="Événement"
          value={eventId ?? ""}
          onChange={(e) => setEventId(e.target.value || null)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
        >
          {(events ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <AttendeesTable attendees={attendees} onOpenTicket={openTicket} />
      )}
    </div>
  );
}
