# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # next dev --webpack (webpack forced, not Turbopack)
npm run build   # next build --webpack
npm start
npm run lint    # eslint (flat config, eslint-config-next)
```

No test runner is configured. Env: `NEXT_PUBLIC_API_URL` (backend, default `http://localhost:3001`), `NEXT_PUBLIC_ROOT_DOMAIN` (default `lumina.ga`). Only `NEXT_PUBLIC_*` vars, no secrets.

## Architecture

Next.js 16 App Router + React 19 + Tailwind 4 + shadcn (`src/components/ui`, don't hand-edit). Pure presentation layer; all logic lives in the separate NestJS backend reached via Axios.

- **Route groups** (`src/app`): `(landing)` marketing, `(auth)` login/signup, `(dashboard)/admin/...` back-office, `(kitchen)` KDS, `(scan)` QR scanner, `[tenant]/...` public storefront (menu, cart, checkout, event), `showcase`. Dashboard has a static `admin/event/*` tree alongside dynamic `admin/[sector]/*`; static wins, so event-sector pages are separate from restaurant/shop pages.
- **Multi-tenancy via subdomain**: `src/middleware.ts` rewrites `slug.<ROOT_DOMAIN>/x` → `/[slug]/x` and sets `x-tenant-slug`. `www/app/admin/api` are reserved; `localhost` and root domain pass through untouched.
- **Auth is client-only**: access token lives in Zustand memory (`stores/useAuthStore`), never localStorage. Refresh token is an httpOnly cookie. Middleware can't see the token, so guards are client-side via `useAuth()` in `(dashboard)/layout.tsx` and `(kitchen)/layout.tsx`.
- **HTTP**: `lib/api.ts` is the single Axios instance. Request interceptor adds Bearer token; a 401 triggers one `/auth/refresh` retry (`_retry` flag), else logout + redirect `/login`. Responses are `{ success, data, error, meta }`; prices are integer centimes.
- **Data layer**: TanStack Query hooks in `src/hooks/*` (`useOrders`, `useMenu`, ...) wrap `api`; Zustand stores in `src/stores` (auth, cart, ui, showcase); forms use react-hook-form + Zod (`lib/validations.ts`).
- **PWA**: Serwist (not next-pwa), service worker source `src/app/sw.ts` → `public/sw.js`, disabled in dev. `public/sw.js` and `manifest.json` are gitignored/generated.
- **Security headers/CSP** are set in `next.config.ts` (CSP allows only self + API origin; `unsafe-eval` dev only). New external origins (images, fonts, APIs) need CSP updates. `dangerouslySetInnerHTML`, `eval` forbidden.

## Docs

- `LUMINA_FRONTEND_CONTEXT.md` — project rules (French), source of truth. Its stack table is partly stale: says Next 14 / next-pwa / `middleware.ts` tree; reality is Next 16 / Serwist. Trust `package.json` and code.
- `docs/API_CONTRACT.md` — every backend route the frontend calls; update it when adding a call to a not-yet-implemented route. `docs/BACKEND_CHANGES_2026-09-29.md` — backend changes to mirror in the frontend. Both still say "GIYA" (former project name).
- `LUMINA_Document_Maitre_v2.md`, `LUMINA_Audit_Menaces_Complet.md`, `LUMINA_Secteur_Hebergement_v3.md` — shared reference copies from the backend repo; do not edit here.
