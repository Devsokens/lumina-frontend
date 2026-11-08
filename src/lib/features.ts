// Fonctions dont le support serveur arrive par étapes. Activées par
// NEXT_PUBLIC_FEATURES (liste séparée par des virgules ou des espaces), ex.
// NEXT_PUBLIC_FEATURES="ticket-extras table-occupancy". Sans drapeau, les
// champs concernés ne sont pas envoyés (un serveur strict refuserait la requête).
// - ticket-extras : `saleEndsAt` (early bird) et `template` (modèle de billet)
//   sur les types de billets (docs/API_CONTRACT.md §14).
// - table-occupancy : `guestCount` (nombre de personnes) sur POST /orders
//   (docs/API_CONTRACT.md §4, §5).
// - showcase-sections : `visibleSections` (sections affichées / masquées)
//   enregistré avec la vitrine (PUT /admin/tenant/showcase). Actif par
//   défaut (serveur à jour, 2026-11) ; « no-showcase-sections » le coupe.
// - event-extras : réglages de la refonte du module Événements que le serveur
//   n’enregistre pas encore (types Mariage / Autre, questions Oui-Non, étoiles,
//   nombre, date, logos, format, contenu et envoi du certificat…). Sans le
//   drapeau, ces réglages sont affichés mais inactifs (« Bientôt »).
// - ai-poster : affiche générée par l'IA (image, POST /admin/ai/event-visual,
//   Cloudflare Workers AI côté serveur). Active par défaut ; « no-ai-poster »
//   la coupe (seules restent les affiches « Graphique » et « Typographique »,
//   dessinées dans le navigateur).
// - sms : codes par SMS (connexion « mot de passe oublié », vérification des
//   comptes de versement). Coupé tant qu'aucun fournisseur SMS n'est branché
//   (SMS_PROVIDER côté serveur) ; « sms » le réactive.
const flags = new Set((process.env.NEXT_PUBLIC_FEATURES ?? "").split(/[\s,]+/).filter(Boolean));

export const FEATURES = {
  ticketExtras: !flags.has("no-ticket-extras"),
  tableOccupancy: flags.has("table-occupancy"),
  showcaseSections: !flags.has("no-showcase-sections"),
  eventExtras: !flags.has("no-event-extras"),
  aiPoster: !flags.has("no-ai-poster"),
  sms: flags.has("sms"),
};
