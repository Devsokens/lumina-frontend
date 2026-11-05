import type { CSSProperties } from "react";
import { FEATURES } from "@/lib/features";
import type { ShowcaseSections, ShowcaseState, ShowcaseTheme } from "@/stores/useShowcaseStore";

// Charte de la vitrine événementielle : chaque thème = un fond et UNE couleur
// d'accent, appliqués partout (boutons, dates, prix, étoiles, liens). Aucune
// autre couleur vive dans le modèle : c'est ce qui garde le thème choisi
// reconnaissable. Valeurs exposées en variables CSS (--sc-*) sur la racine.
type ThemeTokens = {
  bg: string; // fond principal
  bgAlt: string; // fond des sections alternées
  glass: string; // barre de navigation translucide
  accent: string; // boutons, puces
  accentText: string; // accent lisible en texte sur le fond
  onAccent: string; // texte sur un bouton d'accent
  glow: string; // halo de la couverture
};

export const SHOWCASE_THEMES: Record<ShowcaseTheme, ThemeTokens> = {
  // Signature GiyaX : vert profond et or.
  emerald: {
    bg: "#06140f",
    bgAlt: "#0a1d16",
    glass: "rgba(6, 20, 15, 0.82)",
    accent: "#f4b942",
    accentText: "#f4b942",
    onAccent: "#0a2e23",
    glow: "rgba(16, 97, 75, 0.55)",
  },
  amber: {
    bg: "#0d0a07",
    bgAlt: "#15100a",
    glass: "rgba(13, 10, 7, 0.82)",
    accent: "#f59e0b",
    accentText: "#fbbf24",
    onAccent: "#1c1206",
    glow: "rgba(245, 158, 11, 0.28)",
  },
  electric: {
    bg: "#050a12",
    bgAlt: "#08111d",
    glass: "rgba(5, 10, 18, 0.82)",
    accent: "#22d3ee",
    accentText: "#67e8f9",
    onAccent: "#042029",
    glow: "rgba(34, 211, 238, 0.25)",
  },
  ruby: {
    bg: "#0f070b",
    bgAlt: "#170b11",
    glass: "rgba(15, 7, 11, 0.82)",
    accent: "#e11d48",
    accentText: "#fb7185",
    onAccent: "#ffffff",
    glow: "rgba(225, 29, 72, 0.28)",
  },
  indigo: {
    bg: "#070914",
    bgAlt: "#0c1020",
    glass: "rgba(7, 9, 20, 0.82)",
    accent: "#6366f1",
    accentText: "#a5b4fc",
    onAccent: "#ffffff",
    glow: "rgba(99, 102, 241, 0.3)",
  },
  dark: {
    bg: "#0a0a0a",
    bgAlt: "#121212",
    glass: "rgba(10, 10, 10, 0.82)",
    accent: "#fafafa",
    accentText: "#fafafa",
    onAccent: "#0a0a0a",
    glow: "rgba(255, 255, 255, 0.08)",
  },
};

export function showcaseThemeVars(theme: ShowcaseTheme): CSSProperties {
  const t = SHOWCASE_THEMES[theme] ?? SHOWCASE_THEMES.emerald;
  return {
    "--sc-bg": t.bg,
    "--sc-bg-alt": t.bgAlt,
    "--sc-glass": t.glass,
    "--sc-accent": t.accent,
    "--sc-accent-text": t.accentText,
    "--sc-on-accent": t.onAccent,
    "--sc-glow": t.glow,
    backgroundColor: t.bg,
  } as CSSProperties;
}

// Police choisie dans le paramétrage, appliquée aux titres ET au texte.
// Variables chargées par lib/site-fonts.ts (siteFontVariables).
const FONT_STACKS: Record<ShowcaseState["fontFamily"], string> = {
  Outfit: "var(--font-showcase-outfit), ui-sans-serif, system-ui, sans-serif",
  Syne: "var(--font-stay-syne), ui-sans-serif, system-ui, sans-serif",
  Inter: "var(--font-body), ui-sans-serif, system-ui, sans-serif",
  "Plus Jakarta Sans": "var(--font-showcase-jakarta), ui-sans-serif, system-ui, sans-serif",
};

export function showcaseFontStack(font: ShowcaseState["fontFamily"]): string {
  return FONT_STACKS[font] ?? FONT_STACKS.Outfit;
}

type VisibilityInput = Pick<
  ShowcaseState,
  | "visibleSections"
  | "aboutText"
  | "galleryImages"
  | "testimonials"
  | "faqs"
  | "statParticipants"
  | "statEvents"
  | "statSatisfaction"
  | "statSecurity"
>;

// Même règle dans l'éditeur et sur le site public, pour que l'aperçu soit
// exactement le site en ligne :
// - une section sans contenu n'est pas affichée ;
// - les interrupteurs « afficher / masquer » ne comptent que si le serveur
//   les enregistre (drapeau showcase-sections), sinon le site public ne
//   pourrait pas les suivre.
export function showcaseSectionShown(s: VisibilityInput, section: keyof ShowcaseSections): boolean {
  if (FEATURES.showcaseSections && s.visibleSections && s.visibleSections[section] === false) return false;
  switch (section) {
    case "about":
      return s.aboutText.trim().length > 0;
    case "gallery":
      return s.galleryImages.length > 0;
    case "testimonials":
      return s.testimonials.length > 0;
    case "faq":
      return s.faqs.length > 0;
    case "stats":
      return [s.statParticipants, s.statEvents, s.statSatisfaction, s.statSecurity].some((v) => v.trim());
    default:
      return true;
  }
}
