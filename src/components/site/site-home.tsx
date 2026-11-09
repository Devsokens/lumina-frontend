"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useSiteBase } from "@/hooks/useSiteBase";
import { useProducts } from "@/hooks/useMenu";
import { formatXAF } from "@/lib/format";
import { restaurantInfo } from "@/lib/order-document";
import { DAYS, openNow, siteOf, whatsappLink, type SiteConfig, type SiteHours, type SiteLayout } from "@/lib/site";
import { AddToCart } from "@/components/site/add-to-cart";
import { Reveal } from "@/components/stays/site/reveal";
import type { Product } from "@/types/api";
import { cn } from "@/lib/utils";

// Page d'accueil du site restaurant / boutique : contenu et apparence
// réglés dans le back-office (admin/[sector]/site). Rendue aussi dans
// l'aperçu de l'éditeur. Une variante (site.layout) choisit la couverture,
// la présentation des produits, l'ordre des sections et le bouton fixe.

type Hero = "cover" | "minimal" | "split" | "band" | "bold" | "mosaic" | "immersive";
type Featured = "carousel" | "list" | "mosaic" | "grid" | "editorial";
type Block = "featured" | "about" | "gallery" | "infos";

const PRESETS: Record<SiteLayout, { hero: Hero; featured: Featured; order: Block[]; sticky?: boolean }> = {
  brasserie: { hero: "cover", featured: "carousel", order: ["featured", "about", "gallery", "infos"] },
  gastronomique: { hero: "minimal", featured: "list", order: ["about", "featured", "gallery", "infos"] },
  maison: { hero: "split", featured: "editorial", order: ["about", "featured", "gallery", "infos"] },
  carte: { hero: "band", featured: "list", order: ["featured", "infos", "about", "gallery"], sticky: true },
  street: { hero: "bold", featured: "mosaic", order: ["featured", "gallery", "about", "infos"], sticky: true },
  terrasse: { hero: "mosaic", featured: "carousel", order: ["gallery", "featured", "about", "infos"] },
  comptoir: { hero: "band", featured: "grid", order: ["infos", "featured", "about", "gallery"], sticky: true },
  lounge: { hero: "immersive", featured: "mosaic", order: ["gallery", "featured", "about", "infos"] },
  marche: { hero: "band", featured: "grid", order: ["featured", "about", "infos", "gallery"], sticky: true },
  editorial: { hero: "split", featured: "editorial", order: ["featured", "about", "gallery", "infos"] },
};

export function SiteHome() {
  const tenant = useTenant();
  const base = useSiteBase(tenant.slug);
  const site = siteOf(tenant);
  const info = restaurantInfo(tenant);
  const description = (tenant.config as { description?: string }).description;
  const { data: products } = useProducts(tenant.slug);
  const menu = `${base}/menu`;
  const isShop = tenant.sector === "SHOP";
  const wa = whatsappLink(site.whatsapp);
  const preset = PRESETS[site.layout];

  const featured = site.featuredProductIds.length
    ? site.featuredProductIds.map((id) => products?.find((p) => p.id === id)).filter((p) => p !== undefined)
    : (products ?? []).filter((p) => p.isAvailable && (preset.featured === "list" || p.imageUrl)).slice(0, preset.featured === "list" ? 8 : preset.featured === "grid" ? 8 : 4);

  const hasInfos = site.sections.hours || (site.sections.location && (info.address || site.mapsUrl));
  const ctaLabel = isShop ? "Voir le catalogue" : "Découvrir la carte";
  const contact = wa || info.phone ? { href: wa ?? `tel:${info.phone}`, label: isShop ? "Nous contacter" : "Réserver une table", wa: !!wa } : null;

  const blocks: Record<Block, React.ReactNode> = {
    featured: site.sections.featured && featured.length > 0 && (
      <FeaturedSection products={featured} variant={preset.featured} isShop={isShop} menu={menu} />
    ),
    about: site.sections.about && site.aboutText && <AboutSection site={site} centered={site.layout === "gastronomique"} />,
    gallery: site.sections.gallery && site.gallery.length > 0 && <GallerySection images={site.gallery} />,
    infos: hasInfos && <InfosSection site={site} name={tenant.name} address={info.address} phone={info.phone} />,
  };

  return (
    <main className={cn("flex-1 overflow-x-clip", preset.sticky && "pb-20 md:pb-0")}>
      <HeroSection
        variant={preset.hero}
        site={site}
        name={tenant.name}
        tagline={site.tagline || description}
        menu={menu}
        ctaLabel={ctaLabel}
        contact={contact}
      />
      {preset.order.map((b) => (blocks[b] ? <div key={b}>{blocks[b]}</div> : null))}
      <SiteFooter />
      {preset.sticky && (
        // Bouton d'action toujours visible sur mobile (parcours de commande).
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
          <Link href={menu} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground">
            <ShoppingBag className="size-5" /> Commander
          </Link>
          {contact && (
            <a href={contact.href} target={contact.wa ? "_blank" : undefined} rel="noopener noreferrer" aria-label={contact.label} className="flex min-h-12 items-center justify-center rounded-full border border-border px-5">
              {contact.wa ? <MessageCircle className="size-5" /> : <Phone className="size-5" />}
            </a>
          )}
        </div>
      )}
    </main>
  );
}

