// Fonctions dont le support serveur arrive par étapes. Activées par
// NEXT_PUBLIC_FEATURES (liste séparée par des virgules ou des espaces), ex.
// NEXT_PUBLIC_FEATURES="ticket-extras table-occupancy". Sans drapeau, les
// champs concernés ne sont pas envoyés (un serveur strict refuserait la requête).
// - ticket-extras : `saleEndsAt` (early bird) et `template` (modèle de billet)
//   sur les types de billets (docs/API_CONTRACT.md §14).
// - table-occupancy : `guestCount` (nombre de personnes) sur POST /orders
//   (docs/API_CONTRACT.md §4, §5).
const flags = new Set((process.env.NEXT_PUBLIC_FEATURES ?? "").split(/[\s,]+/).filter(Boolean));

export const FEATURES = {
  ticketExtras: flags.has("ticket-extras"),
  tableOccupancy: flags.has("table-occupancy"),
};
