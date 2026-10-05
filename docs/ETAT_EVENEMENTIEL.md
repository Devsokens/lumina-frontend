# Module événementiel — état du branchement API (2026-10-05)

Ce que chaque écran du secteur « événementiel » fait réellement, et ce qui reste en données d'exemple
ou sans support serveur. Contrat des routes : `docs/API_CONTRACT.md` §6, §7, §8, §13, §14.

## Écrans branchés sur l'API

| Écran | Route | Données / actions réelles |
|---|---|---|
| Tableau de bord | `/admin/event` | KPI (événements, billets émis, recettes HT, entrées scannées), ventes par événement, cas manuels (OWNER). Rafraîchi toutes les 15 s. |
| Mes événements | `/admin/event/events` | Liste, création et modification (formulaire en 4 étapes), recettes et remplissage réels. |
| Détail d'un événement | `/admin/event/events/[id]` | Infos, formules, participants, pointage manuel (même validation que `/scan`), ouverture/pause de la vente, statistiques. |
| Réservations | `/admin/event/reservations` | Commandes par événement, filtres, recherche, **remboursement** (OWNER/MANAGER) avec choix « remettre les places en vente ». |
| Participants | `/admin/event/attendees` | Billets payés/entrés/remboursés, ouverture du PDF, export CSV local. |
| Contrôle d'accès | `/scan` | Scanner réel (en ligne, hors ligne, saisie manuelle). `/admin/event/scanner` redirige ici. |
| Vitrine publique | `/{slug}`, `/{slug}/event` | Mise en page de l'éditeur, **événements réels**, « Réserver » mène à la page d'achat. |
| Liste publique | `/{slug}/events` | Événements en vente. |
| Achat | `/{slug}/events/[id]` | Choix de formule, quantité, coordonnées, idempotence, gratuit → billets immédiats, payant → Paystack. |
| Retour de paiement | `/{slug}/events/confirmation` | Statut du paiement (polling ~1 min), liens PDF des billets une fois payés. |

## Ce qui n'est pas enregistré côté serveur

Le formulaire d'événement collecte plus que ce que le backend stocke. Ces champs sont **ignorés à
l'enregistrement** (ils ne réapparaissent pas après rechargement) :

- modèle de pass (`ticketTemplate`) et modèle d'attestation ;
- attestations (`hasCertificate`, intitulé, signataire) : l'onglet « Certifications » affiche un
  avertissement, aucun certificat n'est généré ni envoyé ;
- questionnaire d'inscription ;
- affiche importée depuis l'appareil : il n'existe pas d'endpoint d'upload. Seule une URL `https://`
  est enregistrée, et un message prévient l'utilisateur.

Enregistrés : titre, description, dates, lieu (`venueName`) et ville (`location`), type
d'événement, jauge, formules (nom, prix, quantité, description), statut.

## Limites connues

- **Images d'affiche** : la CSP (`next.config.ts`, `img-src`) n'autorise que le site et l'API. Une
  affiche hébergée ailleurs ne s'affichera pas en production. Il faudra un endpoint d'upload
  (backend) ou ajouter l'origine de l'hébergeur d'images à la CSP.
- **Vitrine** : thème, textes d'accueil, galerie, témoignages et FAQ viennent toujours de l'éditeur
  local (`useShowcaseStore`, non sauvegardé côté serveur). Seuls les événements sont réels.
- **Renvoi de billet** : pas d'envoi WhatsApp/SMS côté serveur. Les boutons ouvrent le PDF du
  billet, à transmettre manuellement.
- **Temps réel** : pas de canal push pour la billetterie, uniquement un rafraîchissement toutes les
  15 s.
- **Rôles** : les stats et les commandes sont réservées à OWNER/MANAGER (le STAFF voit les écrans
  sans chiffres). Les cas manuels sont réservés à OWNER.
- **Écrans encore en données d'exemple** : `/admin/event/users` (équipe), `/admin/event/settings`
  (paramètres), `/admin/event/showcase` (éditeur de vitrine, local). `components/events/tickets-manager.tsx`
  n'est plus utilisé.
- Prix affichés en vitrine hors taxes éventuelles : le total exact (TVA du tenant) est calculé par
  le serveur à la commande.

## Parcours d'achat (à tester de bout en bout en mode test Paystack)

1. `/{slug}/events/{id}` : choisir une formule, puis saisir le téléphone (obligatoire) et l'e-mail
   (recommandé).
2. Le serveur crée la commande et réserve les places. Ensuite :
   - formule gratuite : billets affichés tout de suite ;
   - formule payante : redirection Paystack.
3. Paystack renvoie sur `{FRONTEND_URL}/{slug}/events/confirmation?reference=…`. La page affiche
   les billets dès que le paiement est confirmé (webhook ou vérification directe par le serveur).
4. Back-office : la commande apparaît dans Réservations et les billets dans Participants. Le
   remboursement y invalide les billets : `/scan` répond alors « invalide ».