// ---------- Couvertures ----------

type HeroProps = {
  variant: Hero;
  site: SiteConfig;
  name: string;
  tagline?: string;
  menu: string;
  ctaLabel: string;
  contact: { href: string; label: string; wa: boolean } | null;
};

function Ctas({ menu, ctaLabel, contact, light }: Pick<HeroProps, "menu" | "ctaLabel" | "contact"> & { light?: boolean }) {
  return (
    <div className="stay-intro flex flex-wrap gap-3 pt-2" style={{ "--i": 3 } as React.CSSProperties}>
      <Link href={menu} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
        {ctaLabel} <ArrowRight className="size-5" />
      </Link>
      {contact && (
        <a
          href={contact.href}
          target={contact.wa ? "_blank" : undefined}
          rel="noopener noreferrer"
          className={cn(
            "inline-flex min-h-12 items-center gap-2 rounded-full border px-7 text-base font-semibold backdrop-blur transition-colors",
            light ? "border-white/40 bg-white/10 text-white hover:bg-white/20" : "border-border hover:bg-muted"
          )}
        >
          {contact.wa ? <MessageCircle className="size-5" /> : <Phone className="size-5" />} {contact.label}
        </a>
      )}
    </div>
  );
}

function CoverImage({ src, className }: { src: string; className?: string }) {
  if (!src) {
    return (
      <div
        className={className}
        style={{ background: "radial-gradient(120% 90% at 20% 10%, color-mix(in oklab, var(--site-accent) 55%, transparent), transparent 60%), #14110d" }}
      />
    );
  }
  // Image tenant (https ou data URL vérifiée) — LUMINA_Audit_Menaces_Complet.md 13.2.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={cn("object-cover", className)} />;
}

