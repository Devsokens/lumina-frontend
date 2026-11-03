"use client";

import { useMemo, useState } from "react";
import { ArrowDown, MapPin } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { usePublicListings } from "@/hooks/useStays";
import { restaurantInfo } from "@/lib/order-document";
import { staySiteOf, type StayLayout, type StaySiteConfig } from "@/lib/stay-site";
import { Skeleton } from "@/components/ui/skeleton";
import { formatXAF } from "@/lib/format";
import {
  About,
  Contact,
  Cover,
  Filters,
  Gallery,
  Highlights,
  ListingsView,
  SectionTitle,
  type ListingsVariant,
} from "@/components/stays/site/stay-sections";
import type { ListingType, PublicListing } from "@/types/stays";
import { cn } from "@/lib/utils";

type Block = "highlights" | "featured" | "listings" | "about" | "gallery" | "contact";

// Chaque disposition = une couverture + un ordre de sections + une façon de
// présenter les logements. Les sections elles-mêmes sont partagées.
const LAYOUTS: Record<StayLayout, { listings: ListingsVariant; featured: ListingsVariant; order: Block[] }> = {
  riviera: { listings: "grid", featured: "grid", order: ["highlights", "featured", "listings", "about", "gallery", "contact"] },
  atelier: { listings: "magazine", featured: "grid", order: ["highlights", "listings", "about", "gallery", "contact"] },
  horizon: { listings: "grid", featured: "carousel", order: ["featured", "listings", "highlights", "about", "gallery", "contact"] },
  galerie: { listings: "bento", featured: "grid", order: ["listings", "gallery", "about", "highlights", "contact"] },
  boutique: { listings: "duo", featured: "grid", order: ["highlights", "listings", "about", "gallery", "contact"] },
  nomade: { listings: "index", featured: "carousel", order: ["listings", "highlights", "featured", "about", "gallery", "contact"] },
  lodge: { listings: "grid", featured: "carousel", order: ["listings", "highlights", "featured", "about", "gallery", "contact"] },
  carnet: { listings: "duo", featured: "grid", order: ["about", "highlights", "listings", "gallery", "contact"] },
  comparatif: { listings: "table", featured: "grid", order: ["listings", "highlights", "featured", "about", "contact"] },
  panorama: { listings: "bento", featured: "grid", order: ["highlights", "listings", "gallery", "about", "contact"] },
};

type HeroProps = {
  site: StaySiteConfig;
  name: string;
  headline: string;
  tagline?: string;
  cover?: string;
  city?: string;
  count: number;
  filters: React.ReactNode;
  preview: PublicListing[];
  hrefOf: (id: string) => string;
};

