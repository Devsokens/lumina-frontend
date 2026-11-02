"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Bath, BedDouble, Clock, DoorOpen, MapPin, Users, X } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { usePublicListing } from "@/hooks/useStays";
import { AMENITIES, LISTING_TYPE_LABELS } from "@/lib/stays";
import { BookingWidget } from "@/components/stays/booking-widget";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function StayPage() {
  const tenant = useTenant();
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, isError } = usePublicListing(tenant.slug, id);
  const [viewer, setViewer] = useState<number | null>(null);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="aspect-[2/1] rounded-3xl" />
      </main>
    );
  }
  if (isError || !listing) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <p className="font-semibold">Ce logement n&apos;est plus disponible.</p>
        <Link href={`/${tenant.slug}`} className="mt-3 inline-block text-sm text-primary underline">
          Voir les autres logements
        </Link>
      </main>
    );
  }

  const photos = listing.photos;
  const amenities = AMENITIES.filter((a) => listing.amenities.includes(a.key));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{listing.title}</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-4" /> {[listing.address, listing.city].filter(Boolean).join(", ")}
      </p>

      {/* Galerie : grande photo + 4 vignettes, plein écran au clic. */}
      {photos.length > 0 && (
        <div className="mt-5 grid h-[42svh] min-h-64 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl">
          {photos.slice(0, 5).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setViewer(i)}
              className={cn("relative overflow-hidden bg-muted", i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover transition-transform hover:scale-105" />
              {i === 4 && photos.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 font-semibold text-white">
                  +{photos.length - 5}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="border-b border-border pb-6">
            <h2 className="text-xl font-semibold">
              {LISTING_TYPE_LABELS[listing.type]} · {tenant.name}
            </h2>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {listing.maxGuests} voyageurs</span>
              <span className="inline-flex items-center gap-1.5"><DoorOpen className="size-4" /> {listing.bedrooms} chambre(s)</span>
              <span className="inline-flex items-center gap-1.5"><BedDouble className="size-4" /> {listing.beds} lit(s)</span>
              <span className="inline-flex items-center gap-1.5"><Bath className="size-4" /> {listing.bathrooms} salle(s) de bain</span>
            </p>
          </div>

          {listing.description && <p className="whitespace-pre-line leading-relaxed">{listing.description}</p>}

          {amenities.length > 0 && (
            <section className="space-y-4 border-t border-border pt-6">
              <h2 className="text-xl font-semibold">Ce que propose ce logement</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {amenities.map(({ key, label, icon: Icon }) => (
                  <li key={key} className="flex items-center gap-3">
                    <Icon className="size-5 text-muted-foreground" /> {label}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-xl font-semibold">À savoir</h2>
            <p className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" /> Arrivée à partir de {listing.checkInTime} · départ avant{" "}
              {listing.checkOutTime}
            </p>
            {listing.houseRules && <p className="whitespace-pre-line text-sm text-muted-foreground">{listing.houseRules}</p>}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget slug={tenant.slug} listing={listing} />
        </aside>
      </div>

      {viewer !== null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-black/95 p-4" onClick={() => setViewer(null)}>
          <button type="button" aria-label="Fermer" className="fixed right-4 top-4 rounded-full bg-white/10 p-2 text-white" onClick={() => setViewer(null)}>
            <X className="size-5" />
          </button>
          <div className="mx-auto max-w-4xl space-y-3 pt-12">
            {[...photos.slice(viewer), ...photos.slice(0, viewer)].map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="w-full rounded-xl" />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
