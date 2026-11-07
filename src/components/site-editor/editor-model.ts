import { showcaseDefaultsFor, showcaseFromConfig, type ShowcaseContent, type ShowcaseSections } from "@/stores/useShowcaseStore";
import { DEFAULT_FAQS } from "@/components/event-site/site-data";
import { FONT_FOR_TYPO, layoutFor } from "@/lib/event-site-theme";
import type { Tenant } from "@/types/api";

// Éditeur du site vitrine (refonte Claude Design 2026-11, écrans 19 et 20) :
// sections, textes modifiables et contenu de départ.

export type SectionKey = "header" | "hero" | "about" | "events" | "gallery" | "faq" | "footer";

export const SECTIONS: { key: SectionKey; label: string; vis?: keyof ShowcaseSections }[] = [
  { key: "header", label: "En-tête" },
  { key: "hero", label: "Hero" },
  { key: "about", label: "L'organisation", vis: "about" },
  { key: "events", label: "Prochains événements", vis: "events" },
  { key: "gallery", label: "Souvenirs", vis: "gallery" },
  { key: "faq", label: "FAQ", vis: "faq" },
  { key: "footer", label: "Pied de page" },
];
export const SECTION_LABEL = Object.fromEntries(SECTIONS.map((s) => [s.key, s.label])) as Record<SectionKey, string>;

export type TextField = "heroBadge" | "heroHeadline" | "heroSubheadline" | "heroCtaText" | "aboutTitle" | "aboutText" | "orgName" | "orgTagline";

// Limites : UpdateShowcaseDto (backend).
export const FIELDS: Record<TextField, { label: string; crumb: string; section: SectionKey; max: number; rows: number }> = {
  heroBadge: { label: "Étiquette", crumb: "Étiquette", section: "hero", max: 80, rows: 1 },
  heroHeadline: { label: "Titre principal", crumb: "Titre", section: "hero", max: 200, rows: 2 },
  heroSubheadline: { label: "Sous-titre", crumb: "Sous-titre", section: "hero", max: 500, rows: 4 },
  heroCtaText: { label: "Bouton principal", crumb: "Bouton", section: "hero", max: 60, rows: 1 },
  aboutTitle: { label: "Titre de la section", crumb: "Titre", section: "about", max: 160, rows: 2 },
  aboutText: { label: "Présentation", crumb: "Texte", section: "about", max: 3000, rows: 8 },
  orgName: { label: "Nom affiché", crumb: "Nom", section: "header", max: 120, rows: 1 },
  orgTagline: { label: "Slogan", crumb: "Slogan", section: "header", max: 200, rows: 2 },
};

export const isTextField = (v: string | undefined): v is TextField => !!v && v in FIELDS;

// Proposition de l'IA en attente : montrée sur l'aperçu, appliquée sur demande.
export type AiProposal = { field: TextField | "faq"; text: string; question?: string } | null;

export function proposalPatch(p: NonNullable<AiProposal>, content: ShowcaseContent, id = `faq-${Date.now().toString(36)}`): Partial<ShowcaseContent> {
  return p.field === "faq"
    ? { faqs: [...(content.faqs ?? []), { id, question: (p.question ?? "").slice(0, 200), answer: p.text.slice(0, 1500) }] }
    : { [p.field]: p.text.slice(0, FIELDS[p.field].max) };
}

// Contenu de départ d'un compte sans site publié : les textes du nouveau
// design et l'identité du compte (jamais les exemples de démonstration).
export function initialContent(tenant: Tenant): { content: ShowcaseContent; saved: boolean } {
  const config = (tenant.config ?? {}) as Record<string, unknown>;
  if (config.showcase) return { content: showcaseFromConfig(tenant.config, tenant.name), saved: true };
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const description = str(config.description);
  return {
    saved: false,
    content: {
      ...showcaseDefaultsFor(tenant.name),
      theme: "amber",
      layout: layoutFor("nuit"),
      fontFamily: FONT_FOR_TYPO.expressive,
      design: { model: "nuit", palette: "amber", typography: "expressive", radius: "arrondis" },
      orgTagline: "Événements & expériences",
      orgLogoUrl: str(config.logoUrl) || null,
      orgCoverUrl: "",
      heroBadge: "",
      heroHeadline: "Vivez des moments inoubliables.",
      heroSubheadline: description,
      heroCtaText: "Voir les événements",
      aboutTitle: "Nous créons des moments qui rassemblent.",
      aboutText: description,
      galleryImages: [],
      testimonials: [],
      faqs: DEFAULT_FAQS,
      supportPhone: str(config.phone),
      address: str(config.address),
    },
  };
}

// Nombre de réglages qui diffèrent de la version publiée.
export function countChanges(a: ShowcaseContent, b: ShowcaseContent | null) {
  if (!b) return 0;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof ShowcaseContent>;
  let n = 0;
  for (const k of keys) if (JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null)) n++;
  return n;
}