// Accueil du site d'un hébergeur, mis en forme selon config.staySite.
export function StaysHome() {
  const tenant = useTenant();
  const site = staySiteOf(tenant);
  const info = restaurantInfo(tenant);
  const description = (tenant.config as { description?: string }).description;
  const { data: listings, isLoading } = usePublicListings(tenant.slug);
  const [type, setType] = useState<ListingType | null>(null);
  const [guests, setGuests] = useState(1);

  const all = useMemo(() => listings ?? [], [listings]);
  const types = useMemo(() => [...new Set(all.map((l) => l.type))], [all]);
  const shown = all.filter((l) => (!type || l.type === type) && l.maxGuests >= guests);
  // Vedettes : seuls des logements publiés du tenant (liste publique).
  const featured = site.featuredListingIds
    .map((id) => all.find((l) => l.id === id))
    .filter((l): l is PublicListing => !!l);
  const layout = LAYOUTS[site.layout];
  const hrefOf = (id: string) => `/${tenant.slug}/stays/${id}`;
  const cities = [...new Set(all.map((l) => l.city))];

  // Couvertures qui portent déjà les filtres : pas de doublon au-dessus des logements.
  const filtersInHero = site.layout === "riviera" || site.layout === "lodge";
  const filters = <Filters types={types} type={type} onType={setType} guests={guests} onGuests={setGuests} floating={filtersInHero} />;
  const hero: HeroProps = {
    site,
    name: tenant.name,
    headline: site.headline || tenant.name,
    tagline: site.tagline || description,
    cover: site.coverUrl || all[0]?.photos[0],
    city: cities.length === 1 ? cities[0] : undefined,
    count: all.length,
    filters,
    preview: all.slice(0, 6),
    hrefOf,
  };
  const Hero = HEROES[site.layout];

  const blocks: Record<Block, React.ReactNode> = {
    highlights: site.sections.highlights && site.highlights.some((h) => h.title) && (
      <Highlights items={site.highlights} numbered={site.layout === "atelier" || site.layout === "nomade"} />
    ),
    featured: site.sections.featured && featured.length > 0 && (
      <>
        <SectionTitle eyebrow="Sélection" title="Nos coups de cœur" />
        <ListingsView listings={featured} variant={layout.featured} hrefOf={hrefOf} empty="" />
      </>
    ),
    listings: (
      <div id="logements" className="scroll-mt-24">
        <SectionTitle eyebrow={`${all.length} logement${all.length > 1 ? "s" : ""}`} title="Choisissez votre séjour" center={site.layout === "boutique"} />
        {!filtersInHero && <div className="mb-8">{filters}</div>}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />
            ))}
          </div>
        ) : (
          <ListingsView
            listings={shown}
            variant={layout.listings}
            hrefOf={hrefOf}
            empty={all.length ? "Aucun logement ne correspond à ces critères." : "Aucun logement disponible pour le moment."}
          />
        )}
      </div>
    ),
    about: site.sections.about && site.aboutText && (
      <div id="maison" className="scroll-mt-24">
        <About site={site} center={site.layout === "boutique"} />
      </div>
    ),
    gallery: site.sections.gallery && site.gallery.length > 0 && (
      <>
        <SectionTitle eyebrow="En images" title="L'atmosphère des lieux" />
        <Gallery images={site.gallery} large={site.layout === "galerie"} />
      </>
    ),
    contact: site.sections.contact && (
      <div id="infos" className="scroll-mt-24">
        <Contact site={site} phone={info.phone ?? undefined} address={info.address ?? undefined} />
      </div>
    ),
  };

  return (
    <main className="flex-1 overflow-x-clip">
      <Hero {...hero} />
      <div className="mx-auto w-full max-w-6xl space-y-24 px-4 pb-24 pt-16 sm:space-y-32 sm:pt-20">
        {layout.order.map((b) => (blocks[b] ? <section key={b}>{blocks[b]}</section> : null))}
      </div>
    </main>
  );
}

// ---------- Couvertures ----------

function Eyebrow({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return <p className={cn("stay-intro text-xs font-semibold uppercase tracking-[0.28em]", className)}>{text}</p>;
}

function HeroRiviera({ site, headline, tagline, cover, filters }: HeroProps) {
  return (
    <section className="relative isolate">
      <div className="relative flex min-h-[78svh] items-center justify-center overflow-hidden px-4 pb-28 pt-16 text-center text-white">
        <Cover src={cover} className="stay-kenburns absolute inset-0 -z-10 size-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/25 to-black/70" />
        <div className="max-w-4xl">
          <Eyebrow text={site.eyebrow} className="text-white/85" />
          <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-7xl">
            {headline}
          </h1>
          {tagline && (
            <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mx-auto mt-5 max-w-2xl text-lg text-white/85">
              {tagline}
            </p>
          )}
        </div>
      </div>
      <div style={{ "--i": 3 } as React.CSSProperties} className="stay-intro relative z-10 mx-auto -mt-10 w-full max-w-5xl px-4">
        {filters}
      </div>
    </section>
  );
}

function HeroAtelier({ site, headline, tagline, cover, city, count }: HeroProps) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-6 pt-10 md:grid-cols-12 md:pt-16">
      <div className="md:col-span-6">
        <Eyebrow text={site.eyebrow} className="text-primary" />
        <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-5 font-display text-5xl font-medium leading-[0.98] tracking-tight text-balance sm:text-7xl">
          {headline}
        </h1>
        {tagline && (
          <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            {tagline}
          </p>
        )}
        <div style={{ "--i": 3 } as React.CSSProperties} className="stay-intro mt-10 flex items-center gap-8 border-t border-border pt-6 text-sm">
          <span>
            <span className="block font-display text-3xl">{String(count).padStart(2, "0")}</span>
            <span className="text-muted-foreground">logements</span>
          </span>
          {city && (
            <span>
              <span className="block font-display text-3xl">{city}</span>
              <span className="text-muted-foreground">destination</span>
            </span>
          )}
        </div>
      </div>
      <div style={{ "--i": 2 } as React.CSSProperties} className="stay-intro relative md:col-span-6">
        <div className="absolute -right-4 -top-4 bottom-10 left-10 -z-10 rounded-[2.5rem] bg-[var(--site-soft)]" />
        <div className="overflow-hidden rounded-[2.5rem]">
          <Cover src={cover} className="stay-kenburns aspect-[4/5] md:aspect-[5/6]" />
        </div>
      </div>
    </section>
  );
}

