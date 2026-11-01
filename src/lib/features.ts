// Fonctions dont le support serveur arrive par étapes. Activées par
// NEXT_PUBLIC_FEATURES (liste séparée par des virgules ou des espaces), ex.
// NEXT_PUBLIC_FEATURES="ticket-extras". Voir docs/API_CONTRACT.md §14.
// - ticket-extras : le serveur accepte `saleEndsAt` (early bird) et
//   `template` (modèle de billet) sur les types de billets. Sans ce drapeau,
//   ces champs ne sont pas envoyés (un serveur strict refuserait la requête).
const flags = new Set((process.env.NEXT_PUBLIC_FEATURES ?? "").split(/[\s,]+/).filter(Boolean));

export const FEATURES = {
  ticketExtras: flags.has("ticket-extras"),
};
