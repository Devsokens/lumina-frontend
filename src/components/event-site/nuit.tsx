"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { RichText } from "@/components/shared/rich-text";
import { TicketBox } from "@/components/event-site/ticket-box";
import { formatPrice, instagramLink, splitHeadline, waLink, type SiteData, type SiteEvent } from "@/components/event-site/site-data";
import {
  FaqList,
  GiyaxCredit,
  ICONS,
  Icon,
  LOGO_ROLE,
  Lightbox,
  OrgMark,
  PROGRAM_PLACEHOLDER,
  Photo,
  eventHref,
  homeHref,
  EventMap,
  mapsLink,
  shareOnWhatsApp,
} from "@/components/event-site/parts";
import { cn } from "@/lib/utils";

// Modèle « Nuit » (refonte Claude Design 2026-11, écrans 15 et 16) : fond
// sombre chaud, titres Bricolage Grotesque, accent vif. Mise en page en
// requêtes de conteneur (@3xl, @5xl) : l'aperçu mobile de l'éditeur montre
// la vraie version mobile.

const WRAP = "mx-auto w-full max-w-[1240px] px-5 @3xl:px-8";
const KICKER = "font-(family-name:--s-font-mono) text-[13px] tracking-[0.14em] text-(--s-accent)";
const H2 = "m-0 font-(family-name:--s-font-display) text-[36px] font-extrabold leading-none tracking-[-0.03em] @3xl:text-[56px]";
const BTN = "flex h-[52px] items-center justify-center gap-2.5 rounded-full px-[26px] font-semibold transition-opacity hover:opacity-90 @3xl:h-[54px]";
const BTN_ACCENT = `${BTN} bg-(--s-accent) text-(--s-accent-ink)`;
const BTN_GHOST = `${BTN} border border-(--s-line3) text-(--s-text) font-medium`;

function NuitHeader({ site, home, cta, ctaHref }: { site: SiteData; home: boolean; cta: string; ctaHref: string }) {
  const link = (hash: string) => (home ? hash : homeHref(site, hash));
  return (
    <header data-section="header" className="sticky top-0 z-30 border-b border-(--s-line) bg-(--s-header) backdrop-blur-[10px]">
      <div className={cn(WRAP, "flex items-center justify-between gap-5 py-3.5 @3xl:py-[18px]")}>
        <Link href={homeHref(site)} className="flex min-w-0 items-center gap-3">
          <OrgMark site={site} className="size-[38px] bg-(--s-accent) font-(family-name:--s-font-display) text-base font-extrabold text-(--s-accent-ink)" />
          <span className="flex min-w-0 flex-col leading-[1.15]">
            <span data-edit="orgName" className="truncate font-(family-name:--s-font-display) text-lg font-bold">{site.name}</span>
            <span data-edit="orgTagline" className="truncate text-xs text-(--s-muted)">{site.tagline}</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden gap-8 text-sm @4xl:flex">
          {[
            ["#evenements", "Événements"],
            ["#apropos", "À propos"],
            ["#souvenirs", "Souvenirs"],
            ["#faq", "FAQ"],
          ].map(([h, l]) => (
            <a key={h} href={link(h)} className="text-(--s-soft) transition-colors hover:text-(--s-text)">
              {l}
            </a>
          ))}
        </nav>
        <a href={ctaHref} className="flex h-10 shrink-0 items-center rounded-full bg-(--s-accent) px-4 text-sm font-semibold text-(--s-accent-ink) @3xl:h-11 @3xl:px-5">
          {cta}
        </a>
      </div>
    </header>
  );
}

function DateBadge({ e, size = "lg" }: { e: SiteEvent; size?: "lg" | "md" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-2xl bg-(--s-accent) leading-none text-(--s-accent-ink)",
        size === "lg" ? "h-[82px] w-[76px]" : "h-[60px] w-14 rounded-xl"
      )}
    >
      <span className={cn("font-(family-name:--s-font-display) font-extrabold", size === "lg" ? "text-[34px]" : "text-[26px]")}>{e.day}</span>
      <span className={cn("font-bold tracking-[0.1em]", size === "lg" ? "mt-1 text-xs" : "mt-0.5 text-[11px]")}>{e.month}</span>
    </span>
  );
}

