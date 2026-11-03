"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingForm } from "@/components/stays/listing-form";
import { ListingPlanning } from "@/components/stays/listing-planning";
import { ListingArchiveButton } from "@/components/stays/listing-archive-button";
import { apiError } from "@/lib/api";
import { useDeleteListing, useListing } from "@/hooks/useStays";
import { cn } from "@/lib/utils";

const BASE = "/admin/accommodation/listings";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const { data: listing, isLoading } = useListing(isNew ? null : id);
  const [tab, setTab] = useState<"listing" | "calendar">("listing");
  const remove = useDeleteListing();

  function destroy() {
    if (!listing || !window.confirm(`Supprimer « ${listing.title} » ?`)) return;
    remove.mutate(listing.id, {
      onSuccess: () => {
        toast.success("Logement supprimé");
        router.replace(BASE);
      },
      // 409 : déjà réservé → proposer l'archivage.
      onError: (err) => toast.error(apiError(err, "Suppression impossible.")),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Retour aux logements">
            <Link href={BASE}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="truncate font-display text-xl font-bold sm:text-2xl">
            {isNew ? "Nouveau logement" : (listing?.title ?? "Logement")}
          </h1>
        </div>
        {listing && (
          <div className="flex gap-2">
            {/* Remise en ligne : on reste sur la fiche. */}
            <ListingArchiveButton listing={listing} onDone={listing.status === "ARCHIVED" ? undefined : () => router.replace(BASE)} />
            <Button variant="ghost" size="sm" className="rounded-xl text-destructive" onClick={destroy} disabled={remove.isPending}>
              <Trash2 className="size-4" /> Supprimer
            </Button>
          </div>
        )}
      </div>

      {!isNew && (
        <div className="flex gap-1 rounded-xl bg-muted p-1 text-sm font-medium sm:w-fit">
          {(
            [
              ["listing", "Annonce"],
              ["calendar", "Calendrier"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn("flex-1 rounded-lg px-4 py-2 sm:flex-none", tab === key ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {isNew ? (
        <ListingForm onSaved={(l) => router.replace(`${BASE}/${l.id}`)} />
      ) : isLoading || !listing ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : tab === "listing" ? (
        <>
          {listing.status === "ARCHIVED" && (
            <p className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
              Ce logement est archivé : il n&apos;apparaît plus sur votre site. Utilisez « Remettre en ligne » pour
              le rendre de nouveau réservable.
            </p>
          )}
          {/* key avec le statut : le formulaire repart du statut réel après
              archivage / remise en ligne (sinon l'enregistrer l'écraserait). */}
          <ListingForm key={`${listing.id}-${listing.status}`} listing={listing} onSaved={() => undefined} />
        </>
      ) : (
        <ListingPlanning listingId={listing.id} />
      )}
    </div>
  );
}
