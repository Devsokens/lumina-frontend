import type { EventStatus, EventType } from "@/types/api";

// Formes exactes renvoyées par le backend pour la billetterie
// (docs/API_CONTRACT.md §6, §8, §13, §14). Prix et montants en centimes.

export type ApiTicketType = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number; // places réservées (payées + en attente de paiement)
  description: string | null;
  eventId: string;
  // Champs V1 (voir docs/API_CONTRACT.md §14) : absents tant que le serveur
  // ne les gère pas.
  saleEndsAt?: string | null;
  template?: string | null;
};

export type ApiEvent = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  venueName: string | null;
  eventType: EventType | null;
  capacity: number | null;
  status: EventStatus;
  createdAt: string;
  ticketTypes: ApiTicketType[];
  // Questionnaire et modèles (Event.settings).
  settings?: import("@/lib/events").EventSettings;
};

export type ApiTicketStatus = "PENDING" | "VALID" | "USED" | "CANCELLED" | "REFUNDED";

export type ApiTicket = {
  id: string;
  qrCode: string;
  status: ApiTicketStatus;
  scannedAt: string | null;
  ticketTypeId: string;
  orderId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt: string;
  ticketType: { name: string; price: number };
};

export type TicketTypeStats = {
  ticketTypeId: string;
  name: string;
  quantity: number;
  issued: number;
  scanned: number;
  pending: number;
  refunded: number;
  revenue: number;
};

export type EventStats = {
  eventId: string;
  capacity: number;
  issued: number;
  scanned: number;
  pending: number;
  refunded: number;
  revenue: number;
  ticketTypes: TicketTypeStats[];
};

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type EventOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  createdAt: string;
  tickets: {
    id: string;
    status: ApiTicketStatus;
    scannedAt: string | null;
    ticketType: { name: string };
  }[];
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number };
};

export type RefundResult = {
  orderId: string;
  paymentStatus: "REFUNDED";
  amount: number;
  paystackStatus: string;
  refundedTickets: number;
  releasedSeats: number;
};

export type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  newValue: unknown;
  createdAt: string;
  user: { id: string; fullName: string | null; role: string } | null;
};

// Vitrine publique
export type PublicTicketType = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  remaining: number;
  // Early bird (si le serveur le fournit) : plus en vente après cette date.
  saleEndsAt?: string | null;
};

export type PublicEvent = Omit<ApiEvent, "ticketTypes" | "status" | "createdAt"> & {
  ticketTypes: PublicTicketType[];
};

export type PurchasedTicket = {
  id: string;
  qrCode: string;
  status: ApiTicketStatus;
  ticketTypeId: string;
};

export type PurchaseResult = {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: PaymentStatus;
  tickets: PurchasedTicket[];
};

export type PaymentStatusResult = {
  orderId: string;
  orderNumber: string;
  type: string;
  status: string;
  paymentStatus: PaymentStatus;
  total: number;
  tickets: PurchasedTicket[];
};
