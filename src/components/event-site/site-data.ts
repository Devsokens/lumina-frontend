import type { EventLogo, EventSettings, ProgramItem, Speaker } from "@/lib/events";
import type { PastEvent } from "@/hooks/usePublicEvents";
import { typeOption } from "@/lib/event-meta";
import { initialsOf } from "@/components/events/ev-ui";
import type { FAQItem, ShowcaseContent } from "@/stores/useShowcaseStore";
import type { PublicEvent, PublicTicketType } from "@/types/events";
import { FEATURES } from "@/lib/features";

// Données affichées par les modèles Nuit et Lumière : le contenu publié
// depuis l'éditeur (tenant.config.showcase), l'identité du compte et les
// événements réellement en vente. Rien d'inventé : une section sans contenu
// réel est masquée sur le site public (l'éditeur montre des emplacements).

export type SiteEvent = {
  id: string;
  title: string;
  description: string;
  summary: string;
  imageUrl: string | null;
  start: Date;
  day: string;
  month: string;
  weekday: string;
  dateLong: string;
  timeRange: string;
  venue: string | null;
  place: string | null;
  category: string;
  certified: boolean;
  minPrice: number | null; // centimes
  tickets: PublicTicketType[];
  partners: EventLogo[];
  program: ProgramItem[];
  speakers: Speaker[];
  album: string[];
  raw: PublicEvent;
};

// Album d'un événement passé (« Souvenirs »).
export type SiteAlbum = { id: string; title: string; date: string; place: string; photos: string[] };

export type SiteData = {
  slug: string;
  // Préfixe des liens internes (useSiteBase) ; « /slug » par défaut.
  base?: string;
  name: string;
  initials: string;
  logo: string | null;
  tagline: string;
  badge: string;
  headline: string;
  subheadline: string;
  cta: string;
  cover: string | null;
  gallery: string[];
  aboutTitle: string;
  aboutText: string;
  faqs: FAQItem[];
  contact: { address: string; phone: string; whatsapp: string; email: string; instagram: string; facebook: string };
  legal: { nif: string; rccm: string };
  events: SiteEvent[];
  albums: SiteAlbum[];
  categories: string[];
  // Mot du titre mis en couleur (undefined = selon le modèle, "" = aucun).
  highlight?: string;
  // Contenu jamais enregistré : textes d'exemple du nouveau design.
  isDraft: boolean;
  // Sections affichées (drapeau showcase-sections : pas encore enregistré
  // par le serveur, tout est visible sans lui).
  visible: { events: boolean; about: boolean; gallery: boolean; faq: boolean };
};

function visibility(content: ShowcaseContent): SiteData["visible"] {
  const v = FEATURES.showcaseSections ? content.visibleSections : undefined;
  return { events: v?.events !== false, about: v?.about !== false, gallery: v?.gallery !== false, faq: v?.faq !== false };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hm = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function firstSentence(text: string) {
  const plain = text.replace(/[*_#>`]/g, "").replace(/\s+/g, " ").trim();
  const m = plain.match(/^(.{20,220}?[.!?])(\s|$)/);
  return m ? m[1] : plain.length > 200 ? `${plain.slice(0, 197)}…` : plain;
}

export function toSiteEvent(e: PublicEvent): SiteEvent {
  const start = new Date(e.startDate);
  const end = e.endDate ? new Date(e.endDate) : null;
  const settings = (e.settings ?? {}) as EventSettings;
  const prices = e.ticketTypes.map((t) => t.price);
  const sameDay = end && end.toDateString() === start.toDateString();
  const opt = typeOption(e.eventType);
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? "",
    summary: firstSentence(e.description ?? ""),
    imageUrl: e.imageUrl,
    start,
    day: String(start.getDate()),
    month: start.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase(),
    weekday: cap(start.toLocaleDateString("fr-FR", { weekday: "long" })),
    dateLong: cap(start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })),
    timeRange: sameDay ? `${hm(start)} – ${hm(end)}` : hm(start),
    venue: e.venueName,
    place: e.location,
    category: opt.value ? opt.card : "Événement",
    certified: !!settings.hasCertificate,
    minPrice: prices.length ? Math.min(...prices) : null,
    tickets: e.ticketTypes,
    partners: settings.logosDisplay?.vitrine === false ? [] : (settings.logos ?? []),
    program: settings.program ?? [],
    speakers: settings.speakers ?? [],
    album: settings.album ?? [],
    raw: e,
  };
}

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "faq-billet",
    question: "Comment reçois-je mon billet après le paiement ?",
    answer:
      "Dès la validation de votre paiement, votre pass avec QR code unique s'affiche à l'écran. Vous pouvez le télécharger en PDF, et il vous est aussi envoyé par e-mail si vous en indiquez un.",
  },
  {
    id: "faq-acces",
    question: "Comment se déroule le contrôle d'accès ?",
    answer: "Présentez le QR code de votre billet à l'entrée, sur votre téléphone ou imprimé. Chaque billet n'est valable qu'une fois.",
  },
  {
    id: "faq-groupe",
    question: "Puis-je acheter plusieurs billets en une fois ?",
    answer: "Oui : choisissez la quantité au moment de la commande. Chaque billet a son propre QR code.",
  },
];

