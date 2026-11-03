# GiyaX — frontend

Application Next.js de la plateforme GiyaX : back-office des comptes (restauration, boutique,
événementiel, RBNB), sites publics des comptes, paiement Mobile Money, console plateforme `/vision`.
L'API est dans le dépôt `giyax` ; **aucune logique métier ici**, le contrat
[`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) est une copie de celui du backend (qui fait foi).

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # next build --webpack (vérifie aussi les types)
npm run lint
```

Variables : `NEXT_PUBLIC_API_URL` (ex. `https://giya-backend-gpy4.onrender.com/v1`),
`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ROOT_DOMAIN`.

## Ce que fait l'application

| Zone | Routes | Notes |
|---|---|---|
| Inscription / connexion | `/signup`, `/login`, `/auth/*` | Mot de passe, code SMS, Google (profil Google repris, infos manquantes demandées après), un compte par secteur |
| Back-office | `/admin/[sector]/*`, `/admin/event/*` | Tableaux de bord 7/30/90 j, commandes, menu, logements, réservations, **Factures**, site & apparence, équipe |
| Sites publics | `/[tenant]/*` | 10 variantes de style par secteur — [`docs/DESIGN_VARIANTS.md`](docs/DESIGN_VARIANTS.md) |
| Documents | `/verify/[code]` | Vérification d'authenticité des factures, additions et billets signés |
| Console plateforme | `/vision/*` | Administrateurs du SaaS uniquement (mot de passe + code d'authentification) |
| Cuisine / scan | `/kitchen`, `/scan` | KDS temps réel, contrôle d'accès billets (hors ligne possible) |

## Documents

- [`docs/DESIGN_VARIANTS.md`](docs/DESIGN_VARIANTS.md) — variantes de style et sources de recherche.
- [`docs/ETAT_EVENEMENTIEL.md`](docs/ETAT_EVENEMENTIEL.md) — état du secteur événementiel.
- [`docs/AUDIT_FRONTEND.md`](docs/AUDIT_FRONTEND.md) — audit.
- Vue d'ensemble et changements : `giyax/ETAT_PROJET.md`, `giyax/docs/CHANGELOG_2026-11.md`.
- Briefs motion design : `giyax/doc_descrip/`.

Déploiement : Vercel (`main`).
