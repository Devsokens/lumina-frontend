"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PUSH_MESSAGE, type PushEvent } from "@/lib/push";
import { playNotifySound } from "@/lib/notify-sound";

// Tableau de bord ouvert : une notification push arrive aussi ici (relayée
// par le service worker) → son de l'application et message à l'écran.
export function PushListener() {
  const router = useRouter();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as Partial<PushEvent> | null;
      if (!data || data.type !== PUSH_MESSAGE || typeof data.title !== "string") return;
      playNotifySound(data.kind);
      // Lien interne uniquement.
      const url = typeof data.url === "string" && data.url.startsWith("/") && !data.url.startsWith("//") ? data.url : null;
      toast(data.title, {
        description: typeof data.body === "string" ? data.body : undefined,
        duration: 8000,
        ...(url ? { action: { label: "Voir", onClick: () => router.push(url) } } : {}),
      });
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);
  return null;
}
