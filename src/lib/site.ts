import type { CSSProperties } from "react";
import type { Tenant } from "@/types/api";
import { isPublishableImage } from "@/lib/showcase-payload";

// Apparence du site public restaurant / boutique (tenant.config.site),
// éditée dans le back-office (admin/[sector]/site) — PUT /admin/tenant/site,
// voir docs/API_CONTRACT.md. Les listes doivent rester alignées sur
// UpdateSiteDto côté backend.

export const SITE_PALETTES = ["safran", "bordeaux", "olive", "ocean", "terracotta", "onyx"] as const;
export const SITE_FONTS = ["classique", "moderne", "audacieux"] as const;
export const SITE_MENU_LAYOUTS = ["carte", "cartes", "mosaique"] as const;
export const SITE_MODES = ["clair", "sombre"] as const;
// Variantes de mise en page (structure, ergonomie, animations, parcours).
export const SITE_LAYOUTS = [
  "brasserie",
  "gastronomique",
  "maison",
  "carte",
  "street",
  "terrasse",
  "comptoir",
  "lounge",
  "marche",
  "editorial",
] as const;
export const SITE_MOTIONS = ["aucune", "douce", "vive"] as const;

export type SitePalette = (typeof SITE_PALETTES)[number];
export type SiteFont = (typeof SITE_FONTS)[number];
export type SiteMenuLayout = (typeof SITE_MENU_LAYOUTS)[number];
export type SiteMode = (typeof SITE_MODES)[number];
export type SiteLayout = (typeof SITE_LAYOUTS)[number];
export type SiteMotion = (typeof SITE_MOTIONS)[number];

export type SiteHours = { day: number; open: boolean; from: string; to: string };

export type SiteSections = {
  featured: boolean;
  about: boolean;
  gallery: boolean;
  hours: boolean;
  location: boolean;
};

export type SiteConfig = {
  layout: SiteLayout;
  motion: SiteMotion;
  palette: SitePalette;
  mode: SiteMode;
  font: SiteFont;
  menuLayout: SiteMenuLayout;
  announcement: string;
  eyebrow: string;
  tagline: string;
  coverUrl: string;
  aboutTitle: string;
  aboutText: string;
  aboutImageUrl: string;
  gallery: string[];
  featuredProductIds: string[];
  hours: SiteHours[];
  sections: SiteSections;
  email: string;
  whatsapp: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  mapsUrl: string;
};

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const PALETTE_INFO: Record<SitePalette, { label: string; accent: string; accentFg: string; light: string; dark: string }> = {
  safran: { label: "Safran", accent: "#c8922a", accentFg: "#1a1206", light: "#faf6ef", dark: "#12100c" },
  bordeaux: { label: "Bordeaux", accent: "#8c2238", accentFg: "#fff7f8", light: "#fbf7f5", dark: "#140d0f" },
  olive: { label: "Olive", accent: "#5d6b2f", accentFg: "#fbfbf3", light: "#f7f6ee", dark: "#10120b" },
  ocean: { label: "Océan", accent: "#1d5f7a", accentFg: "#f2fafd", light: "#f4f7f8", dark: "#0b1215" },
  terracotta: { label: "Terracotta", accent: "#b5532f", accentFg: "#fff8f4", light: "#faf5f1", dark: "#150e0b" },
  onyx: { label: "Onyx & or", accent: "#b89b5e", accentFg: "#121212", light: "#f6f5f2", dark: "#0c0c0c" },
};

export const FONT_INFO: Record<SiteFont, { label: string; sample: string }> = {
  classique: { label: "Classique", sample: "Élégance gastronomique" },
  moderne: { label: "Moderne", sample: "Bistro contemporain" },
  audacieux: { label: "Audacieux", sample: "Caractère affirmé" },
};

export const LAYOUT_INFO: Record<SiteMenuLayout, { label: string; hint: string }> = {
  carte: { label: "Carte", hint: "Liste raffinée, comme une carte imprimée" },
  cartes: { label: "Fiches", hint: "Photo, description et prix" },
  mosaique: { label: "Mosaïque", hint: "Grandes photos, idéal pour Instagram" },
};