type TenantLike = { slug: string; name: string; config?: Record<string, unknown> | null };

function toAlbum(e: PastEvent): SiteAlbum {
  const start = new Date(e.startDate);
  return {
    id: e.id,
    title: e.title,
    date: start.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    place: e.location ?? e.venueName ?? "",
    photos: (e.settings?.album ?? []).filter(Boolean),
  };
}

export function buildSite(tenant: TenantLike, content: ShowcaseContent, events: PublicEvent[], saved: boolean, past: PastEvent[] = []): SiteData {
  const albums = past.map(toAlbum).filter((a) => a.photos.length > 0);
  const config = (tenant.config ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(content.orgName) || tenant.name;
  const description = str(config.description);
  // Paramètres · Général et Identité légale (repli si la vitrine ne les précise pas).
  const legal = (config.legal ?? {}) as Record<string, unknown>;
  const now = Date.now();
  const list = events
    .map(toSiteEvent)
    .filter((e) => e.start.getTime() >= now - 12 * 3600_000)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const categories = [...new Set(list.map((e) => e.category))];

  if (!saved) {
    // Compte sans vitrine publiée : textes du design, identité du compte.
    return {
      slug: tenant.slug,
      name,
      initials: initialsOf(name),
      logo: str(config.logoUrl) || null,
      tagline: "Événements & expériences",
      badge: str(config.address) ? `Organisateur d'événements · ${str(config.address)}` : "Organisateur d'événements",
      headline: "Vivez des moments inoubliables.",
      subheadline: description || `${name} conçoit et organise des événements qui rassemblent : réservez vos billets en ligne, en quelques secondes.`,
      cta: "Voir les événements",
      cover: null,
      gallery: [],
      aboutTitle: "Nous créons des moments qui rassemblent.",
      aboutText: description,
      faqs: DEFAULT_FAQS,
      contact: { address: str(config.address), phone: str(config.phone), whatsapp: "", email: str(config.contactEmail), instagram: "", facebook: "" },
      legal: { nif: str(legal.nif), rccm: str(legal.rccm) },
      events: list,
      albums,
      categories,
      isDraft: true,
      visible: visibility(content),
    };
  }

  return {
    slug: tenant.slug,
    name,
    initials: initialsOf(name),
    logo: str(content.orgLogoUrl) || str(config.logoUrl) || null,
    tagline: str(content.orgTagline) || "Événements & expériences",
    badge: str(content.heroBadge) || (str(config.address) ? `Organisateur d'événements · ${str(config.address)}` : "Organisateur d'événements"),
    headline: str(content.heroHeadline) || "Vivez des moments inoubliables.",
    subheadline: str(content.heroSubheadline) || description,
    cta: str(content.heroCtaText) || "Voir les événements",
    cover: str(content.orgCoverUrl) || null,
    gallery: (content.galleryImages ?? []).filter(Boolean),
    aboutTitle: str(content.aboutTitle) || "Nous créons des moments qui rassemblent.",
    aboutText: str(content.aboutText) || description,
    faqs: (content.faqs ?? []).filter((f) => f.question.trim()).length ? content.faqs.filter((f) => f.question.trim()) : DEFAULT_FAQS,
    contact: {
      address: str(content.address) || str(config.address),
      phone: str(content.supportPhone) || str(config.phone),
      whatsapp: str(content.whatsappNumber),
      email: str(content.contactEmail) || str(config.contactEmail),
      instagram: str(content.instagramHandle),
      facebook: str(content.facebookUrl),
    },
    legal: { nif: str(content.nif) || str(legal.nif), rccm: str(content.rccm) || str(legal.rccm) },
    events: list,
    albums,
    categories,
    highlight: content.design?.highlight,
    isDraft: false,
    visible: visibility(content),
  };
}

// Titre découpé autour du mot mis en couleur : celui choisi dans l'éditeur,
// sinon le dernier mot (byDefault, modèle Nuit) ; "" = aucun.
export function splitHeadline(headline: string, highlight?: string, byDefault = true): [string, string, string] {
  const text = headline.trim();
  if (highlight === "" || (highlight === undefined && !byDefault)) return [text, "", ""];
  if (highlight) {
    const i = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (i >= 0) return [text.slice(0, i), text.slice(i, i + highlight.length), text.slice(i + highlight.length)];
  }
  if (!byDefault) return [text, "", ""];
  const words = text.split(/\s+/);
  if (words.length < 2) return ["", text, ""];
  return [words.slice(0, -1).join(" ") + " ", words[words.length - 1], ""];
}

export function formatPrice(centimes: number | null) {
  if (centimes === null) return "";
  if (centimes === 0) return "Gratuit";
  return `${Math.round(centimes / 100).toLocaleString("fr-FR")} F`;
}

export function waLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function instagramLink(handle: string) {
  const h = handle.replace(/^@/, "").trim();
  if (!h) return null;
  return /^https:\/\//.test(handle) ? handle : `https://instagram.com/${encodeURIComponent(h)}`;
}
