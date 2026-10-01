"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CloudDownload, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useScanStore } from "@/stores/useScanStore";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

export function OfflinePanel({
  open,
  onOpenChange,
  online,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  online: boolean;
}) {
  const { eventId, manifest, pendingCount, conflicts, syncing, preparing } = useScanStore();
  const { prepareOffline, clearOffline, dismissConflicts, sync } = useScanStore();
  const [confirmClear, setConfirmClear] = useState(false);

  async function prepare() {
    try {
      await prepareOffline();
      toast.success("Mode hors ligne prêt.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Téléchargement impossible.");
    }
  }

  function clear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    void clearOffline();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl p-5">
        <SheetHeader className="p-0">
          <SheetTitle>Mode hors ligne</SheetTitle>
          <SheetDescription>
            Téléchargez la liste signée des billets avant l&apos;ouverture des portes. Sans réseau,
            les billets sont vérifiés sur l&apos;appareil puis confirmés au retour du réseau. Gardez
            cette page ouverte : un rechargement sans réseau déconnecte la session.
          </SheetDescription>
        </SheetHeader>

        <div className="rounded-xl border p-4 text-sm">
          {manifest ? (
            <>
              <p className="font-medium">{manifest.count} billet(s) valides en mémoire</p>
              <p className="text-muted-foreground">
                Liste générée le {formatTime(manifest.generatedAt)}, téléchargée le{" "}
                {formatTime(manifest.downloadedAt)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Aucune liste téléchargée pour cet événement.</p>
          )}
        </div>

        <Button onClick={prepare} disabled={!eventId || !online || preparing} className="h-11">
          <CloudDownload className="size-4" />
          {preparing
            ? "Téléchargement…"
            : manifest
              ? "Mettre à jour la liste"
              : "Préparer le mode hors ligne"}
        </Button>

        <div className="flex items-center justify-between gap-2 rounded-xl border p-4 text-sm">
          <span>{pendingCount} scan(s) en attente de synchronisation</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void sync()}
            disabled={!online || syncing || pendingCount === 0}
          >
            <RefreshCw className={syncing ? "size-4 animate-spin" : "size-4"} />
            Synchroniser
          </Button>
        </div>

        {conflicts.length > 0 && (
          <div className="rounded-xl border border-warning p-4 text-sm">
            <p className="mb-2 font-semibold text-warning">
              {conflicts.length} conflit(s) : scan(s) hors ligne refusé(s) par le serveur
            </p>
            <ul className="space-y-2">
              {conflicts.map((c) => (
                <li key={c.id} className="rounded-lg bg-muted p-2">
                  <p className="font-medium">
                    {c.serverStatus === "used" ? "Déjà scanné ailleurs" : "Billet invalide"}
                    {c.attendee ? ` — ${c.attendee}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    Scanné hors ligne le {formatTime(c.scannedAt)}
                    {c.detail ? ` · ${c.detail}` : ""}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{c.code}</p>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => void dismissConflicts()}
            >
              Marquer comme traités
            </Button>
          </div>
        )}

        {manifest && (
          <Button variant="ghost" className="text-destructive" onClick={clear}>
            <Trash2 className="size-4" />
            {confirmClear
              ? "Confirmer : effacer la liste de cet appareil"
              : "Effacer les données hors ligne (fin d'événement)"}
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
