"use client";

import { CheckCircle2, XCircle, AlertTriangle, WifiOff, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScanOutcome } from "@/stores/useScanStore";

export type ScanResultKind = "valid" | "used" | "invalid";

const VERDICT: Record<ScanResultKind, { icon: typeof CheckCircle2; label: string; className: string }> =
  {
    valid: { icon: CheckCircle2, label: "Billet valide", className: "bg-success text-white" },
    used: { icon: AlertTriangle, label: "Déjà scanné", className: "bg-warning text-white" },
    invalid: { icon: XCircle, label: "QR invalide", className: "bg-destructive text-white" },
  };

// Trois rendus distincts :
// - verdict backend : plein vert / orange / rouge ;
// - verdict hors ligne : même couleur, bordure pointillée + badge "HORS LIGNE"
//   (provisoire : confirmé par le backend à la synchro) ;
// - panne réseau / erreur : fond sombre, bordure orange — jamais rouge.
export function ScanResult({ outcome, onDismiss }: { outcome: ScanOutcome; onDismiss: () => void }) {
  if (outcome.type !== "verdict") {
    const isNetwork = outcome.type === "network";
    return (
      <Panel
        className="border-t-4 border-warning bg-neutral-900 text-white"
        icon={isNetwork ? WifiOff : AlertTriangle}
        label={isNetwork ? "RÉSEAU — vérification impossible, réessayez" : "Erreur"}
        detail={outcome.detail}
        action="Réessayer"
        onDismiss={onDismiss}
      />
    );
  }

  const { icon, label, className } = VERDICT[outcome.kind];
  return (
    <Panel
      className={cn(className, outcome.offline && "border-4 border-dashed border-white/80")}
      icon={icon}
      label={label}
      detail={outcome.detail}
      badge={outcome.offline ? "HORS LIGNE — à confirmer à la synchro" : undefined}
      action="Scanner suivant"
      onDismiss={onDismiss}
    />
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
}: {
  className: string;
  icon: typeof CheckCircle2;
  label: string;
  detail?: string;
  badge?: string;
  action: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="assertive"
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 rounded-t-3xl p-6 pb-10 text-center",
        className
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
      <Button variant="secondary" className="mt-2 w-full" onClick={onDismiss}>
        {action}
      </Button>
    </div>
  );
}
