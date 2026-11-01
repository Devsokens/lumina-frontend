import { isAxiosError } from "axios";
import type { Attendee, Event, TicketTemplate, TicketType } from "@/types/api";
import { FEATURES } from "@/lib/features";
import type { ApiEvent, ApiTicket, EventStats, PublicEvent } from "@/types/events";
import type { EventItem } from "@/stores/useShowcaseStore";

// Conversion entre les formes du backend et celles des écrans du
// back-office (conçus avant le branchement API). Aucune règle métier ici :
// uniquement du renommage de champs.

export function toUiEvent(event: ApiEvent, stats?: EventStats): Event {
  const statsByType = new Map(stats?.ticketTypes.map((t) => [t.ticketTypeId, t]));
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    imageUrl: event.imageUrl,
    eventType: event.eventType ?? undefined,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    venueName: event.venueName,
    capacity: event.capacity,
    status: event.status,
    createdAt: event.createdAt,
    ticketTypes: event.ticketTypes.map(
      (t): TicketType => ({
        id: t.id,
        eventId: t.eventId,
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        // Billets émis (payés) si les stats sont chargées, sinon places
        // réservées (inclut les paiements en attente).
        sold: statsByType.get(t.id)?.issued ?? t.sold,
        description: t.description,
        saleEndsAt: t.saleEndsAt ?? null,
        ticketTemplate: (t.template as TicketTemplate | null) ?? undefined,
      })
    ),
    soldTicketsCount: stats?.issued ?? event.ticketTypes.reduce((n, t) => n + t.sold, 0),
    totalRevenue: stats?.revenue ?? 0,
    checkedInCount: stats?.scanned ?? 0,
  };
}

// Billets visibles comme « participants » : payés (VALID), entrés (USED)
// ou remboursés. Les réservations impayées (PENDING) et expirées
// (CANCELLED) n'en sont pas.
export function toAttendees(tickets: ApiTicket[]): Attendee[] {
  return tickets
    .filter((t) => t.status === "VALID" || t.status === "USED" || t.status === "REFUNDED")
    .map((t) => ({
      id: t.id,
      ticketId: t.id,
      ticketNumber: ticketNumber(t.id),
      customerName: t.customerName ?? "—",
      customerEmail: t.customerEmail ?? "",
      customerPhone: t.customerPhone ?? "",
      ticketTypeName: t.ticketType.name,
      ticketPrice: t.ticketType.price,
      status: t.status as Attendee["status"],
      scannedAt: t.scannedAt,
      purchaseDate: t.createdAt,
    }));
}

// Numéro court lisible, dérivé de l'id (le code QR complet reste secret).
export function ticketNumber(ticketId: string) {
  return `#${ticketId.slice(0, 8).toUpperCase()}`;
}

export type EventPayload = {
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  venueName?: string;
  eventType?: string;
  capacity?: number;
};

// Champs acceptés par le backend. Les autres réglages du formulaire
// (modèles de pass, attestations, questionnaire) n'ont pas encore de
// support serveur et ne sont pas envoyés (voir docs/ETAT_EVENEMENTIEL.md).
export function toEventPayload(form: Partial<Event>): EventPayload {
  const imageUrl = form.imageUrl && /^https?:\/\//.test(form.imageUrl) ? form.imageUrl : undefined;
  return {
    title: form.title ?? "",
    ...(form.description ? { description: form.description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    startDate: form.startDate ?? new Date().toISOString(),
    ...(form.endDate ? { endDate: form.endDate } : {}),
    ...(form.location ? { location: form.location } : {}),
    ...(form.venueName ? { venueName: form.venueName } : {}),
    ...(form.eventType ? { eventType: form.eventType } : {}),
    ...(form.capacity ? { capacity: form.capacity } : {}),
  };
}

// Corps de création d'un type de billet. `saleEndsAt` et `template` ne
// partent que si le serveur les gère (FEATURES.ticketExtras).
export function ticketTypeBody(f: TicketType) {
  return {
    name: f.name,
    price: f.price,
    quantity: f.quantity,
    ...(f.description ? { description: f.description } : {}),
    ...(FEATURES.ticketExtras && f.saleEndsAt ? { saleEndsAt: f.saleEndsAt } : {}),
    ...(FEATURES.ticketExtras && f.ticketTemplate ? { template: f.ticketTemplate } : {}),
  };
}

// Affiche importée depuis l'appareil (data: URL) : pas d'endpoint d'upload.
export function hasUnsupportedImage(form: Partial<Event>) {
  return !!form.imageUrl && !/^https?:\/\//.test(form.imageUrl);
}

export function apiErrorMessage(err: unknown, fallback = "Une erreur est survenue.") {
  if (isAxiosError(err)) {
    const body = err.response?.data as { error?: unknown } | undefined;
    if (typeof body?.error === "string") return body.error;
    if (body?.error && typeof body.error === "object" && "message" in body.error) {
      const message = (body.error as { message: unknown }).message;
      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(" ");
    }
    if (!err.response) return "Réseau indisponible, réessayez.";
    if (err.response.status === 403) return "Action non autorisée pour votre rôle.";
  }
  return fallback;
}

// Événement public → format de la vitrine (composant ShowcaseCanvas, prix
// affichés en FCFA entiers).
const SHOWCASE_CATEGORY: Record<string, EventItem["category"]> = {
  CONCERT: "Concert & Festival",
  SPORTS: "Concert & Festival",
  SHOW: "Concert & Festival",
  CONFERENCE: "Conférence & Gala",
  EXHIBITION: "Conférence & Gala",
  NIGHTLIFE: "Soirée VIP",
};

export function toShowcaseEvent(event: PublicEvent): EventItem {
  const start = new Date(event.startDate);
  const prices = event.ticketTypes.map((t) => t.price);
  return {
    id: event.id,
    title: event.title,
    category: SHOWCASE_CATEGORY[event.eventType ?? ""] ?? "Concert & Festival",
    date: start.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    time: start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    location: [event.venueName, event.location].filter(Boolean).join(" · ") || "Lieu à préciser",
    description: event.description ?? "",
    coverImageUrl: event.imageUrl ?? "",
    startingPrice: prices.length ? Math.min(...prices) / 100 : 0,
    tickets: event.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price / 100,
      description: t.description ?? "",
      benefits: [],
      stockLeft: t.remaining,
    })),
  };
}

// Téléphone tel qu'attendu par le backend : chiffres, « + » initial optionnel.
export function normalizePhone(value: string) {
  return value.replace(/[\s.()-]/g, "");
}

export function formatXaf(centimes: number) {
  return `${Math.round(centimes / 100).toLocaleString("fr-FR")} F`;
}
