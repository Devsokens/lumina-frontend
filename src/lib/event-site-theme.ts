import type { CSSProperties } from "react";
import type { ShowcaseContent, ShowcaseDesign, ShowcaseTheme } from "@/stores/useShowcaseStore";

// Site vitrine événementiel, refonte Claude Design 2026-11 (écrans 15 à 20) :
// deux modèles (Nuit, Lumière), cinq palettes, quatre typographies.
//
// Enregistré dans showcase.design (UpdateShowcaseDto) : modèle, palette ou
// couleurs libres, typographie, arrondis, mot du titre mis en couleur, taille
// du titre. Les anciens champs restent tenus à jour (et servent de repli
// pour une vitrine enregistrée avant) :
//   modèle      → layout      (« minimal » = Lumière, toute autre valeur = Nuit)
//   palette     → theme       (amber, ruby, emerald, indigo, electric)
//   typographie → fontFamily  (Outfit, Plus Jakarta Sans, Inter, Syne)

export type SiteModel = "nuit" | "lumiere";
export type SiteTypo = "expressive" | "moderne" | "elegante" | "audacieuse";
export type PaletteKey = "amber" | "ruby" | "emerald" | "indigo" | "electric";

export const MODEL_LABELS: Record<SiteModel, string> = { nuit: "Nuit", lumiere: "Lumière" };

export function modelOf(layout: string | undefined): SiteModel {
  return layout === "minimal" ? "lumiere" : "nuit";
}
export function layoutFor(model: SiteModel): ShowcaseContent["layout"] {
  return model === "lumiere" ? "minimal" : "club";
}

export const PALETTE_KEYS: PaletteKey[] = ["amber", "ruby", "emerald", "indigo", "electric"];

export function paletteOf(theme: ShowcaseTheme | string | undefined): PaletteKey {
  return (PALETTE_KEYS as string[]).includes(theme ?? "") ? (theme as PaletteKey) : "amber";
}

type Palette = { name: string; bg: string; text: string; accent: string; accentInk: string; light: boolean };

// Nuit : fond sombre chaud, accent vif. « Clair » : variante claire du modèle.
const NUIT: Record<PaletteKey, Palette> = {
  amber: { name: "Ambre", bg: "#0E0C0A", text: "#F4EEE4", accent: "#F5B83D", accentInk: "#0E0C0A", light: false },
  ruby: { name: "Corail", bg: "#120D0C", text: "#F4EEE4", accent: "#FF5C39", accentInk: "#120D0C", light: false },
  emerald: { name: "Émeraude", bg: "#0B1412", text: "#EEF4F1", accent: "#3DD6B5", accentInk: "#0B1412", light: false },
  indigo: { name: "Lavande", bg: "#110F17", text: "#F1EEF6", accent: "#C9A7FF", accentInk: "#110F17", light: false },
  electric: { name: "Clair", bg: "#F6F3EC", text: "#16211C", accent: "#0C4A3A", accentInk: "#FFFFFF", light: true },
};

// Lumière : fond blanc, accent pour les sur-titres et liens.
const LUMIERE: Record<PaletteKey, Palette> = {
  amber: { name: "Forêt", bg: "#FFFFFF", text: "#0F1115", accent: "#0F7A5A", accentInk: "#FFFFFF", light: true },
  ruby: { name: "Brique", bg: "#FFFFFF", text: "#0F1115", accent: "#D9481F", accentInk: "#FFFFFF", light: true },
  emerald: { name: "Océan", bg: "#FFFFFF", text: "#0F1115", accent: "#2F5BD3", accentInk: "#FFFFFF", light: true },
  indigo: { name: "Prune", bg: "#FFFFFF", text: "#0F1115", accent: "#9B3FB5", accentInk: "#FFFFFF", light: true },
  electric: { name: "Encre", bg: "#FFFFFF", text: "#0F1115", accent: "#0F1115", accentInk: "#FFFFFF", light: true },
};

export function palettesFor(model: SiteModel) {
  return model === "lumiere" ? LUMIERE : NUIT;
}

export const TYPO_LABELS: Record<SiteTypo, string> = {
  expressive: "Expressive",
  moderne: "Moderne",
  elegante: "Élégante",
  audacieuse: "Audacieuse",
};

const TYPO_BY_FONT: Record<string, SiteTypo> = {
  Outfit: "expressive",
  "Plus Jakarta Sans": "moderne",
  Inter: "elegante",
  Syne: "audacieuse",
};
export const FONT_FOR_TYPO: Record<SiteTypo, ShowcaseContent["fontFamily"]> = {
  expressive: "Outfit",
  moderne: "Plus Jakarta Sans",
  elegante: "Inter",
  audacieuse: "Syne",
};

export function typoOf(fontFamily: string | undefined, model: SiteModel): SiteTypo {
  return TYPO_BY_FONT[fontFamily ?? ""] ?? (model === "lumiere" ? "moderne" : "expressive");
}

// Variables des polices : lib/event-site-fonts.ts.
const DISPLAY_FONT: Record<SiteTypo, string> = {
  expressive: "var(--font-es-bricolage)",
  moderne: "var(--font-es-manrope)",
  elegante: "var(--font-es-fraunces)",
  audacieuse: "var(--font-es-unbounded)",
};

