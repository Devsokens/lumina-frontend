import {
  AirVent,
  Briefcase,
  Car,
  Coffee,
  Droplets,
  Shield,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { BookingStatus, ListingStatus, ListingType } from "@/types/stays";

// Libellés d'affichage uniquement : règles (prix, disponibilité, transitions)
// côté serveur — docs/API_CONTRACT.md §15.

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  STUDIO: "Studio",
  ROOM: "Chambre",
  VILLA: "Villa",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "En ligne",
  ARCHIVED: "Archivé",
};

export const AMENITIES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "WIFI", label: "Wi-Fi", icon: Wifi },
  { key: "AIR_CONDITIONING", label: "Climatisation", icon: AirVent },
  { key: "KITCHEN", label: "Cuisine équipée", icon: UtensilsCrossed },
  { key: "WASHER", label: "Lave-linge", icon: WashingMachine },
  { key: "TV", label: "Télévision", icon: Tv },
  { key: "PARKING", label: "Parking", icon: Car },
  { key: "POOL", label: "Piscine", icon: Waves },
  { key: "HOT_WATER", label: "Eau chaude", icon: Droplets },
  { key: "GENERATOR", label: "Groupe électrogène", icon: Zap },
  { key: "SECURITY", label: "Gardiennage", icon: Shield },
  { key: "WORKSPACE", label: "Espace de travail", icon: Briefcase },
  { key: "BREAKFAST", label: "Petit-déjeuner", icon: Coffee },
];

export const BOOKING_STATUS: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: "En attente de paiement", className: "bg-warning/15 text-warning" },
  CONFIRMED: { label: "Confirmée", className: "bg-primary/15 text-primary" },
  CHECKED_IN: { label: "Sur place", className: "bg-success/15 text-success" },
  CHECKED_OUT: { label: "Terminée", className: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "Annulée", className: "bg-destructive/10 text-destructive" },
};

// ---------- Dates de séjour (jours calendaires "AAAA-MM-JJ", UTC) ----------

export function toDay(value: string | Date): string {
  return (typeof value === "string" ? value : value.toISOString()).slice(0, 10);
}

export function todayDay(): string {
  const now = new Date();
  return toDay(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDay(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return toDay(d);
}

export function nights(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000);
}

export function formatDay(day: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(`${toDay(day)}T00:00:00Z`).toLocaleDateString("fr-FR", { ...opts, timeZone: "UTC" });
}

export function formatStay(checkIn: string, checkOut: string) {
  return `${formatDay(checkIn)} → ${formatDay(checkOut, { day: "numeric", month: "short", year: "numeric" })}`;
}

// Nuit `day` occupée par une plage [start, end[ ?
export function inRange(day: string, range: { start: string; end: string }) {
  return day >= toDay(range.start) && day < toDay(range.end);
}
