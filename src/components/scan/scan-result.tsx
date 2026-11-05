"use client";

import { useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  WifiOff,
  CloudOff,
  Phone,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScanOutcome } from "@/stores/useScanStore";
import { formatScanTime, type ScannedTicket } from "./scan-history";

export type ScanResultKind = "valid" | "used" | "invalid";

const VERDICT: Record<
  ScanResultKind,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  valid: {
    icon: CheckCircle2,
    label: "Billet valide",
    className: "bg-success text-white",
  },
  used: {
    icon: AlertTriangle,
    label: "Déjà scanné",
    className: "bg-warning text-white",
  },
  invalid: {
    icon: XCircle,
    label: "QR invalide",
    className: "bg-destructive text-white",
  },
};

// Raison d'un refus quand le billet est connu (remboursé, annulé…).
const REFUSED_REASON: Partial<Record<ScannedTicket["status"], string>> = {
  REFUNDED: "Billet remboursé",
  CANCELLED: "Billet annulé",
  PENDING: "Billet non payé",
};

// Trois rendus distincts :
// - verdict backend : plein vert / orange / rouge, avec le billet scanné
//   (titulaire, formule, numéro) quand il est retrouvé ;
// - verdict hors ligne : même couleur, bordure pointillée + badge "HORS LIGNE"
//   (provisoire : confirmé par le backend à la synchro) ;
// - panne réseau / erreur : fond sombre, bordure orange — jamais rouge.
export function ScanResult({
  outcome,
  ticket,
  onDismiss,
}: {
  outcome: ScanOutcome;
  ticket?: ScannedTicket | null;
  onDismiss: () => void;
}) {
  if (outcome.type !== "verdict") {
    const isNetwork = outcome.type === "network";
    return (
      <Panel
        className="border-t-4 border-warning bg-neutral-900 text-white"
        icon={isNetwork ? WifiOff : AlertTriangle}
        label={
          isNetwork ? "RÉSEAU — vérification impossible, réessayez" : "Erreur"
        }
        detail={outcome.detail}
        action="Réessayer"
        onDismiss={onDismiss}
      />
    );
  }

  const { icon, label, className } = VERDICT[outcome.kind];
  const reason =
    outcome.kind === "invalid" && ticket
      ? REFUSED_REASON[ticket.status]
      : undefined;
  // « Déjà scanné » : l'heure de la première entrée, si le serveur ne l'a pas déjà dite.
  const detail =
    outcome.kind === "used" && !outcome.detail && ticket?.scannedAt
      ? `Entré à ${formatScanTime(ticket.scannedAt)}`
      : outcome.detail;

  return (
    <Panel
      className={cn(
        className,
        outcome.offline && "border-4 border-dashed border-white/80",
      )}
      icon={icon}
      label={reason ?? label}
      // Hors ligne, le détail contient déjà « titulaire · formule ».
      detail={ticket && outcome.offline ? undefined : detail}
      badge={
        outcome.offline ? "HORS LIGNE — à confirmer à la synchro" : undefined
      }
      action="Scanner suivant"
      onDismiss={onDismiss}
    >
      {ticket && (
        <div className="w-full rounded-2xl bg-black/15 p-4 text-left">
          <p className="truncate font-display text-xl font-semibold leading-tight">
            {ticket.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-95">
            <span className="flex items-center gap-1.5">
              <Ticket className="size-4" /> {ticket.ticketType}
            </span>
            <span className="font-mono">{ticket.number}</span>
            {ticket.phone && (
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="size-4" /> {ticket.phone}
              </span>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

function Panel({
  className,
  icon: Icon,
  label,
  detail,
  badge,
  action,
  onDismiss,
  children,
}: {
  className: string;
  icon: typeof CheckCircle2;
  label: string;
  detail?: string;
  badge?: string;
  action: string;
  onDismiss: () => void;
  children?: React.ReactNode;
}) {
  // Échap ferme aussi le résultat (ordinateur).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <>
      {/* Toucher l'écran en dehors du résultat le ferme (comme « Scanner suivant »). */}
      <button
        type="button"
        aria-label={action}
        onClick={onDismiss}
        className="absolute inset-0 z-20 cursor-default bg-black/30"
      />
      <div
        role="status"
        aria-live="assertive"
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-3 rounded-t-3xl p-6 pb-10 text-center",
          className,
        )}
      >
        {badge && (
          <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-bold tracking-wide">
            <CloudOff className="size-3.5" />
            {badge}
          </span>
        )}
        <Icon className="size-12" />
        <p className="font-display text-xl font-semibold">{label}</p>
        {detail && <p className="text-sm opacity-90">{detail}</p>}
        {children}
        <Button variant="secondary" className="mt-2 w-full" onClick={onDismiss}>
          {action}
        </Button>
      </div>
    </>
  );
}
