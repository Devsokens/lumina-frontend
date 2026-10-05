# Audit frontend ↔ backend — 2026-10-05

Vérification de chaque appel API du frontend contre `docs/API_CONTRACT.md` et le code du backend
(`giya-backend`, branche `chore/prisma-migrate`), puis corrections. Branche frontend :
`feat/frontend-audit` (basée sur `feat/events-wiring`).

## 1. Défauts bloquants trouvés et corrigés

| # | Défaut | Effet avant correction | Correction |
|---|---|---|---|
| 1 | Réponses lues sans l'enveloppe `{ success, data }` dans `useAuth` et le rafraîchissement | `accessToken`/`user` = `undefined` : **aucune connexion possible** | `hooks/useAuth.ts`, `lib/api.ts` |
| 2 | Plusieurs 401 simultanés → plusieurs `/auth/refresh` | Le backend voit un refresh token déjà consommé et **révoque la session** | Un seul rafraîchissement en cours, partagé (`refreshAccessToken`) |
| 3 | Inscription sans mot de passe | 400 systématique | `signup/page.tsx` |
| 4 | Redirection fixe vers `/admin/restaurant` après connexion | Mauvais tableau de bord pour événementiel, cuisine, contrôleurs | `homePathFor()` : secteur du tenant + rôle, `?next=` |
| 5 | Pages absentes : retour Google, finalisation Google, changement de mot de passe | Google et membres avec mot de passe temporaire bloqués (403 partout) | `/auth/callback`, `/auth/complete-signup`, `/change-password` (imposée) |
| 6 | `/auth/refresh` appelé pour **chaque visiteur** (vitrine comprise) | Route limitée à 5/15 min par IP : des clients derrière un même NAT bloquaient la connexion des admins | Restauration uniquement en zone protégée ou si une session a déjà été ouverte |
| 7 | Tenant « démo » ACTIF inventé pour tout slug inconnu ou panne API | Fausse vitrine sur n'importe quelle adresse | 404 réel ; panne → page d'erreur |
| 8 | Table du QR lue sur la page de commande (où elle n'est jamais) | Commandes « sur place » sans table | Table mémorisée dans le panier dès l'arrivée |
| 9 | Panier commun à tous les établissements | Articles d'un autre tenant envoyés → 404 | Panier lié à une vitrine |
| 10 | Moyen de paiement jamais envoyé, Paystack forcé | Impossible de payer sur place | Choix en ligne / sur place, confirmation à l'écran |
| 11 | URL WebSocket KDS sans `/v1` | KDS jamais connecté | URL dérivée de l'API, reconnexion progressive |
| 12 | Transitions de statut non acceptées (`PENDING → READY`) | 409 sur « Marquer prêt » | Seules les transitions du backend sont proposées |
| 13 | Aucune création de catégorie | **Impossible d'ajouter un premier article** | Gestion des catégories |
| 14 | `dangerouslySetInnerHTML` sur du HTML saisi (paramètres événementiel) | HTML collé exécutable (XSS local) | Rendu texte |
| 15 | Vitrine événementielle : paiement simulé (`setTimeout`) | Faux « paiement validé » | Corrigé au lot précédent (`feat/events-wiring`) |

## 2. Fonctionnalités ajoutées (routes backend existantes, jamais utilisées)

- Connexion par code SMS (`/auth/otp/*`), qui remplace aussi le lien mort « mot de passe oublié ».
- Articles : modification, suppression, photo (URL), suivi de stock. Stock : réception, inventaire,
  historique des mouvements.
- Tables : numéro choisi, capacité, suppression. Paramètres : taxe (taux, TTC/HT).
- Équipe (§11), clients (§12), journal d'audit (§13), pour les secteurs restaurant/boutique et
  événementiel.
- Navigation par rôle, menu mobile, page de retour Paystack des commandes (`/{slug}/orders/confirmation`).

## 3. Ressources et montée en charge

- **Requêtes partagées** : une seule requête « commandes » (100 dernières) pour le dashboard, les
  onglets et le KDS.
- **Temps réel sans rechargement** : chaque commande poussée par le WebSocket est fusionnée dans le
  cache, sans recharger les 100 commandes à chaque message. Le polling (15 s) ne tourne que si le
  socket est coupé.
- **Pas de nouvel essai inutile** : pas de retry sur les 4xx ; retry unique sur réseau ou 5xx.
  `gcTime` 5 min.
- **Recherche clients** : côté serveur, avec un délai de 300 ms et la page précédente gardée à
  l'écran pendant le chargement.
- **Vitrine** : le tenant est mis en cache 60 s par Next, soit une requête backend par minute et par
  tenant, quel que soit le trafic. Plus aucun appel d'authentification pour les visiteurs.
- **Quotas des rôles** : les écrans n'appellent pas les routes interdites au rôle (pas de 403
  inutiles).
- **Limite du KDS** (côté backend, inchangée) : le registre WebSocket est en mémoire. Avec
  plusieurs instances, un événement n'atteint que les écrans connectés à la même instance. Pour
  passer à plusieurs instances, il faut un pub/sub Redis côté backend.

## 4. Vérifications

- `npx tsc --noEmit` : OK (hors `LayoutProps`, type généré par `next build`).
- `npm run build` : vert.
- `npm run lint` : **0 erreur** (3 avant, toutes corrigées), 68 avertissements préexistants (imports
  inutilisés, `<img>`).
- Pas de tests automatisés dans ce dépôt. **Aucun parcours n'a été exécuté contre un backend réel** :
  pas de base locale disponible pendant l'audit.

## 5. Reste à faire (hors code ou décision nécessaire)

- Tester de bout en bout contre le backend déployé :
  - inscription → menu → commande QR → KDS → paiement Paystack test ;
  - connexion Google, OTP, membre avec mot de passe temporaire.
- `NEXT_PUBLIC_*` en production : voir `.env.example`. `NEXT_PUBLIC_DEMO_MODE` ne doit pas être
  défini.
- Secteur Hébergement : aucun support backend (tableau de bord d'attente).
- Écrans encore illustratifs : éditeur de vitrine (local), sections e-mail / Mobile Money / identité
  légale des paramètres événementiel, attestations.
- Tests automatisés frontend (aucun runner configuré).
