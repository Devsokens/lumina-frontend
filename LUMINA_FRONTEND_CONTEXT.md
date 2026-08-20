# LUMINA FRONTEND — Contexte Projet
## Fichier de référence pour Claude Code (Repo : lumina-frontend)
**Version :** 1.0 — Architecture Séparée  
**Date :** 19 Août 2026  
**Framework :** Next.js 14+ App Router + Tailwind + shadcn/ui  
**Règle d'or :** Le frontend ne fait que de la présentation et de l'interactivité. Toute logique métier, auth, paiement, stock = backend.

---

## 1. VISION EN UNE PHRASE
> Interface web de LUMINA : PWA mobile-first, dashboard intuitif, vitrine publique élégante, scan QR natif. Zéro logique métier côté client.

---

## 2. STACK TECHNIQUE (NE PAS CHANGER SANS DISCUSSION)

| Couche | Tech | Justification |
|--------|------|---------------|
| **Framework** | **Next.js 14+ App Router** | SSR/SSG, PWA, un seul projet pour tout |
| **Langage** | **TypeScript** | Typage strict |
| **Style** | **Tailwind CSS** | Mobile-first, rapidité |
| **Composants** | **shadcn/ui** | Accessible, customizable, pas de lock-in |
| **HTTP Client** | **Axios** | Intercepteurs, retry, cancel tokens |
| **Cache Serveur** | **TanStack Query (React Query)** | Cache, invalidation, background refetch |
| **State Global** | **Zustand** | Léger, pas de boilerplate Redux |
| **Formulaires** | **React Hook Form + Zod** | Validation performante, typesafe |
| **PWA** | **next-pwa** | Manifest, service worker, offline |
| **Scan QR** | **react-zxing** | Webcam scan, Android-first |
| **PDF** | **@react-pdf/renderer** | Billets, factures côté client |
| **Animations** | **Framer Motion** | Subtiles uniquement |
| **Icons** | **Lucide React** | Consistance |
| **Dates** | **date-fns** | Léger, tree-shakeable |
| **Hébergement** | **Vercel** | Déploiement optimal Next.js |

**INTERDIT :** NestJS côté frontend, Firebase, Material UI, Lodash entier, Moment.js.

---

## 3. ARCHITECTURE DES DOSSIERS

