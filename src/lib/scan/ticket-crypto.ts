// Vérification hors ligne des QR billets (EF-E09). Format défini par le
// backend (docs/API_CONTRACT.md section 7) :
//   "v1.<ticketId>.<signature>", signature = base64url(Ed25519(ticketId + "." + eventId))
// Seule la clé PUBLIQUE est connue ici (fournie par le scan-manifest) : on
// vérifie, on ne peut pas signer.

const SIGNED_FORMAT =
  /^v1\.([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([A-Za-z0-9_-]{86})$/;
const LEGACY_FORMAT = /^[0-9a-f]{32}$/;

export type ParsedTicketCode =
  | { kind: "signed"; ticketId: string; signature: string }
  | { kind: "legacy" }
  | { kind: "unknown" };

export function parseTicketCode(code: string): ParsedTicketCode {
  const signed = SIGNED_FORMAT.exec(code);
  if (signed) return { kind: "signed", ticketId: signed[1], signature: signed[2] };
  if (LEGACY_FORMAT.test(code)) return { kind: "legacy" };
  return { kind: "unknown" };
}

export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// WebCrypto Ed25519 natif (Chrome 137+, Safari 17+, Firefox 129+). Sinon,
// repli sur @noble/ed25519 chargé à la demande (quelques Ko, hors bundle
// initial) pour les WebViews Android plus anciennes.
async function verifyEd25519(
  publicKey: Uint8Array<ArrayBuffer>,
  signature: Uint8Array<ArrayBuffer>,
  message: Uint8Array<ArrayBuffer>
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey("raw", publicKey, { name: "Ed25519" }, false, [
      "verify",
    ]);
    return await crypto.subtle.verify({ name: "Ed25519" }, key, signature, message);
  } catch {
    const ed = await import("@noble/ed25519");
    try {
      return await ed.verifyAsync(signature, message, publicKey);
    } catch {
      return false;
    }
  }
}

export async function verifySignedText(
  text: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  const sig = base64UrlToBytes(signature);
  const pub = base64UrlToBytes(publicKey);
  if (sig.length !== 64 || pub.length !== 32) return false;
  return verifyEd25519(pub, sig, new TextEncoder().encode(text));
}

export function verifyTicketSignature(
  ticketId: string,
  eventId: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  return verifySignedText(`${ticketId}.${eventId}`, signature, publicKey);
}