function NuitFooterLine({ site }: { site: SiteData }) {
  const legal = [site.legal.nif && `NIF ${site.legal.nif}`, site.legal.rccm && `RCCM ${site.legal.rccm}`].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-wrap justify-between gap-3 text-[13px] text-(--s-faint)">
      <span>
        © {new Date().getFullYear()} {site.name}
        {legal && ` · ${legal}`}
      </span>
      <GiyaxCredit />
    </div>
  );
}

function EventCard({ site, e }: { site: SiteData; e: SiteEvent }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-(--s-line) bg-(--s-surface) @4xl:flex-row">
      <Link href={eventHref(site, e)} className="relative block min-h-[240px] bg-(--s-surface2) @4xl:min-h-[380px] @4xl:flex-[1_1_520px]">
        <Photo src={e.imageUrl} alt={`Affiche : ${e.title}`} className="absolute inset-0" />
      </Link>
      <div className="flex flex-col gap-[22px] p-6 @3xl:p-11 @4xl:flex-[1_1_420px]">
        <div className="flex items-center gap-[18px]">
          <DateBadge e={e} />
          <div className="flex flex-col gap-1 text-sm text-(--s-body)">
            <span>
              {e.weekday} · {e.timeRange}
            </span>
            {(e.venue || e.place) && <span>{e.venue || e.place}</span>}
          </div>
        </div>
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-(--s-muted)">
          {e.category}
          {e.certified && " · Formation certifiante"}
        </span>
        <h3 className="m-0 font-(family-name:--s-font-display) text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] @3xl:text-[40px]">{e.title}</h3>
        {e.summary && <p className="m-0 text-base leading-[1.65] text-(--s-body)">{e.summary}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-(--s-line) pt-[22px]">
          {e.minPrice !== null && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-(--s-muted)">{e.minPrice === 0 ? "Entrée" : "Pass à partir de"}</span>
              <span className="font-(family-name:--s-font-display) text-[26px] font-bold">{formatPrice(e.minPrice)}</span>
            </div>
          )}
          <Link href={eventHref(site, e)} className={BTN_ACCENT}>
            Voir et réserver
          </Link>
        </div>
      </div>
    </article>
  );
}

