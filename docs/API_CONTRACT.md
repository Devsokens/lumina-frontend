# GiyaX — Contrat API Frontend → Backend

**Émis par :** `giya-frontend`
**Destiné à :** `giya-backend` (NestJS)
**Statut :** Vivant — mis à jour à chaque nouvelle feature frontend qui consomme une route pas encore implémentée.

Ce document liste **toutes les routes HTTP que le frontend appelle actuellement**, telles
qu'utilisées dans le code (`src/lib/api.ts`, `src/hooks/*`, `src/lib/tenant.ts`). Le backend doit
les implémenter conformément à `GIYA_BACKEND_CONTEXT.md` (réponse uniforme `{ success, data,
error, meta }`, versionnées `/v1/`, RBAC, RLS, etc.).

Base URL frontend : `NEXT_PUBLIC_API_URL` (ex: `https://api.giya.com/v1`).

---

## Conventions

- Toutes les réponses succès : `{ "success": true, "data": T, "meta"?: PaginationMeta }`
- Toutes les réponses erreur : `{ "success": false, "error": string }` avec le status HTTP adéquat.
- Prix en **centimes** (Int), jamais de float.
- Auth : header `Authorization: Bearer {accessToken}` sur les routes protégées.
- `withCredentials: true` sur toutes les requêtes → le cookie `refresh_token` (httpOnly,
  SameSite=None; Secure en cross-domain) est envoyé automatiquement par le navigateur.

---

