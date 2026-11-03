"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Search, Sparkles } from "lucide-react";
import { formatXAF } from "@/lib/format";
import { LISTING_TYPE_LABELS } from "@/lib/stays";
import { whatsappHref, type StaySiteConfig } from "@/lib/stay-site";
import { ListingCard } from "@/components/stays/listing-card";
import { Reveal } from "@/components/stays/site/reveal";
import type { ListingType, PublicListing } from "@/types/stays";
import { cn } from "@/lib/utils";

// Briques du site Airbnb, partagées par les 6 dispositions
// (stays-home.tsx). Une disposition choisit l'ordre et la variante.

export type ListingsVariant = "grid" | "duo" | "magazine" | "carousel" | "bento" | "index";

export function SectionTitle({ eyebrow, title, center }: { eyebrow?: string; title: string; center?: boolean }) {
  return (
    <Reveal className={cn("mb-8 max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
    </Reveal>
  );
}

export function Filters({
  types,
  type,
  onType,
  guests,
  onGuests,
  floating,
}: {
  types: ListingType[];
  type: ListingType | null;
  onType: (t: ListingType | null) => void;
  guests: number;
  onGuests: (n: number) => void;
  // Pilule posée sur la couverture (Riviera).
  floating?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        floating && "rounded-[1.75rem] border border-border bg-background/95 p-2 shadow-2xl shadow-black/15 backdrop-blur"
      )}
    >
      <Chip active={!type} onClick={() => onType(null)}>
        Tous
      </Chip>
      {types.map((t) => (
        <Chip key={t} active={type === t} onClick={() => onType(t)}>
          {LISTING_TYPE_LABELS[t]}
        </Chip>
      ))}
      <label className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
        <Search className="size-4 text-muted-foreground" />
        Voyageurs
        <select value={guests} onChange={(e) => onGuests(Number(e.target.value))} className="bg-transparent font-medium">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
              {i === 11 ? "+" : ""}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-foreground/40"
      )}
    >
      {children}
    </button>
  );
}

