"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/stays/listing-card";
import { ListingArchiveButton } from "@/components/stays/listing-archive-button";
import { useListings } from "@/hooks/useStays";
import { LISTING_STATUS_LABELS } from "@/lib/stays";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const { data: listings, isLoading } = useListings();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const base = "/admin/accommodation/listings";
  const archived = (listings ?? []).filter((l) => l.status === "ARCHIVED");
  const active = (listings ?? []).filter((l) => l.status !== "ARCHIVED");
  const shown = tab === "active" ? active : archived;

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

      {(archived.length > 0 || tab === "archived") && (
        <div className="flex gap-1 rounded-xl bg-muted p-1 text-sm font-medium sm:w-fit">
          {(
            [
              ["active", `Actifs (${active.length})`],
              ["archived", `Archivés (${archived.length})`],
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

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : tab === "archived" && !archived.length ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
          <Archive className="size-10 text-muted-foreground" />
          <p className="font-semibold">Aucun logement archivé</p>
        </div>
      ) : !shown.length ? (
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
          {shown.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              href={`${base}/${l.id}`}
              className={l.status === "ARCHIVED" ? "[&_img]:grayscale-[60%]" : undefined}
              footer={l.status === "ARCHIVED" ? <ListingArchiveButton listing={l} className="w-full" /> : undefined}
              badge={
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold shadow",
                    l.status === "PUBLISHED"
                      ? "bg-success text-white"
                      : l.status === "ARCHIVED"
                        ? "bg-foreground/80 text-background"
                        : "bg-background/95 text-foreground"
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