## 1. Authentification (`/auth`)

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| POST | `/auth/register` | non | `{ fullName, email?, phone?, password, businessName, slug, sector, acceptedTerms: true }` | `{ accessToken, user }` + Set-Cookie `refresh_token` |
| POST | `/auth/login` | non | `{ email? \| phone?, password }` | `{ accessToken, user }` + Set-Cookie `refresh_token` — **ou** `{ accountChoice }` (voir « Un compte par secteur ») |
| POST | `/auth/otp/request` | non | `{ phone }` | `{}` |
| POST | `/auth/otp/verify` | non | `{ phone, code }` | `{ accessToken, user }` + Set-Cookie `refresh_token` — **ou** `{ accountChoice }` |
| POST | `/auth/account-choice/options` | non (jeton) | `{ token }` | `{ accounts: [{ sector, businessName, slug }] }` — **401** jeton expiré |
| POST | `/auth/account-choice` | non (jeton) | `{ token, sector }` | `{ accessToken, user }` + Set-Cookie `refresh_token` — **401** jeton expiré ou secteur hors choix |
| POST | `/auth/refresh` | cookie | — | `{ accessToken }` (nouveau refresh_token en cookie, rotation) |
| POST | `/auth/logout` | Bearer | — | `{}` + suppression cookie `refresh_token` |
| GET | `/auth/me` | Bearer | — | `{ user: { id, email, phone, fullName, role, tenantId, mustChangePassword } }` |
| POST | `/auth/change-password` | Bearer | `{ currentPassword, newPassword }` | `{}` — **toutes les sessions sont fermées** (cookie supprimé) : rediriger vers `/login` |
| POST | `/auth/password/forgot` | non | `{ email }` | `{}` (même réponse que l'adresse ait un compte ou non) — **503** si aucune adresse d'envoi n'est connectée en production |
| POST | `/auth/password/reset` | non | `{ email, code, newPassword }` | `{}` — mot de passe changé pour tous les comptes de l'adresse, sessions fermées — **401** `"Code invalide ou expiré."` / `"Trop de tentatives. Demandez un nouveau code."` |
| GET | `/auth/google` | non | — | 302 → écran de consentement Google. Le frontend fait un lien/redirection classique vers cette URL, **pas un fetch AJAX**. |
| GET | `/auth/google/callback` | non (appelé par Google) | — | 302 vers le frontend, jamais de JSON direct — voir ci-dessous |
| POST | `/auth/google/complete` | non (protégé par le `token` à usage unique) | `{ token, businessName, slug, sector, acceptedTerms: true }` | `{ accessToken, user }` + Set-Cookie `refresh_token` |

**Flow Google Sign-In — login si le compte existe, sinon inscription en 2 temps :**
1. Frontend redirige le navigateur vers `GET /v1/auth/google` (lien `<a href>`, pas de fetch)
2. L'utilisateur valide sur l'écran Google, qui redirige vers `/v1/auth/google/callback`
3. Le backend redirige selon le cas :
   - **Compte existant** → pose le cookie `refresh_token`, redirige vers `${FRONTEND_URL}/auth/callback` — le frontend appelle `POST /v1/auth/refresh` immédiatement au chargement pour récupérer un `accessToken` (le cookie déjà posé suffit, pas de token dans l'URL par sécurité)
   - **Email Google sans compte** → redirige vers `${FRONTEND_URL}/auth/complete-signup?token=<token>` — le frontend affiche un formulaire (nom du business, slug, secteur, CGU) **sans redemander l'email** (déjà vérifié par Google, porté par le `token` côté serveur), puis soumet en `POST /auth/google/complete` avec ce `token` + les champs du formulaire. `token` expire après 10 min et est **à usage unique** (une 2ᵉ tentative avec le même token échoue même s'il n'a pas expiré).
   - **Plusieurs comptes pour cet email** (un par secteur) → redirige vers `${FRONTEND_URL}/auth/select-account?token=<token>` (voir ci-dessous)
   - Aucun email retourné par Google → `${FRONTEND_URL}/login?error=google_no_email`

**Un compte par secteur.** Un même email / téléphone (et le même nom, le même nom de structure)
peut ouvrir un compte par secteur d'activité (`RESTAURANT`, `EVENT`, `SHOP`), jamais deux dans le
même secteur : `register`, `google/complete` et la création de membre renvoient **409** sinon. Le
`slug` reste unique sur toute la plateforme (**409** « adresse de site déjà prise »).
Quand l'identité prouvée (mot de passe, code SMS ou Google) correspond à plusieurs comptes actifs,
la réponse est `{ accountChoice: { token, accounts: [{ sector, businessName, slug }] } }` sans
session ni cookie ; le client affiche le choix puis appelle `POST /auth/account-choice`
`{ token, sector }`. `token` : 5 min, consommé par le choix. Au login par mot de passe, seuls les
comptes dont le mot de passe correspond sont proposés (un seul → session directe).

`user` shape : voir `src/stores/useAuthStore.ts` (`AuthUser`).

**Mot de passe temporaire** : un membre créé par l'OWNER (voir §11) a `mustChangePassword: true`.
Tant que c'est le cas, toutes les routes `/admin/*` et `/ai/*` répondent **403**
`"Changement de mot de passe requis avant de continuer."` — le frontend doit rediriger vers un
écran de changement de mot de passe dès que `user.mustChangePassword` est vrai (login ou `/auth/me`).

**OTP** : `POST /auth/otp/request` répond `{}` que le numéro ait un compte ou non (aucun SMS
n'est envoyé sans compte). **503** uniquement si aucun fournisseur SMS n'est configuré en
production. Un échec d'envoi n'est pas signalé (il révélerait que le compte existe) : prévoir un
bouton « renvoyer le code ».

**Mot de passe oublié** : code à 6 chiffres envoyé par e-mail depuis l'adresse GiyaX, valable
15 minutes, 5 essais (le code est ensuite invalidé). Un envoi par minute et 5 par jour pour une même
adresse : au-delà, `{}` sans envoi. Un nouveau code remplace le précédent. L'adresse est comparée
sans tenir compte de la casse.

**Compte désactivé** : login → 401 `"Identifiants incorrects."` (message générique), refresh et
toute requête Bearer → 401.

**Sécurité attendue** (voir `GIYA_Audit_Menaces_Complet.md` 3.1, 3.5) :
- Access token : 15 min. Refresh token : 7 jours, httpOnly, rotation à chaque usage.
- Redis blacklist des JWT révoqués (JTI).
- Rate limit 5 tentatives / 15 min / IP sur `/auth/login`, `/auth/otp/*` et `/auth/password/forgot` ; 10 / 15 min sur `/auth/password/reset` ; 20/min sur `/auth/google*`.

---

## 2. Tenants (`/tenants`, `/admin/tenant`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/tenants/:slug` | non (public) | Tenant public : `id, slug, name, sector, status`, `config` limité à `description, phone, address, logoUrl, showcase`, `settings` limité à `taxRate, taxIncluded` (liste blanche) — 404 si inexistant OU suspendu (message générique, pas de distinction) |
| GET | `/admin/tenant` | Bearer | `Tenant` du tenant courant (résolu via JWT) |
| PATCH | `/admin/tenant` | Bearer (OWNER) | `{ name?, description?, phone?, address?, logoUrl? (https, "" pour retirer), taxRate?, taxIncluded? }` → `Tenant` |

**Taxe** : `taxRate` en points de base (`1800` = 18 %, max `5000`), stocké dans `Tenant.settings`.
`taxIncluded` (défaut `true`) = prix affichés TTC : la taxe est extraite, le total ne change pas.
`false` = prix HT : la taxe s'ajoute au total. Sans configuration : 0 %.

| PUT | `/admin/tenant/showcase` | Bearer (OWNER, MANAGER) | Vitrine complète (`UpdateShowcaseDto`) → `Tenant` |
| PUT | `/admin/tenant/site` | Bearer (OWNER, MANAGER) | Site restaurant / boutique (`UpdateSiteDto` : palette, mode, police, mise en page du menu, couverture, présentation, galerie ≤ 6, plats vedettes ≤ 6, horaires, sections, contacts, liens https) → `Tenant`. Corps ≤ 4 Mo. Lu publiquement dans `config.site` de `GET /tenants/:slug` |
| PUT | `/admin/tenant/stay-site` | Bearer (OWNER, MANAGER) | Site RBNB (`UpdateStaySiteDto` : `layout` ∈ `riviera, atelier, horizon, galerie, boutique, nomade`, `palette` ∈ `sable, lagon, foret, corail, ardoise, terre, ivoire, minuit`, `typography` ∈ `editorial, luxe, classique, moderne, geometrique, audacieux, retro, expressif`, `mode` ∈ `clair, sombre`, `motion` ∈ `aucune, douce, vive`, titre, accroche, couverture, présentation, galerie ≤ 8, logements vedettes ≤ 6, points forts ≤ 4, sections, contacts, liens https) → `Tenant`. **400** hors secteur `ACCOMMODATION`. Corps ≤ 5 Mo. Lu publiquement dans `config.staySite` de `GET /tenants/:slug` |
| GET | `/tenants/:slug/media/:hash` | Public | — | Image importée de `config` (logo, vitrine, site), **binaire** (`image/png|jpeg|webp`), `Cache-Control: public, max-age=31536000, immutable`. 404 si absente |

**Vitrine** : stockée dans `Tenant.config.showcase` (+ `updatedAt`) et donc renvoyée telle quelle par
`GET /tenants/:slug` : le site public l'affiche dès la publication. Remplacement complet (PUT).
Images : URL `https://` ou data URL PNG/JPEG/WebP (SVG refusé), 400 000 caractères max chacune ;
corps limité à 3 Mo sur cette seule route (100 ko ailleurs). Les événements n'en font pas partie
(la vitrine affiche les événements en vente).

`Tenant` shape : voir `src/types/api.ts`.

---

### Paramètres de l'organisation (2026-11)

`PATCH /admin/tenant` accepte aussi `contactEmail` (`""` = retirer), `legalName`, `nif`, `rccm`
(stockés dans `config.contactEmail` et `config.legal = { name, nif, rccm }`, exposés par
`GET /tenants/:slug`).

| Méthode | Route | Auth | Body → Réponse |
|---|---|---|---|
| GET | `/admin/payouts` | Bearer (OWNER) | — | `{ test, commissionBps, balance: { sold, commission, refunds, paidOut, inProgress, upcoming }, payouts[] }` (francs CFA entiers) |
| GET | `/admin/tenant/export` | OWNER, 3/h | — | **ZIP binaire** (`attachment`, hors enveloppe JSON) : données de l'organisation en CSV, images, `manifest.json`. Sans mots de passe, codes de billets, signatures ni comptes de versement |
| PUT | `/admin/tenant/emails` | Bearer (OWNER) | `{ senderName, replyTo ("" possible), templates: { ticket?, certificate?, reminder?, survey?: { subject, body, cta, enabled } } }` → `settings.emails` |
| POST | `/admin/tenant/emails/test` | Bearer (OWNER), 5/15 min | `{ kind: "ticket" \| "certificate" \| "reminder" \| "survey" }` → `{ sentTo }` (e-mail du compte connecté) |
| GET | `/admin/tenant/emails/gmail` | Bearer (OWNER) | → `{ connected, email, status: "ACTIVE" \| "ERROR" \| null, lastError, connectedAt, available, platformReady, sentToday, dailyLimit }` (Gmail de l'organisateur ; jamais de jeton) |
| POST | `/admin/tenant/emails/gmail/connect` | Bearer (OWNER), 10/15 min | → `{ url }` : écran Google (scopes `openid email gmail.send`). Retour : `GET /mail/google/callback`, puis redirection vers `/admin/{secteur}/settings?rubrique=messages&gmail=connected \| denied \| scope \| error` |
| DELETE | `/admin/tenant/emails/gmail` | Bearer (OWNER) | → `{ disconnected }` (autorisation révoquée chez Google ; audit `MAIL_ACCOUNT_DISCONNECTED`) |
| GET | `/mail/google/callback?code&state` | public (le `state` aléatoire, 10 min, usage unique, authentifie la demande), 20/min/IP | Redirection 302 vers le frontend (organisateur ou `/vision/emails`) |
| PUT | `/admin/tenant/payouts` | Bearer (OWNER) | `{ frequency: "AFTER_EVENT" \| "WEEKLY", accounts: [{ operator: "AIRTEL" \| "MOOV", phone, holderName }] }` → `settings.payouts` (vérification conservée si le numéro ne change pas) |
| POST | `/admin/tenant/payouts/verify` | Bearer (OWNER), 5/15 min | `{ operator }` → `{ sentTo }` (numéro masqué) : code SMS à 6 chiffres, 10 min |
| POST | `/admin/tenant/payouts/confirm` | Bearer (OWNER), 10/15 min | `{ operator, code }` → `settings.payouts` (`verifiedAt` renseigné) |

Messages : variables `{Prénom}` `{Événement}` `{Date}` `{Lieu}`, `**gras**`, `*italique*`, texte
toujours échappé. Expéditeur affiché « {senderName} via GiyaX », `replyTo` en réponse. « Billet »
toujours envoyé (avec les PDF) ; « Certificat » à l'envoi des attestations ; « Rappel » la veille
à 18:00 (Libreville) si `enabled` ; « Avis » : texte enregistré, envoi pas encore branché.

`PUT /admin/tenant/showcase` accepte aussi `design` (`{ model: "nuit" | "lumiere", palette:
"amber" | "ruby" | "emerald" | "indigo" | "electric" | "custom", typography: "expressive" | "moderne" |
"elegante" | "audacieuse", radius: "droits" | "doux" | "arrondis", colors?: { accent, background,
text } (hex #RRGGBB), highlight?: string (≤ 60, "" = aucun), headlineSize?: "S" | "M" | "L" | "XL" }`)
et `visibleSections` (`{ hero, stats, events, about, gallery, testimonials, faq, footer }`, booléens).

## 3. Menu — Restauration (`/tenants/:slug`, `/admin`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/tenants/:slug/categories` | non | `Category[]` (publiées uniquement) |
| GET | `/tenants/:slug/products` | non | `Product[]` (disponibles uniquement) |
| GET | `/admin/categories` | Bearer | `Category[]` (toutes, y compris désactivées) |
| POST | `/admin/categories` | Bearer (OWNER/MANAGER) | body `{ name, description?, sortOrder?, imageUrl? }` → `Category` |
| PATCH | `/admin/categories/:id` | Bearer (OWNER/MANAGER) | body `Partial<…>` → `Category` |
| DELETE | `/admin/categories/:id` | Bearer (OWNER/MANAGER) | `{}` — **409** si la catégorie contient encore des articles |
| GET | `/admin/products` | Bearer | `Product[]` (tous) |
| POST | `/admin/products` | Bearer (OWNER/MANAGER) | body `Omit<Product, "id">` → `Product` |
| PATCH | `/admin/products/:id` | Bearer (OWNER/MANAGER) | body `Partial<Product>` → `Product` |
| DELETE | `/admin/products/:id` | Bearer (OWNER/MANAGER) | `{}` — un article **déjà commandé** n'est pas supprimé mais passé `isAvailable: false` (historique des commandes conservé) : il reste visible dans `/admin/products` |
| POST | `/admin/products/:id/stock` | Bearer (OWNER/MANAGER) | body `{ type: "IN" \| "ADJUSTMENT", quantity, reason? }` → `Product`. `IN` = réception (ajoute `quantity` ≥ 1), `ADJUSTMENT` = inventaire (`quantity` = nouveau niveau compté) |
| GET | `/admin/products/:id/stock-movements` | Bearer (OWNER/MANAGER) | `StockMovement[]` (100 derniers) |

`categoryId` (création/modification de produit) doit appartenir au tenant — sinon 404.

---

## 4. Tables & QR (`/admin/tables`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/admin/tables` | Bearer | `Table[]` |
| POST | `/admin/tables` | Bearer (OWNER/MANAGER) | body `{ number, capacity? }` → `Table` — **409** si le numéro existe déjà |
| PATCH | `/admin/tables/:id` | Bearer (OWNER/MANAGER) | body `{ number?, capacity?, status? }` (`AVAILABLE`/`OCCUPIED`/`RESERVED`) → `Table` |
| DELETE | `/admin/tables/:id` | Bearer (OWNER/MANAGER) | `{}` — les commandes passées sur la table sont conservées (`tableId` → `null`) |

Le QR code lui-même est généré **côté frontend** (`qrcode.react`) à partir de l'URL
`${APP_URL}/{slug}?table={tableId}` — le backend n'a pas besoin de générer d'image.

### Occupation d'une table (public)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/tenants/:slug/tables/:tableId` | non (public) | `{ id, number, capacity, status, seatedGuests, openOrders }` — **404** table inconnue ou d'un autre tenant, **400** `tableId` non UUID |

- `seatedGuests` = somme des `guestCount` des commandes non terminées de la table
  (`CONFIRMED`→`DELIVERED`, plus les `PENDING` de moins de 30 min : une commande anonyme jamais prise en charge ne bloque pas la table) ; `openOrders` = nombre de ces commandes.
- Aucune donnée client dans la réponse.

---

## 5. Commandes (`/orders`, `/admin/orders`)

| Méthode | Route | Auth | Headers | Body | Réponse `data` |
|---|---|---|---|---|---|
| POST | `/orders` | non (public, vitrine) | `X-Idempotency-Key: <uuid>` | `{ tenantSlug, type, paymentMethod?, tableId?, customerName?, customerPhone, customerEmail?, items: [{productId, quantity, notes}] }` | `Order & { documentToken }` — jeton du lien d'addition / facture (§16) |
| GET | `/admin/orders?status=&page=&limit=` | Bearer | — | — | `Order[]` + `meta: { page, limit, total }` — `limit` par défaut **100** (max 100) |
| PATCH | `/admin/orders/:id/status` | Bearer (OWNER/MANAGER/STAFF/KITCHEN) | — | `{ status }` | `Order` |

**Transitions de statut autorisées** (sinon **409**) :
`PENDING → CONFIRMED | PREPARING | CANCELLED`, `CONFIRMED → PREPARING | CANCELLED`,
`PREPARING → READY | CANCELLED`, `READY → DELIVERED | COMPLETED`, `DELIVERED → COMPLETED`.
`COMPLETED` et `CANCELLED` sont finaux. L'annulation remet en stock les articles suivis.

`paymentMethod` ∈ `CASH` (défaut), `PAY_ON_DELIVERY`, `MOBILE_MONEY`, `CARD` — pour les deux
derniers, enchaîner sur `POST /payments/initialize` ; le moyen réellement utilisé est corrigé au
paiement. `subtotal`/`tax`/`total` suivent la taxe du tenant (§2).

`guestCount` (entier 1-30, optionnel) : nombre de personnes d'une commande `DINE_IN` avec
`tableId`. **409** s'il dépasse `capacity - seatedGuests` (ligne `Table` verrouillée pendant le
contrôle : deux commandes simultanées ne dépassent pas la capacité). Ignoré pour les autres types.
Côté frontend, envoyé seulement si `NEXT_PUBLIC_FEATURES` contient `table-occupancy`.

`tableId` doit appartenir au tenant de `tenantSlug` — sinon 404. Chaque commande crée ou met à
jour la fiche client (§12) identifiée par `customerPhone`.

**Critique** (voir `GIYA_Audit_Menaces_Complet.md` 10.1, 10.2, 10.3) :
- Montant (`subtotal`, `tax`, `total`) **recalculé serveur** à partir des `Product.price`, jamais accepté du client.
- `X-Idempotency-Key` : verrou Redis 30s, une seule commande créée par clé.
- Stock décrémenté de façon atomique (`UPDATE ... WHERE stock >= qty`).

### Temps réel (KDS)

Le frontend ouvre un WebSocket natif (pas socket.io) :
`${NEXT_PUBLIC_WS_URL}/orders?tenantId={tenantId}&token={accessToken}`.

Le `token` est l'access token JWT courant (query param — impossible d'envoyer un header
`Authorization` en WebSocket natif). Le backend doit :
1. Vérifier la signature/expiration du token (même clé que les requêtes REST).
2. Vérifier qu'il n'est pas blacklisté (Redis).
3. Vérifier que `user.tenantId === tenantId` (query param) — sinon fermer la connexion.

Chaque message reçu est un objet `Order` JSON (commande créée ou mise à jour). Voir
`src/hooks/useOrders.ts` → `useOrdersRealtime`.

---

## 6. Analytics (`/admin/analytics`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/admin/analytics/kpis` | Bearer (OWNER/MANAGER) | `{ salesToday: number, ordersInProgress: number, lowStockCount: number, customersCount: number }` |
| GET | `/admin/analytics/events?eventId=` | Bearer (OWNER/MANAGER) | `[{ eventId, capacity, issued, scanned, pending, refunded, revenue, ticketTypes: [{ ticketTypeId, name, quantity, issued, scanned, pending, refunded, revenue }] }]` — `eventId` optionnel (UUID) |

Billetterie (EF-E10) : `issued` = billets `VALID` + `USED`, `scanned` = `USED`, `pending` = réservés non
payés, `revenue` = Σ prix unitaires (HT, centimes) des billets émis — remboursés exclus. `capacity` =
Σ quantités des types de billets. Pas de push temps réel : le back-office rafraîchit par polling.

| GET | `/admin/analytics/overview?days=7\|30\|90` | Bearer (OWNER/MANAGER) | `{ days, from, to, current: Totals, previous: Totals, series: [{ date, revenue, orders, previousRevenue }], heatmap: number[7][24], paymentMethods: [{ key, revenue, orders }], types: [{ key, revenue, orders }], top: [{ label, quantity, revenue }] }` — tous secteurs |

Overview : `Totals = { revenue, orders, avgBasket, customers }` ; `previous` = période précédente de même
durée ; jours locaux `DISPLAY_TIMEZONE` ; `heatmap[jour][heure]` (0 = lundi) en nombre de commandes ;
`top` = plats/produits, billets (type · événement) ou logements selon le secteur. Une commande compte si
réglée : payée en ligne, ou payée sur place puis `COMPLETED`/`DELIVERED` ; annulées exclues, remboursées
exclues du CA. **400** si `days` hors liste.

---

## 7. Scan / Validation (`/admin/scan`)

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| POST | `/admin/scan/validate` | Bearer | `{ code, eventId? }` (contenu brut du QR scanné) | `{ status: "valid" \| "used" \| "invalid", detail?: string }` |
| GET | `/admin/events/:id/scan-manifest` | Bearer (OWNER, MANAGER, STAFF) | — | `{ eventId, generatedAt, publicKey, tickets: [{ code, attendee, ticketType, status }], signature }` |

**Format du QR billet** (`Ticket.qrCode`, aussi encodé dans le PDF) :
`v1.<ticketId>.<signature>` où `signature` = `base64url(Ed25519(ticketId + "." + eventId))` (64 octets,
86 caractères), clé privée `TICKET_SIGNING_PRIVATE_KEY` côté serveur. Les billets émis avant ce format
gardent un code hex de 32 caractères, toujours acceptés (lookup direct, warning serveur). Tout autre
format → `invalid`.

`eventId` (UUID, optionnel) dans le body de `/admin/scan/validate` : l'événement que contrôle le
scanner. Fourni, la signature d'un QR `v1` est vérifiée avant toute requête en base et un billet
d'un autre événement répond `invalid`. Absent, la signature est vérifiée contre l'événement du
billet trouvé.

`scan-manifest` : billets `VALID` de l'événement (mode hors ligne EF-E09).
`publicKey` = clé publique Ed25519 brute (32 octets, base64url) — vérifie hors ligne les QR `v1` et le
manifeste. `signature` = `base64url(Ed25519("manifest." + JSON.stringify({ eventId, generatedAt, publicKey, tickets })))`,
champs dans cet ordre exact.

Usage MVP restauration : validation de table/commande. Réutilisé en V1 pour les billets
événementiel (`Ticket.qrCode`).

---

## 8. Paiements (`/payments`)

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| POST | `/payments/initialize` | non (suit la création de commande) | `{ orderId, method?: "AIRTEL" \| "MOOV" \| "CARD", phone? }` | `{ authorizationUrl, reference, simulated, flow?: "PUSH" \| "REDIRECT" }` — rappelable (nouvelle référence à chaque tentative, 6 au plus par commande), **400** numéro ou montant refusé (Mobile Money : 150 à 500 000 F), **409** déjà payée, remboursée ou annulée, **503** moyen indisponible |

Au paiement confirmé : reçu par e-mail si `customerEmail` est renseigné ; pour une commande de
billets (`type: "EVENT"`), les billets passent `VALID` et le PDF est envoyé par e-mail.

| GET | `/payments/status/:reference` | non (rate limit 30/min) | — | `{ orderId, orderNumber, type, status, paymentStatus, total, documentToken, tickets: [{ id, qrCode, status, ticketTypeId }] }` — `tickets` vide et `documentToken: null` tant que non payé ; **404** référence inconnue |

Prestataire : **MyPVIT** (https://docs.mypvit.pro). Sans `method`, l'opérateur est déduit du numéro
de la commande (07 : Airtel, 06 : Moov).

- `flow: "PUSH"` (Mobile Money) : la demande part sur le téléphone du client. `authorizationUrl` est
  la page d'attente de la vitrine (`/{slug}/{events|stays|orders}/confirmation?reference=…`) ; la
  fenêtre de réservation interroge directement `/payments/status/:reference`.
- `flow: "REDIRECT"` (carte) : `authorizationUrl` est le formulaire bancaire de PVit, ouvert dans un
  nouvel onglet ; fin de parcours sur `/pay/return/success` ou `/pay/return/failed`.
- `/payments/status/:reference` relit le statut chez PVit (au plus toutes les 10 s) tant que le
  paiement est en attente. `paymentStatus: "FAILED"` : le client peut relancer `initialize`.

**Paiement simulé (tests)** — actif si `PAYMENT_SIMULATION=true`, ou par défaut tant que
les codes `PVIT_*` sont absents ; `PAYMENT_SIMULATION=false` le coupe (sans codes : 503).
`initialize` renvoie alors
`simulated: true`, une référence `SIM-…` et un `authorizationUrl` **relatif**
`/{slug}/pay/simulate?reference=SIM-…` (page de la vitrine). Cette page confirme ou refuse :

| POST | `/payments/simulate/:reference` | non (rate limit 10/min) | `{ outcome: "success" \| "failed" }` | même forme que `/payments/status/:reference` — `success` : commande payée (`MOBILE_MONEY`), billets délivrés et envoyés comme un vrai paiement ; `failed` : `paymentStatus: "FAILED"` ; **404** hors mode simulation ou référence non `SIM-` ; **409** commande annulée |

À couper avant d'encaisser de vrais clients : une commande simulée délivre de vrais billets.
Le webhook PVit (`POST /webhooks/pvit`) est **interne au backend**, jamais appelé par le frontend.

### Remboursement (billets)

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| POST | `/admin/orders/:id/refund` | Bearer (OWNER, MANAGER) | `{ releaseSeats?: boolean }` (défaut `true`) | `{ orderId, paymentStatus: "REFUNDED", amount, providerStatus, refundedTickets, releasedSeats }` |

- Commande `type: "EVENT"`, `paymentStatus: "PAID"`, payée en ligne par Mobile Money — sinon **409** (carte : remboursement manuel) ;
  **404** si la commande n'est pas au tenant ; **502** si PVit refuse ou si le résultat est incertain.
- Montant remboursé = `order.total`, toujours (aucun montant accepté dans le body → 400).
- Double appel : **409** (« déjà en cours » ou « déjà remboursée »), jamais deux remboursements.
- Effet : commande `REFUNDED`, billets `VALID` → `REFUNDED` (le scan répond `invalid`), places rendues
  (`sold -= n`) sauf `releaseSeats: false`. Les billets `USED` restent `USED`.
- Le client est reversé sur le numéro qui a payé (`GIVE_CHANGE`, résultat immédiat). Tout refus ou
  résultat incertain est journalisé (`REFUND_FAILED`) et les billets restent valides. Un résultat
  incertain bloque un nouvel essai, pour ne jamais payer deux fois.

---

## 9. IA

| Méthode | Route | Auth | Body → Réponse |
|---|---|---|---|
| POST | `/ai/generate` | Bearer (OWNER, MANAGER), 10/min/tenant | `{ prompt (≤ 500), language?: "fr" | "en" }` → `{ text, cached? }` |
| POST | `/admin/ai/event-description` | Bearer (OWNER, MANAGER), 10/min | `{ title (2-200), eventType?, venueName? (≤ 200), startDate? (ISO), tone?: "festif" \| "professionnel" \| "premium", notes? (≤ 1000) }` → `{ description }` (texte brut, 2-3 paragraphes) |
| POST | `/admin/ai/event-visual` | Bearer (OWNER, MANAGER), 12/min | `{ title (2-200), eventType?, style: "photo" \| "affiche-concert" \| "elegant" \| "afro-moderne" \| "corporate" \| "neon" \| "minimal", prompt? (≤ 400, ambiance) }` → `{ url }` : data URL JPEG 1080 × 1350 (≤ 450 000 caractères). Cloudflare Workers AI (FLUX.1 schnell) ; **429** au-delà de `AI_IMAGE_DAILY_PER_TENANT` (défaut 24/jour/organisateur) ou `AI_IMAGE_DAILY_TOTAL` (160/jour), **503** si non configuré |
| POST | `/ai/assistant` | public, 20/10 min/IP + plafond `AI_ASSISTANT_PUBLIC_DAILY` (défaut 400/jour) | `{ messages: [{ role: "user" \| "assistant", content (≤ 4000) }] (1-30, le dernier = user), page? }` → `{ reply }` — GiyaX AI pour les visiteurs (page d'accueil) ; conversation non conservée côté serveur |
| POST | `/admin/ai/assistant` | Bearer (tous rôles), 40/10 min | même corps + `conversationId?` → `{ reply, conversationId }` — contexte : organisation, secteur, formule, rôle, page ; échange journalisé (`AIPromptLog`, préfixe `[assistant]`) |
| GET | `/admin/ai/conversations` | Bearer (tous rôles) | → `[{ id, title, updatedAt, count, preview }]` (50 dernières conversations du membre avec GiyaX AI) |
| GET | `/admin/ai/conversations/:id` | Bearer (tous rôles) | → `{ id, title, messages: [{ role, content }], updatedAt }` (404 si ce n'est pas la sienne) |
| DELETE | `/admin/ai/conversations/:id` | Bearer (tous rôles) | → `{ deleted }` |

Fournisseur : `GROQ_API_KEY` seul (Groq, `llama-3.3-70b-versatile`) ou `OPENAI_API_KEY` (+ `OPENAI_BASE_URL`). Erreurs : **429** si le fournisseur limite (Groq gratuit), **503** si l'IA n'est pas configurée ou ne répond pas.

GiyaX AI : base de connaissances `src/modules/ai/assistant-knowledge.ts` (backend), à tenir à jour avec le produit. Modèle : `AI_ASSISTANT_MODEL` sinon celui du texte. Le studio d'affiche appelle `event-visual` 4 fois en parallèle (une image par mise en page) et `/ai/generate` pour l'accroche.

Utilisé par l'éditeur du site vitrine (`src/components/site-editor`, hook `useAiText`) :
variantes d'un texte, réécriture, présentation « À propos », question de FAQ, traduction.
Jamais de données personnelles dans la consigne (noms de clients, téléphones).

---

## 10. Hors périmètre MVP restauration (V1)

Non encore consommés par le frontend, à documenter quand les écrans Commerce seront construits :
`/admin/shops/products` (variantes), `/admin/exports/*`. Événementiel : voir §14.

---

## 11. Équipe (`/admin/users`)

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| GET | `/admin/users` | Bearer (OWNER/MANAGER) | — | `Member[]` |
| POST | `/admin/users` | Bearer (OWNER) | `{ fullName, email?, phone?, role, temporaryPassword }` | `Member` |
| PATCH | `/admin/users/:id` | Bearer (OWNER) | `{ role?, isActive? }` | `Member` |
| POST | `/admin/users/:id/reset-password` | Bearer (OWNER) | `{ temporaryPassword }` | `{}` |

`Member` = `{ id, email, phone, fullName, role, isActive, mustChangePassword, lastLoginAt, createdAt }`.
`role` ∈ `MANAGER`, `STAFF`, `KITCHEN`, `CASHIER` (pas d'OWNER). Email ou téléphone requis, unique
par secteur d'activité (**409** sinon). Mot de passe : 8+ caractères, une majuscule, un chiffre.
L'OWNER communique lui-même le mot de passe temporaire au membre (pas d'email pour l'instant) ; le
membre doit le changer à sa première connexion (voir §1). Le compte OWNER et son propre compte ne
sont pas modifiables ici (**403**). Désactiver un membre ou réinitialiser son mot de passe ferme
toutes ses sessions.

---

### Invitation par lien et périmètre (2026-11)

`POST /admin/users` : `invite: true` au lieu de `temporaryPassword` → le membre est créé sans mot de
passe et la réponse contient `inviteUrl` (`{FRONTEND_URL}/invitation/{jeton}`, 7 jours, usage
unique ; envoyé aussi par e-mail si `email`). `eventIds` (UUID des événements du tenant, vide = tous)
sur `POST` et `PATCH /admin/users/:id`. Chaque membre renvoyé porte `eventIds` et `invitePending`.

| Méthode | Route | Auth | Body → Réponse |
|---|---|---|---|
| POST | `/admin/users/:id/invite` | Bearer (OWNER) | — → `{ inviteUrl }` (l'ancien lien ne marche plus) |
| GET | `/auth/invitations/:token` | Public, 20/15 min | → `{ fullName, businessName, login }` ; 404 si invalide ou expiré |
| POST | `/auth/invitations/:token` | Public, 5/15 min | `{ password }` (8+, une majuscule, un chiffre) → `{ login, accessToken, user }` + Set-Cookie `refresh_token` : le membre est connecté directement |

Scanner (STAFF) limité à des événements (`eventIds` non vide) : `GET /admin/events` ne renvoie que
ceux-là ; `GET /admin/events/:id`, `/tickets`, `/scan-manifest`, `/certificates` → 404 pour les
autres ; `POST /admin/scan/validate` refuse leurs billets (`invalid`).

## 12. Clients (`/admin/customers`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/admin/customers?search=&page=&limit=` | Bearer (OWNER/MANAGER) | `Customer[]` + `meta: { page, limit, total }` (`limit` défaut 20, max 100) |

Alimenté automatiquement par `POST /orders` (une fiche par téléphone et par tenant). `search`
cherche dans le nom, le téléphone et l'email.

---

## 13. Journal d'audit (`/admin/audit-logs`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/admin/audit-logs?page=&limit=&actions=` | Bearer (OWNER) | `AuditLog[]` (+ `user: { id, fullName, role }`) + `meta` — `actions` optionnel : codes séparés par des virgules (ex. `REFUND_FAILED,REFUND_PARTIAL_REVIEW,TICKETS_REFUND_NEEDED`) |

Actions journalisées : `CREATE/UPDATE/DELETE_CATEGORY`, `CREATE/UPDATE/DELETE/DISABLE_PRODUCT`,
`STOCK_IN`, `STOCK_ADJUSTMENT`, `CREATE/UPDATE/DELETE_TABLE`, `UPDATE_ORDER_STATUS`,
`UPDATE_TENANT`, `CREATE_USER`, `UPDATE_USER`, `RESET_USER_PASSWORD`, `PAYMENT_CONFIRMED`
(système, `user: null`).

---

---

## 14. Événementiel & billetterie

**Public (vitrine)**

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| GET | `/tenants/:slug/events` | non | — | `Event[]` à venir, `PUBLISHED`/`ONGOING`, avec `ticketTypes: [{ id, name, price, remaining }]` |
| GET | `/tenants/:slug/events/:id` | non | — | `Event` (même forme) |
| GET | `/events` | non, **Host = sous-domaine tenant** | — | Comme `/tenants/:slug/events`, pour le tenant du Host. **404** hors sous-domaine/domaine tenant |
| GET | `/events/:id` | non, **Host = sous-domaine tenant** | — | Comme `/tenants/:slug/events/:id`, pour le tenant du Host |

**Routage par Host (EF-C03).** Un middleware global lit l'en-tête `Host` (port et casse ignorés).
S'il vaut `{slug}.{ROOT_DOMAIN}` (un seul niveau, `slug` = `^[a-z0-9-]+$`) ou un `Tenant.customDomain`
d'un tenant `ACTIVE`, la requête est rattachée à ce tenant (`req.tenant = { tenantId, tenantSlug }`),
mis en cache Redis 5 min (`tenant:host:<host>` ; hôtes inconnus 60 s). Sans correspondance,
rien ne change : `req.tenant` reste `undefined` et toutes les routes existantes se comportent comme
avant. Seules `GET /events` et `GET /events/:id` consomment `req.tenant` ; `/tenants/:slug/...`
reste le fallback et **prime toujours sur le Host**. Conséquence cache : suspension d'un tenant ou
changement de `customDomain` effectif après au plus 5 min. `ROOT_DOMAIN` doit valoir le domaine
racine de prod (ex. `giyax.ga`).
| POST | `/events/:id/tickets` | non, header `X-Idempotency-Key` | `{ items: [{ ticketTypeId, quantity, amount? }] (`amount` = cotisation par billet en centimes, ≥ `minPrice` ou à défaut `price`, multiple de 100 ; ignoré pour un prix fixe) (ou `ticketTypeId` + `quantity` pour une seule formule ; 10 billets au plus au total), customerPhone, customerName?, customerEmail?, attendees?: [{ name }], answers?: { [questionId]: string \| number \| string[] } }` | `Order` (`type: "EVENT"`) + `tickets: [{ id, qrCode, status, ticketTypeId }]` — **400** `"Réponse requise : « … »."` / `"Réponse invalide : « … »."` |
| POST | `/admin/events/:id/invitations` | OWNER, MANAGER | comme l'achat, `X-Idempotency-Key` requis | Billet émis par l'organisateur : seule voie vers une formule masquée ou aux ventes closes |
| POST | `/tickets/pdf` | non (chaque code sert de secret, 10 au plus) | `{ codes: string[] }` | **PDF binaire** (`attachment`, pas d'enveloppe JSON) : les billets fournis, un par page. 404 si aucun n'est `VALID`/`USED`. Le code d'un billet vaut le billet : jamais dans une adresse |

Achat : prix recalculé serveur, places réservées de façon atomique (**409** si plus assez).
- Billets **payants** : commande `PENDING`, billets `PENDING` (non scannables) → enchaîner sur
  `POST /payments/initialize { orderId }`. **Une réservation impayée expire après 30 min** (places
  rendues, commande `CANCELLED`).
- Billets **gratuits** (total 0) : commande `PAID`, billets `VALID` immédiatement, PDF envoyé par e-mail.
- `customerEmail` fortement recommandé : c'est là que les billets PDF sont envoyés.

**Réservation (page publique)** : une commande peut mêler plusieurs formules (`items`). Si une
formule manque de places, toute la commande est refusée (**409**). `attendees` donne un nom par
billet, dans l'ordre des `items` (billet 1 = l'acheteur, au plus le nombre de billets ; à défaut,
`customerName`). Tous les billets partent à
`customerEmail`, en un seul PDF (une page par billet), avec la facture si la commande est payée.
`answers` : réponses au questionnaire d'inscription (`Event.settings.questionnaire`, si
`questionnaireEnabled`), contrôlées serveur selon le type de question (choix parmi les options, notes
1 à 5, date `AAAA-MM-JJ`…) et enregistrées sur la commande (`Order.answers`). Une question
obligatoire sans réponse refuse la commande (400) avant toute réservation de places.


**Admin**

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| GET | `/admin/events` | Bearer | — | `Event[]` (+ `ticketTypes`, avec `quantity`/`sold`) |
| GET | `/admin/events/:id` | Bearer | — | `Event` |
| POST | `/admin/events` | Bearer (OWNER/MANAGER) | `{ title, startDate, endDate?, description?, imageUrl? (https:// ou data URL PNG/JPEG/WebP vérifiée, ≤ 450 000 car.), location?, venueName?, eventType? (CONCERT/CONFERENCE/NIGHTLIFE/EXHIBITION/SPORTS/SHOW/WEDDING), lat?, lng?, capacity?, notifyParticipants?, settings? }` | `Event` (`status: DRAFT`) |
| PATCH | `/admin/events/:id` | Bearer (OWNER/MANAGER) | mêmes champs + `status` (`DRAFT`/`PUBLISHED`/`ONGOING`/`COMPLETED`/`CANCELLED`) ; `settings` fusionné avec l'existant | `Event` |

`settings` (`Event.settings`, JSON, persisté et renvoyé tel quel) :
- Questionnaire : `{ questionnaireEnabled?: boolean, questionnaire?: [{ id, title, type (SHORT_TEXT/PARAGRAPH/SINGLE_CHOICE/MULTIPLE_CHOICE/DROPDOWN/RATING_SCALE/YES_NO/STAR_RATING/NUMBER/DATE), options?, isRequired }] (50 max) }`
- Visuels & Logos : `{ format?: "ONSITE"|"ONLINE"|"HYBRID", posterCrops?: { portrait45?, square11?, banner169? }, logos?: [{ id, name, role ("MAIN_ORGANIZER"|"CO_ORGANIZER"|"PARTNER"|"SPONSOR"|"INSTITUTION"), imageUrl? }], logosDisplay?: { vitrine: boolean, billets: boolean, certificats: boolean } }`
- Billetterie : `{ ticketTemplate?: string, ticketColor?: string, ticketShowPrice?: boolean, ticketShowLogo?: boolean }`
- Certifications : `{ hasCertificate?: boolean, certificateTemplate?: "CLASSIC"|"MODERN"|"EXECUTIVE", certificateTitle?: string, certificateIssuer?: string, certificateIssuedDate?: string, certificateMention?: string, certificateSignatories?: [{ name?: string, role: string, signatureUrl?: string }], certificateRecipients?: "PRESENT_ONLY"|"ALL_REGISTERED"|"MANUAL", certificateSendMode?: "AUTO_NEXT_DAY"|"MANUAL", certificateChannels?: { email: boolean, whatsapp: boolean, portal: boolean } }`

| DELETE | `/admin/events/:id` | Bearer (OWNER/MANAGER) | — | `{}` — **409** si billet émis/réservé/remboursé ou commande payée/remboursée (archiver via `PATCH` `status: CANCELLED`) |
| GET | `/admin/events/:id/tickets` | Bearer (OWNER/MANAGER/STAFF) | — | `Ticket[]` (+ `ticketType: { name, price }`) |
| GET | `/admin/events/:id/orders?page=&limit=` | Bearer (OWNER/MANAGER) | — | `[{ id, orderNumber, status, paymentStatus, paymentMethod, total, customerName, customerPhone, customerEmail, createdAt, tickets: [{ id, status, scannedAt, ticketType: { name } }] }]` + `meta` — commandes de billets de l'événement (réservations, remboursements) |
| GET | `/admin/events/:id/responses` | Bearer (OWNER/MANAGER) | — | `{ orders, responses: [{ id, orderNumber, customerName, customerEmail, customerPhone, createdAt, answers, ticketTypes: string[], tickets, checkedIn }] }` — réponses au questionnaire, une par commande confirmée ; `orders` = inscriptions confirmées (taux de réponse) ; 5000 commandes au plus |
| POST | `/admin/events/:id/ticket-types` | Bearer (OWNER/MANAGER) | `{ name, price, quantity, description?, saleEndsAt?, template?, maxPerOrder?, visible?, kind?: "FIXED" \| "CONTRIBUTION", minPrice? }` — cotisation : `price` = montant suggéré (≥ 15000), `minPrice` entre 15000 et `price` | `TicketType` |
| GET | `/admin/payouts/events?eventId=` | Bearer (OWNER) | — | `[{ eventId, title, startDate, sales, sold, commission, refunds, net, paidOut, inProgress, upcoming }]` — recettes par événement, **francs CFA entiers** |
| GET | `/admin/payouts/statement?page=&limit=&eventId=` | Bearer (OWNER) | — | `{ rows: [{ id, type: "SALE" \| "REFUND", date, eventId, eventTitle, orderNumber, customerName, gross, commission, net, commissionBps, state: "PAID" \| "IN_PROGRESS" \| "UPCOMING", payoutId, paidAt }], page, limit, total }` — relevé (francs) |
| GET | `/admin/payouts/statement/export?eventId=` | Bearer (OWNER) | — | `{ truncated, rows }` — relevé complet pour l'export, 5 000 lignes au plus (10 / minute) |
| GET | `/admin/payouts/:id` | Bearer (OWNER) | — | versement + `events: [{ eventId, title, lines, net }]` — répartition par événement ; **404** autre compte |
| GET | `/admin/support` | Bearer (tout rôle) | — | `{ unread, waiting, messages: [{ id, from: "me" \| "support", body, createdAt }] }` — conversation de la personne connectée avec le support ; ni nom d'admin ni note interne |
| POST | `/admin/support/messages` | Bearer (tout rôle) | `{ body }` (1 à 2000 caractères) | message créé — 20 / minute ; rouvre une conversation clôturée |
| POST | `/admin/support/read` | Bearer (tout rôle) | — | `{}` — réponses marquées lues |
| GET | `/vision/support` | Vision | — | `{ counts: { toTake, overdue, mine }, threads: [{ id, status, organization, person, role, lastMessageAt, lastPreview, waitingSince, overdue, assignedTo: { id, name, me } \| null, canWrite, canClaim, unread }] }` |
| GET | `/vision/support/admins` | Vision | — | `[{ id, name }]` — admins actifs (passage de main) |
| GET | `/vision/support/:id` | Vision | — | `{ thread, messages: [{ id, author: "USER" \| "ADMIN" \| "SYSTEM", adminName, mine, body, createdAt }] }` |
| POST | `/vision/support/:id/claim` | Vision | — | `{}` — prise en charge ; **409** si un collègue l'a déjà (sauf 15 min sans réponse) |
| POST | `/vision/support/:id/release` · `/transfer` `{ adminId }` · `/close` | Vision | — | `{}` — admin en charge uniquement (**403** sinon) |
| POST | `/vision/support/:id/messages` | Vision | `{ body }` | `{ id }` — admin en charge uniquement (**403** sinon) |
| GET | `/admin/push` | Bearer (tout rôle) | — | `{ enabled, publicKey, devices }` — notifications push ; `enabled: false` tant que les clés du serveur ne sont pas posées |
| GET | `/admin/push/feed` | Bearer (tout rôle) | — | `[{ id, kind: "sale" \| "contribution" \| "payout", title, body, url, date }]` — 20 dernières notifications (cloche) ; vide hors OWNER/MANAGER |
| POST | `/admin/push/subscriptions` | Bearer (tout rôle) | `{ endpoint, keys: { p256dh, auth } }` (abonnement du navigateur) | `{ subscribed: true }` — **400** service de notification inconnu ; **503** inactif |
| DELETE | `/admin/push/subscriptions` | Bearer (tout rôle) | `{ endpoint }` | `{ subscribed: false }` |
| POST | `/admin/push/test` | Bearer (tout rôle) | — | `{ devices, sent }` — notification d'essai sur ses propres appareils (5 / minute) |
| GET | `/admin/events/:id/photos` | Bearer (OWNER/MANAGER) | — | `{ limit, count, bytes, storage, photos: [{ id, url, thumbUrl, width, height, size, hidden, createdAt }] }` — album de l'événement |
| POST | `/admin/events/:id/photos` | Bearer (OWNER/MANAGER) | `{ image }` (data URL PNG/JPEG/WebP, ≤ 2 800 000 caractères, une photo par requête) | `EventPhoto` — ré-encodée en WebP 2000 px + vignette 480 px ; **409** album complet (300) ; **503** stockage indisponible |
| PATCH | `/admin/events/:id/photos` | Bearer (OWNER/MANAGER) | `{ ids: uuid[], hidden }` | `{ updated }` — masquer / afficher sur le site |
| DELETE | `/admin/events/:id/photos` | Bearer (OWNER/MANAGER) | `{ ids: uuid[] }` | `{ deleted }` |
| PATCH | `/admin/ticket-types/:id` | Bearer (OWNER/MANAGER) | `{ name?, price?, quantity?, description?, saleEndsAt?, template?, maxPerOrder?, visible?, kind?, minPrice? }` | `TicketType` — **409** si `quantity` < vendus ; **400** cotisation incohérente |
| DELETE | `/admin/ticket-types/:id` | Bearer (OWNER/MANAGER) | — | `{}` — **409** si `sold` > 0 ou si des billets de ce type existent |

### 14.1 Émission et suivi des attestations / certificats

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| POST | `/admin/events/:id/certificates/test` | Bearer (OWNER/MANAGER) | `{ model, title, issuer, issuedDate, mention, signatories, channels }` | `{ ok: true, sentTo: string }` — Envoie un aperçu PDF test à l'organisateur connecté |
| POST | `/admin/events/:id/certificates/send` | Bearer (OWNER/MANAGER) | `{ model, title, issuer, issuedDate, mention, signatories, channels, ticketIds? }` | `{ count: number, dispatches: CertificateDispatchItem[] }` — Génère et dispatche les attestations sécurisées par QR code |
| GET | `/admin/events/:id/certificates` | Bearer (OWNER/MANAGER/STAFF) | — | `CertificateDispatchItem[]` : `[{ id, ticketId, participantName, participantEmail, participantPhone, certificateCode, channels, status ("SENT"|"OPENED"|"VERIFIED"|"FAILED"), sentAt, pdfUrl }]` |

Un événement n'est visible et achetable qu'en `PUBLISHED`/`ONGOING`. La somme des `quantity` des
types de billets ne peut pas dépasser `capacity` (**409**). Validation à l'entrée : §7
(`/admin/scan/validate`, un billet `PENDING` répond `invalid`).

### Page publique d'un événement, albums (2026-11)

`Event.settings` accepte aussi `program` (`[{ id, time, title, detail? }]`, 30 max), `speakers`
(`[{ id, name, role?, photoUrl? }]`, 16 max) et `album` (12 images max, IsImageRef). Corps de
`/admin/events` jusqu'à 8 Mo. Réponses publiques : images des réglages remplacées par leur URL
(`/tenants/:slug/events/:id/image/:hash`) ; `certificateSignatories` n'est jamais exposé.

| Méthode | Route | Auth | Réponse |
|---|---|---|---|
| GET | `/tenants/:slug/past-events` | Public | 12 derniers événements terminés : `{ id, title, startDate, endDate, venueName, location, eventType, imageUrl, settings: { album } }` |

## 15. RBNB — hébergement (`/tenants/:slug/listings`, `/admin/listings`, `/admin/bookings`)

Secteur `ACCOMMODATION`. Dates de séjour au format `AAAA-MM-JJ`, séjour `[checkIn, checkOut[`
(la nuit de `checkOut` n'est pas occupée). Prix en centimes, **toujours recalculés serveur**
(`nights × nightlyPrice + cleaningFee`, puis taxe du tenant).

`Listing` = `{ id, title, description, type, status, city, address, maxGuests, bedrooms, beds,
bathrooms, nightlyPrice, cleaningFee, minNights, checkInTime, checkOutTime, amenities[],
photos[], houseRules }`. `type` ∈ `APARTMENT, HOUSE, STUDIO, ROOM, VILLA` ; `status` ∈
`DRAFT, PUBLISHED, ARCHIVED` ; `amenities` ∈ `WIFI, AIR_CONDITIONING, KITCHEN, WASHER, TV,
PARKING, POOL, HOT_WATER, GENERATOR, SECURITY, WORKSPACE, BREAKFAST` ; `photos` : 10 max,
`https://` ou image importée (comme `IsImageRef`), la 1re = couverture.

| Méthode | Route | Auth | Body / Query | Réponse `data` |
|---|---|---|---|---|
| GET | `/tenants/:slug/listings` | non | — | `Listing[]` publiés, sans `description`/`houseRules`, `photos` = couverture seule |
| GET | `/tenants/:slug/listings/:id` | non | — | `Listing` + `unavailable: [{ start, end }]` (plages occupées à venir, sans info voyageur) |
| GET | `/tenants/:slug/listings/:id/quote` | non (60/min) | `?checkIn&checkOut&guests` | `{ nights, nightlyPrice, cleaningFee, subtotal, tax, total, available }` |
| POST | `/tenants/:slug/listings/:id/bookings` | non (10/min) + `X-Idempotency-Key` | `{ checkIn, checkOut, guests, customerPhone, customerName?, customerEmail?, note? }` | `Order` STAY `{ id, orderNumber, status, paymentStatus, subtotal, tax, total, booking }` — **409** dates prises / capacité dépassée ; puis `POST /payments/initialize { orderId }` |
| GET | `/admin/listings` | Bearer | — | `Listing[]` (archivés inclus, couverture seule + `photoCount`) — remise en ligne via `PATCH status: PUBLISHED` |
| GET | `/admin/listings/:id` | Bearer | — | `Listing` complet |
| POST / PATCH | `/admin/listings[/:id]` | Bearer (OWNER/MANAGER) | champs `Listing` (corps 5 Mo max) | `Listing` |
| DELETE | `/admin/listings/:id` | Bearer (OWNER/MANAGER) | — | `{}` — **409** s'il a des réservations (archiver via `PATCH status: ARCHIVED`) |
| GET | `/admin/listings/:id/calendar` | Bearer | `?from&to` (400 j max) | `{ bookings: Booking[], blocks: ListingBlock[] }` |
| POST | `/admin/listings/:id/blocks` | Bearer (OWNER/MANAGER) | `{ startDate, endDate, reason? }` | `ListingBlock` — **409** si une réservation occupe ces dates |
| DELETE | `/admin/listing-blocks/:id` | Bearer (OWNER/MANAGER) | — | `{}` |
| GET | `/admin/bookings` | Bearer | `?scope=upcoming\|past\|all` | `Booking[]` + `listing { id, title, city }` + `order { orderNumber, paymentStatus, total, tax }` |
| PATCH | `/admin/bookings/:id/status` | Bearer (OWNER/MANAGER/STAFF) | `{ status: CHECKED_IN \| CHECKED_OUT \| CANCELLED }` | `Booking` — **409** hors transitions `PENDING→CANCELLED`, `CONFIRMED→CHECKED_IN\|CANCELLED`, `CHECKED_IN→CHECKED_OUT` |
| GET | `/admin/stays/stats` | Bearer (OWNER/MANAGER) | — | `{ publishedListings, inHouse, upcomingBookings, revenueThisMonth, occupancyNext30, arrivalsToday[], departuresToday[] }` |

`Booking.status` : `PENDING` (non payée, dates retenues 30 min puis libérées) → `CONFIRMED`
(paiement reçu, e-mail de confirmation) → `CHECKED_IN` → `CHECKED_OUT`. Attente du paiement :
`/{slug}/stays/confirmation`. Annuler une réservation payée ne rembourse pas automatiquement.

## 16. Factures & additions (`/admin/invoices`, `/orders/:id/document`)

PDF A5 générés côté serveur, tous secteurs. **Facture** si la commande est réglée (payée en ligne,
remboursée, ou payée sur place puis servie/livrée) ; **addition** si commande restaurant/boutique encore à
régler sur place ; sinon **409**.

| Méthode | Route | Auth | Entrée | Réponse |
|---|---|---|---|---|
| GET | `/admin/invoices` | Bearer (OWNER/MANAGER) | `?page&limit&type&search` | `{ data: [{ id, orderNumber, type, status, paymentMethod, paymentStatus, total, customerName, customerPhone, createdAt }], meta: { page, limit, total, amount } }` — commandes réglées ; `amount` = CA hors remboursements |
| GET | `/admin/invoices/:orderId/pdf` | Bearer (OWNER/MANAGER) | — | `application/pdf` (pièce jointe) — **404** autre tenant |
| GET | `/orders/:orderId/document?token=` | non (rate limit 30/min) | `token` = `documentToken` reçu | `application/pdf` — **404** jeton invalide |

---

## 17. Console plateforme (`/vision`)

Administrateurs du SaaS (table `PlatformAdmin`, distincte de `User`). Jeton Bearer **dédié**
(`aud: giyax-vision`, secret `VISION_JWT_SECRET`, 30 min) — un jeton tenant est refusé. Console désactivée
(**404**) sans `VISION_JWT_SECRET`. Toute connexion et action est journalisée (`PlatformAuditLog`).

| Méthode | Route | Auth | Entrée | Réponse `data` |
|---|---|---|---|---|
| POST | `/vision/auth/login` | non (rate limit 5 / 15 min / IP) | `{ email, password, code }` (TOTP 6 chiffres) | `{ token, expiresAt, admin: { id, email, name } }` — **401** générique (identifiants, code, compte verrouillé ou inactif) ; code TOTP à usage unique |
| POST | `/vision/auth/logout` | Vision | — | `{}` (jeton révoqué) |
| POST | `/vision/auth/password` | Vision (rate limit 5 / 15 min) | `{ currentPassword, newPassword, code }` — nouveau : ≥ 14 caractères, lettres, chiffres, symbole | `{}` — **401** mot de passe actuel ou code invalide ; **400** trop faible ou identique |
| GET | `/vision/me` | Vision | — | `{ id, email, name, expiresAt }` |
| GET | `/vision/overview?days=7\|30\|90` | Vision | — | `{ tenants: { total, bySector, byStatus, byPlan[{key,count,mrr}] }, users: { total, active, passive, neverLoggedIn, disabled, activeWindowDays }, gmv: { current, previous, orders, previousOrders, online, bySector }, mrr, ai: { calls, costUsd, tokens }, series: [{ date, revenue, orders, previousRevenue, newTenants, newUsers }] }` |
| GET | `/vision/traffic?days=1\|7\|30` | Vision | — | `{ granularity: hour\|day, totals: { requests, errors4xx, errors5xx, errorRate, avgMs }, series: [{ at, … }], routes: [{ route, … }] }` |
| GET | `/vision/costs` | Vision | — | `{ lines: [{ label, amount, kind }], total, mrr, margin, assumptions }` — FCFA, estimation 30 j |
| GET | `/vision/domains` | Vision | — | `{ rootDomain, customDomains, items: [{ slug, name, sector, status, customDomain, subdomain }] }` |
| GET | `/vision/mail` | Vision | — | `{ platform: { connected, email, status, lastError, connectedAt }, available, redirectUri, sentToday, tenantAccounts: { active, error } }` |
| POST | `/vision/mail/connect` | Vision, 10/15 min | — | `{ url }` : écran Google pour l'adresse d'envoi GiyaX (retour : `/vision/emails?gmail=…`) |
| DELETE | `/vision/mail` | Vision | — | `{ disconnected }` (journal `MAIL_ACCOUNT_DISCONNECTED`) |
| POST | `/vision/mail/test` | Vision, 5/15 min | `{ to }` | `{ sentTo }` (e-mail d'essai depuis l'adresse GiyaX) |
| GET | `/vision/tenants` | Vision | `?page&limit&search&sector&status&plan` | `{ data: [{ …tenant, users, revenue30d, orders30d, lastLoginAt }], meta }` |
| GET | `/vision/tenants/:id` | Vision | — | tenant + `users[]` (sans mot de passe) + `stats` |
| PATCH | `/vision/tenants/:id` | Vision | `{ status?: ACTIVE\|SUSPENDED, plan?, autoPayout?, reason? }` | `{ id, status, plan, autoPayout }` (autoPayout : versement quotidien sans validation ; restent manuels le premier versement vers un numéro, un titulaire non vérifié, plus de 1 000 000 F) |
| GET | `/vision/users` | Vision | `?page&limit&search&activity=active\|passive\|disabled` | `{ data, meta }` |
| PATCH | `/vision/users/:id` | Vision | `{ isActive, reason? }` | `{ id, isActive }` |
| GET | `/vision/settings` | Vision | — | `{ ticketCommissionBps, isDefault, updatedAt, updatedBy }` (500 = 5 %, frais PVit compris) |
| PATCH | `/vision/settings` | Vision | `{ ticketCommissionBps: 0…2000 }` | idem (journal `TICKET_COMMISSION_UPDATED`) |
| GET | `/vision/payouts` | Vision | `?page&limit&status` | `{ rows, page, limit, total, summary }` |
| POST | `/vision/payouts/prepare` | Vision, 10/15 min | — | `{ created }` (aussi chaque matin à 06:00 UTC) |
| POST | `/vision/payouts/:id/approve` | Vision + code TOTP | `{ code }` | versement ; envoi découpé à 500 000 F |
| POST | `/vision/payouts/:id/retry` | Vision + code TOTP | `{ code }` | relit les parts incertaines, ne renvoie que les échecs certains |
| POST | `/vision/payouts/:id/parts/:partId/resolve` | Vision + code TOTP | `{ outcome: SUCCESS\|FAILED, code }` | constat depuis l'espace MyPVIT |
| POST | `/vision/payouts/:id/reject` | Vision | `{ reason }` | `{ rejected }` (recettes rendues au solde) |
| GET | `/vision/payments` | Vision | `?page&limit&kind=PAYMENT\|REFUND\|DUPLICATE_REFUND&status&q` | `{ rows, page, limit, total }` (journal PVit ; `q` = référence, n° de commande ou téléphone ; numéros masqués) |
| GET | `/vision/payments/issues` | Vision | — | `{ uncertain: [...], duplicates: [... , lastRefund] }` |
| GET | `/vision/payments/treasury` | Vision, 30/15 min | — | `{ test, balanceConfigured, checkedAt, accounts: [{ code (4 derniers car.), channels, balance, owed, error }], owed: { airtel, moov, noAccount, total } }` (solde PVit, `PVIT_CODE_URL_BALANCE`) |
| POST | `/vision/payments/:id/check` | Vision, 30/15 min | — | `{ status: SUCCESS\|FAILED\|PENDING\|UNKNOWN, message }` : redemande à PVit le résultat d'un remboursement incertain ; un succès confirmé rembourse la commande |
| POST | `/vision/payments/:id/resolve` | Vision + code TOTP | `{ outcome: SUCCESS\|FAILED, code }` | constat depuis l'espace MyPVIT |
| POST | `/vision/payments/:id/refund-duplicate` | Vision + code TOTP | `{ code }` | `{ status, message }` : rend un paiement en double au numéro qui a payé (Mobile Money seulement) |
| POST | `/vision/payments/:id/settle-duplicate` | Vision + code TOTP | `{ code, note }` | doublon remboursé hors GiyaX (carte, virement) |
| GET | `/vision/logs` | Vision | `?page&limit` | `{ data, meta }` |
| GET | `/vision/admins` | Vision | — | `[{ id, email, name, isActive, lastLoginAt, lockedUntil }]` |

Actif = dernière connexion < 30 jours. Trafic : compteurs par heure et motif de route (`TrafficStat`, écrit
par lot chaque minute, aucune donnée client). Tenant `SUSPENDED` : site public en 404 et connexion /
refresh / jetons refusés.

---

## 18. Authenticité des documents (`/documents/verify`)

Factures et additions PDF portent un QR « Document signé numériquement par GiyaX » vers
`<FRONTEND_URL>/verify/<code>` et une empreinte lisible. Code `D1.<orderId>.<I|B>.<signature>` :
signature Ed25519 (clé `TICKET_SIGNING_PRIVATE_KEY`, domaine séparé « doc. ») sur numéro, montant,
établissement et date d'émission. Les QR des billets (`v1.<ticketId>.<signature>`) sont acceptés aussi.

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/documents/verify/:code` | non (rate limit 30/min) | `{ valid: false }` ; ou `{ valid: true, type: INVOICE\|BILL, number, total, issuedAt, paymentStatus, business, sector }` ; ou `{ valid: true, type: TICKET, event, startDate, ticketType, status, business, sector }` |

La signature est recalculée depuis la base : document retouché ou code inventé → `valid: false`. Aucune
coordonnée client renvoyée.

---

## 19. Expérience (`/me`)

| Méthode | Route | Auth | Body → Réponse |
|---|---|---|---|
| GET | `/me/experience` | Bearer (tous rôles) | → `{ onboardingDone, feedbackDue, feedbackAnsweredAt }` — `feedbackDue` : visite guidée faite, compte de plus d'un jour, ni reportée (3 jours) ni répondue (30 jours) |
| POST | `/me/onboarding` | Bearer | → `{ onboardingDone: true }` (visite guidée vue ou passée) |
| POST | `/me/feedback/snooze` | Bearer | → `{ snoozedUntil }` (demande d'avis fermée : reproposée dans 3 jours) |
| POST | `/me/feedback` | Bearer, 5/h | `{ mode: "survey" \| "free" \| "both", rating? (1-5), nps? (0-10), likes?: string[], improvements?: string[], category?: "idee" \| "probleme" \| "autre", message? (≤ 2000), page? }` → `{ received }` ; 400 si tout est vide |
| GET | `/vision/feedback?page=&limit=` | Vision | → `{ data: Feedback[] (+ tenant, user), meta, summary: { averageRating, averageNps } }` |

Préférences dans `User.preferences` (JSON) ; avis dans la table `Feedback` (RLS par organisation), historique GiyaX AI dans `AssistantConversation`.

---

## Historique

- **2026-11-08** — Expérience (§19) : visite guidée, demande d'avis, `GET /vision/feedback` ; historique
  GiyaX AI (`/admin/ai/conversations`, `conversationId` sur `/admin/ai/assistant`). Migration
  `20261108000000_experience` (`User.preferences`, `AssistantConversation`, `Feedback`).
- **2026-11-08** — GiyaX AI : `POST /ai/assistant` (public) et `POST /admin/ai/assistant` (§9).
  Images d'affiche à 4 étapes, quotas 24/jour/organisateur et 160/jour, `event-visual` 12/min.
- **2026-11-07** — Affiches IA : `POST /admin/ai/event-visual` (Cloudflare Workers AI). Frontend :
  pages `/confidentialite` et `/conditions` (alias `/privacy`, `/terms`, `/cgu`), slugs réservés
  côté backend (`confidentialite`, `conditions`, `privacy`, `terms`, `cgu`, `legal`, `pricing`…).
- **2026-11-07** — E-mails par l'API Gmail (OAuth2), Resend retiré : adresse d'envoi GiyaX connectée
  depuis `/vision/emails`, Gmail de chaque organisateur (Paramètres › E-mails, §2). Ordre d'envoi :
  Gmail de l'organisateur (quota `MAIL_TENANT_DAILY_LIMIT`, défaut 450/jour), puis adresse GiyaX
  (« Nom via GiyaX »). Table `MailAccount` (jetons chiffrés, RLS). IA : Groq via `GROQ_API_KEY`,
  nouvelle route `POST /admin/ai/event-description` (§9).
- **2026-11-07** — Refonte événementielle (cohérence frontend / backend) : paramètres de
  l'organisation (e-mail de contact, identité légale, messages aux participants personnalisables avec
  expéditeur et rappel la veille, comptes de versement Mobile Money vérifiés par SMS) ; équipe
  (invitation par lien, événements accessibles d'un scanner) ; événements (programme, intervenants,
  album, `GET /tenants/:slug/past-events`, signatures d'attestation retirées des réponses publiques) ;
  site vitrine (`design`, `visibleSections`). Migration `20261107000000_member_event_scope`
  (`User.eventIds`).
- **2026-11-04 (frontend, à aligner côté backend)** — Adresses des sites : le slug devient un sous-domaine (`nom.giyax.com`) dès que le domaine est branché, sinon `giyax.vercel.app/nom`. Le frontend refuse les slugs qui ne sont pas un libellé DNS valide (tiret au début ou à la fin) et la liste `RESERVED_SLUGS` de `src/lib/constants.ts` (sous-domaines techniques et chemins de l'application : `www`, `api`, `login`, `signup`, `scan`, `kitchen`…) : la même règle doit être appliquée par `POST /auth/register` et `POST /auth/google/complete`. CORS et cookie de rafraîchissement à ouvrir aux origines `https://*.giyax.com` le jour du branchement. Vitrine : `visibleSections` (`{ hero, stats, events, about, gallery, testimonials, faq, footer }`, booléens) à accepter dans `UpdateShowcaseDto` et à renvoyer dans `config.showcase` ; envoyé seulement avec le drapeau `NEXT_PUBLIC_FEATURES=showcase-sections`.
- **2026-11-04** — Variantes de site : `layout` (10 valeurs) et `motion` facultatifs sur `PUT /admin/tenant/site` ; `layout` facultatif sur `PUT /admin/tenant/showcase` (`scene, affiche, agenda, festival, conference, gala, club, communaute, masterclass, minimal`) ; `PUT /admin/tenant/stay-site` accepte aussi `lodge, carnet, comparatif, panorama`.
- **2026-11-04** — Signature numérique des factures/additions (QR + empreinte) et `GET /documents/verify/:code` (§18) ; billets vérifiables au même endroit.
- **2026-11-04** — Google : `GET /auth/google/pending?token=` (identité pré-remplie : `{ email, fullName, avatarUrl }`), `phone` facultatif sur `POST /auth/google/complete`, lien réutilisable jusqu'à création du compte ; échec Google → `/login?error=google_failed`.
- **2026-11-04** — Console plateforme `/vision` (§17) ; tenant suspendu = plus d'accès au back-office ; slugs réservés (`vision`, `admin`…).
- **2026-11-03** — Factures/additions PDF serveur tous secteurs (§16), `documentToken` sur `POST /orders` et `/payments/status`, `GET /admin/analytics/overview`. Secteur `ACCOMMODATION` affiché « RBNB ».
- **2026-11-03** — Images importées (data URL) hors des réponses JSON publiques : `GET /tenants/:slug` (`config.*`),
  `GET /tenants/:slug/listings[/:id]` (`photos`) et `GET /tenants/:slug/events[/:id]` / `GET /events[/:id]` (`imageUrl`)
  renvoient à la place une URL https vers l'image binaire en cache permanent :
  `/tenants/:slug/media/:hash`, `/tenants/:slug/listings/:id/photos/:hash`, `/tenants/:slug/events/:id/image/:hash`
  (`:hash` = 32 hex, empreinte du contenu). Les routes `/admin/*` renvoient toujours les data URL (édition).
  Base des URL : `PUBLIC_API_URL` si défini, sinon hôte de la requête.
- **2026-11-03** — `PUT /admin/tenant/stay-site` (site RBNB, `config.staySite`) ; `GET /admin/listings` inclut les logements archivés.
- **2026-11-03** — RBNB (§15) : logements, réservations à la nuit (Order `STAY`), dates fermées,
  statistiques hôte. Secteur `ACCOMMODATION`. Un compte par secteur pour une même identité (§1).

- **2026-11-02** — `PUT /admin/tenant/site` : apparence et contenu du site restaurant / boutique
  (`config.site`, exposé par `GET /tenants/:slug`). Éditeur : `admin/[sector]/site`.

- **2026-11-02** — Occupation de table publique (§4), `guestCount` sur `POST /orders` (§5),
  `logoUrl` sur `PATCH /admin/tenant` (stocké dans `Tenant.config.logoUrl`, utilisé par les
  factures / additions PDF générées par le frontend).

- **2026-10-05** — Stats billetterie (§6), statut de paiement public + URL de retour billets (§8),
  filtre d'audit par action (§13), commandes d'un événement, champs `venueName`/`eventType`/
  `TicketType.description` (§14). Remboursement (§8), QR signés Ed25519 et manifeste de scan (§7).

- **2026-09-29 (lot 2)** — Billetterie (§14), taxe par tenant, `paymentMethod`, reçus et billets
  par e-mail, OTP par SMS réel.
- **2026-09-29** — Équipe (§11), clients (§12), journal d'audit (§13), changement de mot de
  passe, gestion complète catégories/tables/stock, pagination `/admin/orders`, transitions de
  statut, KPIs réservés OWNER/MANAGER, paiement rappelable.
- **2026-08-19** — Version initiale, générée en même temps que le scaffold `giya-frontend`
  (auth, tenant, menu, commandes, KDS realtime, scan, QR, paiement init).
