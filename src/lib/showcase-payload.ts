import type { ShowcaseContent } from "@/stores/useShowcaseStore";

// Contenu de vitrine rendu conforme à UpdateShowcaseDto (backend) avant
// envoi. La publication automatique envoie aussi les états intermédiaires de
// la saisie (lien Facebook à moitié tapé, texte trop long, image retirée) :
// sans ce nettoyage, le serveur refusait tout (400) et la publication restait
// bloquée tant qu'un seul champ était invalide.

const LIMITS = {
  orgName: 120,
  orgTagline: 200,
  aboutTitle: 160,
  aboutText: 3000,
  heroBadge: 80,
  heroHeadline: 200,
  heroSubheadline: 500,
  heroCtaText: 60,
  statParticipants: 30,
  statEvents: 30,
  statSatisfaction: 30,
  statSecurity: 30,
  whatsappNumber: 30,
  supportPhone: 30,
  contactEmail: 120,
  address: 300,
  rccm: 60,
  nif: 60,
  instagramHandle: 60,
} as const;

const MAX_IMAGE_CHARS = 450_000;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

// Même règle que IsImageRef : https:// (≤ 2048) ou data URL PNG/JPEG/WebP.
export function isPublishableImage(v: unknown): v is string {
  if (typeof v !== "string") return false;
  if (/^https:\/\/\S+$/.test(v)) return v.length <= 2048;
  return /^data:image\/(png|jpeg|webp);base64,/.test(v) && v.length <= MAX_IMAGE_CHARS;
}

export function toShowcasePayload(content: ShowcaseContent): ShowcaseContent {
  const out = { ...content } as Record<string, unknown>;
  for (const [key, max] of Object.entries(LIMITS)) out[key] = text(out[key], max);

  out.orgLogoUrl = isPublishableImage(content.orgLogoUrl) ? content.orgLogoUrl : null;
  out.orgCoverUrl = isPublishableImage(content.orgCoverUrl) ? content.orgCoverUrl : "";
  out.galleryImages = (content.galleryImages ?? []).filter(isPublishableImage).slice(0, 12);
  out.facebookUrl = /^https:\/\/[^\s"'<>]*$/.test(content.facebookUrl ?? "")
    ? text(content.facebookUrl, 300)
    : "";
  out.testimonials = (content.testimonials ?? []).slice(0, 20).map((t) => ({
    id: text(t.id, 40),
    name: text(t.name, 80),
    role: text(t.role, 80),
    comment: text(t.comment, 600),
    rating: Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5))),
    eventName: text(t.eventName, 120),
  }));
  out.faqs = (content.faqs ?? []).slice(0, 30).map((f) => ({
    id: text(f.id, 40),
    question: text(f.question, 200),
    answer: text(f.answer, 1500),
  }));
  return out as ShowcaseContent;
}
