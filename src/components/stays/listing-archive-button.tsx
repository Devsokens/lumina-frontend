"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoubleConfirmDialog } from "@/components/shared/double-confirm-dialog";
import { apiError } from "@/lib/api";
import { useSaveListing } from "@/hooks/useStays";
import type { Listing } from "@/types/stays";
import { cn } from "@/lib/utils";

// Archiver un logement ou le remettre en ligne, toujours en deux
// confirmations. Même bouton sur la liste et sur la fiche du logement.
export function ListingArchiveButton({
  listing,
  onDone,
  className,
}: {
  listing: Pick<Listing, "id" | "title" | "status">;
  onDone?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const save = useSaveListing();
  const restoring = listing.status === "ARCHIVED";

  function confirm() {
    save.mutate(
      { id: listing.id, input: { status: restoring ? "PUBLISHED" : "ARCHIVED" } },
      {
        onSuccess: () => {
          toast.success(restoring ? "Logement remis en ligne" : "Logement archivé");
          setOpen(false);
          onDone?.();
        },
        onError: (err) => toast.error(apiError(err)),
      }
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={restoring ? "default" : "outline"}
        size="sm"
        className={cn("rounded-xl", className)}
        onClick={() => setOpen(true)}
        disabled={save.isPending}
      >
        {restoring ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}
        {restoring ? "Remettre en ligne" : "Archiver"}
      </Button>
      <DoubleConfirmDialog
        open={open}
        onOpenChange={setOpen}
        pending={save.isPending}
        destructive={!restoring}
        first={
          restoring
            ? {
                title: `Remettre « ${listing.title} » en ligne ?`,
                description: "Le logement quittera les archives.",
                confirmLabel: "Continuer",
              }
            : {
                title: `Archiver « ${listing.title} » ?`,
                description: "Le logement sera retiré de votre site. Son historique de réservations est conservé.",
                confirmLabel: "Continuer",
              }
        }
        second={
          restoring
            ? {
                title: "Confirmer la remise en ligne",
                description:
                  "Il redeviendra visible sur votre site et réservable immédiatement, aux tarifs et au calendrier enregistrés. Vérifiez-les si besoin.",
                confirmLabel: "Oui, remettre en ligne",
              }
            : {
                title: "Confirmer l'archivage",
                description:
                  "Les voyageurs ne pourront plus le réserver. Les réservations déjà confirmées restent valables. Vous pourrez le remettre en ligne depuis l'onglet Archivés.",
                confirmLabel: "Oui, archiver",
              }
        }
        onConfirm={confirm}
      />
    </>
  );
}
