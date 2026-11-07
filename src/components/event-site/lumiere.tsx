"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { RichText } from "@/components/shared/rich-text";
import { TicketBox } from "@/components/event-site/ticket-box";
import { formatPrice, instagramLink, splitHeadline, waLink, type SiteData, type SiteEvent } from "@/components/event-site/site-data";
import {
  FaqList,
  ICONS,
  Icon,
  LOGO_ROLE,
  Lightbox,
  OrgMark,
  PROGRAM_PLACEHOLDER,
  Photo,
  copyLink,
  eventHref,
  homeHref,
  mapsLink,
  shareOnWhatsApp,
} from "@/components/event-site/parts";
import { cn } from "@/lib/utils";

// Modèle « Lumière » (refonte Claude Design 2026-11, écrans 17 et 18) : fond
// blanc, Manrope, grande couverture sombre, cartes arrondies. Requêtes de
// conteneur (@3xl, @5xl) comme le modèle Nuit.

const WRAP = "mx-auto w-full max-w-[1280px] px-5 @3xl:px-10";
const KICKER = "text-sm font-bold text-(--s-accent)";
const H2 = "m-0 font-(family-name:--s-font-display) text-[36px] font-extrabold leading-[1.04] tracking-[-0.04em] @3xl:text-[52px]";
const PILL = "flex h-12 items-center justify-center rounded-full px-[22px] text-sm font-bold transition-opacity hover:opacity-90";
const DARK_BTN = `${PILL} bg-(--s-dark) text-(--s-dark-ink)`;
const LINE_BTN = `${PILL} border border-(--s-line3) bg-(--s-surface)`;

const NAV: [string, string][] = [
  ["#apropos", "L'organisation"],
  ["#evenements", "Événements"],
  ["#souvenirs", "Souvenirs"],
  ["#contact", "Contact"],
];

function Brand({ site, light }: { site: SiteData; light?: boolean }) {
  return (
    <Link href={homeHref(site)} className="flex min-w-0 items-center gap-2.5">
      <OrgMark site={site} rounded className={cn("size-9 text-[13px] font-extrabold", light ? "bg-white text-[#0F1115]" : "bg-(--s-dark) text-(--s-dark-ink)")} />
      <span data-edit="orgName" className="truncate text-lg font-bold tracking-[-0.01em]">{site.name}</span>
    </Link>
  );
}

function FooterLine({ site }: { site: SiteData }) {
  const legal = [site.legal.nif && `NIF ${site.legal.nif}`, site.legal.rccm && `RCCM ${site.legal.rccm}`].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-wrap justify-between gap-3 text-[13px] text-(--s-faint)">
      <span>
        © {new Date().getFullYear()} {site.name}
        {legal && ` · ${legal}`}
      </span>
      <span>Billetterie propulsée par GiyaX</span>
    </div>
  );
}

function DateTile({ e }: { e: SiteEvent }) {
  return (
    <span className="flex h-[62px] w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-(--s-chip) leading-none">
      <span className="text-2xl font-extrabold">{e.day}</span>
      <span className="mt-1 text-[11px] font-bold tracking-[0.08em] text-(--s-muted)">{e.month}.</span>
    </span>
  );
}

