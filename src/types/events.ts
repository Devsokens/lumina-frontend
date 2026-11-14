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
  saleEndsAt?: string | null;
  template?: string | null;
  maxPerOrder?: number | null;
  visible?: boolean;
  // Couleur d'accent du billet de cette formule (#RRGGBB), null = modèle.
  color?: string | null;
  // Cotisation : montant libre à partir de `minPrice` (à défaut `price`, le
  // montant suggéré). Le billet sert aussi d'entrée.
  kind?: "FIXED" | "CONTRIBUTION";
  minPrice?: number | null;
};

export type {
  CertificateChannels,
  CertificateRecipientsMode,
  CertificateSendMode,
  CertificateSignatory,
} from "@/lib/events";

export type CertificateDispatchStatus = "SENT" | "OPENED" | "VERIFIED" | "FAILED";

export type CertificateDispatchItem = {
  id: string;
  ticketId: string;
  participantName: string;
  participantEmail: string | null;
  participantPhone: string | null;
  certificateCode: string;
  channels: ("email" | "whatsapp" | "portal")[];
  status: CertificateDispatchStatus;
  sentAt: string;
  pdfUrl?: string | null;
};

export type SendCertificatesPayload = {
  model: "CLASSIC" | "MODERN" | "EXECUTIVE";
  title: string;
  issuer: string;
  issuedDate: string;
  mention: string;
  signatories: { name?: string; role: string; signatureUrl?: string | null }[];
  channels: ("email" | "whatsapp" | "portal")[];
  ticketIds?: string[];
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
  // Coordonnées du lieu (carte de la page publique).
  lat?: number | null;
  lng?: number | null;
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
  providerStatus: string;
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
  maxPerOrder?: number | null;
  id: string;
  name: string;
  price: number;
  description: string | null;
  remaining: number;
  // Early bird (si le serveur le fournit) : plus en vente après cette date.
  saleEndsAt?: string | null;
  // Cotisation : montant libre à partir de `minPrice` (à défaut `price`, le
  // montant suggéré). Le billet sert aussi d'entrée.
  kind?: "FIXED" | "CONTRIBUTION";
  minPrice?: number | null;
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

// Questionnaire d'inscription : valeur d'une réponse (texte, choix, note…).
export type AnswerValue = string | number | string[];

// GET /admin/events/:id/responses : une réponse par commande confirmée.
export type EventResponse = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt: string;
  answers: Record<string, AnswerValue>;
  ticketTypes: string[];
  tickets: number;
  checkedIn: boolean;
};

export type EventResponses = {
  // Inscriptions confirmées (payées ou gratuites), pour le taux de réponse.
  orders: number;
  responses: EventResponse[];
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
  // Jeton du lien de facture (GET /orders/:id/document), null tant que non payé.
  documentToken: string | null;
  tickets: PurchasedTicket[];
};
