"use client";

import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ScanResultKind = "valid" | "used" | "invalid";

const CONFIG: Record<ScanResultKind, { icon: typeof CheckCircle2; label: string; className: string }> = {
  valid: { icon: CheckCircle2, label: "Billet valide", className: "bg-success text-white" },
  used: { icon: AlertTriangle, label: "Déjà scanné", className: "bg-warning text-white" },
  invalid: { icon: XCircle, label: "QR invalide", className: "bg-destructive text-white" },
};

export function ScanResult({
  kind,
  detail,
  onDismiss,
}: {
  kind: ScanResultKind;
  detail?: string;
  onDismiss: () => void;
}) {
  const { icon: Icon, label, className } = CONFIG[kind];

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 rounded-t-3xl p-6 pb-10",
        className
      )}
    >
      <Icon className="size-12" />
      <p className="font-display text-xl font-semibold">{label}</p>
      {detail && <p className="text-sm opacity-90">{detail}</p>}
      <Button variant="secondary" className="mt-2 w-full" onClick={onDismiss}>
        Scanner suivant
      </Button>
    </div>
  );
}