export function LumiereHome({ site, preview }: { site: SiteData; preview?: boolean }) {
  const next = site.events[0];
  const wa = waLink(site.contact.whatsapp);
  const insta = instagramLink(site.contact.instagram);
  const paragraphs = site.aboutText.split(/\n\s*\n/).filter(Boolean);
  const activities = site.categories.slice(0, 3).map((c) => {
    const list = site.events.filter((e) => e.category === c);
    return { label: c, photo: list.find((e) => e.imageUrl)?.imageUrl ?? null, count: list.length };
  });
  const showActivities = site.visible.about && (activities.length > 0 || preview);
  const albums = site.albums.length
    ? site.albums.slice(0, 6).map((a) => ({ ...a, cover: a.photos }))
    : Array.from({ length: Math.ceil(Math.min(site.gallery.length, 9) / 3) }, (_, i) => ({
        id: String(i),
        title: "",
        date: "",
        place: "",
        photos: site.gallery.slice(i * 3, i * 3 + 3),
        cover: site.gallery.slice(i * 3, i * 3 + 3),
      }));
  const showGallery = site.visible.gallery && (albums.length > 0 || preview);
  const [open, setOpen] = useState<{ title: string; photos: string[] } | null>(null);
  const [lead, word, tail] = splitHeadline(site.headline, site.highlight, false);

  return (
    <>
      <section id="top" data-section="hero" className="relative flex min-h-[640px] flex-col overflow-hidden bg-[#1C1F23] text-white @3xl:h-[760px]">
        {site.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.cover} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
            {preview && (
              <span className="absolute right-10 top-24 hidden h-[30px] items-center rounded-full border border-dashed border-white/35 px-3 text-xs text-white/70 @3xl:flex">
                [Photo de couverture de l&apos;organisation]
              </span>
            )}
          </>
        )}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,12,.35)_0%,rgba(8,10,12,0)_40%,rgba(8,10,12,.7)_100%)]" />
        <header className={cn(WRAP, "relative flex items-center justify-between gap-5 py-5 @3xl:py-6")}>
          <Brand site={site} light />
          <nav aria-label="Navigation principale" className="hidden gap-8 text-[15px] font-medium @4xl:flex">
            {NAV.map(([h, l], i) => (
              <a key={h} href={h} className={i === 0 ? "text-white" : "text-white/80 hover:text-white"}>
                {l}
              </a>
            ))}
          </nav>
          <a href="#evenements" className="flex h-11 shrink-0 items-center rounded-full bg-white px-[22px] text-sm font-bold text-[#0F1115]">
            Billetterie
          </a>
        </header>
        <div className={cn(WRAP, "relative mt-auto flex flex-col gap-10 pb-14 pt-16 @5xl:flex-row @5xl:items-end @5xl:justify-between")}>
          <div className="flex flex-col gap-[22px] @5xl:flex-[999_1_600px]">
            <span data-edit="heroBadge" className="text-sm font-semibold text-white/75">{site.badge}</span>
            <h1 data-edit="heroHeadline" className="m-0 font-(family-name:--s-font-display) text-[calc(48px*var(--s-h1,1))] font-extrabold leading-[0.98] tracking-[-0.045em] @xl:text-[calc(64px*var(--s-h1,1))] @5xl:text-[calc(92px*var(--s-h1,1))]">
              {lead}
              {word && <span className="text-(--s-accent)">{word}</span>}
              {tail}
            </h1>
            {site.subheadline && <p data-edit="heroSubheadline" className="m-0 max-w-[600px] text-[17px] leading-[1.6] text-white/82 @3xl:text-[19px]">{site.subheadline}</p>}
            <div className="flex flex-wrap gap-3">
              <a href="#evenements" data-edit="heroCtaText" className="flex h-[54px] items-center rounded-full bg-white px-7 text-base font-bold text-[#0F1115]">
                {site.cta === "Voir les événements" ? "Découvrir nos événements" : site.cta}
              </a>
              <a href="#apropos" className="flex h-[54px] items-center rounded-full border-[1.5px] border-white/50 px-6 text-base font-semibold">
                Qui sommes-nous
              </a>
            </div>
          </div>
          {next && (
            <Link href={eventHref(site, next)} className="flex w-full max-w-[340px] items-center gap-3.5 rounded-[18px] bg-white p-3 text-[#0F1115] @5xl:flex-[1_1_300px]">
              <Photo src={next.imageUrl} className="size-[72px] shrink-0 rounded-xl bg-[#0B1B1C]" />
              <span className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-xs font-bold text-(--s-accent)">
                  Prochain · {next.day} {next.month.toLowerCase()}.
                </span>
                <span className="line-clamp-2 text-[15px] font-bold leading-[1.25]">{next.title}</span>
                {next.minPrice !== null && <span className="text-[13px] text-[#5D636B]">{next.minPrice === 0 ? "Entrée gratuite →" : `Billets dès ${formatPrice(next.minPrice)} →`}</span>}
              </span>
            </Link>
          )}
        </div>
      </section>

      {site.visible.about && (site.aboutText || preview) && (
        <section id="apropos" data-section="about" className={cn(WRAP, "grid scroll-mt-6 gap-8 pb-14 pt-16 @4xl:grid-cols-2 @4xl:gap-[72px] @3xl:pt-[104px]")}>
          <div className="flex flex-col gap-[22px]">
            <span className={KICKER}>L&apos;organisation</span>
            <h2 data-edit="aboutTitle" className={H2}>{site.aboutTitle}</h2>
          </div>
          <div data-edit="aboutText" className="flex flex-col gap-[22px] @4xl:pt-[34px]">
            {paragraphs.length ? (
              paragraphs.map((p, i) => <RichText key={i} text={p} className={cn("text-lg leading-[1.75]", i === 0 ? "text-(--s-body)" : "text-(--s-muted)")} />)
            ) : (
              <>
                <p className="m-0 text-lg leading-[1.75] text-(--s-body)">[Présentation de l&apos;organisation : votre histoire, votre mission, votre vision et ce qui vous distingue.]</p>
                <p className="m-0 text-lg leading-[1.75] text-(--s-muted)">[Vos partenaires, votre public, votre ambition pour les années à venir.]</p>
              </>
            )}
          </div>
        </section>
      )}

      {showActivities && (
        <section aria-label="Nos activités" data-section="about" className={cn(WRAP, "pb-16 pt-6 @3xl:pb-[104px]")}>
          <div className="grid gap-5 @3xl:grid-cols-3">
            {(activities.length ? activities : [{ label: "[Activité]", photo: null, count: 0 }, { label: "[Activité]", photo: null, count: 0 }, { label: "[Activité]", photo: null, count: 0 }]).map((a, i) => (
              <div key={i} className="flex flex-col gap-[18px]">
                <Photo src={a.photo} label="Photo" preview={preview} className={cn("h-[240px] rounded-[24px] @3xl:h-[300px]", i % 2 ? "bg-(--s-surface3)" : "bg-(--s-surface2)")} />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[22px] font-extrabold tracking-[-0.02em]">{a.label}</span>
                  <span className="text-[15px] leading-[1.6] text-(--s-muted)">{a.count ? `${a.count} événement${a.count > 1 ? "s" : ""} à venir` : "[Ce que vous proposez dans cette activité.]"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="evenements" data-section="events" className={cn("scroll-mt-6 bg-(--s-band)", !site.visible.events && "hidden")}>
        <div className={cn(WRAP, "flex flex-col gap-8 py-16 @3xl:py-[104px]")}>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-2.5">
              <span className={KICKER}>Billetterie</span>
              <h2 className={H2}>Nos événements</h2>
            </div>
            <div role="tablist" aria-label="Période" className="flex gap-1.5 rounded-full bg-(--s-surface) p-[5px]">
              <span role="tab" aria-selected className="flex h-[38px] items-center rounded-full bg-(--s-dark) px-[18px] text-sm font-bold text-(--s-dark-ink)">
                À venir · {site.events.length}
              </span>
              {site.albums.length > 0 && (
                <a href="#souvenirs" role="tab" aria-selected={false} className="flex h-[38px] items-center rounded-full px-[18px] text-sm font-semibold text-(--s-muted)">
                  Passés · {site.albums.length}
                </a>
              )}
            </div>
          </div>
          <div className="grid gap-6 @4xl:grid-cols-3">
            {site.events[0] ? <BigEventCard site={site} e={site.events[0]} /> : <EmptyEvents />}
            <AlertCard site={site} wa={wa} preview={preview} />
            {site.events.slice(1).map((e) => (
              <SmallEventCard key={e.id} site={site} e={e} />
            ))}
          </div>
        </div>
      </section>

      {showGallery && (
        <section id="souvenirs" data-section="gallery" className={cn(WRAP, "flex scroll-mt-6 flex-col gap-9 py-16 @3xl:py-[104px]")}>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-2.5">
              <span className={KICKER}>Souvenirs</span>
              <h2 className={H2}>Revivez nos événements</h2>
              <span className="text-base text-(--s-muted)">{site.albums.length ? "Les photos de chaque événement, publiées une fois qu'il est terminé." : "Quelques images de nos derniers événements."}</span>
            </div>
            {insta && (
              <a href={insta} target="_blank" rel="noreferrer" className="text-[15px] font-bold">
                Plus de photos →
              </a>
            )}
          </div>
          <div className="grid gap-6 @3xl:grid-cols-3">
            {(albums.length ? albums : [0, 1, 2].map((i) => ({ id: String(i), title: "", date: "", place: "", photos: [] as string[], cover: [] as string[] }))).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => !preview && a.photos.length > 0 && setOpen({ title: a.title || "Souvenirs", photos: a.photos })}
                className="flex flex-col gap-3.5 text-left"
              >
                <span className="grid h-[260px] w-full grid-cols-[2fr_1fr] grid-rows-2 gap-1.5 overflow-hidden rounded-[20px] @3xl:h-[300px]">
                  <Photo src={a.cover[0] ?? null} label="Photo" preview={preview} className="row-span-2 bg-(--s-surface2)" />
                  <Photo src={a.cover[1] ?? null} className="bg-(--s-surface3)" />
                  <span className="relative bg-(--s-chip)">
                    <Photo src={a.cover[2] ?? null} className="absolute inset-0" />
                    {a.photos.length > 3 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-[15px] font-extrabold text-white">+{a.photos.length - 2}</span>
                    )}
                  </span>
                </span>
                {(a.title || preview) && (
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex flex-col gap-1">
                      <span className="text-lg font-extrabold tracking-[-0.01em]">{a.title || "[Nom de l'événement passé]"}</span>
                      <span className="text-sm text-(--s-muted)">{[a.date, a.place].filter(Boolean).join(" · ") || "[Date] · [Lieu]"}</span>
                    </span>
                    {a.photos.length > 0 && <span className="flex h-[30px] shrink-0 items-center rounded-full bg-(--s-chip) px-3 text-[13px] font-semibold">{a.photos.length} photos</span>}
                  </span>
                )}
              </button>
            ))}
          </div>
          {open && <Lightbox photos={open.photos} title={open.title} onClose={() => setOpen(null)} />}
        </section>
      )}

      <section data-section="faq" className={cn("bg-(--s-band)", !site.visible.faq && "hidden")}>
        <div className={cn(WRAP, "grid gap-10 py-16 @4xl:grid-cols-[1fr_1.4fr] @4xl:gap-[72px] @3xl:py-24")}>
          <div className="flex flex-col gap-3.5">
            <span className={KICKER}>Bon à savoir</span>
            <h2 className="m-0 font-(family-name:--s-font-display) text-[34px] font-extrabold leading-[1.05] tracking-[-0.04em] @3xl:text-[44px]">Questions fréquentes</h2>
            <span className="text-[15px] leading-[1.6] text-(--s-muted)">Billets, paiement, accès : tout ce qu&apos;il faut savoir avant de venir.</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <FaqList
              faqs={site.faqs}
              render={(f, open, toggle) => (
                <div key={f.id} className="rounded-[18px] bg-(--s-surface) px-6 py-[22px]">
                  <button type="button" aria-expanded={open} onClick={toggle} className="flex w-full items-center justify-between gap-4 text-left text-[17px] font-bold">
                    {f.question}
                    <Icon d={open ? ICONS.minus : ICONS.plus} size={16} />
                  </button>
                  {open && <p className="m-0 mt-3 text-[15px] leading-[1.7] text-(--s-muted)">{f.answer}</p>}
                </div>
              )}
            />
          </div>
        </div>
      </section>

      {(wa || site.contact.email || preview) && (
        <section id="contact" data-section="footer" className={cn(WRAP, "scroll-mt-6 pb-12 pt-16 @3xl:pt-[104px]")}>
          <div className="flex flex-wrap items-center justify-between gap-10 rounded-[32px] bg-(--s-dark) p-8 text-(--s-dark-ink) @3xl:p-14">
            <div className="flex max-w-[620px] flex-col gap-3">
              <h2 className="m-0 font-(family-name:--s-font-display) text-[32px] font-extrabold leading-[1.05] tracking-[-0.04em] @3xl:text-[44px]">Un projet d&apos;événement ? Parlons-en.</h2>
              <span className="text-[17px] leading-[1.6] opacity-70">Partenariats, sponsoring, organisation sur mesure : notre équipe vous répond.</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {(wa || preview) && (
                <a href={wa ?? "#contact"} target="_blank" rel="noreferrer" className="flex h-[54px] items-center rounded-full bg-(--s-dark-ink) px-[26px] font-bold text-(--s-dark)">
                  Écrire sur WhatsApp
                </a>
              )}
              {(site.contact.email || preview) && (
                <a href={site.contact.email ? `mailto:${site.contact.email}` : "#contact"} className="flex h-[54px] items-center rounded-full border-[1.5px] border-current/40 px-6 font-semibold">
                  Envoyer un e-mail
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <footer data-section="footer" className={cn(WRAP, "flex flex-col gap-12 pb-9 pt-14")}>
        <div className="grid gap-10 text-[15px] leading-[1.9] text-(--s-muted) @3xl:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="text-[22px] font-extrabold text-(--s-text)">{site.name}</span>
            <span data-edit="orgTagline" className="max-w-[280px]">{site.tagline}</span>
          </div>
          <Col title="Contact">
            {site.contact.address && <span>{site.contact.address}</span>}
            {site.contact.phone && <span>{site.contact.phone}</span>}
            {site.contact.email && <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>}
            {!site.contact.address && !site.contact.phone && !site.contact.email && preview && <span>[Adresse · Téléphone · E-mail]</span>}
          </Col>
          {(insta || site.contact.facebook || wa || preview) && (
          <Col title="Réseaux">
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
            {!insta && !site.contact.facebook && !wa && preview && <span>[Instagram · Facebook]</span>}
          </Col>
          )}
          <Col title="Paiement">
            <span>Mobile Money</span>
            <span>Carte bancaire</span>
          </Col>
        </div>
        <div aria-hidden className="overflow-hidden whitespace-nowrap font-(family-name:--s-font-display) text-[72px] font-extrabold leading-[0.8] tracking-[-0.06em] text-(--s-line) @3xl:text-[150px]">
          {site.name}
        </div>
        <FooterLine site={site} />
      </footer>
    </>
  );
}

function Col({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="mb-1.5 font-bold text-(--s-text)">{title}</span>
      {children}
    </div>
  );
}

function EmptyEvents() {
  return (
    <div className="flex flex-col justify-center gap-3 rounded-[24px] bg-(--s-surface) p-8 @4xl:col-span-2">
      <span className="text-2xl font-extrabold tracking-[-0.02em]">De nouvelles dates arrivent bientôt.</span>
      <span className="text-[15px] text-(--s-muted)">Aucun événement n&apos;est en vente pour le moment.</span>
    </div>
  );
}

function BigEventCard({ site, e }: { site: SiteData; e: SiteEvent }) {
  return (
    <Link href={eventHref(site, e)} className="flex flex-col overflow-hidden rounded-[24px] bg-(--s-surface) @3xl:flex-row @4xl:col-span-2">
      <Photo src={e.imageUrl} alt={`Affiche : ${e.title}`} className={cn("min-h-[240px] @3xl:min-h-[400px] @3xl:w-[52%]", e.imageUrl ? "bg-[#0B1B1C]" : "bg-(--s-surface2)")} />
      <div className="flex flex-1 flex-col gap-3.5 p-6 @3xl:p-8">
        <div className="flex items-center gap-3">
          <DateTile e={e} />
          <span className="flex flex-col gap-0.5 text-sm text-(--s-muted)">
            <span>
              {e.weekday} · {e.timeRange.split(" ")[0]}
            </span>
            {(e.place || e.venue) && <span>{e.place || e.venue}</span>}
          </span>
        </div>
        <span className="text-[13px] font-bold text-(--s-accent)">
          {e.category.split(" · ")[0]}
          {e.certified && " · Certifiant"}
        </span>
        <span className="text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em] @3xl:text-[28px]">{e.title}</span>
        {e.summary && <span className="text-[15px] leading-[1.6] text-(--s-muted)">{e.summary}</span>}
        <span className="mt-auto flex items-center justify-between border-t border-(--s-line) pt-4">
          {e.minPrice !== null ? (
            <span className="text-sm text-(--s-muted)">
              {e.minPrice === 0 ? "" : "dès "}
              <b className="text-lg text-(--s-text)">{formatPrice(e.minPrice)}</b>
            </span>
          ) : (
            <span />
          )}
          <span className="flex h-11 items-center rounded-full bg-(--s-dark) px-5 text-sm font-bold text-(--s-dark-ink)">Voir et réserver</span>
        </span>
      </div>
    </Link>
  );
}

function SmallEventCard({ site, e }: { site: SiteData; e: SiteEvent }) {
  return (
    <Link href={eventHref(site, e)} className="flex flex-col overflow-hidden rounded-[24px] bg-(--s-surface)">
      <Photo src={e.imageUrl} alt={`Affiche : ${e.title}`} className={cn("h-[200px]", e.imageUrl ? "bg-[#0B1B1C]" : "bg-(--s-surface2)")} />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-3">
          <DateTile e={e} />
          <span className="text-[13px] font-bold text-(--s-accent)">{e.category.split(" · ")[0]}</span>
        </div>
        <span className="text-xl font-extrabold leading-[1.15] tracking-[-0.02em]">{e.title}</span>
        <span className="mt-auto flex items-center justify-between pt-2 text-sm text-(--s-muted)">
          {e.minPrice !== null && <b className="text-base text-(--s-text)">{formatPrice(e.minPrice)}</b>}
          <span className="font-bold text-(--s-text)">Réserver →</span>
        </span>
      </div>
    </Link>
  );
}

// « Soyez prévenu » : ouvre une conversation WhatsApp avec l'organisateur
// (aucune liste d'alerte côté serveur pour l'instant).
function AlertCard({ site, wa, preview }: { site: SiteData; wa: string | null; preview?: boolean }) {
  const [phone, setPhone] = useState("");
  if (!wa && !preview) return null;
  const link = waLink(site.contact.whatsapp, `Bonjour ${site.name}, je souhaite être prévenu de vos prochains événements.${phone ? ` Mon numéro : ${phone}` : ""}`);
  return (
    <div className="flex flex-col justify-between gap-5 rounded-[24px] bg-(--s-surface) p-8">
      <div className="flex flex-col gap-3">
        <span className="flex size-12 items-center justify-center rounded-[14px] bg-(--s-chip)">
          <Icon d={ICONS.bell} />
        </span>
        <span className="text-2xl font-extrabold leading-[1.15] tracking-[-0.02em]">Soyez prévenu des prochaines dates.</span>
        <span className="text-[15px] leading-[1.6] text-(--s-muted)">Écrivez-nous sur WhatsApp : nous vous prévenons dès qu&apos;un événement est en vente.</span>
      </div>
      <div className="flex flex-col gap-2.5">
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Numéro WhatsApp
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+241 …"
            className="h-12 rounded-full border border-(--s-line3) bg-(--s-surface) px-4 text-[15px] font-normal outline-none focus:border-(--s-accent)"
          />
        </label>
        <a href={link ?? "#evenements"} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center rounded-full bg-(--s-dark) text-[15px] font-bold text-(--s-dark-ink)">
          M&apos;alerter
        </a>
      </div>
    </div>
  );
}

function H2Small({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="m-0 font-(family-name:--s-font-display) text-[26px] font-extrabold tracking-[-0.03em] @3xl:text-[30px]">{children}</h2>
      {right}
    </div>
  );
}

export function LumiereEvent({ site, event: e, preview }: { site: SiteData; event: SiteEvent; preview?: boolean }) {
  const [more, setMore] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const maps = mapsLink(e);
  const long = e.description.length > 520;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-(--s-line) bg-[color-mix(in_srgb,var(--s-bg)_92%,transparent)] backdrop-blur-[10px]">
        <div className={cn(WRAP, "flex items-center justify-between gap-5 py-[18px]")}>
          <Brand site={site} />
          <nav aria-label="Navigation principale" className="hidden gap-8 text-[15px] font-medium @4xl:flex">
            {NAV.map(([h, l]) => (
              <Link key={h} href={homeHref(site, h)} className={h === "#evenements" ? "text-(--s-text)" : "text-(--s-muted) hover:text-(--s-text)"}>
                {l}
              </Link>
            ))}
          </nav>
          <a href="#billets" className="flex h-11 shrink-0 items-center rounded-full bg-(--s-dark) px-[22px] text-sm font-bold text-(--s-dark-ink)">
            Billetterie
          </a>
        </div>
      </header>

      <main className={cn(WRAP, "flex flex-col gap-8 pb-24 pt-8")}>
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 text-sm text-(--s-faint)">
          <Link href={homeHref(site)} className="text-(--s-muted)">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <Link href={homeHref(site, "#evenements")} className="text-(--s-muted)">
            Événements
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-(--s-text)">{e.title}</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex max-w-[820px] flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="flex h-[30px] items-center rounded-full bg-(--s-chip) px-3 text-[13px] font-bold">{e.category}</span>
              {e.certified && <span className="flex h-[30px] items-center rounded-full bg-[#FBF1DF] px-3 text-[13px] font-bold text-[#8A5A0B]">Attestation certifiée</span>}
            </div>
            <h1 className="m-0 font-(family-name:--s-font-display) text-[40px] font-extrabold leading-none tracking-[-0.045em] @3xl:text-[64px]">{e.title}</h1>
            <div className="flex flex-wrap gap-x-7 gap-y-2 text-base text-(--s-body)">
              <span className="flex items-center gap-2">
                <Icon d={ICONS.cal} size={17} />
                {e.dateLong}
              </span>
              <span className="flex items-center gap-2">
                <Icon d={ICONS.clock} size={17} />
                {e.timeRange}
              </span>
              {(e.venue || e.place) && (
                <span className="flex items-center gap-2">
                  <Icon d={ICONS.pin} size={17} />
                  {[e.venue, e.place].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => shareOnWhatsApp(e)} className="flex h-11 items-center gap-2 rounded-full border border-(--s-line3) bg-(--s-surface) px-4 text-sm font-semibold">
              Partager sur WhatsApp
            </button>
            <button type="button" aria-label="Copier le lien" onClick={copyLink} className="flex size-11 items-center justify-center rounded-full border border-(--s-line3) bg-(--s-surface)">
              <Icon d={ICONS.link} size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-10 @5xl:flex-row @5xl:items-start">
          <div className="order-2 flex min-w-0 flex-col gap-16 @5xl:order-1 @5xl:flex-[999_1_600px]">
            {e.imageUrl && <Photo src={e.imageUrl} alt={`Affiche : ${e.title}`} className="h-[260px] rounded-[28px] bg-[#0B1B1C] @3xl:h-[480px]" />}

            {e.description && (
              <section className="flex flex-col gap-[18px]">
                <H2Small>À propos de l&apos;événement</H2Small>
                <div className={cn("relative", long && !more && "max-h-[230px] overflow-hidden")}>
                  <RichText text={e.description} className="text-[17px] leading-[1.8] text-(--s-body)" />
                  {long && !more && <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(transparent,var(--s-bg))]" />}
                </div>
                {long && (
                  <button type="button" onClick={() => setMore(!more)} className="self-start p-0 text-[15px] font-bold underline underline-offset-[5px]">
                    {more ? "Réduire" : "Lire la suite"}
                  </button>
                )}
              </section>
            )}

            {(e.program.length > 0 || preview) && (
              <section className="flex flex-col gap-[18px]">
                <H2Small>Programme</H2Small>
                <ol className="m-0 flex list-none flex-col p-0">
                  {(e.program.length ? e.program.map((p) => ({ time: p.time, title: p.title, sub: p.detail ?? "" })) : PROGRAM_PLACEHOLDER).map((p, i) => (
                    <li key={i} className="grid grid-cols-[90px_minmax(0,1fr)] gap-5 border-t border-(--s-line) py-[18px] @3xl:grid-cols-[110px_minmax(0,1fr)]">
                      <span className="text-[15px] font-bold text-(--s-accent)">{p.time}</span>
                      <span className="flex flex-col gap-1">
                        <span className="text-[17px] font-bold">{p.title}</span>
                        {p.sub && <span className="text-sm text-(--s-muted)">{p.sub}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {(e.speakers.length > 0 || preview) && (
              <section className="flex flex-col gap-[18px]">
                <H2Small>Intervenants</H2Small>
                <div className="grid grid-cols-2 gap-5 @3xl:grid-cols-4">
                  {(e.speakers.length ? e.speakers : [0, 1, 2, 3].map((i) => ({ id: String(i), name: "[Nom]", role: "[Fonction]", photoUrl: null }))).map((sp, i) => (
                    <div key={sp.id} className="flex flex-col gap-3">
                      <Photo src={sp.photoUrl} alt={sp.name} label="Photo" preview={preview} className={cn("aspect-square rounded-[20px]", i % 2 ? "bg-(--s-surface3)" : "bg-(--s-surface2)")} />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-base font-bold">{sp.name}</span>
                        {sp.role && <span className="text-sm text-(--s-muted)">{sp.role}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(e.venue || e.place) && (
              <section className="flex flex-col gap-[18px]">
                <H2Small>Lieu</H2Small>
                <div className="flex flex-col overflow-hidden rounded-[24px] border border-(--s-line) @3xl:flex-row">
                  <div className="flex min-h-[220px] flex-1 items-center justify-center bg-[#EEF1EC] bg-[linear-gradient(#E1E6DF_1px,transparent_1px),linear-gradient(90deg,#E1E6DF_1px,transparent_1px)] bg-[size:32px_32px] @3xl:min-h-[240px]">
                    <span className="size-11 -rotate-45 rounded-[999px_999px_999px_0] bg-(--s-accent) shadow-[0_6px_16px_rgba(0,0,0,.2)]" />
                  </div>
                  <div className="flex flex-col gap-2.5 p-7 @3xl:w-[320px]">
                    <span className="text-lg font-extrabold">{e.venue || e.place}</span>
                    {e.venue && e.place && <span className="text-[15px] text-(--s-muted)">{e.place}</span>}
                    {maps && (
                      <a href={maps} target="_blank" rel="noreferrer" className="mt-auto flex h-[46px] items-center justify-center rounded-full border border-(--s-line3) text-sm font-bold">
                        Itinéraire
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section className="flex flex-col gap-[18px]">
              <H2Small>Organisé par</H2Small>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3.5 rounded-[18px] border border-(--s-line) py-3.5 pl-3.5 pr-5">
                  <OrgMark site={site} className="h-12 w-16 bg-(--s-chip) text-xs font-extrabold tracking-[0.14em]" />
                  <span className="flex flex-col">
                    <span className="font-bold">{site.name}</span>
                    <span className="text-[13px] text-(--s-muted)">Organisateur principal</span>
                  </span>
                </div>
                {e.partners
                  .filter((p) => p.role !== "MAIN_ORGANIZER" || p.name !== site.name)
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-3.5 rounded-[18px] border border-(--s-line) py-3.5 pl-3.5 pr-5">
                      <span className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-[10px] bg-(--s-chip)">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt="" className="size-full object-contain p-1" />
                        ) : (
                          <span className="text-[10px] font-bold">{p.name.slice(0, 8)}</span>
                        )}
                      </span>
                      <span className="flex flex-col">
                        <span className="font-bold">{p.name}</span>
                        <span className="text-[13px] text-(--s-muted)">{LOGO_ROLE[p.role] ?? "Partenaire"}</span>
                      </span>
                    </div>
                  ))}
              </div>
            </section>

            {e.album.length > 0 ? (
              <section className="flex flex-col gap-[18px]">
                <H2Small right={<span className="text-sm text-(--s-muted)">{e.album.length} photos</span>}>Photos de l&apos;événement</H2Small>
                <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                  {e.album.map((src, i) => (
                    <button key={i} type="button" onClick={() => !preview && setPhoto(i)} className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-(--s-surface2)">
                      <Photo src={src} className="absolute inset-0" />
                    </button>
                  ))}
                </div>
                {photo !== null && <Lightbox photos={e.album} title={e.title} start={photo} onClose={() => setPhoto(null)} />}
              </section>
            ) : (
              preview && (
                <section className="flex flex-col gap-[18px]">
                  <H2Small right={<span className="text-sm text-(--s-muted)">Album</span>}>Photos de l&apos;événement</H2Small>
                  <div className="flex items-center gap-5 rounded-[24px] border border-dashed border-(--s-line3) bg-(--s-band) p-7">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-(--s-surface)">
                      <Icon d={ICONS.image} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-[17px] font-bold">L&apos;album sera publié après l&apos;événement.</span>
                      <span className="text-[15px] text-(--s-muted)">
                        Revenez après le {e.day} {e.month.toLowerCase()}. pour revivre la journée en images.
                      </span>
                    </div>
                  </div>
                </section>
              )
            )}
          </div>

          <aside id="billets" className="order-1 flex w-full scroll-mt-24 flex-col gap-3.5 @5xl:sticky @5xl:top-[100px] @5xl:order-2 @5xl:max-w-[400px] @5xl:flex-[1_1_360px]">
            <TicketBox event={e.raw} variant="lumiere" preview={preview} />
            <div className="flex flex-col gap-2.5 rounded-[20px] bg-(--s-band) px-5 py-[18px] text-sm text-(--s-body)">
              <span className="flex gap-2.5">
                <Icon d={ICONS.qr} size={16} />
                Billet QR dès le paiement, aussi envoyé par e-mail
              </span>
              {e.certified && (
                <span className="flex gap-2.5">
                  <Icon d={ICONS.award} size={16} />
                  Attestation remise aux participants présents
                </span>
              )}
            </div>
          </aside>
        </div>
      </main>

      <section className="bg-(--s-band)">
        <div className={cn(WRAP, "flex flex-wrap items-center justify-between gap-8 py-14 @3xl:py-[72px]")}>
          <div className="flex items-center gap-[18px]">
            <OrgMark site={site} rounded className="size-16 bg-(--s-dark) font-extrabold text-(--s-dark-ink)" />
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-(--s-muted)">Organisé par</span>
              <span className="text-[22px] font-extrabold tracking-[-0.02em]">{site.name}</span>
              <span className="text-sm text-(--s-muted)">{site.tagline}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href={homeHref(site, "#apropos")} className={LINE_BTN}>
              Découvrir l&apos;organisation
            </Link>
            <Link href={homeHref(site, "#evenements")} className={DARK_BTN}>
              Autres événements
            </Link>
          </div>
        </div>
      </section>
      <footer className={cn(WRAP, "py-10")}>
        <FooterLine site={site} />
      </footer>
    </>
  );
}