export function NuitHome({ site, preview }: { site: SiteData; preview?: boolean }) {
  const [lead, word, tail] = splitHeadline(site.headline, site.highlight, true);
  const [album, setAlbum] = useState<{ title: string; photos: string[] } | null>(null);
  const next = site.events[0];
  const wa = waLink(site.contact.whatsapp, `Bonjour ${site.name}, `);
  const insta = instagramLink(site.contact.instagram);
  const heroPhoto2 = site.gallery[0] ?? next?.imageUrl ?? null;
  const showAbout = site.visible.about && (preview || !!site.aboutText || site.cover || site.gallery.length > 1);
  const showGallery = site.visible.gallery && (preview || site.albums.length > 0 || site.gallery.length > 0);

  return (
    <>
      <NuitHeader site={site} home cta="Réserver un billet" ctaHref="#evenements" />

      <section id="top" data-section="hero" className="relative overflow-hidden">
        <div aria-hidden className="absolute -right-[180px] -top-[120px] size-[720px] rounded-full bg-[radial-gradient(circle,var(--s-accent-soft),transparent_65%)]" />
        <div className={cn(WRAP, "relative flex flex-col gap-14 pb-16 pt-14 @3xl:pb-[88px] @3xl:pt-24 @5xl:flex-row @5xl:items-center")}>
          <div className="flex min-w-0 flex-col gap-7 @5xl:flex-[999_1_520px]">
            <span data-edit="heroBadge" className="flex h-8 items-center gap-2 self-start rounded-full border border-(--s-line2) px-3.5 text-[13px] text-(--s-soft)">
              <span className="size-[7px] rounded-full bg-[#3DD68C]" />
              {site.badge}
            </span>
            <h1 data-edit="heroHeadline" className="m-0 font-(family-name:--s-font-display) text-[calc(52px*var(--s-h1,1))] font-extrabold leading-[0.95] tracking-[-0.035em] @xl:text-[calc(64px*var(--s-h1,1))] @5xl:text-[calc(88px*var(--s-h1,1))]">
              {lead}
              <span className="text-(--s-accent)">{word}</span>
              {tail}
            </h1>
            {site.subheadline && <p data-edit="heroSubheadline" className="m-0 max-w-[560px] text-[17px] leading-[1.6] text-(--s-body) @3xl:text-[19px]">{site.subheadline}</p>}
            <div className="flex flex-wrap gap-3">
              <a href="#evenements" data-edit="heroCtaText" className={BTN_ACCENT}>
                {site.cta}
                <Icon d={ICONS.arrow} />
              </a>
              <a href="#apropos" className={BTN_GHOST}>
                Qui sommes-nous
              </a>
            </div>
          </div>
          <div className="relative h-[380px] w-full max-w-[460px] self-center @3xl:h-[480px] @5xl:flex-[1_1_380px]">
            <Photo
              src={site.cover}
              label="Photo de l'organisation"
              preview={preview}
              className="absolute left-0 top-0 h-[78%] w-[66%] -rotate-2 rounded-[26px] border border-(--s-line2) bg-(--s-surface2)"
            />
            <Photo
              src={heroPhoto2}
              label="Photo d'un événement"
              preview={preview}
              className="absolute right-0 top-[70px] h-[52%] w-[46%] rotate-3 rounded-[22px] border border-(--s-line2) bg-(--s-surface3) shadow-[0_30px_60px_rgba(0,0,0,.45)]"
            />
            {next && (
              <Link
                href={eventHref(site, next)}
                className="absolute bottom-0 left-6 flex max-w-[calc(100%-24px)] items-center gap-3 rounded-[18px] bg-[#F4EEE4] py-2.5 pl-2.5 pr-4 text-[#0E0C0A] shadow-[0_20px_40px_rgba(0,0,0,.4)]"
              >
                <Photo src={next.imageUrl} className="size-[54px] shrink-0 rounded-xl bg-[#0B1B1C]" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#8A5A0B]">
                    Prochain · {next.day} {next.month.toLowerCase()}.
                  </span>
                  <span className="truncate text-sm font-bold">{next.title} →</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="evenements" data-section="events" className={cn(WRAP, "flex scroll-mt-20 flex-col gap-10 pb-10 pt-16 @3xl:pt-[104px]", !site.visible.events && "hidden")}>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-3">
            <span className={KICKER}>BILLETTERIE</span>
            <h2 className={H2}>Prochains événements</h2>
          </div>
          <span className="text-[15px] text-(--s-muted)">
            {site.events.length === 0 ? "Aucun événement en vente" : `${site.events.length} événement${site.events.length > 1 ? "s" : ""} à venir`}
          </span>
        </div>
        {site.events.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-[28px] border border-dashed border-(--s-line3) p-8 @3xl:p-11">
            <span className="font-(family-name:--s-font-display) text-2xl font-bold">De nouvelles dates arrivent bientôt.</span>
            <span className="text-base text-(--s-body)">Revenez prochainement{wa ? " ou écrivez-nous pour être prévenu." : "."}</span>
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className={BTN_GHOST}>
                Être prévenu sur WhatsApp
              </a>
            )}
          </div>
        ) : (
          site.events.map((e) => <EventCard key={e.id} site={site} e={e} />)
        )}
      </section>

      {showAbout && (
        <section id="apropos" data-section="about" className={cn(WRAP, "flex scroll-mt-20 flex-col gap-12 py-16 @3xl:py-[104px] @5xl:flex-row @5xl:items-center @5xl:gap-16")}>
          <div className="grid grid-cols-2 gap-3.5 @5xl:flex-[1_1_420px]">
            <Photo src={site.cover} label="Photo de l'équipe" preview={preview} className="row-span-2 h-[300px] rounded-[22px] bg-(--s-surface2) @3xl:h-[440px]" />
            <Photo src={site.gallery[1] ?? null} label="Photo" preview={preview} className="h-[143px] rounded-[22px] bg-(--s-surface3) @3xl:h-[213px]" />
            <div className="flex h-[143px] flex-col justify-end rounded-[22px] bg-(--s-accent) p-4 text-(--s-accent-ink) @3xl:h-[213px] @3xl:p-6">
              <span className="font-(family-name:--s-font-display) text-base font-extrabold leading-[1.15] @3xl:text-xl">Billet QR disponible dès le paiement.</span>
            </div>
          </div>
          <div className="flex flex-col gap-[22px] @5xl:flex-[1_1_440px]">
            <span className={KICKER}>À PROPOS</span>
            <h2 data-edit="aboutTitle" className="m-0 font-(family-name:--s-font-display) text-[36px] font-extrabold leading-[1.02] tracking-[-0.03em] @3xl:text-[52px]">{site.aboutTitle}</h2>
            {site.aboutText ? (
              <div data-edit="aboutText"><RichText text={site.aboutText} className="text-[17px] leading-[1.7] text-(--s-body)" /></div>
            ) : (
              preview && <p data-edit="aboutText" className="m-0 text-[17px] leading-[1.7] text-(--s-body)">[Présentation de l&apos;organisation : votre histoire, votre mission, les événements que vous organisez et ce qui vous distingue.]</p>
            )}
            {site.categories.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {site.categories.map((c) => (
                  <span key={c} className="flex h-9 items-center rounded-full border border-(--s-line2) px-3.5 text-sm">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {showGallery && (
        <section id="souvenirs" data-section="gallery" className={cn(WRAP, "flex scroll-mt-20 flex-col gap-9 pb-16 pt-10 @3xl:pb-[104px]")}>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-3">
              <span className={KICKER}>SOUVENIRS</span>
              <h2 className={H2}>Revivez nos événements</h2>
              <span className="text-[15px] text-(--s-muted)">{site.albums.length ? "Un album par événement, publié une fois l'événement terminé." : "Quelques images de nos derniers événements."}</span>
            </div>
            {insta && (
              <a href={insta} target="_blank" rel="noreferrer" className="text-[15px] font-medium text-(--s-accent)">
                Plus de photos →
              </a>
            )}
          </div>
          {site.albums.length > 0 ? (
            <div className="grid grid-cols-2 gap-[18px] @3xl:grid-cols-3">
              {site.albums.slice(0, 5).map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => !preview && setAlbum({ title: a.title, photos: a.photos })}
                  className={cn(
                    "relative flex flex-col justify-end overflow-hidden rounded-[24px] bg-(--s-surface2) text-left",
                    i === 0 ? "col-span-2 min-h-[320px] p-[26px] @3xl:col-span-1 @3xl:row-span-2 @3xl:min-h-[560px]" : "min-h-[220px] p-[22px] @3xl:min-h-[271px]"
                  )}
                >
                  {/* Grande tuile : photo entière ; petites tuiles : vignette. */}
                  <Photo src={i === 0 ? a.photos[0] : (a.thumbs[0] ?? a.photos[0])} className="absolute inset-0" />
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,.75))]" />
                  <span className="relative flex flex-col gap-1.5 text-white">
                    {i === 0 && (
                      <span className="flex h-7 items-center self-start rounded-full bg-(--s-accent) px-3 text-xs font-bold text-(--s-accent-ink)">
                        {a.photos.length} photo{a.photos.length > 1 ? "s" : ""}
                      </span>
                    )}
                    <span className={cn("font-(family-name:--s-font-display) font-extrabold", i === 0 ? "text-[28px]" : "text-xl")}>{a.title}</span>
                    <span className="flex justify-between gap-3 text-[13px] text-white/75">
                      <span>{[a.date, i === 0 ? a.place : ""].filter(Boolean).join(" · ")}</span>
                      {i > 0 && <span>{a.photos.length} photos</span>}
                    </span>
                  </span>
                </button>
              ))}
              {insta && site.albums.length < 5 && (
                <a
                  href={insta}
                  target="_blank"
                  rel="noreferrer"
                  className="col-span-2 flex min-h-[160px] items-center justify-center gap-3 rounded-[24px] border border-dashed border-(--s-line3) font-(family-name:--s-font-display) text-[22px] font-bold @3xl:min-h-[271px]"
                >
                  Plus de photos <span className="text-(--s-accent)">→</span>
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[18px] @3xl:grid-cols-3">
              {(site.gallery.length ? site.gallery.slice(0, 5) : [null, null, null]).map((src, i) => (
                <Photo
                  key={i}
                  src={src}
                  label={i === 0 ? "Album d'un événement passé" : "Photo"}
                  preview={preview}
                  className={cn(
                    "rounded-[24px] bg-(--s-surface2)",
                    i === 0 ? "col-span-2 min-h-[300px] @3xl:col-span-1 @3xl:row-span-2 @3xl:min-h-[560px]" : "min-h-[200px] @3xl:min-h-[271px]"
                  )}
                />
              ))}
            </div>
          )}
          {album && <Lightbox photos={album.photos} title={album.title} onClose={() => setAlbum(null)} />}
        </section>
      )}

      <section id="faq" data-section="faq" className={cn("scroll-mt-20 border-t border-(--s-line) bg-(--s-band)", !site.visible.faq && "hidden")}>
        <div className={cn(WRAP, "flex flex-col gap-10 py-16 @3xl:py-[104px] @5xl:flex-row @5xl:gap-16")}>
          <div className="flex flex-col gap-4 @5xl:flex-[1_1_320px]">
            <span className={KICKER}>QUESTIONS FRÉQUENTES</span>
            <h2 className="m-0 font-(family-name:--s-font-display) text-[36px] font-extrabold leading-none tracking-[-0.03em] @3xl:text-[52px]">Bon à savoir</h2>
            <p className="m-0 text-base leading-[1.6] text-(--s-muted)">
              Une autre question ?{" "}
              {wa ? (
                <a href={wa} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  Écrivez-nous sur WhatsApp.
                </a>
              ) : site.contact.phone ? (
                `Appelez-nous au ${site.contact.phone}.`
              ) : (
                "Contactez l'organisateur."
              )}
            </p>
          </div>
          <div className="flex flex-col @5xl:flex-[2_1_560px]">
            <FaqList
              faqs={site.faqs}
              render={(f, open, toggle) => (
                <div key={f.id} className="border-b border-(--s-line2) py-[22px] @3xl:py-[26px]">
                  <button type="button" aria-expanded={open} onClick={toggle} className="flex w-full justify-between gap-5 text-left font-(family-name:--s-font-display) text-lg font-bold @3xl:text-[22px]">
                    {f.question}
                    <span className="text-(--s-accent)">{open ? "−" : "+"}</span>
                  </button>
                  {open && <p className="m-0 mt-3.5 text-base leading-[1.7] text-(--s-body)">{f.answer}</p>}
                </div>
              )}
            />
          </div>
        </div>
      </section>

      <footer data-section="footer" className="bg-(--s-footer)">
        <div className={cn(WRAP, "flex flex-col gap-14 pb-8 pt-[72px]")}>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <span className="font-(family-name:--s-font-display) text-[40px] font-extrabold leading-none tracking-[-0.03em] @3xl:text-[64px]">
              On se voit au
              <br />
              prochain <span className="text-(--s-accent)">événement.</span>
            </span>
            <a href="#evenements" className={BTN_ACCENT}>
              Voir la billetterie
            </a>
          </div>
          <div className="grid gap-8 border-t border-(--s-line) pt-10 text-sm text-(--s-body) @3xl:grid-cols-3">
            <FooterCol title="Contact">
              {site.contact.address && <span>{site.contact.address}</span>}
              {(site.contact.phone || site.contact.whatsapp) && <span>{[site.contact.phone, site.contact.whatsapp && "WhatsApp"].filter(Boolean).join(" · ")}</span>}
              {site.contact.email && <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>}
              {!site.contact.address && !site.contact.phone && !site.contact.email && <span>{preview ? "[Adresse · Téléphone · E-mail]" : site.name}</span>}
            </FooterCol>
            {(insta || site.contact.facebook || wa || preview) && (
              <FooterCol title="Suivez-nous">
                {insta && (
                  <a href={insta} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                )}
                {site.contact.facebook && (
                  <a href={site.contact.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                )}
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                )}
                {!insta && !site.contact.facebook && !wa && <span>[Instagram · Facebook]</span>}
              </FooterCol>
            )}
            <FooterCol title="Paiement">
              <span>Mobile Money · carte bancaire</span>
              <span>Billet QR envoyé dès le paiement</span>
            </FooterCol>
          </div>
          <NuitFooterLine site={site} />
        </div>
      </footer>
    </>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-semibold text-(--s-text)">{title}</span>
      {children}
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className={KICKER}>{kicker}</span>
      <h2 className="m-0 font-(family-name:--s-font-display) text-[32px] font-extrabold leading-none tracking-[-0.03em] @3xl:text-[44px]">
        {title}
      </h2>
    </div>
  );
}

