# LUMINA — DOCUMENT MAÎTRE COMPLET v2.0
## SaaS de Digitalisation Sectorielle pour l'Afrique
**Version :** 2.0 — Architecture Séparée (2 Repos)  
**Date :** 19 Août 2026  
**Auteur :** Direction Produit & Sécurité LUMINA  
**Statut :** Cahier des charges final — Phase MVP

---

# TABLE DES MATIÈRES

## PARTIE I — STRATÉGIE & VISION
1. [Résumé Exécutif & Vision](#1-résumé-exécutif--vision)
2. [Architecture Produit (2 Repos)](#2-architecture-produit-2-repos)
3. [Brief pour Claude Design — UI/UX](#3-brief-pour-claude-design--uiux)
4. [Brief pour Claude Code — Backend](#4-brief-pour-claude-code--backend)
5. [Brief pour Claude Code — Frontend](#5-brief-pour-claude-code--frontend)
6. [Parcours Utilisateurs Détaillés](#6-parcours-utilisateurs-détaillés)
7. [Cahier des Charges Fonctionnel](#7-cahier-des-charges-fonctionnel)
8. [Stack Technique Finale (2 Repos)](#8-stack-technique-finale-2-repos)
9. [Intégration IA — Guide Implémentation](#9-intégration-ia--guide-implémentation)
10. [Modèle Économique & Freemium](#10-modèle-économique--freemium)
11. [Souveraineté des Données](#11-souveraineté-des-données)
12. [Rôles & Permissions](#12-rôles--permissions)
13. [Roadmap MVP → V1](#13-roadmap-mvp--v1)
14. [Plans Gratuits — Démarrage Zero Budget](#14-plans-gratuits--démarrage-zero-budget)

## PARTIE II — ARCHITECTURE DES DONNÉES
15. [Architecture des Stockages](#15-architecture-des-stockages)
16. [Couche Base de Données](#16-couche-base-de-données)
17. [Couche Cache & Fichiers](#17-couche-cache--fichiers)
18. [Export Client & Portabilité](#18-export-client--portabilité)
19. [Stratégie Data Center & Souveraineté](#19-stratégie-data-center--souveraineté)
20. [Backup & Disaster Recovery](#20-backup--disaster-recovery)

## PARTIE III — SÉCURITÉ
21. [Plan de Sécurité Global](#21-plan-de-sécurité-global)
22. [Authentification & Autorisation](#22-authentification--autorisation)
23. [Sécurité Multi-Tenant](#23-sécurité-multi-tenant)
24. [Sécurité des Paiements](#24-sécurité-des-paiements)
25. [Sécurité API & Frontend](#25-sécurité-api--frontend)
26. [Conformité & Gouvernance](#26-conformité--gouvernance)

## PARTIE IV — AUDIT DES MENACES (THREAT MATRIX)
27. [Injections](#27-injections)
28. [Cross-Site Scripting (XSS)](#28-cross-site-scripting-xss)
29. [Authentification & Sessions](#29-authentification--sessions)
30. [Contrôle d'Accès](#30-contrôle-daccès)
31. [Fichiers & Uploads](#31-fichiers--uploads)
32. [CSRF & Redirections](#32-csrf--redirections)
33. [API & Infrastructure](#33-api--infrastructure)
34. [Attaques Métier](#34-attaques-métier)
35. [Attaques Réseau & IA](#35-attaques-réseau--ia)
36. [Récapitulatif & Actions Critiques](#36-récapitulatif--actions-critiques)

---

---

# PARTIE I — STRATÉGIE & VISION

---

# 1. RÉSUMÉ EXÉCUTIF & VISION

## 1.1. Le Problème
Au Gabon et en Afrique francophone, la digitalisation des PME/PMI reste fragmentée :
- **Événementiel** : gestion manuelle des réservations, billets papier, fraude, absence de vitrine digitale.
- **Restauration** : menus papier, commandes orales sujettes aux erreurs, pas de traçabilité des stocks, paiement cash dominant.
- **Commerce** : vente sur WhatsApp/Facebook sans infrastructure e-commerce, gestion de stock artisanale, pas de paiement en ligne intégré.

## 1.2. La Vision LUMINA
> **"Digitaliser l'économie informelle et formelle africaine par des outils sectoriels simples, sécurisés et intelligents — sans écrire une ligne de code."**

LUMINA est une plateforme **multi-tenant, multi-secteur** où chaque opérateur économique obtient :
- Un sous-domaine natif (`monbusiness.lumina.ga`)
- Un dashboard métier configuré à son secteur
- Une vitrine publique pour ses clients
- Des modules IA pour automatiser les tâches répétitives

## 1.3. Architecture à 2 Repos (Nouveau)
Avec une équipe de 4+ développeurs, LUMINA adopte une architecture séparée :

| Repo | Rôle | Tech | URL |
|------|------|------|-----|
| **lumina-backend** | API REST, auth, paiements, IA, DB | NestJS + Prisma + PostgreSQL | `api.lumina.ga` |
| **lumina-frontend** | PWA, dashboard, vitrine, scan QR | Next.js 14 + Tailwind + shadcn/ui | `lumina.ga` |

**Communication** : API REST versionnée (`/v1/`) + JWT + WebSocket (Realtime).

## 1.4. Opportunité de Marché
- E-commerce africain : **+15,2%** (croissance la plus rapide mondiale)
- QR code restauration Afrique : **+66%** year-over-year
- Gabon : accélération digitale (UNCDF, CLIKPAY, guichet numérique)
- Mobile Money (Airtel Money, Moov Money, CLIKPAY) incontournable.

## 1.5. Défis & Mitigations
| Défi | Solution LUMINA |
|------|-----------------|
| Connectivité intermittente | PWA + Cache agressif + Mode offline |
| Méfiance du digital | Vitrine gratuite immédiate, onboarding guidé |
| Paiement | Mobile Money + Carte + Cash à la livraison |
| Alphabétisation numérique | Interface ultra-simple, IA conversationnelle |
| Souveraineté données | Export auto vers Google Drive/Dropbox du client |

---

# 2. ARCHITECTURE PRODUIT (2 REPOS)

## 2.1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS (PWA / Web)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐│
│  │ IndexedDB   │  │ localStorage│  │ Cache API (Service Worker)  ││
│  │ (offline)   │  │ (prefs)     │  │ (assets statiques)          ││
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS/TLS 1.3
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 14)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐│
│  │  Landing    │  │  Dashboard  │  │  Vitrine Publique           ││
│  │  (marketing)│  │  (admin)    │  │  (tenant slug)              ││
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘│
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐│
│  │  Scan QR    │  │  KDS        │  │  PWA (offline)              ││
│  │  (PWA)      │  │  (cuisine)  │  │                             ││
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘│
└──────────────────────┬────────────────────────────────────────────┘
                       │ API REST /v1/ + JWT + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS 10+)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐│
│  │  Auth       │  │  Tenants    │  │  Restaurants                ││
│  │  (JWT/OTP)  │  │  (CRUD)     │  │  (Menu, Orders, KDS)        ││
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘│
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐│
│  │  Events     │  │  Shops      │  │  Payments                   ││
│  │  (Tickets)  │  │  (Products) │  │  (Paystack)                 ││
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘│
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐│
│  │  AI         │  │  Exports    │  │  Analytics                  ││
│  │  (OpenAI)   │  │  (CSV/PDF)  │  │  (KPIs)                     ││
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘│
└──────────────────────┬────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────────┐
│ PostgreSQL  │ │ Redis       │ │ Supabase Storage│
│ (Supabase)  │ │ (Upstash)   │ │ (Images/PDFs)   │
└─────────────┘ └─────────────┘ └─────────────────┘
```

## 2.2. Flux de données typique (Commande Restaurant)

```
1. Client scanne QR → Frontend charge menu (GET /v1/tenants/{slug}/menu)
2. Client ajoute au panier → State local (Zustand)
3. Client checkout → POST /v1/orders (avec idempotency key)
4. Backend valide : stock disponible ? (SELECT FOR UPDATE)
5. Backend crée commande → INSERT Order + OrderItems
6. Backend notifie cuisine : WebSocket / Supabase Realtime
7. Frontend KDS reçoit notification → affiche commande
8. Cuisinier marque "Prêt" → PATCH /v1/orders/{id}/status
9. Client reçoit notification (push/SMS)
10. Paiement : POST /v1/payments/init → Paystack → Webhook → UPDATE Order
```

---

# 3. BRIEF POUR CLAUDE DESIGN — UI/UX

## 3.1. Philosophie Visuelle
**"Afro-Tech Lumineux"** — Modernité africaine chaleureuse.

**Mots-clés :** Clair, Aéré, Chaleureux, Professionnel, Accessible, Confiant.

## 3.2. Palette de Couleurs (Forêt Gabonaise)

| Rôle | Hex | Usage |
|------|-----|-------|
| **Primaire** | `#0A4F3C` | Boutons, header, validation |
| **Secondaire** | `#F4B942` | Badges, accents, CTA secondaires |
| **Tertiaire** | `#2E6BAA` | Liens, informations, focus rings |
| **Fond** | `#F8F7F4` | Background principal |
| **Surface** | `#EAE8E1` | Cartes, sections alternées |
| **Texte** | `#1C1C1E` | Titres |
| **Texte secondaire** | `#6B7280` | Descriptions |
| **Succès** | `#10B981` | Validation |
| **Alerte** | `#EA580C` | Attention |
| **Erreur** | `#DC2626` | Erreur |

## 3.3. Typographie
- **Titres :** Space Grotesk
- **Body :** Inter
- **Chiffres :** JetBrains Mono

## 3.4. Écrans à Concevoir (Priorité)

### A. Landing Page LUMINA
- Hero : "Digitalisez votre activité en 5 minutes"
- 3 cartes secteurs (Restauration, Événementiel, Commerce)
- Comment ça marche (3 étapes)
- Tarification freemium
- Footer

### B. Onboarding (3 étapes)
1. Choix secteur (3 cartes cliquables)
2. Configuration (nom, slug, type, téléphone)
3. Confirmation (animation succès)

### C. Dashboard Restauration
- Sidebar + Header
- KPI cards (Ventes, Commandes, Stock, Clients)
- Graphique 7 jours
- Table dernières commandes
- Vue Menu (grille, CRUD)
- Vue Commandes (tabs, cartes)
- Vue QR Code (générateur, aperçu, téléchargement)

### D. Vitrine Publique
- Header (logo, panier, langue)
- Hero (photo, nom, description)
- Catégories scrollables
- Grille menu
- Panier (bottom sheet)
- Checkout (mode, table, paiement)
- Confirmation

### E. Scan QR (PWA)
- Plein écran caméra
- Overlay cadre QR
- Torch toggle
- Résultat overlay (valide/used/invalide)

### F. Écran Cuisine (KDS)
- Fullscreen
- Grille commandes (couleur selon ancienneté)
- Boutons tactiles "En préparation" / "Prêt"
- Notification sonore

## 3.5. Contraintes Design
- Mobile-first (375px)
- Touch targets 48×48px minimum
- Contraste 4.5:1 minimum
- Animations subtiles (transform/opacity, 200-300ms)
- Empty states avec illustration + CTA
- Loading states skeleton

---

# 4. BRIEF POUR CLAUDE CODE — BACKEND

## 4.1. Stack Backend
| Tech | Usage |
|------|-------|
| **NestJS 10+** | Framework API modulaire |
| **TypeScript** | Typage strict |
| **Prisma** | ORM type-safe |
| **PostgreSQL (Supabase)** | Base de données |
| **Redis (Upstash)** | Cache, sessions, rate limit |
| **Swagger/OpenAPI** | Documentation API |
| **Paystack** | Paiements |
| **OpenAI** | IA |
| **Jest** | Tests |

## 4.2. Architecture Dossiers
```
📁 src/
├── 📁 modules/
│   ├── 📁 auth/ (JWT, OTP, OAuth)
│   ├── 📁 tenants/
│   ├── 📁 users/
│   ├── 📁 restaurants/ (menu, orders, tables, kitchen)
│   ├── 📁 events/ (tickets)
│   ├── 📁 shops/ (products)
│   ├── 📁 payments/ (Paystack, webhooks)
│   ├── 📁 ai/ (OpenAI)
│   ├── 📁 exports/ (CSV/PDF)
│   └── 📁 analytics/
├── 📁 common/ (guards, interceptors, filters, decorators)
├── 📁 prisma/
├── 📁 config/
└── main.ts
```

## 4.3. Règles Backend
- Un module = un domaine métier
- Controller = exposition HTTP (pas de logique métier)
- Service = logique métier pure
- DTO = contrat d'entrée/sortie (class-validator)
- Guard = contrôle d'accès (auth, rôle, tenant)
- API versionnée : `/v1/`
- Swagger auto-généré sur `/api-json`

## 4.4. Auth Backend
- Access token : 15 min, retourné dans body
- Refresh token : 7 jours, httpOnly cookie
- Rotation refresh token
- Redis blacklist JWT révoqués
- Device binding (User-Agent hash)

## 4.5. Commandes d'Init
```bash
npm i -g @nestjs/cli
nest new lumina-backend --strict
npm install @nestjs/swagger @prisma/client class-validator class-transformer ioredis axios @paystack/paystack-sdk openai resend
npx prisma init
```

---

# 5. BRIEF POUR CLAUDE CODE — FRONTEND

## 5.1. Stack Frontend
| Tech | Usage |
|------|-------|
| **Next.js 14+ App Router** | Framework web |
| **TypeScript** | Typage strict |
| **Tailwind CSS** | Style |
| **shadcn/ui** | Composants UI |
| **Axios** | HTTP client |
| **TanStack Query** | Cache serveur |
| **Zustand** | State global |
| **React Hook Form + Zod** | Formulaires |
| **next-pwa** | PWA |
| **react-zxing** | Scan QR |

## 5.2. Architecture Dossiers
```
📁 src/
├── 📁 app/
│   ├── 📁 (landing)/
│   ├── 📁 (dashboard)/admin/[sector]/
│   ├── 📁 (kitchen)/
│   ├── 📁 (scan)/
│   ├── 📁 [tenant]/ (vitrine publique)
│   └── layout.tsx
├── 📁 components/ (ui, dashboard, vitrine, scan, kitchen, shared)
├── 📁 hooks/ (useAuth, useTenant, useApi, useOrders, useMenu, useScan)
├── 📁 lib/ (api.ts, auth.ts, utils.ts, constants.ts)
├── 📁 stores/ (useAuthStore, useCartStore, useUiStore)
└── 📁 types/ (api.ts généré depuis Swagger)
```

## 5.3. Règles Frontend
- Server Components par défaut
- Client Components uniquement pour interactivité
- Access token en mémoire Zustand (PAS localStorage)
- Refresh token géré par navigateur (httpOnly cookie)
- dangerouslySetInnerHTML INTERDIT
- rel="noopener noreferrer" sur liens externes
- Mobile-first (375px)

## 5.4. API Client
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Intercepteur : ajoute access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur : refresh en cas de 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      useAuthStore.getState().setAccessToken(data.accessToken);
      return api(err.config);
    }
    return Promise.reject(err);
  }
);
```

## 5.5. Commandes d'Init
```bash
npx create-next-app@latest lumina-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn-ui@latest init
npm install axios @tanstack/react-query zustand react-hook-form @hookform/resolvers zod react-zxing next-pwa framer-motion lucide-react date-fns
```

---

# 6. PARCOURS UTILISATEURS DÉTAILLÉS

## 6.1. Secteur RESTAURATION (Pilote MVP)

### Rôles
| Rôle | Permissions |
|------|-------------|
| **Propriétaire** | Tout (facturation, config, suppression) |
| **Manager** | Menu, stock, commandes, employés |
| **Cuisinier** | Vue KDS uniquement |
| **Serveur** | Prise commande, tables |
| **Caissier** | Paiements, clôture |
| **Client** | Scan, menu, panier, paiement |

### Parcours Restaurateur (Onboarding)
```
1. Landing LUMINA → "Je suis restaurateur"
2. Création compte (téléphone OTP ou Email)
3. Choix secteur : Restauration
4. Configuration vitrine :
   - Nom : "Le Petit Libreville"
   - Slug : petitlibreville → petitlibreville.lumina.ga
   - Type : Restaurant / Fast-food / Lounge / Bar
5. Arrivée Dashboard
6. Tutoriel interactif (3 étapes)
7. Ajout 1er plat → Publication
8. Génération QR code Table 1 → Test scan
```

### Parcours Client (Sur place)
```
1. S'installe → Scan QR table
2. Menu digital s'ouvre
3. Parcourt catégories, ajoute au panier
4. Choix confirmé : "Manger ici - Table 5"
5. Paiement : Mobile Money / Carte / Payer au comptoir
6. Commande apparaît en cuisine (KDS)
7. Notification "Prêt" → Serveur livre
```

## 6.2. Secteur ÉVÉNEMENTIEL (V1)

### Rôles
| Rôle | Permissions |
|------|-------------|
| **Organisateur** | Création, édition, suppression, finances |
| **Manager** | Réservations, remboursements |
| **Scanner** | Scan QR uniquement |
| **Participant** | Achat, billet, scan entrée |

### Parcours Organisateur
```
1. Inscription → Secteur Événementiel
2. Configuration : nom, slug, type
3. Création événement (titre, description IA, date, lieu, capacité, billets)
4. Publication → Vitrine publique
5. Partage lien réseaux sociaux
6. 1ère vente → notification WhatsApp/SMS
```

## 6.3. Secteur E-COMMERCE (V1)

### Parcours Vendeur
```
1. Inscription → Secteur Boutique
2. Configuration : nom, slug, type
3. Dashboard : Catalogue, Stock, Commandes, Clients, Marketing
4. Import CSV ou création manuelle
5. Configuration livraison
6. Publication boutique
```

---

# 7. CAHIER DES CHARGES FONCTIONNEL

## 7.1. Module Core (Commun)

| Fonction | Priorité | Description |
|----------|----------|-------------|
| Auth multi-tenant | P0 | Email, téléphone OTP, OAuth Google |
| Sous-domaines | P0 | `{slug}.lumina.ga` + custom domain V2 |
| RBAC | P0 | Rôles configurables par secteur |
| Facturation | P0 | Abonnement freemium, relance auto |
| Dashboard widgets | P0 | KPIs configurables |
| Paramètres | P0 | Langue, devise (XAF), fuseau, thème |

## 7.2. Module Restauration (MVP)

| Fonction | Prio | Description |
|----------|------|-------------|
| Menu digital | P0 | Catégories, articles, prix, photos |
| QR par table | P0 | Génération unique, scan → menu |
| Commande table | P0 | Panier, auto-détection table |
| Commande emporter | P0 | Créneau horaire retrait |
| Paiement intégré | P0 | Mobile Money, carte, espèces |
| Écran cuisine KDS | P1 | Fullscreen, temps réel |
| Plan de salle | P1 | Tables libres/occupées |
| Stock basique | P1 | Alertes seuil |

## 7.3. Module Événementiel (V1)

| Fonction | Prio | Description |
|----------|------|-------------|
| Création événement | P0 | Titre, description, visuel, date, lieu |
| Types billets | P0 | Gratuit, payant, VIP |
| Vitrine événement | P0 | Page publique responsive |
| Réservation | P0 | Formulaire, paiement |
| Billets QR | P0 | QR unique, email + WhatsApp |
| Scan entrée | P0 | Validation temps réel |

## 7.4. Module E-commerce (V1)

| Fonction | Prio | Description |
|----------|------|-------------|
| Catalogue | P0 | Variantes, stock, photos |
| Vitrine | P0 | Thèmes, navigation |
| Panier & Checkout | P0 | Process simplifié |
| Paiement multi | P0 | Mobile Money, carte |
| Stock | P0 | Entrées/sorties, alertes |

## 7.5. Module IA (Transverse)

| Fonction | Secteurs | Prio |
|----------|----------|------|
| Génération description | Tous | P1 |
| Génération visuels | Tous | P1 |
| Chatbot support | Tous | P1 |
| Prévision ventes | Tous | P2 |
| Recommandation | Shop/Resto | P2 |

---

# 8. STACK TECHNIQUE FINALE (2 REPOS)

## 8.1. Backend (`lumina-backend`)

| Couche | Tech |
|--------|------|
| Framework | NestJS 10+ |
| Langage | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Cache / Queue | Redis (Upstash) |
| Auth | Supabase Auth + JWT custom |
| API Docs | Swagger/OpenAPI |
| Validation | class-validator + class-transformer |
| Paiement | Paystack |
| IA | OpenAI API + Replicate |
| Email | Resend |
| SMS | Twilio / Africa's Talking |
| PDF | @react-pdf/renderer (via API) |
| Testing | Jest + Supertest |
| Container | Docker + Docker Compose |
| Hébergement | Railway / Render / Hetzner |

## 8.2. Frontend (`lumina-frontend`)

| Couche | Tech |
|--------|------|
| Framework | Next.js 14+ App Router |
| Langage | TypeScript |
| Style | Tailwind CSS |
| Composants | shadcn/ui |
| HTTP Client | Axios |
| Cache Serveur | TanStack Query |
| State Global | Zustand |
| Formulaires | React Hook Form + Zod |
| PWA | next-pwa |
| Scan QR | react-zxing |
| PDF | @react-pdf/renderer |
| Animations | Framer Motion |
| Icons | Lucide React |
| Dates | date-fns |
| Hébergement | Vercel |

## 8.3. Communication Frontend ↔ Backend

| Aspect | Implémentation |
|--------|----------------|
| **Protocole** | HTTPS REST API |
| **Versioning** | `/v1/` dans l'URL |
| **Auth** | JWT Bearer token (access) + httpOnly cookie (refresh) |
| **CORS** | Origins whitelistées, credentials true |
| **Realtime** | WebSocket (Socket.io) ou Supabase Realtime |
| **Types** | Générés auto depuis Swagger (`openapi-typescript`) |

---

# 9. INTÉGRATION IA — GUIDE IMPLÉMENTATION

## 9.1. Principe
L'IA s'appelle comme une API REST. Le frontend ne voit jamais la clé OpenAI.

## 9.2. Flow IA
```
Frontend → POST /v1/ai/generate (prompt, type)
Backend  → Vérification rôle + rate limit (Redis)
Backend  → Cache check (Redis, même prompt = réponse servie)
Backend  → Appel OpenAI API (clé serveur uniquement)
Backend  → Log coût + tokens (AIPromptLog DB)
Backend  → Cache réponse (TTL 24h)
Backend  → Retourne réponse au frontend
```

## 9.3. Exemple
```typescript
// Backend (NestJS)
@Post('generate')
@UseGuards(JwtGuard, TenantGuard)
async generate(@Body() dto: GenerateTextDto, @CurrentTenant() tenant: Tenant) {
  const cacheKey = `ai:${tenant.id}:${hash(dto.prompt)}`;
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const response = await this.openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: dto.prompt }],
  });

  await this.prisma.aIPromptLog.create({
    data: { tenantId: tenant.id, prompt: dto.prompt, response: response.choices[0].message.content, cost: 0.002 }
  });

  await this.redis.setex(cacheKey, 86400, JSON.stringify(response));
  return response;
}
```

## 9.4. Stack IA MVP
| Service | Usage | Coût |
|---------|-------|------|
| OpenAI GPT-4o-mini | Texte | ~$5-15/mois |
| Replicate SDXL | Images | ~$10-30/mois |
| Pinecone (free) | Vector DB | $0 |

---

# 10. MODÈLE ÉCONOMIQUE & FREEMIUM

## 10.1. Plans

| Plan | Prix | Inclus | Limites |
|------|------|--------|---------|
| **Free** | 0 FCFA | Vitrine, 10 produits, 1 événement/mois, QR code | Pas de paiement en ligne, branding LUMINA, 1 user |
| **Starter** | 15 000 FCFA/mois | Tout 1 secteur, paiement intégré, 3 users, IA basique | Pas de multi-secteur |
| **Pro** | 35 000 FCFA/mois | Multi-secteurs, multi-users, IA avancée, domaine perso | — |
| **Enterprise** | Sur devis | Multi-locations, API dédiée, onboarding, SLA | — |

## 10.2. Revenus Complémentaires
- Commission paiement : 1,5% - 2,5%
- SMS pack
- Impressions QR
- Formation

## 10.3. Projections (3 ans)

| Indicateur | Année 1 | Année 2 | Année 3 |
|------------|---------|---------|---------|
| Clients actifs | 200 | 800 | 2 500 |
| Conversion Free→Payant | 8% | 12% | 15% |
| Revenu abonnements | 28M FCFA | 168M FCFA | 630M FCFA |
| Revenu transactions | 5M FCFA | 45M FCFA | 200M FCFA |
| **Revenu total** | **33M FCFA** | **213M FCFA** | **830M FCFA** |

---

# 11. SOUVERAINETÉ DES DONNÉES

## 11.1. Principe
> **"Les données du client lui appartiennent. Il peut les exporter à tout moment."**

## 11.2. Mécanismes

| Type | Fréquence | Format | Destination |
|------|-----------|--------|-------------|
| Export auto | Quotidien | CSV + JSON + PDF | Google Drive / Dropbox client |
| Export manuel | À la demande | ZIP complet | Téléchargement direct |
| API Webhook | Temps réel | JSON | URL configurée par client |
| Backup LUMINA | Hebdomadaire | SQL chiffré | Stockage LUMINA |

## 11.3. Feuille de Route Data Center

| Phase | Timing | Infra |
|-------|--------|-------|
| MVP | Mois 1-6 | Supabase + Vercel |
| Scale | Mois 7-18 | Hetzner (Allemagne) ou AWS Afrique |
| Souveraineté | Mois 18-36 | Data Center Gabon (GSEZ/ARCEP) |

---

# 12. RÔLES & PERMISSIONS

## 12.1. Matrice Globale

| Permission | Owner | Manager | Staff | Kitchen | Cashier | Client |
|------------|:-----:|:-------:|:-----:|:-------:|:-------:|:------:|
| Config tenant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gestion users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Finances | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Catalogue/Stock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Traiter commandes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Voir KDS | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Valider paiements | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Passer commande | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 12.2. Rôles par Secteur

### Restauration
- **Owner** : Tout + facturation
- **Manager** : Menu, stock, employés, rapports
- **Cuisinier** : KDS, validation étapes
- **Serveur** : Prise commande, tables
- **Caissier** : Paiements, clôture

### Événementiel
- **Organisateur** : Création, édition, suppression
- **Manager** : Réservations, remboursements
- **Scanner** : Scan QR uniquement

### E-commerce
- **Vendeur** : Catalogue, finances, stratégie
- **Gestionnaire stock** : Inventaire, fournisseurs
- **Livreur** : Suivi, preuve livraison

---

# 13. ROADMAP MVP → V1

## Phase 1 : FONDATION (Semaines 1-4)
- [ ] Setup repos GitHub (backend + frontend)
- [ ] Backend : NestJS + Prisma + Supabase + Auth
- [ ] Frontend : Next.js + shadcn/ui + Tailwind
- [ ] API : Swagger docs + types partagés
- [ ] Auth cross-domain fonctionnel

## Phase 2 : RESTAURATION PILOTE (Semaines 5-10)
- [ ] Backend : CRUD Menu + Orders + Tables
- [ ] Frontend : Dashboard + Vitrine + QR
- [ ] Paiement Paystack (Mobile Money + Carte)
- [ ] KDS temps réel (WebSocket)
- [ ] Beta avec 5 restaurants

## Phase 3 : ÉVÉNEMENTIEL (Semaines 11-16)
- [ ] Backend : Events + TicketTypes + Tickets
- [ ] Frontend : Vitrine événement + scan billet
- [ ] Génération QR billets + envoi email/WhatsApp
- [ ] Beta avec 3 organisateurs

## Phase 4 : E-COMMERCE (Semaines 17-24)
- [ ] Backend : Catalogue + Checkout + Livraison
- [ ] Frontend : Boutique + Panier + Suivi
- [ ] Beta avec 5 boutiques

## Phase 5 : IA & POLISH (Semaines 25-30)
- [ ] Backend : OpenAI integration + cache
- [ ] Frontend : Chatbot vitrine + génération contenu
- [ ] PWA optimisée (offline)
- [ ] Analytics dashboard

## Phase 6 : LANCEMENT (Semaine 31+)
- [ ] Landing page + onboarding automatisé
- [ ] Support WhatsApp Business
- [ ] Campagne acquisition
- [ ] Collecte feedbacks V2

---

# 14. PLANS GRATUITS — DÉMARRAGE ZERO BUDGET

## 14.1. Stack Gratuite (2 Repos)

| Service | Plan Gratuit | Limite |
|---------|--------------|--------|
| **Vercel** (frontend) | Hobby | 100GB bandwidth |
| **Railway / Render** (backend) | Starter | 500h/mois |
| **Supabase** | Free | 500MB DB, 1GB storage |
| **Upstash Redis** | Free | 10K commands/day |
| **GitHub** | Free | Repos illimités |
| **OpenAI** | Pay-as-you-go | ~$5/mois |
| **Paystack** | Free setup | Commission uniquement |
| **Resend** | Free | 100 emails/jour |
| **Meilisearch** | Free | 1GB |
| **Sentry** | Developer | 5K errors/mois |
| **Cloudflare** | Free | CDN + SSL |

## 14.2. Coût Total Mensuel (MVP)

| Poste | Coût |
|-------|------|
| Hébergement frontend (Vercel) | **0 FCFA** |
| Hébergement backend (Railway/Render) | **0 FCFA** |
| Base de données (Supabase) | **0 FCFA** |
| Auth (Supabase) | **0 FCFA** |
| Cache (Redis) | **0 FCFA** |
| Emails (Resend) | **0 FCFA** |
| IA (OpenAI) | **~3 000 FCFA** |
| **TOTAL** | **~3 000 FCFA / mois** |

---

---

# PARTIE II — ARCHITECTURE DES DONNÉES

---

# 15. ARCHITECTURE DES STOCKAGES

## 15.1. Vue d'ensemble

```
CLIENT (PWA) → FRONTEND (Next.js) → BACKEND API (NestJS) → DATA LAYER
                                                    │
        ┌───────────────────────────────────────────┼───────────┐
        ▼                                           ▼           ▼
   ┌─────────┐                                ┌──────────┐ ┌──────────┐
   │ Redis   │                                │PostgreSQL│ │ Storage  │
   │(Upstash)│                                │(Supabase)│ │(Supabase)│
   └─────────┘                                └──────────┘ └──────────┘
```

## 15.2. Couches de Stockage

| Couche | Tech | Données | Durée |
|--------|------|---------|-------|
| **Base de données** | PostgreSQL (Supabase) | Tenants, users, commandes, produits, tickets | Persistante |
| **Cache / Session** | Redis (Upstash) | Sessions, rate limit, cache API, locks IA | Temporaire |
| **Fichiers** | Supabase Storage | Photos, QR codes, PDFs | Persistante |
| **Export client** | Google Drive / Dropbox | Backup propriétaire client | Persistante |

## 15.3. Schéma DB Clé
- IDs : UUID v4
- Prix : Int (centimes)
- Dates : UTC
- Soft delete : status enum
- RLS : policies sur chaque table
- tenantId obligatoire

---

# 16. COUCHE BASE DE DONNÉES

## 16.1. Tables Principales
- `Tenant` : Cœur multi-tenant
- `User` : Auth + RBAC
- `Product` / `Category` : Catalogue
- `Order` / `OrderItem` : Commandes
- `Table` : Tables restaurant
- `Event` / `TicketType` / `Ticket` : Événementiel
- `Customer` : CRM
- `AuditLog` : Traçabilité
- `AIPromptLog` : Log IA

## 16.2. Taille Estimée
| Tenant Type | Données / an | Fichiers / an |
|-------------|-------------|---------------|
| Restaurant | ~50 MB | ~200 MB |
| Organisateur | ~20 MB | ~500 MB |
| Boutique | ~100 MB | ~2 GB |

---

# 17. COUCHE CACHE & FICHIERS

## 17.1. Redis (Cache)
| Usage | Clé | TTL |
|-------|-----|-----|
| Sessions | `session:{token}` | 7 jours |
| Rate limit | `ratelimit:{ip}:{endpoint}` | 15 min |
| Cache API | `cache:{tenantId}:{query}` | 5 min |
| Locks | `lock:{resource}` | 30 sec |
| IA Cache | `ai:{hash(prompt)}` | 24h |

## 17.2. Supabase Storage (Fichiers)
- `tenant-logos/`
- `product-images/`
- `event-posters/`
- `qr-codes/`
- `tickets/`
- `invoices/`
- `exports/`
- `temp/` (nettoyage auto 24h)

---

# 18. EXPORT CLIENT & PORTABILITÉ

## 18.1. Mécanismes
- Export auto quotidien (CSV + JSON + PDF) → Google Drive
- Export manuel (ZIP) → Téléchargement
- API Webhook (JSON temps réel)

## 18.2. Contenu Export
```
export-{tenantId}-{date}.zip
├── manifest.json
├── data/ (products.csv, orders.csv, customers.csv)
├── documents/ (invoices/, tickets/)
└── media/ (logos/, product-images/)
```

---

# 19. STRATÉGIE DATA CENTER & SOUVERAINETÉ

## 19.1. Feuille de Route

| Phase | Timing | Infra |
|-------|--------|-------|
| MVP | Mois 1-6 | Supabase + Vercel |
| Scale | Mois 7-18 | Hetzner (Allemagne) |
| Souveraineté | Mois 18-36 | Data Center Gabon |

## 19.2. Option Hybride (Phase 3)
- **Primary** : Data Center Gabon (PostgreSQL + Next.js + Redis)
- **Backup** : Hetzner Cloud (réplica PostgreSQL + cold storage)
- Bascule automatique si DC Gabon indisponible

---

# 20. BACKUP & DISASTER RECOVERY

## 20.1. Stratégie 3-2-1
- 3 copies des données
- 2 médias différents
- 1 copie offsite

## 20.2. Plan de Backup

| Type | Fréquence | Rétention |
|------|-----------|-----------|
| Backup auto Supabase | Quotidien | 7 jours |
| Dump SQL manuel | Hebdomadaire | 4 semaines |
| Export client auto | Quotidien | Illimité |
| Backup fichiers | Quotidien | 30 jours |

## 20.3. RTO / RPO

| Scénario | RTO | RPO |
|----------|-----|-----|
| Panne DB | 1 heure | 5 minutes |
| Panne serveur | 30 minutes | 0 |
| Panne régionale | 4 heures | 1 heure |
| Catastrophe totale | 1 jour | 24 heures |

---

---

# PARTIE III — SÉCURITÉ

---

# 21. PLAN DE SÉCURITÉ GLOBAL

## 21.1. Principes
1. Défense en profondeur
2. Moindre privilège
3. Zero Trust
4. Sécurité par défaut
5. Fail securely

## 21.2. Architecture de Confiance
```
Client → HTTPS → Vercel Edge → NestJS API → PostgreSQL/Redis/Storage
              │         │           │
              ▼         ▼           ▼
           Rate      JWT +      RLS +
           Limit     Tenant     Row-Level
                     Guard      Security
```

## 21.3. Classification des Données

| Niveau | Données |
|--------|---------|
| Critique | Paiement, secrets, JWT |
| Sensible | Nom, email, téléphone, adresse |
| Confidentiel | Stock, prix de revient, marges |
| Public | Menu, prix publics, description |

---

# 22. AUTHENTIFICATION & AUTORISATION

## 22.1. Auth
| Méthode | Usage |
|---------|-------|
| OTP Téléphone | Principal en Afrique |
| Email + Password | Alternative |
| OAuth (Google) | Rapide |

## 22.2. JWT
- Access token : 15 min
- Refresh token : 7 jours, rotation, httpOnly cookie
- Redis blacklist pour révocation
- JTI (JWT ID) unique
- Device binding (User-Agent hash)

## 22.3. RBAC
| Rôle | Permissions |
|------|-------------|
| Owner | Tout |
| Manager | Menu, stock, commandes, employés |
| Staff | Traitement commandes |
| Kitchen | KDS uniquement |
| Cashier | Paiements |

---

# 23. SÉCURITÉ MULTI-TENANT

## 23.1. Isolation
- Schéma partagé + Row Level Security (RLS)
- `tenantId` sur chaque table
- Double vérification : RLS (DB) + code (Prisma where)
- Middleware : résolution tenant depuis sous-domaine

## 23.2. Règles
```
✅ RLS sur TOUTES les tables
✅ Chaque requête Prisma filtre par tenantId
✅ Pas de raw SQL sans paramétrisation
✅ Service Role Key jamais exposée côté client
❌ JAMAIS de requête cross-tenant
```

---

# 24. SÉCURITÉ DES PAIEMENTS

## 24.1. Architecture
```
Client → Backend → Paystack API → Client paie → Paystack Webhook → Backend
```

## 24.2. Règles
```
✅ Montant calculé SERVEUR uniquement
✅ Vérification signature webhook (HMAC SHA-512)
✅ Idempotency key sur chaque transaction
✅ Webhook endpoint protégé (signature obligatoire)
✅ Pas de données carte stockées
❌ JAMAIS accepter statut "paid" sans vérifier API Paystack
```

---

# 25. SÉCURITÉ API & FRONTEND

## 25.1. Validation
- Zod sur toutes les entrées (frontend + backend)
- class-validator sur tous les DTOs (backend)
- Longueurs maximales sur les strings
- Types stricts (pas de any)

## 25.2. Rate Limiting
| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| Login / OTP | 5 | 15 min |
| API publique | 100 | 1 min |
| API authentifiée | 200 | 1 min |
| IA | 10 | 1 min |

## 25.3. Headers Sécurité
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 25.4. Frontend
```
✅ dangerouslySetInnerHTML INTERDIT
✅ DOMPurify si contenu riche obligatoire
✅ rel="noopener noreferrer" liens externes
✅ Pas de eval(), new Function()
✅ Types MIME vérifiés sur upload
```

---

# 26. CONFORMITÉ & GOUVERNANCE

## 26.1. Régulations
| Régulation | Application |
|------------|-------------|
| RGPD | Si clients EU |
| Loi Gabon Données Perso | Opérations Gabon |
| PCI-DSS | Paystack gère (LUMINA ne touche pas les cartes) |

## 26.2. Politique de Confidentialité (obligatoire)
- Données collectées
- Finalités
- Base légale
- Destinataires
- Durée de conservation (3 ans)
- Droits (accès, rectification, suppression, portabilité)
- Contact DPO

## 26.3. Consentement
- Checkbox explicite à l'inscription
- Pas de pré-cochage
- Retrait consentement marketing possible
- Log du consentement

---

---

# PARTIE IV — AUDIT DES MENACES (THREAT MATRIX)

---

# 27. INJECTIONS

## 27.1. SQL Injection (SQLi)
**Statut :** 🟢 PROTÉGÉ
- Prisma ORM (requêtes paramétrées)
- Zod validation
- RLS PostgreSQL

## 27.2. Command Injection
**Statut :** 🟡 PARTIELLEMENT
- Pas d'appel système dans le métier
- Renommage UUID des fichiers
- **Action :** Utiliser @react-pdf/renderer (React pur) plutôt que Puppeteer

## 27.3. Template Injection (SSTI)
**Statut :** 🟢 PROTÉGÉ
- Pas de moteur de template traditionnel
- Emails JSX React
- PDF React pur

---

# 28. CROSS-SITE SCRIPTING (XSS)

## 28.1. Stored XSS
**Statut :** 🟡 PARTIELLEMENT
- React échappe le JSX
- **Action :** INTERDIRE dangerouslySetInnerHTML (ESLint rule)
- **Action :** DOMPurify + whitelist strict si contenu riche
- **Action :** Scanner SVG uploadés

## 28.2. Reflected XSS
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Messages d'erreur via React uniquement
- **Action :** Pas de réflexion directe de params URL

## 28.3. DOM-based XSS
**Statut :** 🟢 PROTÉGÉ
- Pas de manipulation DOM manuelle
- Service Worker généré par next-pwa

## 28.4. Blind XSS
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Logs d'audit en texte brut uniquement
- **Action :** Exports CSV sans exécution automatique

---

# 29. AUTHENTIFICATION & SESSIONS

## 29.1. Token Reuse / Replay Attack
**Statut :** 🔴 NON PROTÉGÉ — CRITIQUE
- **Solution :** Redis blacklist + JTI + device binding

## 29.2. JWT "None" Algorithm
**Statut :** 🟢 PROTÉGÉ
- Supabase utilise RS256

## 29.3. JWT Weak Secret
**Statut :** 🟢 PROTÉGÉ
- RS256, clé 256 bits

## 29.4. Session Fixation
**Statut :** 🟢 PROTÉGÉ
- JWT stateless, rotation refresh token

## 29.5. Credential Stuffing / Brute Force
**Statut :** 🟡 PARTIELLEMENT
- Rate limit : 5/15min
- **Action :** hCaptcha + blocage progressif + alerte email

## 29.6. OAuth Attacks
**Statut :** 🟢 PROTÉGÉ
- PKCE flow, state parameter, email vérifié

---

# 30. CONTRÔLE D'ACCÈS

## 30.1. IDOR
**Statut :** 🔴 NON PROTÉGÉ — CRITIQUE
- **Solution :** "Owner Check" systématique sur chaque requête
- **Solution :** Message "Not found" uniforme (pas 403)

## 30.2. Privilege Escalation
**Statut :** 🔴 NON PROTÉGÉ — CRITIQUE
- **Solution :** Rôle en DB uniquement (pas JWT)
- **Solution :** Seul Owner modifie les rôles

## 30.3. Path Traversal
**Statut :** 🟢 PROTÉGÉ
- Supabase Storage, pas de filesystem direct

---

# 31. FICHIERS & UPLOADS

## 31.1. Malicious File Upload
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Vérification binaire (magic bytes)
- **Action :** Sharp ré-encodage systématique
- **Action :** Dimensions max 4000×4000
- **Action :** SVG interdit ou DOMPurify strict

## 31.2. EXIF Data Leakage
**Statut :** 🔴 NON PROTÉGÉ
- **Solution :** Strip EXIF via Sharp à l'upload

---

# 32. CSRF & REDIRECTIONS

## 32.1. CSRF
**Statut :** 🟢 PROTÉGÉ
- SameSite cookies
- Next.js Server Actions protection
- Origin verification

## 32.2. Open Redirect
**Statut :** 🔴 NON PROTÉGÉ
- **Solution :** Whitelist de domaines uniquement

## 32.3. Reverse Tabnabbing
**Statut :** 🔴 NON PROTÉGÉ
- **Solution :** rel="noopener noreferrer" sur tous les liens externes

## 32.4. Clickjacking
**Statut :** 🟢 PROTÉGÉ
- X-Frame-Options: DENY
- CSP frame-ancestors 'none'

---

# 33. API & INFRASTRUCTURE

## 33.1. Mass Assignment
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Champs explicites Prisma (pas de spread)
- **Action :** Zod pick/omit strict

## 33.2. API Abuse / Scraping
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Rate limit strict + pagination max + User-Agent analysis

## 33.3. HTTP Request Smuggling
**Statut :** 🟢 PROTÉGÉ
- Vercel Edge normalisation

## 33.4. Cache Poisoning
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Vérification headers origine

## 33.5. Security Misconfiguration
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Vérifier NODE_ENV=production
- **Action :** Scanner secrets dans les repos

## 33.6. Subdomain Takeover
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Inventaire DNS + monitoring

## 33.7. Supply Chain Attack
**Statut :** 🟡 PARTIELLEMENT
- **Action :** npm audit + Dependabot + Snyk

---

# 34. ATTAQUES MÉTIER

## 34.1. Race Condition (Double Paiement)
**Statut :** 🔴 NON PROTÉGÉ — CRITIQUE
- **Solution :** Idempotency key + distributed lock Redis + transaction atomique

## 34.2. Price Manipulation
**Statut :** 🟢 PROTÉGÉ
- Total recalculé serveur
- Prix snapshot dans OrderItem

## 34.3. Inventory Manipulation
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Transaction atomique (SELECT FOR UPDATE)

## 34.4. Coupon/Promo Abuse
**Statut :** 🔴 NON PROTÉGÉ (pas encore implémenté)
- **Solution :** Usage limit + date validité + calcul serveur

---

# 35. ATTAQUES RÉSEAU & IA

## 35.1. Man-in-the-Middle
**Statut :** 🟢 PROTÉGÉ
- TLS 1.3 + HSTS + certificats valides

## 35.2. DDoS / L7
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Cloudflare Pro si attaques fréquentes

## 35.3. Prompt Injection
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Output filtering + input validation + sandbox

## 35.4. Denial of Wallet
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Budget quotidien + alerte automatique

## 35.5. QR Code Manipulation
**Statut :** 🟡 PARTIELLEMENT
- **Action :** Watermark QR + URL reconnaissable

## 35.6. Footer / Header Injection
**Statut :** 🔴 NON PROTÉGÉ — CRITIQUE
- **Solution :** CSP strict (script-src 'self') + pas de HTML libre + DOMPurify + SameSite cookies

---

# 36. RÉCAPITULATIF & ACTIONS CRITIQUES

## 36.1. Matrice Synthétique

| # | Attaque | Statut | Priorité |
|---|---------|:------:|:--------:|
| 1 | SQL Injection | 🟢 | — |
| 2 | Stored XSS | 🟡 | Haute |
| 3 | Reflected XSS | 🟡 | Haute |
| 4 | **Token Reuse** | 🔴 | **CRITIQUE** |
| 5 | Credential Stuffing | 🟡 | Haute |
| 6 | **IDOR** | 🔴 | **CRITIQUE** |
| 7 | **Privilege Escalation** | 🔴 | **CRITIQUE** |
| 8 | Malicious File Upload | 🟡 | Haute |
| 9 | **EXIF Leakage** | 🔴 | Moyenne |
| 10 | **Open Redirect** | 🔴 | Haute |
| 11 | **Reverse Tabnabbing** | 🔴 | Moyenne |
| 12 | **Race Condition** | 🔴 | **CRITIQUE** |
| 13 | Mass Assignment | 🟡 | Haute |
| 14 | API Abuse | 🟡 | Moyenne |
| 15 | Security Misconfiguration | 🟡 | Haute |
| 16 | Subdomain Takeover | 🟡 | Moyenne |
| 17 | Supply Chain | 🟡 | Haute |
| 18 | Price Manipulation | 🟢 | — |
| 19 | Inventory Manipulation | 🟡 | Haute |
| 20 | DDoS | 🟡 | Moyenne |
| 21 | Prompt Injection | 🟡 | Moyenne |
| 22 | Denial of Wallet | 🟡 | Moyenne |
| 23 | QR Code Manipulation | 🟡 | Basse |
| 24 | **Footer/Header Injection** | 🔴 | **CRITIQUE** |
| 25 | MITM | 🟢 | — |
| 26 | CSRF | 🟢 | — |
| 27 | Clickjacking | 🟢 | — |
| 28 | Path Traversal | 🟢 | — |
| 29 | JWT None | 🟢 | — |
| 30 | Session Fixation | 🟢 | — |

## 36.2. Actions Critiques Avant Lancement

1. **🔴 Token Reuse** : Redis blacklist + JTI + device binding
2. **🔴 IDOR** : "Owner Check" systématique
3. **🔴 Privilege Escalation** : Rôle en DB uniquement
4. **🔴 Race Condition** : Idempotency key + distributed lock
5. **🔴 Footer/Header Injection** : CSP strict + pas de HTML libre
6. **🔴 Open Redirect** : Whitelist domaines
7. **🟡 Stored XSS** : DOMPurify + CSP
8. **🟡 File Upload** : Magic bytes + Sharp + strip EXIF
9. **🟡 Mass Assignment** : Champs explicites
10. **🟡 Credential Stuffing** : CAPTCHA + blocage progressif

---

# ANNEXE FINALE — CHECKLIST GLOBALE PRÉ-LANCEMENT

## A. Backend
- [ ] NestJS + Prisma + Supabase configurés
- [ ] RLS activé sur TOUTES les tables
- [ ] Swagger accessible sur /api-docs
- [ ] Rate limiting activé
- [ ] Webhook Paystack vérifié (HMAC)
- [ ] Idempotency key sur paiements
- [ ] Redis blacklist JWT
- [ ] Audit log sur mutations sensibles
- [ ] Tests > 70% coverage

## B. Frontend
- [ ] Next.js + shadwind/ui configurés
- [ ] PWA installable
- [ ] Auth cross-domain fonctionnel
- [ ] TanStack Query + Zustand configurés
- [ ] dangerouslySetInnerHTML interdit
- [ ] rel="noopener noreferrer" liens externes
- [ ] Pas de secrets dans le bundle
- [ ] Lighthouse > 90

## C. Sécurité (2 Repos)
- [ ] Redis blacklist JWT
- [ ] JTI dans chaque JWT
- [ ] Device binding
- [ ] Access token en mémoire (pas localStorage)
- [ ] "Owner Check" sur chaque requête
- [ ] Rôle en DB uniquement
- [ ] Idempotency key + distributed lock
- [ ] DOMPurify sur contenu riche
- [ ] CSP headers configurés
- [ ] HSTS + X-Frame-Options + DNSSEC
- [ ] npm audit clean
- [ ] Sentry configuré

## D. Design & UX
- [ ] Design System généré
- [ ] Maquettes 6 écrans prioritaires
- [ ] Mobile-first validé

## E. Métier
- [ ] Onboarding 3 étapes testé
- [ ] CRUD Menu fonctionnel
- [ ] QR code par table
- [ ] Vitrine publique responsive
- [ ] Commande temps réel (KDS)
- [ ] Paiement Mobile Money testé
- [ ] 5 restaurants en beta

## F. Conformité
- [ ] Politique de confidentialité publiée
- [ ] CGU publiées
- [ ] Checkbox consentement
- [ ] Mécanisme suppression compte
- [ ] Email DPO fonctionnel

---

**LUMINA. Deux repos. Une vision. Une Afrique digitalisée.**

*Document maître v2.0 — Architecture séparée. Toutes les parties doivent être lues avant toute décision.*
