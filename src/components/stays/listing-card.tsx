import Link from "next/link";
import { BedDouble, Home, Users } from "lucide-react";
import { formatXAF } from "@/lib/format";
import { LISTING_TYPE_LABELS } from "@/lib/stays";
import type { PublicListing } from "@/types/stays";
import { cn } from "@/lib/utils";

type Props = {
  listing: Pick<PublicListing, "title" | "type" | "city" | "maxGuests" | "bedrooms" | "nightlyPrice" | "photos">;
  href?: string;
  // Pastille en haut à gauche (statut côté back-office).
  badge?: React.ReactNode;
  // Actions sous la carte (back-office).
  footer?: React.ReactNode;
  className?: string;
};

// Carte logement — même rendu sur le site public et dans le back-office.
export function ListingCard({ listing, href, badge, footer, className }: Props) {
  const cover = listing.photos[0];
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        {cover ? (
          // Image tenant (https ou data URL vérifiée par le serveur).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Home className="size-10" />
          </div>
        )}
        {badge && <div className="absolute left-3 top-3">{badge}</div>}
      </div>
      <div className="mt-3 space-y-0.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold text-foreground">{listing.title}</p>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {LISTING_TYPE_LABELS[listing.type]} · {listing.city}
        </p>
        <p className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {listing.maxGuests}
          </span>
          <span className="inline-flex items-center gap-1">
            <BedDouble className="size-3.5" /> {listing.bedrooms} ch.
          </span>
        </p>
        <p className="pt-1 text-sm">
          <span className="font-semibold text-foreground">{formatXAF(listing.nightlyPrice)}</span>
          <span className="text-muted-foreground"> / nuit</span>
        </p>
      </div>
    </>
  );

  return (
    <div className={cn("group", className)}>
      {href ? (
        <Link href={href} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-primary">
          {body}
        </Link>
      ) : (
        body
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