export function NuitEvent({ site, event: e, preview }: { site: SiteData; event: SiteEvent; preview?: boolean }) {
  const [photo, setPhoto] = useState<number | null>(null);
  const maps = mapsLink(e);
  const rest = e.description.trim();
  return (
    <>
      <NuitHeader site={site} home={false} cta="Réserver" ctaHref="#billets" />

      <section className="relative overflow-hidden">
        {e.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.imageUrl} alt="" aria-hidden className="absolute -inset-10 size-[calc(100%+80px)] object-cover opacity-45 blur-[28px] saturate-[1.2]" />
        )}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--s-bg)_55%,transparent),var(--s-bg))]" />
        <div className={cn(WRAP, "relative flex flex-col gap-9 pb-16 pt-8 @3xl:pt-10")}>
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 text-sm text-(--s-muted)">
            <Link href={homeHref(site)} className="text-(--s-soft)">
              Accueil
            </Link>
            <span aria-hidden>/</span>
            <Link href={homeHref(site, "#evenements")} className="text-(--s-soft)">
              Événements
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-(--s-text)">{e.title}</span>
          </nav>
          <div className="flex flex-col gap-12 @5xl:flex-row @5xl:items-end">
            <div className="flex min-w-0 flex-col gap-[22px] @5xl:flex-[999_1_560px]">
              <div className="flex flex-wrap gap-2">
                <span className="flex h-[30px] items-center rounded-full border border-(--s-line3) px-3 text-[13px]">{e.category}</span>
                {e.certified && <span className="flex h-[30px] items-center rounded-full bg-(--s-accent) px-3 text-[13px] font-bold text-(--s-accent-ink)">Attestation certifiée</span>}
              </div>
              <h1 className="m-0 font-(family-name:--s-font-display) text-[44px] font-extrabold leading-[0.95] tracking-[-0.035em] @xl:text-[56px] @5xl:text-[80px]">{e.title}</h1>
              <div className="flex flex-wrap gap-3.5">
                <div className="flex items-center gap-3.5 rounded-[18px] border border-(--s-line2) bg-(--s-accent-tint) py-3 pl-3 pr-[18px]">
                  <DateBadge e={e} size="md" />
                  <span className="flex flex-col gap-0.5 text-sm">
                    <span className="font-semibold">{e.dateLong}</span>
                    <span className="text-(--s-muted)">{e.timeRange}</span>
                  </span>
                </div>
                {(e.venue || e.place) && (
                  <div className="flex items-center gap-3.5 rounded-[18px] border border-(--s-line2) px-[18px] py-3">
                    <Icon d={ICONS.pin} />
                    <span className="flex flex-col gap-0.5 text-sm">
                      <span className="font-semibold">{e.venue || e.place}</span>
                      {e.venue && e.place && <span className="text-(--s-muted)">{e.place}</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {e.imageUrl && (
              <div className="h-[260px] w-full max-w-[420px] rotate-2 overflow-hidden rounded-[24px] border border-(--s-line2) shadow-[0_30px_80px_rgba(0,0,0,.5)] @3xl:h-[300px] @5xl:flex-[1_1_340px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.imageUrl} alt={`Affiche : ${e.title}`} className="size-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      <main className={cn(WRAP, "flex flex-col gap-12 pb-20 pt-10 @5xl:flex-row @5xl:items-start @5xl:pb-[104px]")}>
        <div className="order-2 flex min-w-0 flex-col gap-16 @5xl:order-1 @5xl:flex-[999_1_600px] @5xl:gap-[72px]">
          <section className="flex flex-col gap-[18px]">
            <span className={KICKER}>L&apos;ÉVÉNEMENT</span>
            {e.summary && <p className="m-0 font-(family-name:--s-font-display) text-2xl font-bold leading-[1.25] tracking-[-0.02em] @3xl:text-[30px]">{e.summary}</p>}
            {rest && rest !== e.summary && <RichText text={rest} className="text-[17px] leading-[1.8] text-(--s-body)" />}
          </section>

          {(e.program.length > 0 || preview) && (
            <section className="flex flex-col gap-6">
              <SectionHead kicker="PROGRAMME" title="Le déroulé de la journée" />
              <ol className="m-0 flex list-none flex-col border-l border-(--s-line2) p-0 pl-2">
                {(e.program.length ? e.program.map((p) => ({ time: p.time, title: p.title, sub: p.detail ?? "" })) : PROGRAM_PLACEHOLDER).map((p, i) => (
                  <li key={i} className="relative flex flex-col gap-1 pb-[30px] pl-8">
                    <span className={cn("absolute -left-[7px] top-1 size-[13px] rounded-full shadow-[0_0_0_4px_var(--s-bg)]", i === 0 ? "bg-(--s-accent)" : "bg-(--s-line3)")} />
                    {p.time && <span className="font-(family-name:--s-font-mono) text-[13px] text-(--s-accent)">{p.time}</span>}
                    <span className="font-(family-name:--s-font-display) text-[22px] font-bold">{p.title}</span>
                    {p.sub && <span className="text-[15px] text-(--s-muted)">{p.sub}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(e.speakers.length > 0 || preview) && (
            <section className="flex flex-col gap-6">
              <SectionHead kicker="INTERVENANTS" title="Sur scène" />
              <div className="grid grid-cols-2 gap-4 @3xl:grid-cols-4">
                {(e.speakers.length ? e.speakers : [0, 1, 2, 3].map((i) => ({ id: String(i), name: "[Nom]", role: "[Fonction]", photoUrl: null }))).map((sp, i) => (
                  <div key={sp.id} className="flex flex-col gap-3">
                    <Photo src={sp.photoUrl} alt={sp.name} label="Photo" preview={preview} className={cn("aspect-[3/4] rounded-[20px] border border-(--s-line)", i % 2 ? "bg-(--s-surface2)" : "bg-(--s-surface)")} />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-(family-name:--s-font-display) text-lg font-bold">{sp.name}</span>
                      {sp.role && <span className="text-sm text-(--s-muted)">{sp.role}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(e.venue || e.place) && (
            <section className="flex flex-col gap-6">
              <SectionHead kicker="LIEU" title="Comment venir" />
              <div className="flex flex-col overflow-hidden rounded-[24px] border border-(--s-line2) @3xl:flex-row">
                {e.coords ? (
                  <div className="relative min-h-[260px] bg-(--s-surface) @3xl:min-h-[300px] @3xl:flex-[1_1_380px]">
                    <EventMap event={e} className="absolute inset-0 size-full border-0" />
                  </div>
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center bg-(--s-surface) bg-[linear-gradient(var(--s-line)_1px,transparent_1px),linear-gradient(90deg,var(--s-line)_1px,transparent_1px)] bg-[size:34px_34px] @3xl:min-h-[260px] @3xl:flex-[1_1_380px]">
                    <span className="size-[46px] -rotate-45 rounded-[999px_999px_999px_0] bg-(--s-accent) shadow-[0_0_0_10px_var(--s-accent-soft)]" />
                  </div>
                )}
                <div className="flex flex-col gap-2.5 bg-(--s-surface) p-7 @3xl:flex-[1_1_280px]">
                  <span className="font-(family-name:--s-font-display) text-[22px] font-bold leading-[1.2]">{e.venue || e.place}</span>
                  {e.venue && e.place && <span className="text-[15px] text-(--s-muted)">{e.place}</span>}
                  {maps && (
                    <a href={maps} target="_blank" rel="noreferrer" className="mt-auto flex h-12 items-center justify-center rounded-full border border-(--s-line3) text-sm font-semibold">
                      Ouvrir l&apos;itinéraire
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-5">
            <span className={KICKER}>ORGANISÉ PAR</span>
            <div className="flex flex-wrap gap-3.5">
              <OrgCard site={site} />
              {e.partners
                .filter((p) => p.role !== "MAIN_ORGANIZER" || p.name !== site.name)
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-3.5 rounded-[18px] border border-(--s-line) bg-(--s-surface) py-3.5 pl-3.5 pr-[22px]">
                    <span className="flex h-[50px] w-[68px] items-center justify-center overflow-hidden rounded-[10px] bg-[#F4EEE4]">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="size-full object-contain p-1" />
                      ) : (
                        <span className="text-[11px] font-bold text-[#0E0C0A]">{p.name.slice(0, 8)}</span>
                      )}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-[13px] text-(--s-muted)">{LOGO_ROLE[p.role] ?? "Partenaire"}</span>
                    </span>
                  </div>
                ))}
            </div>
          </section>

          {e.album.length > 0 ? (
            <section className="flex flex-col gap-5">
              <SectionHead kicker="SOUVENIRS" title="Photos de l'événement" />
              <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                {e.album.map((src, i) => (
                  <button key={i} type="button" onClick={() => !preview && setPhoto(i)} className="relative h-[150px] overflow-hidden rounded-[18px] bg-(--s-surface)">
                    <Photo src={e.albumThumbs[i] ?? src} className="absolute inset-0" />
                  </button>
                ))}
              </div>
              {photo !== null && <Lightbox photos={e.album} title={e.title} start={photo} onClose={() => setPhoto(null)} />}
            </section>
          ) : (
            preview && (
              <section className="flex flex-col gap-5">
                <SectionHead kicker="SOUVENIRS" title="Photos de l'événement" />
                <div className="relative grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={cn("h-[150px] rounded-[18px]", i % 2 ? "bg-(--s-surface2)" : "bg-(--s-surface)")} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="flex items-center gap-3 rounded-full border border-(--s-line2) bg-(--s-bg) px-5 py-3.5 text-[15px]">
                      <Icon d={ICONS.image} />
                      L&apos;album sera publié après le {e.day} {e.month.toLowerCase()}.
                    </span>
                  </div>
                </div>
              </section>
            )
          )}
        </div>

        <aside id="billets" className="order-1 flex w-full scroll-mt-24 flex-col gap-3.5 @5xl:sticky @5xl:top-[100px] @5xl:order-2 @5xl:max-w-[390px] @5xl:flex-[1_1_340px]">
          <TicketBox event={e.raw} variant="nuit" preview={preview} />
          {e.certified && (
            <div className="flex items-start gap-3 rounded-[20px] border border-(--s-line) bg-(--s-accent-tint) px-5 py-[18px] text-sm leading-normal text-(--s-soft)">
              <Icon d={ICONS.award} className="text-(--s-accent)" />
              Une attestation certifiée est remise à chaque participant présent.
            </div>
          )}
          <button type="button" onClick={() => shareOnWhatsApp(e)} className="flex h-12 items-center justify-center rounded-full border border-(--s-line2) text-sm font-semibold">
            Partager sur WhatsApp
          </button>
        </aside>
      </main>

      <section className="border-t border-(--s-line) bg-(--s-band)">
        <div className={cn(WRAP, "flex flex-wrap items-center justify-between gap-8 py-14 @3xl:py-[72px]")}>
          <div className="flex items-center gap-[18px]">
            <OrgMark site={site} className="size-16 rounded-2xl bg-(--s-accent) font-(family-name:--s-font-display) text-[22px] font-extrabold text-(--s-accent-ink)" />
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-(--s-muted)">Un événement</span>
              <span className="font-(family-name:--s-font-display) text-[26px] font-extrabold tracking-[-0.02em] @3xl:text-[30px]">{site.name}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={homeHref(site, "#apropos")} className={cn(BTN_GHOST, "h-[52px]")}>
              Découvrir l&apos;organisation
            </Link>
            <Link href={homeHref(site, "#evenements")} className={cn(BTN_ACCENT, "h-[52px]")}>
              Autres événements
            </Link>
          </div>
        </div>
      </section>
      <footer className="bg-(--s-footer)">
        <div className={cn(WRAP, "py-8")}>
          <NuitFooterLine site={site} />
        </div>
      </footer>
    </>
  );
}

function OrgCard({ site }: { site: SiteData }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] border border-(--s-line) bg-(--s-surface) py-3.5 pl-3.5 pr-[22px]">
      <OrgMark site={site} className="h-[50px] w-[68px] bg-[#F4EEE4] text-xs font-extrabold tracking-[0.14em] text-[#0E0C0A]" />
      <span className="flex flex-col">
        <span className="font-semibold">{site.name}</span>
        <span className="text-[13px] text-(--s-muted)">Organisateur principal</span>
      </span>
    </div>
  );
}
