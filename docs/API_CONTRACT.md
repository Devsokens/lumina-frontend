# GIYA — Contrat API Frontend → Backend

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
| POST | `/auth/login` | non | `{ email? \| phone?, password }` | `{ accessToken, user }` + Set-Cookie `refresh_token` |
| POST | `/auth/otp/request` | non | `{ phone }` | `{}` |
| POST | `/auth/otp/verify` | non | `{ phone, code }` | `{ accessToken, user }` + Set-Cookie `refresh_token` |
| POST | `/auth/refresh` | cookie | — | `{ accessToken }` (nouveau refresh_token en cookie, rotation) |
| POST | `/auth/logout` | Bearer | — | `{}` + suppression cookie `refresh_token` |
| GET | `/auth/me` | Bearer | — | `{ user: { id, email, phone, fullName, role, tenantId, mustChangePassword } }` |
| POST | `/auth/change-password` | Bearer | `{ currentPassword, newPassword }` | `{}` — **toutes les sessions sont fermées** (cookie supprimé) : rediriger vers `/login` |
| GET | `/auth/google` | non | — | 302 → écran de consentement Google. Le frontend fait un lien/redirection classique vers cette URL, **pas un fetch AJAX**. |
| GET | `/auth/google/callback` | non (appelé par Google) | — | 302 vers le frontend, jamais de JSON direct — voir ci-dessous |
| POST | `/auth/google/complete` | non (protégé par le `token` à usage unique) | `{ token, businessName, slug, sector, acceptedTerms: true }` | `{ accessToken, user }` + Set-Cookie `refresh_token` |

