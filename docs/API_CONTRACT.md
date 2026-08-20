# LUMINA — Contrat API Frontend → Backend

**Émis par :** `lumina-frontend`
**Destiné à :** `lumina-backend` (NestJS)
**Statut :** Vivant — mis à jour à chaque nouvelle feature frontend qui consomme une route pas encore implémentée.

Ce document liste **toutes les routes HTTP que le frontend appelle actuellement**, telles
qu'utilisées dans le code (`src/lib/api.ts`, `src/hooks/*`, `src/lib/tenant.ts`). Le backend doit
les implémenter conformément à `LUMINA_BACKEND_CONTEXT.md` (réponse uniforme `{ success, data,
error, meta }`, versionnées `/v1/`, RBAC, RLS, etc.).

Base URL frontend : `NEXT_PUBLIC_API_URL` (ex: `https://api.lumina.ga/v1`).

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
| GET | `/auth/me` | Bearer | — | `{ user: { id, email, phone, fullName, role, tenantId } }` |

`user` shape : voir `src/stores/useAuthStore.ts` (`AuthUser`).

**Sécurité attendue** (voir `LUMINA_Audit_Menaces_Complet.md` 3.1, 3.5) :
- Access token : 15 min. Refresh token : 7 jours, httpOnly, rotation à chaque usage.
- Redis blacklist des JWT révoqués (JTI).
- Rate limit 5 tentatives / 15 min / IP sur `/auth/login` et `/auth/otp/*`.

---

## 2. Tenants (`/tenants`, `/admin/tenant`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/tenants/:slug` | non (public) | `Tenant` — 404 si inexistant OU suspendu (message générique, pas de distinction) |
| GET | `/admin/tenant` | Bearer | `Tenant` du tenant courant (résolu via JWT) |
| PATCH | `/admin/tenant` | Bearer (OWNER) | `{ name?, description?, phone?, address? }` → `Tenant` |

`Tenant` shape : voir `src/types/api.ts`.

---

## 3. Menu — Restauration (`/tenants/:slug`, `/admin`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/tenants/:slug/categories` | non | `Category[]` (publiées uniquement) |
| GET | `/tenants/:slug/products` | non | `Product[]` (disponibles uniquement) |
| GET | `/admin/categories` | Bearer | `Category[]` (toutes, y compris désactivées) |
| GET | `/admin/products` | Bearer | `Product[]` (tous) |
| POST | `/admin/products` | Bearer (OWNER/MANAGER) | body `Omit<Product, "id">` → `Product` |
| PATCH | `/admin/products/:id` | Bearer (OWNER/MANAGER) | body `Partial<Product>` → `Product` |
| DELETE | `/admin/products/:id` | Bearer (OWNER/MANAGER) | `{}` |

---

## 4. Tables & QR (`/admin/tables`)

| Méthode | Route | Auth | Réponse `data` |
|---|---|---|---|
| GET | `/admin/tables` | Bearer | `Table[]` |
| POST | `/admin/tables` | Bearer (OWNER/MANAGER) | body `{ number }` → `Table` |

Le QR code lui-même est généré **côté frontend** (`qrcode.react`) à partir de l'URL
`${APP_URL}/{slug}?table={tableId}` — le backend n'a pas besoin de générer d'image.

---

## 5. Commandes (`/orders`, `/admin/orders`)

| Méthode | Route | Auth | Headers | Body | Réponse `data` |
|---|---|---|---|---|---|
| POST | `/orders` | non (public, vitrine) | `X-Idempotency-Key: <uuid>` | `{ tenantSlug, type, tableId?, customerName?, customerPhone, customerEmail?, items: [{productId, quantity, notes}] }` | `Order` |
| GET | `/admin/orders?status=&page=&limit=` | Bearer | — | — | `Order[]` |
| PATCH | `/admin/orders/:id/status` | Bearer (OWNER/MANAGER/STAFF/KITCHEN) | — | `{ status }` | `Order` |

**Critique** (voir `LUMINA_Audit_Menaces_Complet.md` 10.1, 10.2, 10.3) :
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
| GET | `/admin/analytics/kpis` | Bearer | `{ salesToday: number, ordersInProgress: number, lowStockCount: number, customersCount: number }` |

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
| POST | `/payments/initialize` | non (suit la création de commande) | `{ orderId }` | `{ authorizationUrl: string, reference: string }` |

Le frontend redirige `window.location.href` vers `authorizationUrl` (Paystack hosted checkout).
Le webhook Paystack (`POST /webhooks/paystack`) est **interne au backend**, jamais appelé par le
frontend — voir `LUMINA_BACKEND_CONTEXT.md` 4.6.

---

## 9. IA (à venir — non encore consommé par le frontend)

Prévu : `POST /ai/generate` `{ type, prompt }` → `{ text }`, protégé Bearer + rate limit
10/min/tenant. Sera ajouté ici dès qu'un composant frontend l'utilisera (génération de
description produit).

---

## 10. Hors périmètre MVP restauration (V1)

Non encore consommés par le frontend, à documenter quand les écrans Événementiel / Commerce
seront construits : `/admin/events`, `/admin/tickets`, `/admin/shops/products` (variantes),
`/admin/customers`, `/admin/exports/*`.

---

## Historique

- **2026-08-19** — Version initiale, générée en même temps que le scaffold `lumina-frontend`
  (auth, tenant, menu, commandes, KDS realtime, scan, QR, paiement init).