export type SiteRadius = "droits" | "doux" | "arrondis";
export type HeadlineSize = "S" | "M" | "L" | "XL";
export type SiteColors = { accent: string; background: string; text: string };

export type SiteLook = {
  model: SiteModel;
  palette: PaletteKey | "custom";
  typo: SiteTypo;
  radius: SiteRadius;
  colors?: SiteColors;
  headlineSize?: HeadlineSize;
};

export function lookOf(content: Pick<ShowcaseContent, "layout" | "theme" | "fontFamily" | "design">): SiteLook {
  const d = content.design;
  if (d) {
    return {
      model: d.model === "lumiere" ? "lumiere" : "nuit",
      palette: d.palette === "custom" && d.colors ? "custom" : paletteOf(d.palette),
      typo: d.typography in TYPO_LABELS ? d.typography : "expressive",
      radius: d.radius ?? "arrondis",
      colors: d.colors,
      headlineSize: d.headlineSize,
    };
  }
  const model = modelOf(content.layout);
  return { model, palette: paletteOf(content.theme), typo: typoOf(content.fontFamily, model), radius: "arrondis" };
}

// Réglages d'apparence à enregistrer : design + anciens champs synchronisés.
export function designPatch(look: SiteLook, current?: ShowcaseDesign): Pick<ShowcaseContent, "design" | "layout" | "theme" | "fontFamily"> {
  return {
    design: {
      ...current,
      model: look.model,
      palette: look.palette,
      typography: look.typo,
      radius: look.radius,
      ...(look.palette === "custom" && look.colors ? { colors: look.colors } : { colors: undefined }),
      ...(look.headlineSize ? { headlineSize: look.headlineSize } : {}),
    },
    layout: layoutFor(look.model),
    theme: look.palette === "custom" ? "amber" : look.palette,
    fontFamily: FONT_FOR_TYPO[look.typo],
  };
}

function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrastRatio(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// Palette effective (prédéfinie, ou couleurs libres).
export function paletteFor(look: SiteLook): Palette {
  if (look.palette === "custom" && look.colors) {
    const { accent, background, text } = look.colors;
    return {
      name: "Personnalisée",
      bg: background,
      text,
      accent,
      accentInk: contrastRatio(accent, "#0E0C0A") >= contrastRatio(accent, "#FFFFFF") ? "#0E0C0A" : "#FFFFFF",
      light: luminance(background) > 0.4,
    };
  }
  return palettesFor(look.model)[look.palette === "custom" ? "amber" : look.palette];
}

const H1_SCALE: Record<HeadlineSize, number> = { S: 0.72, M: 0.86, L: 1, XL: 1.14 };

// Jetons CSS du site (--s-*), utilisés par les modèles via bg-(--s-bg)…
// Les surfaces sont dérivées du fond et du texte : chaque palette (claire
// ou sombre) garde des contrastes cohérents.
export function siteStyle(look: SiteLook): CSSProperties {
  const p = paletteFor(look);
  const mix = (pct: number) => `color-mix(in srgb, ${p.text} ${pct}%, ${p.bg})`;
  const display = DISPLAY_FONT[look.typo];
  const lumiere = look.model === "lumiere";
  return {
    "--s-bg": p.bg,
    "--s-text": p.text,
    "--s-accent": p.accent,
    "--s-accent-ink": p.accentInk,
    "--s-accent-soft": `color-mix(in srgb, ${p.accent} 18%, transparent)`,
    "--s-accent-tint": `color-mix(in srgb, ${p.accent} 7%, transparent)`,
    // Surfaces : cartes, blocs, photos en attente.
    "--s-surface": lumiere ? "#FFFFFF" : mix(7),
    "--s-surface2": mix(lumiere ? 7 : 11),
    "--s-surface3": mix(lumiere ? 11 : 15),
    "--s-band": lumiere ? "#F7F7F5" : mix(4),
    "--s-footer": p.light ? mix(3) : `color-mix(in srgb, #000 30%, ${p.bg})`,
    "--s-chip": lumiere ? "#F3F3F1" : mix(10),
    // Textes secondaires.
    "--s-soft": mix(88),
    "--s-body": mix(lumiere ? 82 : 76),
    "--s-muted": mix(lumiere ? 66 : 64),
    "--s-faint": mix(lumiere ? 50 : 40),
    // Traits.
    "--s-line": mix(lumiere ? 9 : 8),
    "--s-line2": mix(lumiere ? 15 : 18),
    "--s-line3": mix(lumiere ? 24 : 28),
    "--s-dark": lumiere ? "#0F1115" : p.text,
    "--s-dark-ink": lumiere ? "#FFFFFF" : p.bg,
    "--s-header": `color-mix(in srgb, ${p.bg} 86%, transparent)`,
    "--s-font-display": lumiere && look.typo === "moderne" ? "var(--font-es-manrope)" : display,
    "--s-font-body": lumiere ? "var(--font-es-manrope)" : "var(--font-es-geist)",
    "--s-font-mono": "var(--font-es-geist-mono)",
    "--s-h1": String(H1_SCALE[look.headlineSize ?? "L"]),
    colorScheme: p.light ? "light" : "dark",
  } as CSSProperties;
}
