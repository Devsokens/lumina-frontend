"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CloudOff, Search, WifiOff, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ticketNumber } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { ApiTicket, ApiTicketStatus } from "@/types/events";
import type { ScanLogEntry, ScanLogKind } from "@/stores/useScanLog";

// Informations d'un billet affichées au scan et dans l'historique. Le serveur
// ne renvoie qu'un verdict au scan : le billet est retrouvé par son QR code
// dans la liste des billets de l'événement (GET /admin/events/:id/tickets,
// ouverte au rôle Scanner).
export type ScannedTicket = {
  name: string;
  ticketType: string;
  number: string;
  phone: string;
  scannedAt: string | null;
  status: ApiTicketStatus;
};

export function toScannedTicket(t: ApiTicket): ScannedTicket {
  return {
    name: t.customerName?.trim() || "Participant",
    ticketType: t.ticketType.name,
    number: ticketNumber(t.id),
    phone: t.customerPhone ?? "",
    scannedAt: t.scannedAt,
    status: t.status,
  };
}

export function formatScanTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const LOG_STYLE: Record<ScanLogKind, { icon: typeof CheckCircle2; label: string; className: string }> = {
  valid: { icon: CheckCircle2, label: "Entrée acceptée", className: "text-success" },
  used: { icon: AlertTriangle, label: "Déjà scanné", className: "text-warning" },
  invalid: { icon: XCircle, label: "Refusé", className: "text-destructive" },
  network: { icon: WifiOff, label: "Réseau indisponible", className: "text-muted-foreground" },
  error: { icon: AlertTriangle, label: "Erreur", className: "text-muted-foreground" },
};

type Tab = "entries" | "device";

export function ScanHistory({
  tickets,
  log,
  className,
}: {
  // Billets de l'événement contrôlé (null : aucun événement choisi).
  tickets: ApiTicket[] | undefined | null;
  // Tentatives faites sur cet appareil pour cet événement.
  log: ScanLogEntry[];
  className?: string;
}) {
  const [tab, setTab] = useState<Tab>("entries");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // Entrées enregistrées par le serveur, tous scanners confondus, plus récentes d'abord.
  const entered = useMemo(
    () =>
      (tickets ?? [])
        .filter((t) => t.status === "USED")
        .sort((a, b) => new Date(b.scannedAt ?? 0).getTime() - new Date(a.scannedAt ?? 0).getTime())
        .map(toScannedTicket),
    [tickets]
  );

  const shownEntries = entered.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.number.toLowerCase().includes(q) || t.ticketType.toLowerCase().includes(q) || t.phone.includes(q)
  );
  const shownLog = log.filter(
    (e) => !q || [e.name, e.number, e.ticketType, e.detail].some((v) => v?.toLowerCase().includes(q))
  );

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm font-medium">
        {(
          [
            ["entries", `Entrées (${entered.length})`],
            ["device", `Ce téléphone (${log.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "rounded-lg px-3 py-1.5 transition",
              tab === id ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, n° de billet, formule…"
          aria-label="Rechercher dans l'historique"
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {tickets === null ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Choisissez l&apos;événement contrôlé.</p>
        ) : tab === "entries" ? (
          shownEntries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {q ? "Aucune entrée ne correspond." : "Aucune entrée enregistrée pour l'instant."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {shownEntries.map((t) => (
                <li key={t.number} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-sm font-semibold text-success">
                    {t.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.ticketType} · <span className="font-mono">{t.number}</span>
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatScanTime(t.scannedAt)}</span>
                </li>
              ))}
            </ul>
          )
        ) : shownLog.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {q ? "Aucun scan ne correspond." : "Aucun scan sur ce téléphone pour l'instant."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {shownLog.map((e) => {
              const style = LOG_STYLE[e.kind];
              const Icon = style.icon;
              return (
                <li key={e.id} className="flex items-start gap-3 py-2.5">
                  <Icon className={cn("mt-0.5 size-5 shrink-0", style.className)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.name ?? style.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.name ? style.label : null}
                      {e.name && (e.ticketType || e.detail) ? " · " : null}
                      {e.ticketType ?? e.detail}
                    </p>
                    {e.offline && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-warning">
                        <CloudOff className="size-3" /> Hors ligne, à confirmer à la synchro
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatScanTime(e.at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
