"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Bouton de téléchargement : reste sur la page, indique le chargement et
// signale un échec.
export function DownloadButton({ action, className, children }: { action: () => Promise<void>; className?: string; children: ReactNode }) {
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      await action();
    } catch {
      toast.error("Téléchargement impossible, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={() => void run()} disabled={busy} className={className}>
      {busy && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
