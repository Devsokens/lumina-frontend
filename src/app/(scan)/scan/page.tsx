"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CloudOff, History, Keyboard, LogOut, RefreshCw, ScanLine, Wifi, WifiOff } from "lucide-react";
import { QrScanner } from "@/components/scan/qr-scanner";
import { ScanResult } from "@/components/scan/scan-result";
import { ManualEntry } from "@/components/scan/manual-entry";
import { OfflinePanel } from "@/components/scan/offline-panel";
import { EntryCounter } from "@/components/scan/entry-counter";
import { ScanHistory, toScannedTicket, type ScannedTicket } from "@/components/scan/scan-history";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEventTickets } from "@/hooks/useEvents";
import { useScanLog } from "@/stores/useScanLog";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/useApi";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/useAuth";
import { useScanStore, type ScanOutcome } from "@/stores/useScanStore";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/api";
import type { ApiTicket } from "@/types/events";

const SYNC_INTERVAL_MS = 30_000;

// Contrôle d'accès. Téléphone : caméra plein écran, commandes par-dessus,
// historique dans un panneau qui glisse depuis la droite. Ordinateur (lg+) :
// console — caméra, saisie manuelle et synchronisation à gauche ; événement,
// compteur et historique à droite. Une seule caméra est montée.
// Au scan, le billet (titulaire, formule, numéro) est retrouvé par son QR code
// dans la liste des billets de l'événement : le serveur ne renvoie qu'un verdict.
export default function ScanPage() {
  const online = useOnlineStatus();
  const { eventId, manifest, pendingCount, conflicts, setEventId, refresh, submit, sync } =
    useScanStore();
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scanned, setScanned] = useState<ScannedTicket | null>(null);
  const busyRef = useRef(false);
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  // Le Scanner n'a pas accès au back-office : déconnexion depuis cet écran.
  const scannerOnly = user?.role === "STAFF";

  const { data: events } = useApiQuery<Event[]>(["admin-events"], "/admin/events", online);
  const ticketsQuery = useEventTickets(eventId);
  const { refetch: refetchTickets } = ticketsQuery;

  const allLog = useScanLog((s) => s.entries);
  const addLog = useScanLog((s) => s.add);
  const log = useMemo(() => allLog.filter((e) => e.eventId === eventId), [allLog, eventId]);

  // Journal de session relu après le premier rendu (voir useScanLog).
  useEffect(() => {
    void useScanLog.persist.rehydrate();
  }, []);

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
        const result = await submit(code);

        // Billet scanné : retrouvé dans la liste de l'événement, rechargée
        // une fois s'il n'y est pas encore (billet acheté à l'instant).
        const clean = code.trim();
        const cached = eventId ? queryClient.getQueryData<ApiTicket[]>(["admin-event-tickets", eventId]) : undefined;
        let found = cached?.find((t) => t.qrCode === clean);
        if (!found && eventId && online && result.type === "verdict" && !result.offline) {
          const fresh = await refetchTickets();
          found = fresh.data?.find((t) => t.qrCode === clean);
        }
        const ticket = found ? toScannedTicket(found) : null;
        setScanned(ticket);
        setOutcome(result);
        addLog({
          eventId,
          kind: result.type === "verdict" ? result.kind : result.type,
          offline: result.type === "verdict" && result.offline,
          name: ticket?.name,
          ticketType: ticket?.ticketType,
          number: ticket?.number,
          detail: result.detail,
        });
        // Entrée acceptée : compteur à jour sans attendre le prochain rafraîchissement.
        if (result.type === "verdict" && result.kind === "valid" && !result.offline && eventId) {
          void queryClient.invalidateQueries({ queryKey: ["admin-event-tickets", eventId] });
        }
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [submit, eventId, queryClient, online, refetchTickets, addLog]
  );

  const activeEvents = (events ?? []).filter(
    (e) => e.status === "PUBLISHED" || e.status === "ONGOING"
  );

  const eventSelect = (className: string, id?: string) => (
    <select
      id={id}
      aria-label="Événement contrôlé"
      value={eventId ?? ""}
      onChange={(e) => void setEventId(e.target.value || null)}
      className={className}
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
  );

  const syncBanner = !online ? (
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
  );

  return (
    <div className="mobile-readable relative h-dvh overflow-hidden bg-black lg:h-auto lg:min-h-dvh lg:overflow-visible lg:bg-background">
      {/* En-tête de la console (ordinateur). La navigation passe par la barre
          latérale (ScanShell), sauf pour le rôle Scanner. */}
      <header className="hidden h-16 items-center justify-between gap-4 border-b border-border bg-card px-6 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-display text-lg font-semibold">
            <ScanLine className="size-5 text-primary" /> Contrôle d&apos;accès
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              online ? "bg-success/10 text-success" : "bg-warning/15 text-warning"
            )}
          >
            {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {online ? "En ligne" : "Hors ligne"}
          </span>
          {scannerOnly && (
            <Button variant="outline" size="sm" onClick={() => void signOut()} className="gap-1.5">
              <LogOut className="size-4" /> Déconnexion
            </Button>
          )}
        </div>
      </header>

      <div className="h-full lg:mx-auto lg:grid lg:h-auto lg:max-w-6xl lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start lg:gap-8 lg:px-6 lg:py-8">
        <div className="h-full lg:h-auto lg:space-y-4">
          {/* Caméra : plein écran sur téléphone, carte sur ordinateur */}
          <section className="relative h-full overflow-hidden lg:h-[min(560px,calc(100dvh-12rem))] lg:rounded-3xl lg:shadow-xl lg:ring-1 lg:ring-black/10">
            <QrScanner onResult={(code) => void handleCode(code)} paused={busy || outcome !== null} />

            {/* Commandes par-dessus la caméra (téléphone) */}
            <header className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 lg:hidden">
              {syncBanner}
              <div className="flex gap-2">
                {/* Retour au back-office sur téléphone (dès la tablette, la barre
                    latérale est affichée). Lien direct : /admin/event/scanner
                    redirige ici, un router.back() bouclerait. Le Scanner seul
                    n'a pas de back-office : il garde la déconnexion. */}
                {!scannerOnly && (
                  <Button asChild variant="secondary" className="h-10 sm:hidden" aria-label="Retour au tableau de bord">
                    <Link href="/admin/event">
                      <ArrowLeft className="size-4" />
                    </Link>
                  </Button>
                )}
                {eventSelect("h-10 min-w-0 flex-1 rounded-xl bg-white/95 px-3 text-sm text-neutral-900")}
                <Button
                  variant="secondary"
                  className="h-10"
                  onClick={() => setHistoryOpen(true)}
                  aria-label="Historique des scans"
                >
                  <History className="size-4" />
                  <span className="hidden sm:inline">Historique</span>
                </Button>
                <Button
                  variant="secondary"
                  className="h-10"
                  onClick={() => setPanelOpen(true)}
                  aria-label="Mode hors ligne"
                >
                  <CloudOff className="size-4" />
                  <span className="hidden sm:inline">Hors ligne</span>
                </Button>
                {scannerOnly && (
                  <Button variant="secondary" className="h-10" onClick={() => void signOut()} aria-label="Se déconnecter">
                    <LogOut className="size-4" />
                  </Button>
                )}
              </div>
              <EntryCounter eventId={eventId} enabled={online} />
            </header>

            {!outcome && (
              <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-6 lg:hidden">
                <ManualEntry disabled={busy} onSubmit={(code) => void handleCode(code)} />
              </div>
            )}

            {outcome && (
              <ScanResult
                outcome={outcome}
                ticket={scanned}
                onDismiss={() => {
                  setOutcome(null);
                  setScanned(null);
                }}
              />
            )}
          </section>

          {/* Sous la caméra (ordinateur) : saisie manuelle et synchronisation */}
          <div className="hidden rounded-2xl border border-border bg-card p-4 shadow-xs lg:block">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Keyboard className="size-4" /> Saisie manuelle
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              QR abîmé ou illisible : tapez le code imprimé sous le QR du billet.
            </p>
            <div className="mt-3">
              <ManualEntry disabled={busy || outcome !== null} onSubmit={(code) => void handleCode(code)} />
            </div>
          </div>

          <div className="hidden rounded-2xl border border-border bg-card p-4 shadow-xs lg:block">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <RefreshCw className="size-4" /> Synchronisation
              </p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPanelOpen(true)}>
                <CloudOff className="size-4" /> Mode hors ligne
              </Button>
            </div>
            <p className="mt-2 text-sm">
              {pendingCount > 0
                ? `${pendingCount} scan(s) en attente d'envoi`
                : online
                  ? "Tous les scans sont envoyés."
                  : "Hors ligne : les scans seront envoyés au retour du réseau."}
              {conflicts.length > 0 && (
                <span className="text-warning"> · {conflicts.length} conflit(s) à vérifier</span>
              )}
            </p>
            {!manifest && (
              <p className="mt-1 text-xs text-muted-foreground">
                Préparez la liste des billets avant l&apos;ouverture des portes pour scanner sans réseau.
              </p>
            )}
          </div>
        </div>

        {/* Colonne de droite (ordinateur) : événement, compteur, historique */}
        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <label htmlFor="scan-event" className="text-sm font-medium text-muted-foreground">
              Événement contrôlé
            </label>
            <div className="mt-2">
              {eventSelect(
                "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                "scan-event"
              )}
            </div>
            {!eventId && (
              <p className="mt-2 text-xs text-muted-foreground">
                Choisissez l&apos;événement pour suivre les entrées.
              </p>
            )}
          </div>

          <EntryCounter eventId={eventId} enabled={online} variant="card" />

          <div className="flex h-[min(620px,calc(100dvh-20rem))] min-h-80 flex-col rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="size-4" /> Historique des scans
            </p>
            <ScanHistory tickets={eventId ? ticketsQuery.data : null} log={log} className="flex-1" />
          </div>
        </aside>
      </div>

      {/* Historique (téléphone) : panneau qui glisse depuis la droite */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-[88vw] gap-0 p-0 sm:max-w-md lg:hidden">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle>Historique des scans</SheetTitle>
            <SheetDescription>Entrées de l&apos;événement et scans faits sur ce téléphone.</SheetDescription>
          </SheetHeader>
          <ScanHistory tickets={eventId ? ticketsQuery.data : null} log={log} className="min-h-0 flex-1 p-4" />
        </SheetContent>
      </Sheet>

      <OfflinePanel open={panelOpen} onOpenChange={setPanelOpen} online={online} />
    </div>
  );
}