// Inspirations : sites de référence du secteur (recherche 2026-11), voir
// docs/DESIGN_VARIANTS.md côté frontend.
export const SITE_LAYOUT_INFO: Record<SiteLayout, { label: string; hint: string }> = {
  brasserie: { label: "Brasserie", hint: "Grande photo, plats vedettes en carrousel : l'efficacité classique" },
  gastronomique: { label: "Gastronomique", hint: "Sobriété haut de gamme : typographie centrée, peu d'éléments, beaucoup d'air" },
  maison: { label: "Maison", hint: "L'histoire d'abord : texte et photo en regard, la carte vient ensuite" },
  carte: { label: "Carte d'abord", hint: "Pour commander vite : la carte lisible dès l'arrivée, bouton fixe en bas d'écran" },
  street: { label: "Street", hint: "Titres XXL, mosaïque de photos : pensé pour Instagram et TikTok" },
  terrasse: { label: "Terrasse", hint: "L'ambiance en premier : mosaïque de photos du lieu" },
  comptoir: { label: "Comptoir", hint: "Service rapide : ouvert ou fermé, commander, WhatsApp, horaires en tête" },
  lounge: { label: "Lounge", hint: "Ambiance de soirée immersive : plein écran, centré, zoom lent" },
  marche: { label: "Marché", hint: "Catalogue dense façon e-commerce : idéal pour les boutiques" },
  editorial: { label: "Éditorial", hint: "Mise en page magazine : produits en grandes rangées alternées" },
};

export const SITE_MOTION_INFO: Record<SiteMotion, string> = { aucune: "Aucune", douce: "Douce", vive: "Vive" };

export const DEFAULT_HOURS: SiteHours[] = DAYS.map((_, day) => ({
  day,
  open: day !== 0,
  from: "11:30",
  to: "23:00",
}));

