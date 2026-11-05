import type { EventStatus, EventType, QuestionType } from "@/types/api";
import { FEATURES } from "@/lib/features";

// Libellés, couleurs et formats du module Événements (refonte 2026-11).

export const STATUS_META: Record<EventStatus, { label: string; tone: "ok" | "neutral" | "warn" | "danger" }> = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  PUBLISHED: { label: "En vente", tone: "ok" },
  ONGOING: { label: "En cours", tone: "ok" },
  COMPLETED: { label: "Terminé", tone: "neutral" },
  CANCELLED: { label: "Annulé", tone: "danger" },
};

// Icônes du design (chemins SVG 24 × 24, trait 2).
export const TYPE_ICON_PATHS = {
  music: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  cap: "M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5",
  glass: "M8 22h8M12 15v7M5 3h14l-1 7a6 6 0 0 1-12 0z",
  expo: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  mask: "M4 4h16v6a8 8 0 0 1-16 0zM9 9h.01M15 9h.01M9 13c1.5 1.5 4.5 1.5 6 0",
  more: "M5 12h.01M12 12h.01M19 12h.01",
} as const;

// Types d'événement, dans l'ordre du design. `value: null` = « Autre »
// (aucun type). WEDDING et « Autre » ne sont acceptés par le serveur
// qu'avec le drapeau event-extras.
export type EventTypeOption = {
  key: string;
  value: EventType | null;
  label: string;
  card: string; // libellé court des cartes (« Formation · Conférence »)
  icon: keyof typeof TYPE_ICON_PATHS;
  extra?: boolean;
};

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  { key: "CONCERT", value: "CONCERT", label: "Concert & festival", card: "Concert · Festival", icon: "music" },
  { key: "WEDDING", value: "WEDDING", label: "Mariage & fête", card: "Mariage · Fête", icon: "heart" },
  { key: "CONFERENCE", value: "CONFERENCE", label: "Conférence & formation", card: "Formation · Conférence", icon: "cap" },
  { key: "NIGHTLIFE", value: "NIGHTLIFE", label: "Soirée VIP & club", card: "Soirée VIP · Club", icon: "glass" },
  { key: "EXHIBITION", value: "EXHIBITION", label: "Salon & expo", card: "Salon · Exposition", icon: "expo" },
  { key: "SPORTS", value: "SPORTS", label: "Sport & tournoi", card: "Sport · Tournoi", icon: "trophy" },
  { key: "SHOW", value: "SHOW", label: "Spectacle & théâtre", card: "Spectacle · Théâtre", icon: "mask" },
  { key: "OTHER", value: null, label: "Autre", card: "Événement", icon: "more" },
];

export function typeOption(type?: string | null): EventTypeOption {
  return EVENT_TYPE_OPTIONS.find((o) => o.value === type) ?? EVENT_TYPE_OPTIONS[EVENT_TYPE_OPTIONS.length - 1];
}

export function typeAvailable(o: EventTypeOption) {
  return !o.extra || FEATURES.eventExtras;
}

// Couleur de chaque formule (pastilles, barres, graphiques), dans l'ordre.
export const FORMULA_COLORS = ["#0F8A64", "#E39A1F", "#2C5BA8", "#C2547A", "#6B8E23", "#8FC7AE"];
export const formulaColor = (index: number) => FORMULA_COLORS[index % FORMULA_COLORS.length];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// « Sam. 28 nov. 2026 »
export function formatEventDay(iso: string) {
  return cap(new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
}

// « 09:00 »
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// « 28 novembre 2026 »
export function formatLongDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Jours restants avant une date : « J-23 », « Aujourd'hui », « Passé ».
export function daysUntilLabel(iso: string, now = new Date()) {
  const start = new Date(iso);
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((day(start) - day(now)) / 86_400_000);
  if (diff > 0) return `J-${diff}`;
  if (diff === 0) return "Aujourd'hui";
  return "Passé";
}

// Montants en centimes : « 18 000 » (+ unité au choix).
export function amount(centimes: number) {
  return Math.round(centimes / 100).toLocaleString("fr-FR");
}

export function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

// Opérateur Mobile Money d'après le numéro (Gabon) : Airtel 07x, Moov 06x.
// Le serveur enregistre « MOBILE_MONEY » sans l'opérateur.
export function operatorOf(phone: string | null | undefined): "Airtel Money" | "Moov Money" | "Autre" {
  const digits = (phone ?? "").replace(/\D/g, "").replace(/^241/, "");
  const local = digits.startsWith("0") ? digits : `0${digits}`;
  if (/^07[0-9]/.test(local)) return "Airtel Money";
  if (/^06[0-9]/.test(local)) return "Moov Money";
  return "Autre";
}

// Types de question du design. `server` : valeur acceptée par le serveur ;
// les autres attendent le drapeau event-extras.
export type QuestionKind =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "DROPDOWN"
  | "YES_NO"
  | "SHORT_TEXT"
  | "PARAGRAPH"
  | "RATING_SCALE"
  | "STAR_RATING"
  | "NUMBER"
  | "DATE";

export const QUESTION_KINDS: { kind: QuestionKind; label: string; chip: string; server: boolean; hasOptions: boolean }[] = [
  { kind: "SINGLE_CHOICE", label: "Choix unique", chip: "Choix unique", server: true, hasOptions: true },
  { kind: "MULTIPLE_CHOICE", label: "Cases à cocher", chip: "Cases à cocher", server: true, hasOptions: true },
  { kind: "DROPDOWN", label: "Menu déroulant", chip: "Menu déroulant", server: true, hasOptions: true },
  { kind: "YES_NO", label: "Oui / Non", chip: "Oui / Non", server: true, hasOptions: false },
  { kind: "SHORT_TEXT", label: "Texte court", chip: "Texte court", server: true, hasOptions: false },
  { kind: "PARAGRAPH", label: "Paragraphe", chip: "Paragraphe", server: true, hasOptions: false },
  { kind: "RATING_SCALE", label: "Échelle", chip: "Échelle 1–5", server: true, hasOptions: false },
  { kind: "STAR_RATING", label: "Note étoiles", chip: "Note étoiles", server: true, hasOptions: false },
  { kind: "NUMBER", label: "Nombre", chip: "Nombre", server: true, hasOptions: false },
  { kind: "DATE", label: "Date", chip: "Date", server: true, hasOptions: false },
];

export function questionKind(type: QuestionType | QuestionKind) {
  return QUESTION_KINDS.find((q) => q.kind === type) ?? QUESTION_KINDS[0];
}

export function questionKindAvailable(kind: QuestionKind) {
  return questionKind(kind).server || FEATURES.eventExtras;
}

// Résumé d'une question (aperçu de l'événement) : « Choix unique · 4 options ».
export function questionSummary(q: { type: string; options?: string[] }) {
  switch (q.type) {
    case "SINGLE_CHOICE":
      return `Choix unique · ${q.options?.length ?? 0} options`;
    case "MULTIPLE_CHOICE":
      return `Choix multiples · ${q.options?.length ?? 0} options`;
    case "DROPDOWN":
      return `Menu déroulant · ${q.options?.length ?? 0} options`;
    case "SHORT_TEXT":
      return "Texte court";
    case "PARAGRAPH":
      return "Texte long";
    case "RATING_SCALE":
      return "Échelle 1 à 5";
    case "YES_NO":
      return "Oui / Non";
    case "STAR_RATING":
      return "Note étoiles";
    case "NUMBER":
      return "Nombre";
    case "DATE":
      return "Date";
    default:
      return "";
  }
}
