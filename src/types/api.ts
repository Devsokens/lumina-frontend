// Types partagés avec le backend — écrits à la main pour l'instant.
// À REMPLACER par génération automatique dès que le backend expose Swagger :
//   npx openapi-typescript https://api.lumina.ga/api-json -o src/types/api.ts
// Voir LUMINA_FRONTEND_CONTEXT.md section 7.

import type { Role, Sector } from "@/lib/constants";

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  sector: Sector;
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  config: Record<string, unknown>;
  settings: Record<string, unknown>;
  customDomain: string | null;
};

export type User = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: Role;
  tenantId: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  imageUrl: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number; // centimes
  imageUrl: string | null;
  isAvailable: boolean;
  stock: number | null;
  stockAlert: number | null;
  categoryId: string;
};

export type Table = {
  id: string;
  number: number;
  qrCodeUrl: string | null;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  capacity: number;
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "EVENT";

export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "CARD" | "PAY_ON_DELIVERY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number; // centimes
  notes: string | null;
  productId: string;
  product?: Product;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  tableId: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type EventType =
  | "CONCERT"
  | "CONFERENCE"
  | "NIGHTLIFE"
  | "EXHIBITION"
  | "SPORTS"
  | "SHOW";

export type CertificateTemplate =
  | "ACADEMIC_GOLD"
  | "CORPORATE_PRESTIGE"
  | "TECH_INNOVATION"
  | "MINIMALIST_ECO";

export type TicketTemplate =
  | "GOLD_VIP"
  | "FESTIVAL_WRISTBAND"
  | "CONFERENCE_BADGE"
  | "NIGHTLIFE_DARK"
  | "CLASSIC_PASS";

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "SHORT_TEXT"
  | "PARAGRAPH"
  | "RATING_SCALE"
  | "DROPDOWN";

export type QuestionnaireQuestion = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  isRequired: boolean;
};

export type CertificateDispatchRecord = {
  id: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketNumber: string;
  ticketTypeName: string;
  certificateNumber: string;
  status: "SENT" | "PENDING_SCAN" | "FAILED";
  sentAt: string | null;
  pdfUrl: string;
};

export type EventStatus = "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED";

export type Event = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  eventType?: EventType;
  hasCertificate?: boolean;
  certificateTemplate?: CertificateTemplate;
  ticketTemplate?: TicketTemplate;
  questionnaireEnabled?: boolean;
  questionnaire?: QuestionnaireQuestion[];
  startDate: string;
  endDate: string | null;
  location: string | null;
  venueName?: string | null;
  address?: string | null;
  capacity: number | null;
  status: EventStatus;
  ticketTypes?: TicketType[];
  soldTicketsCount?: number;
  totalRevenue?: number;
  checkedInCount?: number;
  createdAt: string;
};

export type TicketType = {
  id: string;
  name: string;
  price: number; // centimes
  quantity: number;
  sold: number;
  eventId: string;
  description?: string | null;
  ticketTemplate?: TicketTemplate;
};

export type Attendee = {
  id: string;
  ticketId: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketTypeName: string;
  ticketPrice: number;
  status: "VALID" | "USED" | "CANCELLED" | "REFUNDED";
  scannedAt: string | null;
  purchaseDate: string;
};

export type Ticket = {
  id: string;
  ticketNumber: string;
  qrCode: string;
  status: "VALID" | "USED" | "CANCELLED" | "REFUNDED";
  scannedAt: string | null;
  ticketTypeId: string;
  ticketType?: TicketType;
  eventId: string;
  event?: Event;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  pricePaid: number;
};

export type TicketScanResult = {
  isValid: boolean;
  message: string;
  ticket?: Ticket;
  alreadyScannedAt?: string;
};

export type Property = {
  id: string;
  name: string;
  type: "APARTMENT" | "MOTEL_ROOM" | "GUEST_HOUSE" | "VILLA" | "STUDIO";
  address: string;
  city: string;
  basePrice: number; // centimes
  maxGuests: number;
  photos: { id: string; url: string; isMain: boolean }[];
  isPublished: boolean;
};