export const DEFAULT_SITE: SiteConfig = {
  layout: "brasserie",
  motion: "douce",
  palette: "safran",
  mode: "clair",
  font: "classique",
  menuLayout: "carte",
  announcement: "",
  eyebrow: "",
  tagline: "",
  coverUrl: "",
  aboutTitle: "Notre maison",
  aboutText: "",
  aboutImageUrl: "",
  gallery: [],
  featuredProductIds: [],
  hours: DEFAULT_HOURS,
  sections: { featured: true, about: true, gallery: true, hours: true, location: true },
  email: "",
  whatsapp: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  mapsUrl: "",
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;
const https = (v: unknown, max: number) => {
  const s = str(v, max).trim();
  return /^https:\/\/[^\s"'<>]*$/.test(s) ? s : "";
};
const image = (v: unknown) => (isPublishableImage(v) ? v : "");
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Lecture tolérante : config absente, partielle ou d'une ancienne version.
// Sert aussi à nettoyer le contenu avant PUT (même contraintes que le DTO).
export function normalizeSite(raw: unknown): SiteConfig {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const sections = (s.sections && typeof s.sections === "object" ? s.sections : {}) as Record<string, unknown>;
  const hours = Array.isArray(s.hours) ? (s.hours as Record<string, unknown>[]) : [];
  return {
    layout: oneOf(s.layout, SITE_LAYOUTS, DEFAULT_SITE.layout),
    motion: oneOf(s.motion, SITE_MOTIONS, DEFAULT_SITE.motion),
    palette: oneOf(s.palette, SITE_PALETTES, DEFAULT_SITE.palette),
    mode: oneOf(s.mode, SITE_MODES, DEFAULT_SITE.mode),
    font: oneOf(s.font, SITE_FONTS, DEFAULT_SITE.font),
    menuLayout: oneOf(s.menuLayout, SITE_MENU_LAYOUTS, DEFAULT_SITE.menuLayout),
    announcement: str(s.announcement, 140),
    eyebrow: str(s.eyebrow, 60),
    tagline: str(s.tagline, 140),
    coverUrl: image(s.coverUrl),
    aboutTitle: typeof s.aboutTitle === "string" ? str(s.aboutTitle, 120) : DEFAULT_SITE.aboutTitle,
    aboutText: str(s.aboutText, 1500),
    aboutImageUrl: image(s.aboutImageUrl),
    gallery: (Array.isArray(s.gallery) ? s.gallery : []).filter(isPublishableImage).slice(0, 6),
    featuredProductIds: (Array.isArray(s.featuredProductIds) ? s.featuredProductIds : [])
      .filter((id): id is string => typeof id === "string" && UUID.test(id))
      .slice(0, 6),
    hours: DEFAULT_HOURS.map((d) => {
      const h = hours.find((x) => x?.day === d.day);
      if (!h) return d;
      return {
        day: d.day,
        open: h.open === true,
        from: typeof h.from === "string" && TIME.test(h.from) ? h.from : d.from,
        to: typeof h.to === "string" && TIME.test(h.to) ? h.to : d.to,
      };
    }),
    sections: {
      featured: sections.featured !== false,
      about: sections.about !== false,
      gallery: sections.gallery !== false,
      hours: sections.hours !== false,
      location: sections.location !== false,
    },
    email: str(s.email, 120),
    whatsapp: str(s.whatsapp, 30),
    instagramUrl: https(s.instagramUrl, 300),
    facebookUrl: https(s.facebookUrl, 300),
    tiktokUrl: https(s.tiktokUrl, 300),
    mapsUrl: https(s.mapsUrl, 500),
  };
}

export function siteOf(tenant: Tenant): SiteConfig {
  return normalizeSite((tenant.config as { site?: unknown } | undefined)?.site);
}

// Variables CSS du site : redéfinit les jetons du thème (bg-primary,
// text-muted-foreground…) pour tout le sous-arbre.
export function siteThemeStyle(site: Pick<SiteConfig, "palette" | "mode">): CSSProperties {
  const p = PALETTE_INFO[site.palette];
  const dark = site.mode === "sombre";
  return {
    "--background": dark ? p.dark : p.light,
    "--foreground": dark ? "#f3efe8" : "#1b1712",
    "--card": dark ? `color-mix(in oklab, ${p.dark} 88%, white)` : "#ffffff",
    "--card-foreground": dark ? "#f3efe8" : "#1b1712",
    "--popover": dark ? p.dark : "#ffffff",
    "--popover-foreground": dark ? "#f3efe8" : "#1b1712",
    "--muted": dark ? `color-mix(in oklab, ${p.dark} 80%, white)` : `color-mix(in oklab, ${p.light} 85%, ${p.accent})`,
    "--muted-foreground": dark ? "#b4ab9d" : "#6b6257",
    "--border": dark ? "rgb(255 255 255 / 0.1)" : "rgb(27 23 18 / 0.1)",
    "--input": dark ? "rgb(255 255 255 / 0.14)" : "rgb(27 23 18 / 0.14)",
    "--primary": p.accent,
    "--primary-foreground": p.accentFg,
    "--ring": p.accent,
    "--site-accent": p.accent,
    colorScheme: dark ? "dark" : "light",
  } as CSSProperties;
}

function minutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Ouvert maintenant ? Gère les services après minuit (18:00 → 02:00).
export function openNow(hours: SiteHours[], now = new Date()): { open: boolean; label: string } {
  const today = (now.getDay() + 6) % 7;
  const cur = now.getHours() * 60 + now.getMinutes();
  const yesterday = hours.find((h) => h.day === (today + 6) % 7);
  if (yesterday?.open && minutes(yesterday.to) < minutes(yesterday.from) && cur < minutes(yesterday.to)) {
    return { open: true, label: `Ouvert jusqu'à ${yesterday.to}` };
  }
  const h = hours.find((x) => x.day === today);
  if (h?.open) {
    const from = minutes(h.from);
    const to = minutes(h.to);
    const overnight = to <= from;
    if (cur >= from && (overnight || cur < to)) return { open: true, label: `Ouvert jusqu'à ${h.to}` };
    if (cur < from) return { open: false, label: `Ouvre à ${h.from}` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = hours.find((x) => x.day === (today + i) % 7);
    if (next?.open) return { open: false, label: `Ouvre ${i === 1 ? "demain" : DAYS[next.day].toLowerCase()} à ${next.from}` };
  }
  return { open: false, label: "Fermé" };
}

export function whatsappLink(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}
