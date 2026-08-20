# LUMINA Frontend

Ce dépôt est le **frontend** de LUMINA (repo séparé du backend `lumina-backend`). Avant toute
modification, lire `LUMINA_FRONTEND_CONTEXT.md` — c'est la source de vérité de ce dépôt.
`LUMINA_Document_Maitre_v2.md` et `LUMINA_Audit_Menaces_Complet.md` sont fournis en référence
partagée (vision produit + threat matrix) mais ne doivent pas être modifiés depuis ce repo.

Règle d'or : ce frontend ne contient AUCUNE logique métier, secret, ou accès direct à une base
de données. Tout passe par des appels HTTP à `NEXT_PUBLIC_API_URL` (le backend NestJS).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
