"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useProducts } from "@/hooks/useMenu";
import { formatXAF } from "@/lib/format";
import { restaurantInfo } from "@/lib/order-document";
import { DAYS, openNow, siteOf, whatsappLink, type SiteHours } from "@/lib/site";
import { AddToCart } from "@/components/site/add-to-cart";

// Page d'accueil du site restaurant / boutique : contenu et apparence
// réglés dans le back-office (admin/[sector]/site). Rendue aussi dans
// l'aperçu de l'éditeur.
export function SiteHome() {
  const tenant = useTenant();
  const site = siteOf(tenant);
  const info = restaurantInfo(tenant);
  const description = (tenant.config as { description?: string }).description;
  const { data: products } = useProducts(tenant.slug);
  const menu = `/${tenant.slug}/menu`;
  const isShop = tenant.sector === "SHOP";
  const wa = whatsappLink(site.whatsapp);

  const featured = site.featuredProductIds.length
    ? site.featuredProductIds
        .map((id) => products?.find((p) => p.id === id))
        .filter((p) => p !== undefined)
    : (products ?? []).filter((p) => p.imageUrl && p.isAvailable).slice(0, 4);

  const hasInfos = site.sections.hours || (site.sections.location && (info.address || site.mapsUrl));

  return (
    <main className="flex-1">
      {/* Couverture */}
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden">
        {site.coverUrl ? (
          // Image tenant (https ou data URL vérifiée) — LUMINA_Audit_Menaces_Complet.md 13.2.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.coverUrl} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 -z-20"
            style={{
              background:
                "radial-gradient(120% 90% at 20% 10%, color-mix(in oklab, var(--site-accent) 55%, transparent), transparent 60%), #14110d",
            }}
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-32 text-white sm:pb-20">
          <div className="max-w-2xl space-y-5">
            {site.sections.hours && <OpenBadge hours={site.hours} />}
            {site.eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">{site.eyebrow}</p>
            )}
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
              {tenant.name}
            </h1>
            {(site.tagline || description) && (
              <p className="max-w-xl text-lg text-white/85 sm:text-xl">{site.tagline || description}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={menu}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                {isShop ? "Voir le catalogue" : "Découvrir la carte"}
                <ArrowRight className="size-5" />
              </Link>
              {(wa || info.phone) && (
                <a
                  href={wa ?? `tel:${info.phone}`}
                  target={wa ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  {wa ? <MessageCircle className="size-5" /> : <Phone className="size-5" />}
                  {isShop ? "Nous contacter" : "Réserver une table"}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Plats vedettes */}
      {site.sections.featured && featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle eyebrow={isShop ? "Sélection" : "Signatures"} title={isShop ? "Nos coups de cœur" : "Les incontournables du chef"} />
          <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {featured.map((p) => (
              <article key={p.id} className="group w-[78%] shrink-0 snap-start sm:w-auto">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <AddToCart product={p} className="absolute bottom-4 right-4" />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <span className="shrink-0 font-mono text-sm font-semibold text-primary">{formatXAF(p.price)}</span>
                </div>
                {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={menu} className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
              {isShop ? "Tout le catalogue" : "Voir toute la carte"} <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      {/* La maison */}
      {site.sections.about && site.aboutText && (
        <section id="maison" className="scroll-mt-20 bg-muted/60">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:gap-16">
            {site.aboutImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.aboutImageUrl} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-3xl object-cover md:order-2" />
            )}
            <div className={site.aboutImageUrl ? "" : "md:col-span-2 md:mx-auto md:max-w-2xl md:text-center"}>
              <SectionTitle eyebrow="La maison" title={site.aboutTitle || "Notre histoire"} align="left" />
              <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{site.aboutText}</p>
            </div>
          </div>
        </section>
      )}

      {/* Galerie */}
      {site.sections.gallery && site.gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle eyebrow="Ambiance" title="Un aperçu de chez nous" />
          <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4">
            {site.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className={`size-full rounded-2xl object-cover ${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Horaires & accès */}
      {hasInfos && (
        <section id="infos" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20">
          <SectionTitle eyebrow="Nous rendre visite" title="Horaires & accès" />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {site.sections.hours && (
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                  <Clock className="size-5 text-primary" /> Horaires
                </h3>
                <HoursTable hours={site.hours} />
              </div>
            )}
            {site.sections.location && (info.address || site.mapsUrl || info.phone) && (
              <div className={`flex flex-col overflow-hidden rounded-3xl border border-border bg-card ${site.sections.hours ? "" : "md:col-span-2"}`}>
                {info.address && (
                  // Carte intégrée à partir de l'adresse (pas de clé d'API).
                  // CSP : frame-src www.google.com (next.config.ts).
                  <iframe
                    title={`Plan d'accès — ${tenant.name}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${tenant.name}, ${info.address}`)}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="pointer-events-auto h-64 w-full border-0 sm:h-80"
                  />
                )}
                <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
                <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                  <MapPin className="size-5 text-primary" /> Adresse
                </h3>
                {info.address && <p className="text-lg">{info.address}</p>}
                <div className="mt-auto flex flex-wrap gap-3">
                  {(site.mapsUrl || info.address) && (
                    <a
                      href={site.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${tenant.name}, ${info.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
                    >
                      <MapPin className="size-4" /> Itinéraire
                    </a>
                  )}
                  {info.phone && (
                    <a href={`tel:${info.phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 font-semibold">
                      <Phone className="size-4" /> {info.phone}
                    </a>
                  )}
                </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

function SectionTitle({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
    </div>
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

function OpenBadge({ hours }: { hours: SiteHours[] }) {
  const now = useNow();
  if (!now) return null;
  const state = openNow(hours, now);
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
      <span className={`size-2 rounded-full ${state.open ? "animate-pulse bg-emerald-400" : "bg-white/50"}`} />
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
      <p className="pb-8 text-center text-xs text-muted-foreground">
        Commande en ligne propulsée par GiyaX
      </p>
    </footer>
  );
}