function HeroHorizon({ site, headline, tagline, cover }: HeroProps) {
  return (
    <section className="px-4 pt-4">
      <div className="relative isolate mx-auto flex min-h-[58svh] max-w-[1400px] items-end overflow-hidden rounded-[2.5rem] text-white">
        <Cover src={cover} className="stay-kenburns absolute inset-0 -z-10 size-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="w-full max-w-3xl p-6 sm:p-12">
          <Eyebrow text={site.eyebrow} className="text-white/80" />
          <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-6xl">
            {headline}
          </h1>
          {tagline && (
            <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mt-4 max-w-xl text-white/85">
              {tagline}
            </p>
          )}
          <a href="#logements" style={{ "--i": 3 } as React.CSSProperties} className="stay-intro mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">
            Voir les logements <ArrowDown className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function HeroGalerie({ site, headline, tagline, cover }: HeroProps) {
  const tiles = [cover, ...site.gallery].filter(Boolean).slice(0, 3) as string[];
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Eyebrow text={site.eyebrow} className="text-primary" />
          <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {headline}
          </h1>
        </div>
        {tagline && (
          <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro max-w-sm text-muted-foreground">
            {tagline}
          </p>
        )}
      </div>
      <div className="grid h-[56svh] min-h-80 grid-cols-4 grid-rows-2 gap-3">
        {(tiles.length ? tiles : [undefined]).map((src, i) => (
          <div
            key={i}
            style={{ "--i": i + 2 } as React.CSSProperties}
            className={cn(
              "stay-intro overflow-hidden rounded-[2rem]",
              i === 0 ? (tiles.length > 1 ? "col-span-4 row-span-2 sm:col-span-3" : "col-span-4 row-span-2") : "hidden sm:block"
            )}
          >
            <Cover src={src} className={cn("size-full", i === 0 && "stay-kenburns")} />
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroBoutique({ site, headline, tagline, cover, name }: HeroProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-4 pt-16 text-center sm:pt-24">
      <Eyebrow text={site.eyebrow || name} className="text-primary" />
      <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mx-auto mt-6 max-w-4xl font-display text-5xl font-medium italic leading-[1.05] tracking-tight text-balance sm:text-8xl">
        {headline}
      </h1>
      <span style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mx-auto mt-8 block h-px w-24 bg-primary" />
      {tagline && (
        <p style={{ "--i": 3 } as React.CSSProperties} className="stay-intro mx-auto mt-8 max-w-xl text-lg text-muted-foreground">
          {tagline}
        </p>
      )}
      {cover && (
        <div style={{ "--i": 4 } as React.CSSProperties} className="stay-intro mx-auto mt-14 max-w-4xl overflow-hidden rounded-t-full">
          <Cover src={cover} className="stay-kenburns aspect-[16/10]" />
        </div>
      )}
    </section>
  );
}

function HeroNomade({ site, headline, tagline, cover, city, count }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-black text-white">
      <Cover src={cover} className="stay-kenburns absolute inset-0 -z-10 size-full opacity-70" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-black/10" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70">
          <span className="h-px w-10 bg-[var(--site-accent)]" />
          <Eyebrow text={site.eyebrow || "Séjours"} />
        </div>
        <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-6 max-w-5xl font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight text-balance sm:text-8xl">
          {headline}
        </h1>
        <div style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-white/20 pt-6">
          {tagline && <p className="max-w-md text-white/80">{tagline}</p>}
          <p className="flex items-center gap-4 text-sm text-white/70">
            {city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {city}
              </span>
            )}
            <span>{count} adresses</span>
            <a href="#logements" aria-label="Voir les logements" className="rounded-full border border-white/30 p-3 transition-colors hover:bg-white hover:text-black">
              <ArrowDown className="size-4" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function HeroLodge({ site, headline, tagline, cover, filters, count, city }: HeroProps) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-stretch gap-6 px-4 pt-8 lg:grid-cols-[1fr_380px]">
      <div className="relative isolate flex min-h-[60svh] items-end overflow-hidden rounded-[2.5rem] p-8 text-white">
        <Cover src={cover} className="stay-kenburns absolute inset-0 -z-10 size-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="max-w-xl">
          <Eyebrow text={site.eyebrow} className="text-white/80" />
          <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {headline}
          </h1>
          {tagline && (
            <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mt-3 text-white/85">
              {tagline}
            </p>
          )}
        </div>
      </div>
      <aside
        style={{ "--i": 2 } as React.CSSProperties}
        className="stay-intro flex flex-col justify-between gap-6 rounded-[2.5rem] border border-border bg-card p-6 shadow-xl lg:sticky lg:top-24 lg:self-start"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Réservation directe</p>
          <p className="mt-2 font-display text-2xl font-semibold">Trouvez votre séjour</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} logement{count > 1 ? "s" : ""}
            {city ? ` à ${city}` : ""} · paiement Mobile Money sécurisé
          </p>
        </div>
        <div className="[&>div]:flex-col [&>div]:items-stretch [&_label]:ml-0">{filters}</div>
        <a href="#logements" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Voir les disponibilités <ArrowDown className="size-4" />
        </a>
      </aside>
    </section>
  );
}

function HeroCarnet({ site, headline, tagline, cover, name }: HeroProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-4 pt-16 sm:pt-24">
      <Eyebrow text={site.eyebrow || name} className="text-primary" />
      <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-5 font-display text-5xl font-medium leading-[1.05] tracking-tight text-balance sm:text-7xl">
        {headline}
      </h1>
      {tagline && (
        <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mt-6 border-l-2 border-primary pl-5 text-xl italic leading-relaxed text-muted-foreground">
          {tagline}
        </p>
      )}
      <div style={{ "--i": 3 } as React.CSSProperties} className="stay-intro mt-12 overflow-hidden rounded-3xl">
        <Cover src={cover} className="stay-kenburns aspect-[3/2]" />
      </div>
    </section>
  );
}

function HeroComparatif({ site, headline, tagline, count, city }: HeroProps) {
  return (
    <section className="border-b border-border bg-[var(--site-soft)]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-14">
        <div className="max-w-2xl">
          <Eyebrow text={site.eyebrow} className="text-primary" />
          <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {headline}
          </h1>
          {tagline && (
            <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mt-3 text-muted-foreground">
              {tagline}
            </p>
          )}
        </div>
        <div style={{ "--i": 3 } as React.CSSProperties} className="stay-intro flex gap-6 text-sm">
          <span>
            <span className="block font-display text-3xl font-semibold">{count}</span>
            <span className="text-muted-foreground">logements</span>
          </span>
          {city && (
            <span>
              <span className="block font-display text-3xl font-semibold">{city}</span>
              <span className="text-muted-foreground">ville</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroPanorama({ site, headline, tagline, cover, preview, hrefOf }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[94svh] flex-col justify-between overflow-hidden text-white">
      <Cover src={cover} className="stay-kenburns absolute inset-0 -z-10 size-full" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/10 to-black/80" />
      <div className="mx-auto w-full max-w-6xl px-4 pt-20 text-center">
        <Eyebrow text={site.eyebrow} className="text-white/80" />
        <h1 style={{ "--i": 1 } as React.CSSProperties} className="stay-intro mx-auto mt-4 max-w-4xl font-display text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          {headline}
        </h1>
        {tagline && (
          <p style={{ "--i": 2 } as React.CSSProperties} className="stay-intro mx-auto mt-4 max-w-xl text-white/85">
            {tagline}
          </p>
        )}
      </div>
      {preview.length > 0 && (
        <div style={{ "--i": 3 } as React.CSSProperties} className="stay-intro mx-auto w-full max-w-6xl px-4 pb-8">
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {preview.map((l) => (
              <a key={l.id} href={hrefOf(l.id)} className="flex w-64 shrink-0 snap-start items-center gap-3 rounded-2xl bg-white/10 p-2 pr-4 backdrop-blur-md transition-colors hover:bg-white/20">
                <div className="size-14 shrink-0 overflow-hidden rounded-xl">
                  <Cover src={l.photos[0]} className="size-full" />
                </div>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{l.title}</span>
                  <span className="text-xs text-white/75">{formatXAF(l.nightlyPrice)} / nuit</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const HEROES: Record<StayLayout, (p: HeroProps) => React.ReactNode> = {
  riviera: HeroRiviera,
  atelier: HeroAtelier,
  horizon: HeroHorizon,
  galerie: HeroGalerie,
  boutique: HeroBoutique,
  nomade: HeroNomade,
  lodge: HeroLodge,
  carnet: HeroCarnet,
  comparatif: HeroComparatif,
  panorama: HeroPanorama,
};
