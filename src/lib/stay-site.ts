import type { CSSProperties } from "react";
import type { Tenant } from "@/types/api";
import { isPublishableImage } from "@/lib/showcase-payload";

// Site public d'un hébergeur (tenant.config.staySite), édité dans le
// back-office (admin/accommodation/site) — PUT /admin/tenant/stay-site, voir
// docs/API_CONTRACT.md. Les listes doivent rester alignées sur
// UpdateStaySiteDto côté backend.

export const STAY_LAYOUTS = [
  "riviera",
  "atelier",
  "horizon",
  "galerie",
  "boutique",
  "nomade",
  "lodge",
  "carnet",
  "comparatif",
  "panorama",
] as const;
export const STAY_PALETTES = ["sable", "lagon", "foret", "corail", "ardoise", "terre", "ivoire", "minuit"] as const;
export const STAY_TYPOGRAPHIES = [
  "editorial",
  "luxe",
  "classique",
  "moderne",
  "geometrique",
  "audacieux",
  "retro",
  "expressif",
] as const;
export const STAY_MODES = ["clair", "sombre"] as const;
export const STAY_MOTIONS = ["aucune", "douce", "vive"] as const;

export type StayLayout = (typeof STAY_LAYOUTS)[number];
export type StayPalette = (typeof STAY_PALETTES)[number];
export type StayTypography = (typeof STAY_TYPOGRAPHIES)[number];
export type StayMode = (typeof STAY_MODES)[number];
export type StayMotion = (typeof STAY_MOTIONS)[number];

export type StayHighlight = { title: string; text: string };

export type StaySiteSections = {
  highlights: boolean;
  featured: boolean;
  about: boolean;
  gallery: boolean;
  contact: boolean;
};

export type StaySiteConfig = {
  layout: StayLayout;
  palette: StayPalette;
  typography: StayTypography;
  mode: StayMode;
  motion: StayMotion;
  announcement: string;
  eyebrow: string;
  headline: string;
  tagline: string;
  coverUrl: string;
  aboutTitle: string;
  aboutText: string;
  aboutImageUrl: string;
  gallery: string[];
  featuredListingIds: string[];
  highlights: StayHighlight[];
  sections: StaySiteSections;
  email: string;
  whatsapp: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  mapsUrl: string;
};

export const STAY_LAYOUT_INFO: Record<StayLayout, { label: string; hint: string }> = {
  riviera: { label: "Riviera", hint: "Couverture plein écran, titre centré et recherche flottante" },
  atelier: { label: "Atelier", hint: "Mise en page magazine, texte et photo en regard" },
  horizon: { label: "Horizon", hint: "Bandeau panoramique et carrousel de logements" },
  galerie: { label: "Galerie", hint: "Mosaïque de photos, idéal pour les beaux intérieurs" },
  boutique: { label: "Boutique", hint: "Typographie centrée, épurée, façon hôtel de charme" },
  nomade: { label: "Nomade", hint: "Ambiance immersive et index numéroté des logements" },
  lodge: { label: "Lodge", hint: "Recherche toujours visible à côté de la couverture : réserver en deux gestes" },
  carnet: { label: "Carnet", hint: "Le récit du lieu d'abord, façon boutique-hôtel, puis les logements" },
  comparatif: { label: "Comparatif", hint: "Tableau des logements (voyageurs, chambres, prix) pour choisir vite" },
  panorama: { label: "Panorama", hint: "Plein écran, les logements défilent au bas de la couverture" },
};

// accent2 : teinte douce pour les fonds de section et les dégradés.
export const STAY_PALETTE_INFO: Record<
  StayPalette,
  { label: string; accent: string; accentFg: string; accent2: string; light: string; dark: string }
