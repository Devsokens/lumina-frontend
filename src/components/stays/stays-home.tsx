"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, Search } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { usePublicListings } from "@/hooks/useStays";
import { restaurantInfo } from "@/lib/order-document";
import { siteOf } from "@/lib/site";
import { LISTING_TYPE_LABELS } from "@/lib/stays";
import { ListingCard } from "@/components/stays/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListingType } from "@/types/stays";
import { cn } from "@/lib/utils";

// Accueil du site d'un hébergeur : couverture, filtres par type et par
// voyageurs, grille de logements réservables.
export function StaysHome() {
  const tenant = useTenant();
  const site = siteOf(tenant);
  const info = restaurantInfo(tenant);
  const description = (tenant.config as { description?: string }).description;
  const { data: listings, isLoading } = usePublicListings(tenant.slug);
  const [type, setType] = useState<ListingType | null>(null);
  const [guests, setGuests] = useState(1);

  const types = useMemo(() => [...new Set((listings ?? []).map((l) => l.type))], [listings]);
  const shown = (listings ?? []).filter((l) => (!type || l.type === type) && l.maxGuests >= guests);
  const cover = site.coverUrl || listings?.[0]?.photos[0];

  return (
    <main className="flex-1">
      <section className="relative isolate flex min-h-[46svh] items-end overflow-hidden">
        {cover ? (
          // Image tenant (https ou data URL vérifiée par le serveur).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/40 to-primary/5" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 text-white">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{tenant.name}</h1>
          {description && <p className="mt-2 max-w-2xl text-white/85">{description}</p>}
        </div>
      </section>

      <section id="logements" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Chip active={!type} onClick={() => setType(null)}>
            Tous
          </Chip>
          {types.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {LISTING_TYPE_LABELS[t]}
            </Chip>
          ))}
          <label className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm">
            <Search className="size-4 text-muted-foreground" />
            Voyageurs
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="bg-transparent font-medium">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                  {i === 11 ? "+" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            {listings?.length ? "Aucun logement ne correspond à ces critères." : "Aucun logement disponible pour le moment."}
          </p>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((l) => (
              <ListingCard key={l.id} listing={l} href={`/${tenant.slug}/stays/${l.id}`} />
            ))}
          </div>
        )}
      </section>

      {(info.phone || info.address) && (
        <section id="infos" className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-6 px-4 py-8 text-sm text-muted-foreground">
            {info.address && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" /> {info.address}
              </span>
            )}
            {info.phone && (
              <a href={`tel:${info.phone}`} className="inline-flex items-center gap-2 hover:text-foreground">
                <Phone className="size-4" /> {info.phone}
              </a>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50"
      )}
    >
      {children}
    </button>
  );
}
