// Dernier paiement lancé sur un événement, gardé dans le navigateur : si la
// page se ferme ou si le réseau coupe pendant la validation, l'acheteur
// retrouve ses billets en revenant sur la page (payment-recovery.tsx). La
// référence sert déjà de secret d'accès à GET /payments/status/:reference.
// Confort uniquement : sans stockage disponible, l'e-mail reste le recours.

export type PendingPayment = { reference: string; email: string; at: number };

const PREFIX = "giyax:paiement:";
const KEEP_MS = 48 * 60 * 60 * 1000;
const listeners = new Set<() => void>();

const keyOf = (eventId: string) => `${PREFIX}${eventId}`;

function notify() {
  for (const l of listeners) l();
}

export function subscribePendingPayment(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Texte brut (stable entre deux rendus) ; à passer dans parsePendingPayment.
export function readPendingPayment(eventId: string): string | null {
  try {
    return window.localStorage.getItem(keyOf(eventId));
  } catch {
    return null;
  }
}

export function parsePendingPayment(raw: string | null): PendingPayment | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<PendingPayment>;
    if (typeof v.reference !== "string" || typeof v.at !== "number") return null;
    if (Date.now() - v.at > KEEP_MS) return null;
    return { reference: v.reference, email: typeof v.email === "string" ? v.email : "", at: v.at };
  } catch {
    return null;
  }
}

export function savePendingPayment(eventId: string, payment: Omit<PendingPayment, "at">) {
  try {
    window.localStorage.setItem(keyOf(eventId), JSON.stringify({ ...payment, at: Date.now() }));
  } catch {
    // Stockage indisponible (navigation privée…) : rien à faire.
  }
  notify();
}

export function clearPendingPayment(eventId: string, reference?: string) {
  try {
    // Avec une référence : seulement si c'est toujours elle (un nouveau
    // paiement lancé entre-temps n'est pas effacé).
    if (reference && parsePendingPayment(window.localStorage.getItem(keyOf(eventId)))?.reference !== reference) return;
    window.localStorage.removeItem(keyOf(eventId));
  } catch {
    // Idem.
  }
  notify();
}