> = {
  sable: { label: "Sable & caramel", accent: "#a8662f", accentFg: "#fffaf3", accent2: "#ecdcc4", light: "#f8f3ea", dark: "#14100b" },
  lagon: { label: "Lagon", accent: "#0e7a88", accentFg: "#f0fbfc", accent2: "#c4e6e3", light: "#f2f8f8", dark: "#061215" },
  foret: { label: "Forêt", accent: "#2f5d46", accentFg: "#f3faf5", accent2: "#d0decb", light: "#f4f6f0", dark: "#0a110d" },
  corail: { label: "Corail", accent: "#d9583f", accentFg: "#fff6f3", accent2: "#f6d2c6", light: "#fdf5f1", dark: "#160c0a" },
  ardoise: { label: "Ardoise", accent: "#334155", accentFg: "#f8fafc", accent2: "#d3d9e2", light: "#f4f5f7", dark: "#0c0f14" },
  terre: { label: "Latérite", accent: "#94431f", accentFg: "#fff7f2", accent2: "#ebcbb6", light: "#f9f1eb", dark: "#140b08" },
  ivoire: { label: "Ivoire & or", accent: "#9a7b3f", accentFg: "#fffdf7", accent2: "#ece2c9", light: "#fbf9f3", dark: "#11100c" },
  minuit: { label: "Minuit", accent: "#6555f0", accentFg: "#f7f6ff", accent2: "#dad5fd", light: "#f6f5fd", dark: "#0a0916" },
};

// Couples titre / texte : variables chargées par lib/site-fonts.ts.
export const STAY_TYPOGRAPHY_INFO: Record<StayTypography, { label: string; display: string; body: string; sample: string }> = {
  editorial: { label: "Éditorial", display: "var(--font-stay-fraunces)", body: "var(--font-site-sans)", sample: "Une maison face à l'océan" },
  luxe: { label: "Luxe", display: "var(--font-site-serif)", body: "var(--font-site-sans)", sample: "Suites & villas d'exception" },
  classique: { label: "Classique", display: "var(--font-site-bold)", body: "var(--font-stay-dmsans)", sample: "L'hospitalité à l'ancienne" },
  moderne: { label: "Moderne", display: "var(--font-site-sans)", body: "var(--font-site-sans)", sample: "Appartements en centre-ville" },
  geometrique: { label: "Géométrique", display: "var(--font-stay-grotesk)", body: "var(--font-stay-dmsans)", sample: "Lofts au design affirmé" },
  audacieux: { label: "Audacieux", display: "var(--font-stay-syne)", body: "var(--font-stay-dmsans)", sample: "Séjours hors du commun" },
  retro: { label: "Rétro", display: "var(--font-stay-dmserif)", body: "var(--font-stay-dmsans)", sample: "Le charme d'une villa coloniale" },
  expressif: { label: "Expressif", display: "var(--font-stay-bricolage)", body: "var(--font-stay-bricolage)", sample: "Cases & bungalows nature" },
};

export const STAY_MOTION_INFO: Record<StayMotion, string> = {
  aucune: "Aucune",
  douce: "Douce",
  vive: "Vive",
};