function HeroSection(p: HeroProps) {
  const { site, name, tagline } = p;
  const eyebrow = site.eyebrow && (
    <p className="stay-intro text-sm font-semibold uppercase tracking-[0.3em] opacity-80">{site.eyebrow}</p>
  );
  const delay = (i: number) => ({ "--i": i }) as React.CSSProperties;

  if (p.variant === "minimal") {
    return (
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-24 text-center sm:pt-32">
        {site.sections.hours && <OpenBadge hours={site.hours} subtle />}
        <div className="mt-6 text-primary">{eyebrow}</div>
        <h1 style={delay(1)} className="stay-intro mt-6 font-display text-5xl font-medium tracking-tight sm:text-8xl">{name}</h1>
        <span style={delay(2)} className="stay-intro mx-auto mt-8 block h-px w-20 bg-primary" />
        {tagline && <p style={delay(2)} className="stay-intro mx-auto mt-8 max-w-xl text-lg text-muted-foreground">{tagline}</p>}
        <div className="mt-8 flex justify-center">
          <Ctas {...p} />
        </div>
        {site.coverUrl && (
          <div style={delay(4)} className="stay-intro mx-auto mt-16 max-w-3xl overflow-hidden rounded-t-full">
            <CoverImage src={site.coverUrl} className="stay-kenburns aspect-[16/10] w-full" />
          </div>
        )}
      </section>
    );
  }

  if (p.variant === "split") {
    return (
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-12 md:grid-cols-2 md:pt-20">
        <div className="space-y-5">
          {site.sections.hours && <OpenBadge hours={site.hours} subtle />}
          <div className="text-primary">{eyebrow}</div>
          <h1 style={delay(1)} className="stay-intro font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">{name}</h1>
          {tagline && <p style={delay(2)} className="stay-intro max-w-md text-lg text-muted-foreground">{tagline}</p>}
          <Ctas {...p} />
        </div>
        <div style={delay(2)} className="stay-intro relative">
          <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-[2.5rem] bg-primary/15" />
          <div className="overflow-hidden rounded-[2.5rem]">
            <CoverImage src={site.coverUrl} className="stay-kenburns aspect-[4/5] w-full" />
          </div>
        </div>
      </section>
    );
  }

  if (p.variant === "band") {
    return (
      <section className="relative isolate overflow-hidden">
        <CoverImage src={site.coverUrl} className="absolute inset-0 -z-20 size-full" />
        <div className="absolute inset-0 -z-10 bg-black/65" />
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 pb-10 pt-20 text-white">
          <div className="space-y-3">
            {site.sections.hours && <OpenBadge hours={site.hours} />}
            <h1 style={delay(1)} className="stay-intro font-display text-4xl font-semibold tracking-tight sm:text-6xl">{name}</h1>
            {tagline && <p style={delay(2)} className="stay-intro max-w-xl text-white/85">{tagline}</p>}
          </div>
          <Ctas {...p} light />
        </div>
      </section>
    );
  }

  if (p.variant === "bold") {
    return (
      <section className="relative isolate overflow-hidden bg-primary px-4 pb-14 pt-20 text-primary-foreground">
        <div className="mx-auto max-w-6xl">
          {eyebrow}
          <h1 style={delay(1)} className="stay-intro mt-4 font-display text-6xl font-black uppercase leading-[0.85] tracking-tighter sm:text-[9rem]">{name}</h1>
          <div className="mt-8 grid items-end gap-8 md:grid-cols-[1fr_auto]">
            {tagline && <p style={delay(2)} className="stay-intro max-w-lg text-xl font-medium">{tagline}</p>}
            {site.coverUrl && (
              <div style={delay(3)} className="stay-intro size-40 rotate-3 overflow-hidden rounded-3xl border-4 border-primary-foreground sm:size-56">
                <CoverImage src={site.coverUrl} className="size-full" />
              </div>
            )}
          </div>
          <div className="mt-8 [&_a:first-child]:bg-primary-foreground [&_a:first-child]:text-primary">
            <Ctas {...p} light />
          </div>
        </div>
      </section>
    );
  }

  if (p.variant === "mosaic") {
    const tiles = [site.coverUrl, ...site.gallery].filter(Boolean).slice(0, 5);
    return (
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            {site.sections.hours && <OpenBadge hours={site.hours} subtle />}
            <h1 style={delay(1)} className="stay-intro font-display text-5xl font-semibold tracking-tight sm:text-6xl">{name}</h1>
            {tagline && <p style={delay(2)} className="stay-intro max-w-xl text-muted-foreground">{tagline}</p>}
          </div>
          <Ctas {...p} />
        </div>
        <div className="grid h-[52svh] min-h-72 grid-cols-4 grid-rows-2 gap-3">
          {(tiles.length ? tiles : [""]).map((src, i) => (
            <div key={i} style={delay(i + 2)} className={cn("stay-intro overflow-hidden rounded-3xl", i === 0 ? "col-span-4 row-span-2 md:col-span-2" : "hidden md:block")}>
              <CoverImage src={src} className={cn("size-full", i === 0 && "stay-kenburns")} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // cover (défaut) et immersive : grande photo en fond.
  const immersive = p.variant === "immersive";
  return (
    <section className={cn("relative isolate flex overflow-hidden", immersive ? "min-h-[92svh] items-center justify-center text-center" : "min-h-[78svh] items-end")}>
      <CoverImage src={site.coverUrl} className={cn("absolute inset-0 -z-20 size-full", immersive && "stay-kenburns")} />
      <div className={cn("absolute inset-0 -z-10", immersive ? "bg-black/60" : "bg-gradient-to-t from-black/85 via-black/40 to-black/10")} />
      <div className={cn("mx-auto w-full max-w-6xl px-4 text-white", immersive ? "py-24" : "pb-14 pt-32 sm:pb-20")}>
        <div className={cn("space-y-5", immersive ? "mx-auto max-w-3xl" : "max-w-2xl")}>
          {site.sections.hours && <OpenBadge hours={site.hours} />}
          {eyebrow}
          <h1 style={delay(1)} className={cn("stay-intro font-display font-semibold leading-[1.02] tracking-tight", immersive ? "text-6xl sm:text-8xl" : "text-5xl sm:text-7xl")}>
            {name}
          </h1>
          {tagline && <p style={delay(2)} className="stay-intro max-w-xl text-lg text-white/85 sm:text-xl">{tagline}</p>}
          <div className={immersive ? "flex justify-center" : ""}>
            <Ctas {...p} light />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Sections ----------

function FeaturedSection({ products, variant, isShop, menu }: { products: Product[]; variant: Featured; isShop: boolean; menu: string }) {
  const title = isShop ? "Nos coups de cœur" : "Les incontournables du chef";
  const more = (
    <div className="mt-10 text-center">
      <Link href={menu} className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
        {isShop ? "Tout le catalogue" : "Voir toute la carte"} <ArrowRight className="size-4" />
      </Link>
    </div>
  );

  if (variant === "list") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20">
        <SectionTitle eyebrow={isShop ? "Sélection" : "La carte"} title={isShop ? "Notre sélection" : "À la carte"} />
        <ul className="mt-10 space-y-5">
          {products.map((p, i) => (
            <Reveal key={p.id} as="li" index={i} className="group flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <span className="mb-1 flex-1 border-b border-dotted border-muted-foreground/40" />
                  <span className="font-mono text-sm font-semibold text-primary">{formatXAF(p.price)}</span>
                </div>
                {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
              </div>
              <AddToCart product={p} />
            </Reveal>
          ))}
        </ul>
        {more}
      </section>
    );
  }

  if (variant === "editorial") {
    return (
      <section className="mx-auto max-w-6xl space-y-16 px-4 py-20">
        <SectionTitle eyebrow={isShop ? "Sélection" : "Signatures"} title={title} />
        {products.map((p, i) => (
          <Reveal key={p.id} as="article" className="grid items-center gap-8 md:grid-cols-2">
            <div className={cn("relative overflow-hidden rounded-[2rem] bg-muted", i % 2 && "md:order-2")}>
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              )}
              <AddToCart product={p} className="absolute bottom-4 right-4" />
            </div>
            <div>
              <p className="font-display text-5xl text-primary/30">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-display text-3xl font-semibold">{p.name}</h3>
              {p.description && <p className="mt-3 text-muted-foreground">{p.description}</p>}
              <p className="mt-4 font-mono text-lg font-semibold text-primary">{formatXAF(p.price)}</p>
            </div>
          </Reveal>
        ))}
        {more}
      </section>
    );
  }

  const grid =
    variant === "mosaic"
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[260px]"
      : variant === "grid"
        ? "grid grid-cols-2 gap-4 lg:grid-cols-4"
        : "-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4";
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <SectionTitle eyebrow={isShop ? "Sélection" : "Signatures"} title={title} />
      <div className={cn("mt-10", grid)}>
        {products.map((p, i) => (
          <Reveal
            key={p.id}
            as="article"
            index={i}
            className={cn(
              "stay-lift group",
              variant === "carousel" && "w-[78%] shrink-0 snap-start sm:w-auto",
              variant === "mosaic" && i === 0 && "sm:col-span-2 lg:row-span-2"
            )}
          >
            <div className={cn("relative overflow-hidden rounded-3xl bg-muted", variant === "mosaic" ? "h-full min-h-56" : variant === "grid" ? "aspect-square" : "aspect-[4/5]")}>
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              )}
              <AddToCart product={p} className="absolute bottom-4 right-4" />
              {variant === "mosaic" && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pr-16 text-white">
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  <p className="font-mono text-sm">{formatXAF(p.price)}</p>
                </div>
              )}
            </div>
            {variant !== "mosaic" && (
              <>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className={cn("font-display font-semibold", variant === "grid" ? "text-base" : "text-xl")}>{p.name}</h3>
                  <span className="shrink-0 font-mono text-sm font-semibold text-primary">{formatXAF(p.price)}</span>
                </div>
                {p.description && variant !== "grid" && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
              </>
            )}
          </Reveal>
        ))}
      </div>
      {more}
    </section>
  );
}

function AboutSection({ site, centered }: { site: SiteConfig; centered?: boolean }) {
  const withImage = site.aboutImageUrl && !centered;
  return (
    <section id="maison" className="scroll-mt-20 bg-muted/60">
      <div className={cn("mx-auto max-w-6xl px-4 py-20", withImage && "grid items-center gap-10 md:grid-cols-2 md:gap-16")}>
        {withImage && (
          <Reveal className="md:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.aboutImageUrl} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-3xl object-cover" />
          </Reveal>
        )}
        <Reveal className={withImage ? "" : "mx-auto max-w-2xl text-center"}>
          <SectionTitle eyebrow="La maison" title={site.aboutTitle || "Notre histoire"} align={withImage ? "left" : "center"} />
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{site.aboutText}</p>
        </Reveal>
      </div>
    </section>
  );
}

function GallerySection({ images }: { images: string[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <SectionTitle eyebrow="Ambiance" title="Un aperçu de chez nous" />
      <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4">
        {images.map((src, i) => (
          <Reveal key={i} index={i} className={cn("overflow-hidden rounded-2xl", i % 5 === 0 && "col-span-2 row-span-2")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 hover:scale-105" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function InfosSection({ site, name, address, phone }: { site: SiteConfig; name: string; address?: string | null; phone?: string | null }) {
  return (
    <section id="infos" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <SectionTitle eyebrow="Nous rendre visite" title="Horaires & accès" />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {site.sections.hours && (
          <Reveal className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
              <Clock className="size-5 text-primary" /> Horaires
            </h3>
            <HoursTable hours={site.hours} />
          </Reveal>
        )}
        {site.sections.location && (address || site.mapsUrl || phone) && (
          <Reveal index={1} className={cn("flex flex-col overflow-hidden rounded-3xl border border-border bg-card", !site.sections.hours && "md:col-span-2")}>
            {address && (
              // Carte intégrée à partir de l'adresse (pas de clé d'API).
              // CSP : frame-src www.google.com (next.config.ts).
              <iframe
                title={`Plan d'accès — ${name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${name}, ${address}`)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="pointer-events-auto h-64 w-full border-0 sm:h-80"
              />
            )}
            <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <MapPin className="size-5 text-primary" /> Adresse
              </h3>
              {address && <p className="text-lg">{address}</p>}
              <div className="mt-auto flex flex-wrap gap-3">
                {(site.mapsUrl || address) && (
                  <a
                    href={site.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
                  >
                    <MapPin className="size-4" /> Itinéraire
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 font-semibold">
                    <Phone className="size-4" /> {phone}
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "center" | "left" }) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
    </Reveal>
  );
}

// Calculé après montage : l'heure du serveur ≠ celle du visiteur.
function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}

function OpenBadge({ hours, subtle }: { hours: SiteHours[]; subtle?: boolean }) {
  const now = useNow();
  if (!now) return null;
  const state = openNow(hours, now);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur",
        subtle ? "border border-border bg-card" : "bg-black/40 text-white"
      )}
    >
      <span className={`size-2 rounded-full ${state.open ? "animate-pulse bg-emerald-400" : "bg-muted-foreground"}`} />
      {state.open ? state.label : `Fermé · ${state.label.toLowerCase()}`}
    </span>
  );
}

function HoursTable({ hours }: { hours: SiteHours[] }) {
  const now = useNow();
  const today = now ? (now.getDay() + 6) % 7 : -1;
  return (
    <dl className="mt-5 divide-y divide-border">
      {hours.map((h) => (
        <div key={h.day} className={`flex justify-between py-2.5 ${h.day === today ? "font-semibold text-primary" : ""}`}>
          <dt>{DAYS[h.day]}</dt>
          <dd className="font-mono text-sm">{h.open ? `${h.from} – ${h.to}` : "Fermé"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SiteFooter() {
  const tenant = useTenant();
  const site = siteOf(tenant);
  const info = restaurantInfo(tenant);
  const wa = whatsappLink(site.whatsapp);
  const socials = [
    { href: site.instagramUrl, label: "Instagram" },
    { href: site.facebookUrl, label: "Facebook" },
    { href: site.tiktokUrl, label: "TikTok" },
    { href: wa ?? "", label: "WhatsApp" },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="font-display text-3xl font-semibold">{tenant.name}</p>
          {info.address && <p className="text-muted-foreground">{info.address}</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {info.phone && (
              <a href={`tel:${info.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Phone className="size-4" /> {info.phone}
              </a>
            )}
            {site.email && (
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Mail className="size-4" /> {site.email}
              </a>
            )}
          </div>
        </div>
        {socials.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">Commande en ligne propulsée par GiyaX</p>
    </footer>
  );
}
