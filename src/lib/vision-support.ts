"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { visionGet } from "@/lib/vision";
import { playNotifySound } from "@/lib/notify-sound";

// Support, côté console /vision — routes /vision/support
// (docs/API_CONTRACT.md §17). Pas de temps réel : la liste est relue toutes
// les 10 secondes, ce qui suffit pour une prise en charge en moins d'une
// minute.

export type SupportThread = {
  id: string;
  status: "OPEN" | "CLOSED";
  organization: string;
  person: string;
  role: string | null;
  lastMessageAt: string;
  lastPreview: string;
  waitingSince: string | null;
  // Sans réponse depuis 15 minutes : n'importe quel admin peut reprendre.
  overdue: boolean;
  assignedTo: { id: string; name: string; me: boolean } | null;
  canWrite: boolean;
  canClaim: boolean;
  unread: boolean;
};

export type SupportList = { counts: { toTake: number; overdue: number; mine: number }; threads: SupportThread[] };

export type SupportDetail = {
  thread: SupportThread;
  messages: { id: string; author: "USER" | "ADMIN" | "SYSTEM"; adminName: string | null; mine: boolean; body: string; createdAt: string }[];
};

export const SUPPORT_LIST_KEY = ["vision-support"];

export function useSupportList(enabled = true) {
  return useQuery({
    queryKey: SUPPORT_LIST_KEY,
    queryFn: () => visionGet<SupportList>("/support"),
    refetchInterval: 10_000,
    enabled,
  });
}

// Alerte de la console : son et message quand une nouvelle demande arrive,
// ou quand une conversation passe « en retard » (15 minutes sans réponse).
// Monté une fois dans le cadre /vision : actif sur toutes les pages.
export function useSupportAlerts(enabled: boolean): SupportList["counts"] | undefined {
  const { data } = useSupportList(enabled);
  const previous = useRef<SupportList["counts"] | null>(null);
  const counts = data?.counts;

  useEffect(() => {
    if (!counts) return;
    const before = previous.current;
    previous.current = counts;
    // Premier chargement : pas d'alerte pour ce qui était déjà là.
    if (!before) return;
    if (counts.overdue > before.overdue) {
      playNotifySound("sale", true);
      toast.warning("Une conversation attend une réponse depuis 15 minutes", { description: "N'importe quel admin peut reprendre la main.", duration: 12_000 });
    } else if (counts.toTake > before.toTake) {
      playNotifySound(undefined, true);
      toast.info("Nouvelle demande d'assistance", { description: "Une conversation attend d'être prise en charge.", duration: 8_000 });
    }
  }, [counts]);

  return counts;
}
