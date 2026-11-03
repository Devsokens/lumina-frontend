// Variantes de la vitrine événementielle (tenant.config.showcase.layout) :
// structure (couverture, ordre des sections), ergonomie (présentation des
// événements, bouton billet toujours visible), animations et parcours.
// Inspirations : sites de festivals et conférences de référence (recherche
// 2026-11) — voir docs/DESIGN_VARIANTS.md. Liste alignée sur
// UpdateShowcaseDto côté backend.

export const SHOWCASE_LAYOUTS = [
  "scene",
  "affiche",
  "agenda",
  "festival",
  "conference",
  "gala",
  "club",
  "communaute",
  "masterclass",
  "minimal",
] as const;

export type ShowcaseLayout = (typeof SHOWCASE_LAYOUTS)[number];

export type ShowcaseSection = "events" | "about" | "gallery" | "testimonials" | "faq";

export type ShowcasePreset = {
  label: string;
  hint: string;
  // Couverture : centrée, alignée à gauche, affiche du 1er événement,
  // photo plein cadre, ou bandeau compact.
  hero: "center" | "left" | "poster" | "fullbleed" | "compact";
  stats: boolean;
  // Événements : cartes, agenda daté, une vedette + deux, carrousel, affiches.
  events: "cards" | "agenda" | "featured" | "carousel" | "posters";
  order: ShowcaseSection[];
  // Bouton « Billets » fixe en bas d'écran sur mobile.
  sticky: boolean;
  motion: "aucune" | "douce" | "vive";
};

export const SHOWCASE_PRESETS: Record<ShowcaseLayout, ShowcasePreset> = {
  scene: {
    label: "Scène",
    hint: "L'équilibre classique : grand titre centré, chiffres clés, cartes d'événements",
    hero: "center",
    stats: true,
    events: "cards",
    order: ["events", "about", "gallery", "testimonials", "faq"],
    sticky: false,
    motion: "douce",
  },
  affiche: {
    label: "Affiche",
    hint: "L'affiche du prochain événement en héros, puis un mur d'affiches",
    hero: "poster",
    stats: false,
    events: "posters",
    order: ["events", "gallery", "about", "testimonials", "faq"],
    sticky: true,
    motion: "vive",
  },
  agenda: {
    label: "Agenda",
    hint: "Programme daté en premier, bouton billet toujours visible",
    hero: "compact",
    stats: false,
    events: "agenda",
    order: ["events", "faq", "about", "testimonials", "gallery"],
    sticky: true,
    motion: "douce",
  },
  festival: {
    label: "Festival",
    hint: "Photo plein écran, carrousel, galerie juste après : l'énergie d'un festival",
    hero: "fullbleed",
    stats: true,
    events: "carousel",
    order: ["events", "gallery", "testimonials", "about", "faq"],
    sticky: true,
    motion: "vive",
  },
  conference: {
    label: "Conférence",
    hint: "Ton professionnel : texte à gauche, agenda, présentation et FAQ tôt",
    hero: "left",
    stats: true,
    events: "agenda",
    order: ["events", "about", "faq", "testimonials", "gallery"],
    sticky: false,
    motion: "douce",
  },
  gala: {
    label: "Gala",
    hint: "Élégance : titre centré sans chiffres, un événement vedette, témoignages",
    hero: "center",
    stats: false,
    events: "featured",
    order: ["events", "testimonials", "gallery", "about", "faq"],
    sticky: false,
    motion: "douce",
  },
  club: {
    label: "Club",
    hint: "Ambiance nuit : plein cadre, mur d'affiches et galerie immédiate",
    hero: "fullbleed",
    stats: false,
    events: "posters",
    order: ["events", "gallery", "testimonials", "faq", "about"],
    sticky: true,
    motion: "vive",
  },
  communaute: {
    label: "Communauté",
    hint: "La preuve sociale d'abord : avis et galerie avant la présentation",
    hero: "center",
    stats: true,
    events: "cards",
    order: ["events", "testimonials", "gallery", "about", "faq"],
    sticky: false,
    motion: "douce",
  },
  masterclass: {
    label: "Masterclass",
    hint: "Formation : texte à gauche, session vedette, questions fréquentes juste après",
    hero: "left",
    stats: false,
    events: "featured",
    order: ["events", "faq", "about", "testimonials", "gallery"],
    sticky: true,
    motion: "douce",
  },
  minimal: {
    label: "Minimal",
    hint: "L'essentiel : bandeau compact, agenda, rien de superflu",
    hero: "compact",
    stats: false,
    events: "agenda",
    order: ["events", "about", "faq", "testimonials", "gallery"],
    sticky: false,
    motion: "aucune",
  },
};

export function showcaseLayoutOf(v: unknown): ShowcaseLayout {
  return SHOWCASE_LAYOUTS.includes(v as ShowcaseLayout) ? (v as ShowcaseLayout) : "scene";
}