**Flow Google Sign-In — login si le compte existe, sinon inscription en 2 temps :**
1. Frontend redirige le navigateur vers `GET /v1/auth/google` (lien `<a href>`, pas de fetch)
2. L'utilisateur valide sur l'écran Google, qui redirige vers `/v1/auth/google/callback`
3. Le backend redirige selon le cas :
   - **Compte existant** → pose le cookie `refresh_token`, redirige vers `${FRONTEND_URL}/auth/callback` — le frontend appelle `POST /v1/auth/refresh` immédiatement au chargement pour récupérer un `accessToken` (le cookie déjà posé suffit, pas de token dans l'URL par sécurité)
   - **Email Google sans compte** → redirige vers `${FRONTEND_URL}/auth/complete-signup?token=<token>` — le frontend affiche un formulaire (nom du business, slug, secteur, CGU) **sans redemander l'email** (déjà vérifié par Google, porté par le `token` côté serveur), puis soumet en `POST /auth/google/complete` avec ce `token` + les champs du formulaire. `token` expire après 10 min et est **à usage unique** (une 2ᵉ tentative avec le même token échoue même s'il n'a pas expiré).
   - Aucun email retourné par Google → `${FRONTEND_URL}/login?error=google_no_email`

`user` shape : voir `src/stores/useAuthStore.ts` (`AuthUser`).

**Mot de passe temporaire** : un membre créé par l'OWNER (voir §11) a `mustChangePassword: true`.
Tant que c'est le cas, toutes les routes `/admin/*` et `/ai/*` répondent **403**
`"Changement de mot de passe requis avant de continuer."` — le frontend doit rediriger vers un
écran de changement de mot de passe dès que `user.mustChangePassword` est vrai (login ou `/auth/me`).

**OTP** : `POST /auth/otp/request` répond `{}` que le numéro ait un compte ou non (aucun SMS
n'est envoyé sans compte). **503** uniquement si aucun fournisseur SMS n'est configuré en
production. Un échec d'envoi n'est pas signalé (il révélerait que le compte existe) : prévoir un
bouton « renvoyer le code ».

**Compte désactivé** : login → 401 `"Identifiants incorrects."` (message générique), refresh et
toute requête Bearer → 401.

**Sécurité attendue** (voir `GIYA_Audit_Menaces_Complet.md` 3.1, 3.5) :
- Access token : 15 min. Refresh token : 7 jours, httpOnly, rotation à chaque usage.
- Redis blacklist des JWT révoqués (JTI).
- Rate limit 5 tentatives / 15 min / IP sur `/auth/login` et `/auth/otp/*` ; 20/min sur `/auth/google*`.

---

## 2. Tenants (`/tenants`, `/admin/tenant`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/tenants/:slug` | non (public) | `Tenant` — 404 si inexistant OU suspendu (message générique, pas de distinction) |
| GET | `/admin/tenant` | Bearer | `Tenant` du tenant courant (résolu via JWT) |
| PATCH | `/admin/tenant` | Bearer (OWNER) | `{ name?, description?, phone?, address?, taxRate?, taxIncluded? }` → `Tenant` |

**Taxe** : `taxRate` en points de base (`1800` = 18 %, max `5000`), stocké dans `Tenant.settings`.
`taxIncluded` (défaut `true`) = prix affichés TTC : la taxe est extraite, le total ne change pas.
`false` = prix HT : la taxe s'ajoute au total. Sans configuration : 0 %.

`Tenant` shape : voir `src/types/api.ts`.

---

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

---

## 5. Commandes (`/orders`, `/admin/orders`)

| Méthode | Route | Auth | Headers | Body | Réponse `data` |
|---|---|---|---|---|---|
| POST | `/orders` | non (public, vitrine) | `X-Idempotency-Key: <uuid>` | `{ tenantSlug, type, paymentMethod?, tableId?, customerName?, customerPhone, customerEmail?, items: [{productId, quantity, notes}] }` | `Order` |
| GET | `/admin/orders?status=&page=&limit=` | Bearer | — | — | `Order[]` + `meta: { page, limit, total }` — `limit` par défaut **100** (max 100) |
| PATCH | `/admin/orders/:id/status` | Bearer (OWNER/MANAGER/STAFF/KITCHEN) | — | `{ status }` | `Order` |

**Transitions de statut autorisées** (sinon **409**) :
`PENDING → CONFIRMED | PREPARING | CANCELLED`, `CONFIRMED → PREPARING | CANCELLED`,
`PREPARING → READY | CANCELLED`, `READY → DELIVERED | COMPLETED`, `DELIVERED → COMPLETED`.
`COMPLETED` et `CANCELLED` sont finaux. L'annulation remet en stock les articles suivis.

`paymentMethod` ∈ `CASH` (défaut), `PAY_ON_DELIVERY`, `MOBILE_MONEY`, `CARD` — pour les deux
derniers, enchaîner sur `POST /payments/initialize` ; le moyen réellement utilisé est corrigé au
paiement. `subtotal`/`tax`/`total` suivent la taxe du tenant (§2).

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

---

## 7. Scan / Validation (`/admin/scan`)

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| POST | `/admin/scan/validate` | Bearer | `{ code }` (contenu brut du QR scanné) | `{ status: "valid" \| "used" \| "invalid", detail?: string }` |

Usage MVP restauration : validation de table/commande. Réutilisé en V1 pour les billets
événementiel (`Ticket.qrCode`).

---

## 8. Paiements (`/payments`)

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| POST | `/payments/initialize` | non (suit la création de commande) | `{ orderId }` | `{ authorizationUrl: string, reference: string }` — rappelable (nouvelle référence à chaque tentative), **409** si déjà payée ou annulée (réservation de billets expirée) |

Au paiement confirmé : reçu par e-mail si `customerEmail` est renseigné ; pour une commande de
billets (`type: "EVENT"`), les billets passent `VALID` et le PDF est envoyé par e-mail.

Le frontend redirige `window.location.href` vers `authorizationUrl` (Paystack hosted checkout).
Le webhook Paystack (`POST /webhooks/paystack`) est **interne au backend**, jamais appelé par le
frontend — voir `GIYA_BACKEND_CONTEXT.md` 4.6.

---

## 9. IA (à venir — non encore consommé par le frontend)

Prévu : `POST /ai/generate` `{ type, prompt }` → `{ text }`, protégé Bearer + rate limit
10/min/tenant. Sera ajouté ici dès qu'un composant frontend l'utilisera (génération de
description produit).

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
sur toute la plateforme (**409** sinon). Mot de passe : 8+ caractères, une majuscule, un chiffre.
L'OWNER communique lui-même le mot de passe temporaire au membre (pas d'email pour l'instant) ; le
membre doit le changer à sa première connexion (voir §1). Le compte OWNER et son propre compte ne
sont pas modifiables ici (**403**). Désactiver un membre ou réinitialiser son mot de passe ferme
toutes ses sessions.

---

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
| GET | `/admin/audit-logs?page=&limit=` | Bearer (OWNER) | `AuditLog[]` (+ `user: { id, fullName, role }`) + `meta` |

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
| POST | `/events/:id/tickets` | non, header `X-Idempotency-Key` | `{ ticketTypeId, quantity (1-10), customerPhone, customerName?, customerEmail? }` | `Order` (`type: "EVENT"`) + `tickets: [{ id, qrCode, status, ticketTypeId }]` |
| GET | `/tickets/:qrCode/pdf` | non (le `qrCode` sert de secret) | — | **PDF binaire** (pas d'enveloppe JSON). 404 si le billet n'est pas `VALID`/`USED` |

Achat : prix recalculé serveur, places réservées de façon atomique (**409** si plus assez).
- Billets **payants** : commande `PENDING`, billets `PENDING` (non scannables) → enchaîner sur
  `POST /payments/initialize { orderId }`. **Une réservation impayée expire après 30 min** (places
  rendues, commande `CANCELLED`).
- Billets **gratuits** (total 0) : commande `PAID`, billets `VALID` immédiatement, PDF envoyé par e-mail.
- `customerEmail` fortement recommandé : c'est là que les billets PDF sont envoyés.

**Admin**

| Méthode | Route | Auth | Body | Réponse `data` |
|---|---|---|---|---|
| GET | `/admin/events` | Bearer | — | `Event[]` (+ `ticketTypes`, avec `quantity`/`sold`) |
| GET | `/admin/events/:id` | Bearer | — | `Event` |
| POST | `/admin/events` | Bearer (OWNER/MANAGER) | `{ title, startDate, endDate?, description?, imageUrl?, location?, lat?, lng?, capacity? }` | `Event` (`status: DRAFT`) |
| PATCH | `/admin/events/:id` | Bearer (OWNER/MANAGER) | mêmes champs + `status` (`DRAFT`/`PUBLISHED`/`ONGOING`/`COMPLETED`/`CANCELLED`) | `Event` |
| DELETE | `/admin/events/:id` | Bearer (OWNER/MANAGER) | — | `{}` — **409** si des billets ont été émis (passer `CANCELLED`) |
| GET | `/admin/events/:id/tickets` | Bearer (OWNER/MANAGER/STAFF) | — | `Ticket[]` (+ `ticketType: { name, price }`) |
| POST | `/admin/events/:id/ticket-types` | Bearer (OWNER/MANAGER) | `{ name, price, quantity }` | `TicketType` |
| PATCH | `/admin/ticket-types/:id` | Bearer (OWNER/MANAGER) | `{ name?, price?, quantity? }` | `TicketType` — **409** si `quantity` < vendus |
| DELETE | `/admin/ticket-types/:id` | Bearer (OWNER/MANAGER) | — | `{}` — **409** si des billets de ce type existent |

Un événement n'est visible et achetable qu'en `PUBLISHED`/`ONGOING`. La somme des `quantity` des
types de billets ne peut pas dépasser `capacity` (**409**). Validation à l'entrée : §7
(`/admin/scan/validate`, un billet `PENDING` répond `invalid`).

## Historique

- **2026-09-29 (lot 2)** — Billetterie (§14), taxe par tenant, `paymentMethod`, reçus et billets
  par e-mail, OTP par SMS réel.
- **2026-09-29** — Équipe (§11), clients (§12), journal d'audit (§13), changement de mot de
  passe, gestion complète catégories/tables/stock, pagination `/admin/orders`, transitions de
  statut, KPIs réservés OWNER/MANAGER, paiement rappelable.
- **2026-08-19** — Version initiale, générée en même temps que le scaffold `giya-frontend`
  (auth, tenant, menu, commandes, KDS realtime, scan, QR, paiement init).
