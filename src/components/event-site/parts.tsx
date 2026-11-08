"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { APP_URL } from "@/lib/constants";
import { LEGAL_LINKS } from "@/lib/legal";
import type { SiteData, SiteEvent } from "@/components/event-site/site-data";
import type { FAQItem } from "@/stores/useShowcaseStore";

// Pièces communes aux modèles Nuit et Lumière.

export type SiteMode = { preview?: boolean };

// Mention GiyaX en pied de page, avec les documents légaux de la plateforme
// (sous-traitant des données des acheteurs). Adresses absolues : le site
// public peut être servi sur le sous-domaine de l'organisateur.
export function GiyaxCredit() {
  const link = "underline-offset-4 hover:underline";
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      <span>Billetterie propulsée par GiyaX</span>
      <a href={`${APP_URL}${LEGAL_LINKS.privacy}`} target="_blank" rel="noopener noreferrer" className={link}>
        Confidentialité
      </a>
      <a href={`${APP_URL}${LEGAL_LINKS.terms}`} target="_blank" rel="noopener noreferrer" className={link}>
        Conditions
      </a>
    </span>
  );
}

// Photo réelle, ou emplacement gris (libellé visible dans l'éditeur).
export function Photo({ src, alt = "", label, preview, className, imgClassName }: { src?: string | null; alt?: string; label?: string; preview?: boolean; className?: string; imgClassName?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={cn("absolute inset-0 size-full object-cover", imgClassName)} />
      ) : (
        preview && label && <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-[13px] text-(--s-faint)">[{label}]</span>
      )}
    </div>
  );
}

// Logo de l'organisation, ou ses initiales.
export function OrgMark({ site, className, rounded }: { site: SiteData; className?: string; rounded?: boolean }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden", rounded ? "rounded-full" : "rounded-[10px]", className)}>
      {site.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={site.logo} alt="" className="size-full bg-white object-contain p-0.5" />
      ) : (
        site.initials
      )}
    </span>
  );
}

export function Soon() {
  return <span className="ml-2 inline-flex h-6 items-center rounded-full bg-(--s-chip) px-2.5 align-middle text-xs font-semibold text-(--s-muted)">Bientôt</span>;
}

// nom.giyax.com/events/42 sur sous-domaine, giyax.vercel.app/nom/events/42 sinon.
export function homeHref(site: SiteData, hash = "") {
  const base = site.base ?? `/${site.slug}`;
  return base ? `${base}${hash}` : `/${hash}`;
}
export function eventHref(site: SiteData, e: SiteEvent) {
  return `${site.base ?? `/${site.slug}`}/events/${e.id}`;
}

// Itinéraire vers le point placé sur la carte, sinon recherche de l'adresse.
export function mapsLink(e: SiteEvent) {
  if (e.coords) return `https://www.google.com/maps/dir/?api=1&destination=${e.coords.lat},${e.coords.lng}`;
  const q = [e.venue, e.place].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

// Carte intégrée (Google Maps, sans clé ; frame-src autorisé dans la CSP).
// Uniquement quand l'organisateur a placé le lieu : une adresse libre peut
// tomber à côté, le lien « Itinéraire » reste alors la seule aide.
export function mapEmbed(e: SiteEvent) {
  if (!e.coords) return null;
  return `https://www.google.com/maps?q=${e.coords.lat},${e.coords.lng}&z=16&hl=fr&output=embed`;
}

export function EventMap({ event, className }: { event: SiteEvent; className?: string }) {
  const src = mapEmbed(event);
  if (!src) return null;
  return (
    <iframe
      src={src}
      title={`Carte : ${event.venue ?? event.title}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={className}
    />
  );
}

// Questions fréquentes : la première ouverte.
export function FaqList({ faqs, render }: { faqs: FAQItem[]; render: (f: FAQItem, open: boolean, toggle: () => void) => ReactNode }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return <>{faqs.map((f) => render(f, open === f.id, () => setOpen(open === f.id ? null : f.id)))}</>;
}

// Lien construit au clic : l'adresse de la page n'est connue que du
// navigateur (un href calculé au rendu différerait entre serveur et client).
export function shareOnWhatsApp(e: SiteEvent) {
  const text = `${e.title} — ${e.dateLong}\n${window.location.href}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

export function copyLink() {
  navigator.clipboard?.writeText(window.location.href).then(
    () => toast.success("Lien copié"),
    () => toast.error("Copie impossible")
  );
}

// Programme, intervenants et album d'un événement : pas encore de données
// côté serveur. Affichés dans l'aperçu de l'éditeur seulement (« Bientôt »).
export const PROGRAM_PLACEHOLDER = [
  { time: "[Horaire]", title: "[Accueil des participants]", sub: "[Détail de la session]" },
  { time: "[Horaire]", title: "[Conférence d'ouverture]", sub: "[Intervenant]" },
  { time: "[Horaire]", title: "[Ateliers pratiques]", sub: "[Thèmes des ateliers]" },
  { time: "[Horaire]", title: "[Clôture]", sub: "[Détail]" },
];

export const LOGO_ROLE: Record<string, string> = {
  MAIN_ORGANIZER: "Organisateur principal",
  CO_ORGANIZER: "Co-organisateur",
  PARTNER: "Partenaire",
  SPONSOR: "Sponsor",
  INSTITUTION: "Institution",
};

export function Icon({ d, className, size = 18 }: { d: string; className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("shrink-0", className)}>
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  pin: "M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  cal: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14l-1.5 8 5-3 5 3-1.5-8",
  image: "M3 5h18v14H3zM8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 16l-5-5-8 8",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  qr: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
};

// Visionneuse d'album (Souvenirs, photos d'un événement) : grande photo,
// flèches et Échap. Désactivée dans l'aperçu de l'éditeur.
export function Lightbox({ photos, title, start = 0, onClose }: { photos: string[]; title: string; start?: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const go = (d: number) => setI((n) => (n + d + photos.length) % photos.length);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      ref={(el) => el?.focus()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      className="fixed inset-0 z-[80] flex flex-col bg-black/90 text-white outline-none"
    >
      <div className="flex items-center justify-between gap-4 p-4">
        <span className="truncate text-sm font-semibold">
          {title} · {i + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose} aria-label="Fermer" className="flex size-10 items-center justify-center rounded-full bg-white/10 text-xl hover:bg-white/20">
          ×
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[i]} alt={`${title}, photo ${i + 1}`} className="max-h-full max-w-full rounded-lg object-contain" />
        {photos.length > 1 && (
          <>
            <button type="button" aria-label="Photo précédente" onClick={() => go(-1)} className="absolute left-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20">
              ‹
            </button>
            <button type="button" aria-label="Photo suivante" onClick={() => go(1)} className="absolute right-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20">
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