export function ListingsView({
  listings,
  variant,
  hrefOf,
  empty,
}: {
  listings: PublicListing[];
  variant: ListingsVariant;
  hrefOf: (id: string) => string;
  empty: string;
}) {
  if (listings.length === 0) {
    return <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">{empty}</p>;
  }

  if (variant === "magazine") {
    return (
      <div className="space-y-16 sm:space-y-24">
        {listings.map((l, i) => (
          <Reveal key={l.id} as="article">
            <Link href={hrefOf(l.id)} className="group grid items-center gap-6 md:grid-cols-12 md:gap-10">
              <div className={cn("overflow-hidden rounded-[2rem] bg-muted md:col-span-7", i % 2 && "md:order-2")}>
                <Cover src={l.photos[0]} className="aspect-[4/3] transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="md:col-span-5">
                <p className="font-display text-6xl font-light text-primary/30">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {LISTING_TYPE_LABELS[l.type]} · {l.city}
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">{l.title}</h3>
                {l.description && <p className="mt-3 line-clamp-3 text-muted-foreground">{l.description}</p>}
                <p className="mt-5 inline-flex items-center gap-2 border-b border-foreground pb-1 font-medium">
                  {formatXAF(l.nightlyPrice)} / nuit <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    );
  }

  if (variant === "index") {
    return (
      <ol className="divide-y divide-border border-y border-border">
        {listings.map((l, i) => (
          <Reveal key={l.id} as="li" index={i}>
            <Link href={hrefOf(l.id)} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 sm:gap-8 sm:py-7">
              <span className="font-display text-sm tabular-nums text-muted-foreground sm:text-base">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                <div className="hidden size-20 shrink-0 overflow-hidden rounded-2xl bg-muted sm:block">
                  <Cover src={l.photos[0]} className="size-full transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-4xl">
                    {l.title}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {LISTING_TYPE_LABELS[l.type]} · {l.city} · {l.maxGuests} voyageurs
                  </p>
                </div>
              </div>
              <span className="text-right text-sm">
                <span className="block font-semibold">{formatXAF(l.nightlyPrice)}</span>
                <span className="text-muted-foreground">/ nuit</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ol>
    );
  }

  if (variant === "carousel") {
    return (
      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]">
        {listings.map((l, i) => (
          <Reveal key={l.id} index={i} className="w-[78%] shrink-0 snap-start sm:w-[340px]">
            <ListingCard listing={l} href={hrefOf(l.id)} className="stay-lift" />
          </Reveal>
        ))}
      </div>
    );
  }

  const grid = {
    grid: "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    duo: "grid gap-x-8 gap-y-12 sm:grid-cols-2",
    bento: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
  }[variant];

  return (
    <div className={grid}>
      {listings.map((l, i) => (
        <Reveal
          key={l.id}
          index={i}
          className={cn(
            variant === "bento" && i === 0 && "sm:col-span-2 lg:row-span-2",
            variant === "duo" && "rounded-[2rem] border border-border bg-card p-3"
          )}
        >
          <ListingCard listing={l} href={hrefOf(l.id)} className="stay-lift" />
        </Reveal>
      ))}
    </div>
  );
}

export function Highlights({ items, numbered }: { items: StaySiteConfig["highlights"]; numbered?: boolean }) {
  const shown = items.filter((h) => h.title);
  if (!shown.length) return null;
  return (
    <div className={cn("grid gap-4", shown.length > 2 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2")}>
      {shown.map((h, i) => (
        <Reveal key={i} index={i} className="rounded-3xl border border-border bg-card p-6">
          {numbered ? (
            <p className="font-display text-4xl font-light text-primary">{String(i + 1).padStart(2, "0")}</p>
          ) : (
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[var(--site-soft)] text-primary">
              <Sparkles className="size-5" />
            </span>
          )}
          <p className="mt-4 font-display text-lg font-semibold">{h.title}</p>
          {h.text && <p className="mt-1 text-sm text-muted-foreground">{h.text}</p>}
        </Reveal>
      ))}
    </div>
  );
}

export function About({ site, center }: { site: StaySiteConfig; center?: boolean }) {
  if (!site.aboutText) return null;
  if (center || !site.aboutImageUrl) {
    return (
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">À propos</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{site.aboutTitle}</h2>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{site.aboutText}</p>
      </Reveal>
    );
  }
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <Reveal className="relative">
        <div className="absolute -inset-3 -z-10 translate-x-5 translate-y-5 rounded-[2.25rem] bg-[var(--site-soft)]" />
        <Cover src={site.aboutImageUrl} className="aspect-[4/5] rounded-[2rem]" />
      </Reveal>
      <Reveal index={1}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">À propos</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{site.aboutTitle}</h2>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{site.aboutText}</p>
      </Reveal>
    </div>
  );
}

export function Gallery({ images, large }: { images: string[]; large?: boolean }) {
  if (!images.length) return null;
  return (
    <div className={cn("grid gap-3", large ? "grid-cols-2 md:grid-cols-4 md:auto-rows-[220px]" : "grid-cols-2 md:grid-cols-4")}>
      {images.map((src, i) => (
        <Reveal
          key={i}
          index={i}
          className={cn("overflow-hidden rounded-3xl bg-muted", large && (i === 0 || i === 5) && "md:col-span-2 md:row-span-2")}
        >
          <Cover src={src} className={cn("transition-transform duration-700 hover:scale-105", large ? "size-full min-h-40" : "aspect-square")} />
        </Reveal>
      ))}
    </div>
  );
}

export function Contact({ site, phone, address }: { site: StaySiteConfig; phone?: string; address?: string }) {
  const wa = whatsappHref(site.whatsapp);
  const items = [
    wa && { href: wa, icon: MessageCircle, label: "WhatsApp", value: site.whatsapp },
    phone && { href: `tel:${phone}`, icon: Phone, label: "Téléphone", value: phone },
    site.email && { href: `mailto:${site.email}`, icon: Mail, label: "E-mail", value: site.email },
    (site.mapsUrl || address) && { href: site.mapsUrl || undefined, icon: MapPin, label: "Adresse", value: address || "Itinéraire" },
  ].filter(Boolean) as { href?: string; icon: typeof Phone; label: string; value: string }[];
  const socials = [
    site.instagramUrl && { href: site.instagramUrl, label: "Instagram" },
    site.facebookUrl && { href: site.facebookUrl, label: "Facebook" },
    site.tiktokUrl && { href: site.tiktokUrl, label: "TikTok" },
  ].filter(Boolean) as { href: string; label: string }[];
  if (!items.length && !socials.length) return null;

  return (
    <div className="rounded-[2.5rem] bg-[var(--site-soft)] p-6 sm:p-12">
      <SectionTitle eyebrow="Contact" title="Une question avant de réserver ?" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ href, icon: Icon, label, value }, i) => {
          const body = (
            <>
              <Icon className="size-5 text-primary" />
              <span className="mt-4 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
              <span className="block truncate font-medium">{value}</span>
            </>
          );
          return (
            <Reveal key={label} index={i}>
              {href ? (
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="stay-lift block rounded-3xl bg-background p-5 hover:shadow-lg">
                  {body}
                </a>
              ) : (
                <div className="rounded-3xl bg-background p-5">{body}</div>
              )}
            </Reveal>
          );
        })}
      </div>
      {socials.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {socials.map(({ href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground">
              {label} <ArrowUpRight className="size-4" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Image tenant (https ou data URL vérifiée par le serveur).
export function Cover({ src, className }: { src?: string; className?: string }) {
  if (!src) return <div className={cn("bg-gradient-to-br from-primary/30 to-[var(--site-soft)]", className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={cn("w-full object-cover", className)} />;
}
