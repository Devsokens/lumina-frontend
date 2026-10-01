TYPE = FRONTEND

# CARTOGRAPHIE — lumina-frontend (2026-09-30)

## 1. Stack réelle (source : package.json, next.config.ts, components.json)

| Domaine | Élément | Version |
|---|---|---|
| Framework | next | 16.3.1 (build/dev forcés `--webpack`) |
| UI runtime | react / react-dom | 19.2.8 |
| Langage | typescript | ^5 |
| Style | tailwindcss + @tailwindcss/postcss | ^4 |
| Composants | shadcn (CLI) + radix-ui | ^4.18 / ^1.6 |
| HTTP | axios | ^1.19 |
| Cache serveur | @tanstack/react-query | ^5 |
| State | zustand | ^5 |
| Formulaires | react-hook-form + zod + @hookform/resolvers | ^7 / ^3 / ^5 |
| PWA | serwist + @serwist/next | ^9.5 |
| Scan QR | react-zxing / qrcode.react | ^3 / ^4 |
| PDF | @react-pdf/renderer | ^4.6 |
| Animations | framer-motion | ^13 |
| Thème | next-themes | ^0.4 |
| Divers | lucide-react, date-fns ^4, sonner ^2, slugify, clsx, tailwind-merge, cva | — |
| Lint | eslint ^9 + eslint-config-next 16.3.1 | — |
| ORM / BDD | absent (frontend) | — |
| Auth | aucune lib ; JWT backend (access en mémoire Zustand, refresh cookie httpOnly) | — |
| Paiement | aucune lib ; redirection vers `authorizationUrl` Paystack fournie par le backend | — |
| Stockage fichiers | aucune lib | — |
| Temps réel | WebSocket natif navigateur (pas de lib) | — |
| Tests | aucun runner déclaré | — |

## 2. Arborescence (2 niveaux)

```
.                    Racine : config Next/TS/ESLint/PostCSS, docs projet LUMINA_*.md
├── docs/            Contrat API frontend→backend et journal des changements backend
├── public/          Assets statiques (SVG) et manifest.json PWA
└── src/             Code applicatif
    ├── app/         Routes App Router (groupes (auth), (dashboard), (kitchen), (landing), (scan), [tenant], showcase) + sw.ts
    ├── components/  Composants par domaine : ui (shadcn), dashboard, events, kitchen, landing, scan, shared, showcase, vitrine
    ├── hooks/       Hooks TanStack Query / auth / scan / tenant
    ├── lib/         Instance axios, constantes, formatage, fetch tenant, validations Zod
    ├── stores/      Stores Zustand (auth, cart, showcase, ui)
    ├── types/       Types TS des objets API
    └── middleware.ts Réécriture sous-domaine → /[tenant]
```

## 3. Points d'entrée

- Routeur : **App Router** (`src/app`). Racine : `src/app/layout.tsx`. Middleware : `src/middleware.ts`.
- Aucune route API Next (`route.ts`) présente.

Pages (`page.tsx`) :

| Groupe | Routes |
|---|---|
| (landing) | `/`, `/pricing` |
| (auth) | `/login`, `/signup` |
| (dashboard) | `/admin/[sector]`, `/admin/[sector]/{menu,orders,qr,settings,stock}` |
| (dashboard) | `/admin/event`, `/admin/event/{attendees,events,events/[id],reservations,scanner,settings,showcase,tickets,users}` |
| (kitchen) | `/kitchen` |
| (scan) | `/scan` |
| [tenant] | `/[tenant]`, `/[tenant]/{cart,checkout,event,menu}` |
| — | `/showcase` |

Layouts : racine, (auth), (dashboard), admin/[sector], admin/event, (kitchen), (landing), (scan), [tenant].

PWA :
- Manifest : `public/manifest.json`
- Service worker source : `src/app/sw.ts` → généré `public/sw.js` (Serwist, désactivé en dev, via `next.config.ts`)

## 4. Configuration

Fichiers présents : `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`.

Absents : `.env.example` / `.env*`, `Dockerfile`, `docker-compose.yml`, `.github/` (aucun CI/CD), `vercel.json` / `vercel.ts`.

Secrets en clair : aucun trouvé (grep clés/secret/password dans `src` et configs racine).

Variables d'environnement :

| Variable | Défaut dans le code | Usage |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/v1` | base axios, CSP, login/signup |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `lib/constants.ts` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `lumina.ga` | middleware multi-tenant |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3001` | WebSocket KDS (`hooks/useOrders.ts`) |

URLs appelées / référencées dans `src` (hors commentaires) :
- API backend : `http://localhost:3001/v1` (fallback) — `lib/constants.ts`, `(auth)/login`, `(auth)/signup`
- WebSocket : `ws://localhost:3001/orders` (fallback) — `hooks/useOrders.ts`
- `https://images.unsplash.com/...` — données de démo : `admin/event/events`, `events/[id]`, `components/events/event-form.tsx`, `stores/useShowcaseStore.ts` (non autorisé par `img-src` de la CSP)
- `https://wa.me/...` — `components/showcase/showcase-canvas.tsx`
- `https://maps.google.com`, `https://facebook.com` — valeurs par défaut `useShowcaseStore.ts`
- `https://festival-urban.giya.ga` — texte affiché `components/landing/hero-section.tsx`

## 5. Écarts vs stack cible (Next.js 14 PWA mobile-first + Tailwind)

| Point | Statut |
|---|---|
| Next.js 14 | différent : Next.js 16.3.1 (webpack forcé) |
| App Router | conforme |
| TypeScript | conforme |
| Tailwind | différent : Tailwind v4 (config CSS, pas de `tailwind.config`) |
| PWA manifest | conforme (`public/manifest.json`) |
| PWA service worker | différent : Serwist au lieu de next-pwa |
| Icônes PWA `public/icons/` | absent |
| Mobile-first | non vérifiable sans lecture du code (hors périmètre) |
| shadcn/ui, axios, TanStack Query, Zustand, RHF+Zod, react-zxing, @react-pdf, framer-motion, lucide, date-fns | conforme |
| `.env.example` | absent |
| CI/CD | absent |
| Tests | absent |