```
📁 lumina-frontend/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (landing)/              ← Routes publiques marketing
│   │   │   ├── page.tsx               ← Landing LUMINA
│   │   │   ├── pricing.tsx
│   │   │   └── layout.tsx
│   │   ├── 📁 (dashboard)/            ← Routes admin protégées
│   │   │   ├── 📁 admin/
│   │   │   │   ├── 📁 [sector]/       ← restaurant | event | shop
│   │   │   │   │   ├── page.tsx       ← Dashboard home
│   │   │   │   │   ├── 📁 menu/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── 📁 [id]/
│   │   │   │   │   ├── 📁 orders/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── 📁 stock/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── 📁 settings/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── 📁 qr/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── layout.tsx         ← Sidebar + Header dashboard
│   │   │   └── layout.tsx             ← Auth guard (redirect si pas auth)
│   │   ├── 📁 (kitchen)/              ← KDS fullscreen
│   │   │   └── 📁 kitchen/
│   │   │       └── page.tsx
│   │   ├── 📁 (scan)/                 ← Scan QR PWA
│   │   │   └── 📁 scan/
│   │   │       └── page.tsx
│   │   ├── 📁 [tenant]/               ← VITRINE PUBLIQUE DYNAMIQUE
│   │   │   ├── page.tsx               ← Homepage vitrine
│   │   │   ├── 📁 menu/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 cart/
│   │   │   │   └── page.tsx
│   │   │   └── 📁 checkout/
│   │   │       └── page.tsx
│   │   ├── 📁 api/                    ← API Routes Next.js (rares)
│   │   │   └── 📁 auth/
│   │   │       └── callback/
│   │   │           └── route.ts       ← OAuth callback
│   │   ├── layout.tsx                 ← Root layout (providers)
│   │   └── globals.css
│   ├── 📁 components/
│   │   ├── 📁 ui/                     ← shadcn/ui (NE PAS MODIFIER)
│   │   ├── 📁 dashboard/              ← Widgets métier
│   │   │   ├── kpi-card.tsx
│   │   │   ├── orders-table.tsx
│   │   │   ├── sales-chart.tsx
│   │   │   └── sidebar.tsx
│   │   ├── 📁 vitrine/                ← Composants vitrine publique
│   │   │   ├── header.tsx
│   │   │   ├── menu-grid.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── cart-sheet.tsx
│   │   │   └── checkout-form.tsx
│   │   ├── 📁 scan/                   ← Scanner QR
│   │   │   ├── qr-scanner.tsx
│   │   │   └── scan-result.tsx
│   │   ├── 📁 kitchen/                ← KDS components
│   │   │   ├── order-card.tsx
│   │   │   └── orders-grid.tsx
│   │   └── 📁 shared/                 ← Header, Footer, Logo
│   │       ├── logo.tsx
│   │       ├── mobile-nav.tsx
│   │       └── footer.tsx
│   ├── 📁 hooks/
│   │   ├── useAuth.ts                 ← Auth state + login/logout/refresh
│   │   ├── useTenant.ts               ← Résolution tenant par sous-domaine
│   │   ├── useApi.ts                  ← Wrapper TanStack Query
│   │   ├── useOrders.ts               ← Queries/mutations orders
│   │   ├── useMenu.ts                 ← Queries/mutations menu
│   │   └── useScan.ts                 ← Scan QR logic
│   ├── 📁 lib/
│   │   ├── api.ts                     ← Axios instance configuré
│   │   ├── auth.ts                    ─ Gestion JWT côté client
│   │   ├── utils.ts                   ← cn(), formatters
│   │   └── constants.ts               ← API_URL, etc.
│   ├── 📁 stores/
│   │   ├── useAuthStore.ts            ← Zustand auth (access token en mémoire)
│   │   ├── useCartStore.ts            ← Zustand panier
│   │   └── useUiStore.ts              ← Zustand UI state (sidebar, modals)
│   ├── 📁 types/
│   │   └── api.ts                     ← Types générés depuis Swagger backend
│   └── middleware.ts                  ← Routing tenant + auth checks
├── 📁 public/
│   ├── icons/                         ← PWA icons (192x192, 512x512)
│   ├── images/
│   └── manifest.json
├── next.config.js                     ← PWA config + rewrites
└── package.json
```

---

## 4. RÈGLES DE CODE (NON NÉGOCIABLES)

### 4.1. Server vs Client Components
```
✅ Server Components (default) : Pages, layouts, data fetching initial
✅ Client Components ('use client') : Interactivité, hooks, browser APIs
✅ Pas de 'use client' sur une page entière sauf justification
✅ Extraire les parties interactives en petits composants client
```

### 4.2. Communication avec le Backend
```typescript
// lib/api.ts — Axios instance centralisée
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // https://api.lumina.ga/v1
  withCredentials: true, // envoie les cookies (refresh token httpOnly)
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : ajoute access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken; // en mémoire Zustand
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur : refresh token en cas de 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true } // cookie httpOnly envoyé
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        return api(original); // retry avec nouveau token
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
```

### 4.3. TanStack Query (React Query)
```typescript
// hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useOrders(tenantId: string) {
  return useQuery({
    queryKey: ['orders', tenantId],
    queryFn: () => api.get(`/tenants/${tenantId}/orders`).then(r => r.data),
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

### 4.4. Formulaires (React Hook Form + Zod)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().min(0),
  categoryId: z.string().uuid(),
});

type FormData = z.infer<typeof schema>;

function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createProduct = useCreateProduct();

  return (
    <form onSubmit={handleSubmit((data) => createProduct.mutate(data))}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Créer</button>
    </form>
  );
}
```

