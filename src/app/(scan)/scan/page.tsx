"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CloudOff, WifiOff } from "lucide-react";
import { QrScanner } from "@/components/scan/qr-scanner";
import { ScanResult } from "@/components/scan/scan-result";
import { ManualEntry } from "@/components/scan/manual-entry";
import { OfflinePanel } from "@/components/scan/offline-panel";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/useApi";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useScanStore, type ScanOutcome } from "@/stores/useScanStore";
import type { Event } from "@/types/api";

const SYNC_INTERVAL_MS = 30_000;

export default function ScanPage() {
  const online = useOnlineStatus();
  const { eventId, manifest, pendingCount, conflicts, setEventId, refresh, submit, sync } =
    useScanStore();
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const busyRef = useRef(false);

  const { data: events } = useApiQuery<Event[]>(["admin-events"], "/admin/events", online);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Synchro automatique : au retour du réseau, puis toutes les 30 s
  // (navigator.onLine peut rater une reconnexion).
  useEffect(() => {
    if (!online) return;
    void sync();
    const timer = window.setInterval(() => void sync(), SYNC_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [online, sync]);

  const handleCode = useCallback(
    async (code: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      try {
        setOutcome(await submit(code));
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [submit]
  );

  const activeEvents = (events ?? []).filter(
    (e) => e.status === "PUBLISHED" || e.status === "ONGOING"
  );

  return (
    <div className="relative h-dvh overflow-hidden bg-black">
      <QrScanner onResult={(code) => void handleCode(code)} paused={busy || outcome !== null} />

      <header className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3">
        {!online ? (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-warning px-3 py-2 text-sm font-bold text-white"
          >
            <WifiOff className="size-4" />
            HORS LIGNE — {pendingCount} scan(s) en attente
            {!manifest && " · liste non préparée"}
          </button>
        ) : (
          (pendingCount > 0 || conflicts.length > 0) && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="rounded-xl bg-black/70 px-3 py-2 text-sm text-white"
            >
              Synchronisation : {pendingCount} en attente
              {conflicts.length > 0 && ` · ${conflicts.length} conflit(s)`}
            </button>
          )
        )}

        <div className="flex gap-2">
          <select
            aria-label="Événement contrôlé"
            value={eventId ?? ""}
            onChange={(e) => void setEventId(e.target.value || null)}
            className="h-10 min-w-0 flex-1 rounded-xl bg-white/95 px-3 text-sm text-neutral-900"
          >
            <option value="">Choisir l&apos;événement…</option>
            {activeEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
            {eventId && !activeEvents.some((e) => e.id === eventId) && (
              <option value={eventId}>Événement sélectionné</option>
            )}
          </select>
          <Button
            variant="secondary"
            className="h-10"
            onClick={() => setPanelOpen(true)}
            aria-label="Mode hors ligne"
          >
            <CloudOff className="size-4" />
            <span className="hidden sm:inline">Hors ligne</span>
          </Button>
        </div>
      </header>

      {!outcome && (
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-6">
          <ManualEntry disabled={busy} onSubmit={(code) => void handleCode(code)} />
        </div>
      )}

      {outcome && <ScanResult outcome={outcome} onDismiss={() => setOutcome(null)} />}

      <OfflinePanel open={panelOpen} onOpenChange={setPanelOpen} online={online} />
    </div>
  );
}
