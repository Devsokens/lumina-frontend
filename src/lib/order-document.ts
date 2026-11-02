import type { Order, PaymentMethod, Tenant } from "@/types/api";

// Données d'une facture (payée en ligne) ou d'une addition (à régler sur
// place). Montants en centimes, tels que renvoyés par le serveur.
export type OrderDocumentKind = "INVOICE" | "BILL";

export type OrderDocumentLine = { name: string; quantity: number; unitPrice: number; notes?: string | null };

export type OrderDocumentData = {
  kind: OrderDocumentKind;
  orderNumber: string;
  createdAt: string;
  orderType: Order["type"];
  paymentMethod: PaymentMethod;
  tableNumber?: number | null;
  guests?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  lines: OrderDocumentLine[];
  subtotal: number;
  tax: number;
  total: number;
  restaurant: {
    name: string;
    slug: string;
    phone?: string | null;
    address?: string | null;
    logoUrl?: string | null;
  };
};

// Instantané gardé le temps du paiement en ligne : la page de retour de
// Paystack ne reçoit que la référence (pas les lignes de la commande).
const KEY = "lumina-order-snapshot";

export function saveOrderSnapshot(data: Omit<OrderDocumentData, "kind">) {
  try {
    sessionStorage.setItem(`${KEY}:${data.orderNumber}`, JSON.stringify(data));
  } catch {
    // navigation privée / stockage plein : document résumé au retour
  }
}

export function loadOrderSnapshot(orderNumber: string): Omit<OrderDocumentData, "kind"> | null {
  try {
    const raw = sessionStorage.getItem(`${KEY}:${orderNumber}`);
    return raw ? (JSON.parse(raw) as Omit<OrderDocumentData, "kind">) : null;
  } catch {
    return null;
  }
}

function text(config: Record<string, unknown>, key: string) {
  const v = config[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function restaurantInfo(tenant: Tenant): OrderDocumentData["restaurant"] {
  const config = tenant.config ?? {};
  const logo = text(config, "logoUrl");
  return {
    name: tenant.name,
    slug: tenant.slug,
    phone: text(config, "phone"),
    address: text(config, "address"),
    // Logo importé (data URL) ou https : un logo https d'un autre domaine est
    // bloqué par la CSP (connect-src), le PDF sort alors sans logo.
    logoUrl: logo && /^(https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(logo) ? logo : null,
  };
}

// Lignes de la commande : noms du serveur si fournis, sinon ceux du panier.
export function orderLines(
  order: Order,
  cart: { productId: string; name: string }[]
): OrderDocumentLine[] {
  const names = new Map(cart.map((i) => [i.productId, i.name]));
  return order.items.map((i) => ({
    name: i.product?.name ?? names.get(i.productId) ?? "Article",
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    notes: i.notes,
  }));
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte bancaire",
  CASH: "Espèces",
  PAY_ON_DELIVERY: "À la livraison",
};
