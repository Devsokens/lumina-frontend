"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useSetEventReminder } from "@/hooks/useEvents";
import { apiErrorMessage } from "@/lib/events";
import type { ApiEvent } from "@/types/events";

// Le serveur envoie le rappel 24 h avant le début (EventRemindersService).
const LEAD_MS = 24 * 60 * 60 * 1000;

const whenLabel = (ms: number) =>
  new Date(ms).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Libreville",
  });

// Entrée du menu « … » d'un événement : active ou coupe le rappel e-mail
// aux participants. Masquée pour un événement commencé, terminé ou annulé.
export function ReminderMenuItem({ event: e }: { event: ApiEvent }) {
  const setReminder = useSetEventReminder();
  const [now] = useState(() => Date.now());
  const start = new Date(e.startDate).getTime();
  if (e.status === "CANCELLED" || e.status === "COMPLETED" || start <= now) return null;
  if (e.reminderSentAt) return <DropdownMenuItem disabled>Rappel déjà envoyé</DropdownMenuItem>;
  const on = !!e.reminderEnabled;

  async function toggle() {
    try {
      await setReminder.mutateAsync({ id: e.id, enabled: !on });
      if (on) toast.success("Rappel désactivé : aucun e-mail ne sera envoyé.");
      else if (e.status === "DRAFT") toast.success("Rappel activé. Il partira 24 h avant le début, une fois la vente ouverte.");
      else if (start - Date.now() <= LEAD_MS) toast.success("Rappel activé : il part aux participants dans les prochaines minutes.");
      else toast.success(`Rappel activé : il partira aux participants ${whenLabel(start - LEAD_MS)}.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Réglage du rappel impossible."));
    }
  }

  return (
    <DropdownMenuItem disabled={setReminder.isPending} onClick={() => void toggle()}>
      {on ? "Désactiver le rappel" : "Activer le rappel (24 h avant)"}
    </DropdownMenuItem>
  );
}
