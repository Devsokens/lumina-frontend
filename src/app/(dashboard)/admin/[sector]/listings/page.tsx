"use client";

import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/stays/listing-card";
import { useListings } from "@/hooks/useStays";
import { LISTING_STATUS_LABELS } from "@/lib/stays";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const { data: listings, isLoading } = useListings();
  const base = "/admin/accommodation/listings";

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Logements</h1>
          <p className="text-sm text-muted-foreground">Annonces, photos, tarifs et calendrier.</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href={`${base}/new`}>
            <Plus className="size-4" /> Nouveau logement
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : !listings?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
          <Home className="size-10 text-muted-foreground" />
          <p className="font-semibold">Aucun logement pour l&apos;instant</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ajoutez votre premier logement : photos, équipements et prix par nuit. Il sera réservable
            en ligne dès sa mise en ligne.
          </p>
          <Button asChild className="rounded-xl">
            <Link href={`${base}/new`}>Ajouter un logement</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              href={`${base}/${l.id}`}
              badge={
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold shadow",
                    l.status === "PUBLISHED" ? "bg-success text-white" : "bg-background/95 text-foreground"
                  )}
                >
                  {LISTING_STATUS_LABELS[l.status]}
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