export const DEFAULT_STAY_SITE: StaySiteConfig = {
  layout: "riviera",
  palette: "sable",
  typography: "editorial",
  mode: "clair",
  motion: "douce",
  announcement: "",
  eyebrow: "",
  headline: "",
  tagline: "",
  coverUrl: "",
  aboutTitle: "Notre maison",
  aboutText: "",
  aboutImageUrl: "",
  gallery: [],
  featuredListingIds: [],
  highlights: [],
  sections: { highlights: true, featured: true, about: true, gallery: true, contact: true },
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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Lecture tolérante : config absente, partielle ou d'une ancienne version.
// Sert aussi à nettoyer le contenu avant PUT (mêmes contraintes que le DTO).
export function normalizeStaySite(raw: unknown): StaySiteConfig {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const sections = (s.sections && typeof s.sections === "object" ? s.sections : {}) as Record<string, unknown>;
  return {
    layout: oneOf(s.layout, STAY_LAYOUTS, DEFAULT_STAY_SITE.layout),
    palette: oneOf(s.palette, STAY_PALETTES, DEFAULT_STAY_SITE.palette),
    typography: oneOf(s.typography, STAY_TYPOGRAPHIES, DEFAULT_STAY_SITE.typography),
    mode: oneOf(s.mode, STAY_MODES, DEFAULT_STAY_SITE.mode),
    motion: oneOf(s.motion, STAY_MOTIONS, DEFAULT_STAY_SITE.motion),
    announcement: str(s.announcement, 140),
    eyebrow: str(s.eyebrow, 60),
    headline: str(s.headline, 120),
    tagline: str(s.tagline, 200),
    coverUrl: image(s.coverUrl),
    aboutTitle: typeof s.aboutTitle === "string" ? str(s.aboutTitle, 120) : DEFAULT_STAY_SITE.aboutTitle,
    aboutText: str(s.aboutText, 1500),
    aboutImageUrl: image(s.aboutImageUrl),
    gallery: (Array.isArray(s.gallery) ? s.gallery : []).filter(isPublishableImage).slice(0, 8),
    featuredListingIds: (Array.isArray(s.featuredListingIds) ? s.featuredListingIds : [])
      .filter((id): id is string => typeof id === "string" && UUID.test(id))
      .slice(0, 6),
    highlights: (Array.isArray(s.highlights) ? s.highlights : [])
      .filter((h): h is Record<string, unknown> => !!h && typeof h === "object")
      .map((h) => ({ title: str(h.title, 60), text: str(h.text, 160) }))
      .slice(0, 4),
    sections: {
      highlights: sections.highlights !== false,
      featured: sections.featured !== false,
      about: sections.about !== false,
      gallery: sections.gallery !== false,
      contact: sections.contact !== false,
    },
    email: str(s.email, 120),
    whatsapp: str(s.whatsapp, 30),
    instagramUrl: https(s.instagramUrl, 300),
    facebookUrl: https(s.facebookUrl, 300),
    tiktokUrl: https(s.tiktokUrl, 300),
    mapsUrl: https(s.mapsUrl, 500),
  };
}

export function staySiteOf(tenant: Tenant): StaySiteConfig {
  return normalizeStaySite((tenant.config as { staySite?: unknown } | undefined)?.staySite);
}

// Variables CSS du site : redéfinit les jetons du thème (bg-primary,
// font-display…) pour tout le sous-arbre.
export function staySiteStyle(site: Pick<StaySiteConfig, "palette" | "mode" | "typography">): CSSProperties {
  const p = STAY_PALETTE_INFO[site.palette];
  const t = STAY_TYPOGRAPHY_INFO[site.typography];
  const dark = site.mode === "sombre";
  const fg = dark ? "#f4f0ea" : "#1a1714";
  return {
    "--background": dark ? p.dark : p.light,
    "--foreground": fg,
    "--card": dark ? `color-mix(in oklab, ${p.dark} 90%, white)` : "#ffffff",
    "--card-foreground": fg,
    "--popover": dark ? p.dark : "#ffffff",
    "--popover-foreground": fg,
    "--muted": dark ? `color-mix(in oklab, ${p.dark} 82%, white)` : `color-mix(in oklab, ${p.light} 70%, ${p.accent2})`,
    "--muted-foreground": dark ? "#b3aa9e" : "#6a6158",
    "--border": dark ? "rgb(255 255 255 / 0.1)" : "rgb(26 23 20 / 0.1)",
    "--input": dark ? "rgb(255 255 255 / 0.14)" : "rgb(26 23 20 / 0.14)",
    "--primary": p.accent,
    "--primary-foreground": p.accentFg,
    "--ring": p.accent,
    "--site-accent": p.accent,
    "--site-soft": dark ? `color-mix(in oklab, ${p.dark} 75%, ${p.accent})` : p.accent2,
    "--font-display": t.display,
    "--font-body": t.body,
    fontFamily: t.body,
    colorScheme: dark ? "dark" : "light",
  } as CSSProperties;
}

export function whatsappHref(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}