### 4.5. Auth Côté Client
```
✅ Access token en mémoire Zustand (pas localStorage, pas cookie)
✅ Refresh token géré par le navigateur (httpOnly cookie sur api.lumina.ga)
✅ Sur refresh page : appel /auth/refresh pour récupérer nouvel access token
✅ Sur 401 irrécupérable : redirect login
❌ JAMAIS stocker access token dans localStorage
❌ JAMAIS envoyer refresh token manuellement
```

### 4.6. PWA
```
✅ next-pwa génère le service worker
✅ Manifest.json configuré (icons, theme, display standalone)
✅ Cache stratégie : Network First pour API, Cache First pour assets
✅ Pas de données sensibles en cache local (pas de token, pas de données carte)
✅ IndexedDB : uniquement cache menu/catalogue public (données non sensibles)
```

### 4.7. Sécurité Frontend
```
✅ dangerouslySetInnerHTML INTERDIT (ESLint rule)
✅ Si contenu riche obligatoire : DOMPurify + whitelist strict
✅ rel="noopener noreferrer" sur tous les liens externes
✅ Pas de eval(), new Function(), innerHTML
✅ CSP respectée (pas de script inline)
✅ Types MIME vérifiés avant upload (côté client + serveur)
```

---

## 5. GESTION DU TENANT (Sous-domaine)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isMainDomain = host === 'lumina.ga' || host === 'www.lumina.ga';

  if (!isMainDomain) {
    const slug = host.split('.')[0]; // slug.lumina.ga
    // Vérifier que le tenant existe via API ou cache
    request.headers.set('x-tenant-slug', slug);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 6. ENVIRONNEMENT (.env.local)

```env
# Frontend
NEXT_PUBLIC_APP_URL=https://lumina.ga
NEXT_PUBLIC_API_URL=https://api.lumina.ga/v1

# Pas de secrets ici (tout est public côté client)
# Les secrets sont côté backend uniquement
```

> **RÈGLE :** Toute variable avec `NEXT_PUBLIC_` est visible dans le bundle client. Ne jamais y mettre de clé API, token, ou secret.

---

## 7. COMMANDES D'INITIALISATION

```bash
# 1. Créer le projet
npx create-next-app@latest lumina-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd lumina-frontend

# 2. shadcn/ui
npx shadcn-ui@latest init --yes --template next --base-color stone
npx shadcn-ui@latest add button card input badge tabs dialog dropdown-menu table avatar separator sheet scroll-area sonner

# 3. Dépendances
npm install axios @tanstack/react-query zustand react-hook-form @hookform/resolvers zod
npm install react-zxing html5-qrcode
npm install @react-pdf/renderer
npm install next-pwa
npm install framer-motion lucide-react date-fns
npm install -D @types/node @types/react @types/react-dom

# 4. Générer types depuis le backend
npx openapi-typescript https://api.lumina.ga/api-json -o src/types/api.ts

# 5. Dev
npm run dev
```

---

## 8. CHECKLIST PRÉ-LANCEMENT FRONTEND

- [ ] PWA installable (manifest + service worker)
- [ ] Mobile-first validé sur 375px
- [ ] Auth fonctionnel (login, refresh, logout)
- [ ] TanStack Query configuré avec invalidation
- [ ] Zod sur tous les formulaires
- [ ] dangerouslySetInnerHTML interdit (ESLint)
- [ ] rel="noopener noreferrer" sur liens externes
- [ ] Pas de secrets dans le bundle (vérifier avec source map analyzer)
- [ ] Offline mode fonctionnel (cache menu/catalogue)
- [ ] Scan QR testé sur Android
- [ ] KDS fullscreen testé
- [ ] Lighthouse score > 90 (performance, accessibilité, SEO, PWA)

---

**Ce document est la source de vérité du frontend. En cas de doute, revenir ici.**
