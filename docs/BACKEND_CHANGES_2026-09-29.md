# Backend — Changements du 2026-09-29 (à répercuter côté frontend)

**Auteur :** Claude Code (Anthropic), à la demande du propriétaire du repo.
**Branches :** `fix/audit-bugs` → `feat/lot-1` → `feat/lot-2` (empilées sur `main`, poussées sur `origin`, PR à ouvrir).
**Détail route par route :** [`API_CONTRACT.md`](API_CONTRACT.md) (source de vérité, mis à jour en même temps que ce document).

Ce document explique **pourquoi** chaque changement a été fait, pas seulement quoi — pour que le frontend (et toute IA qui l'assiste) applique la même logique plutôt que de deviner.

---

## 1. Contexte

Un audit du backend (`giya-backend`) a montré que le MVP restauration tournait, mais avec :
- 7 bugs, dont un qui rendait le rate limiting global à toute la plateforme derrière Render (`trust proxy` manquant) ;
- plusieurs fonctionnalités documentées mais jamais codées : gestion d'équipe, journal d'audit, CRM, billetterie, SMS, e-mails, taxe.

Trois commits/branches ont comblé ces manques. Tout est testé (161 tests unitaires, `npm run arch:check`, lint, build) mais **rien n'a tourné contre une vraie base de données** — à valider en review/CI avant merge.

---

## 2. `fix/audit-bugs` — corrections de bugs

| Bug | Impact frontend |
|---|---|
| `trust proxy` absent | Aucun — corrige un faux positif de rate limit côté serveur uniquement. |
| `categoryId`/`tableId` non vérifiés appartenir au tenant | Aucun changement de contrat, juste un 404 au lieu d'un comportement indéfini si un ID étranger est envoyé. |
| Suppression d'un produit déjà commandé → 500 | `DELETE /admin/products/:id` renvoie maintenant `{}` mais **le produit reste visible** dans `/admin/products` avec `isAvailable: false` au lieu de disparaître. Si l'UI filtrait déjà sur `isAvailable`, rien à faire. |
| Statuts de commande sans règles | `PATCH /admin/orders/:id/status` renvoie **409** si la transition n'est pas autorisée (ex: `DELIVERED → PENDING`). Voir la liste des transitions dans `API_CONTRACT.md` §5. **Le frontend doit gérer ce 409** (message d'erreur, désactiver les boutons de statut non atteignables). |
| Paiement non relançable | `POST /payments/initialize` est maintenant rappelable (nouvelle référence Paystack à chaque tentative). Renvoie **409** si la commande est déjà payée. |
| KPIs visibles par tous les rôles | `GET /admin/analytics/kpis` renvoie **403** pour STAFF/KITCHEN/CASHIER. **Si le dashboard de ces rôles appelle cette route, il faut soit la masquer pour eux, soit gérer le 403.** |
| Webhook Paystack (montant/signature) | Aucun impact frontend, sécurité interne. |

---

## 3. `feat/lot-1` — équipe, audit, CRM, menu complet

### 3.1 Gestion d'équipe (nouveau : `/admin/users`)

**Logique :** un seul OWNER par tenant (créé à l'inscription). L'OWNER crée des comptes MANAGER/STAFF/KITCHEN/CASHIER avec un **mot de passe temporaire** qu'il communique lui-même (pas d'e-mail d'invitation dans ce lot — Resend n'était pas encore branché à ce stade).

**Comportement critique pour le frontend :**
- Un membre créé a `mustChangePassword: true`. **Tant que c'est vrai, TOUTES les routes `/admin/*` et `/ai/*` répondent 403** `"Changement de mot de passe requis avant de continuer."`
- Le frontend doit :
  1. Lire `user.mustChangePassword` après login/`/auth/me`.
  2. Si `true`, rediriger vers un écran dédié qui appelle `POST /auth/change-password { currentPassword, newPassword }`.
  3. Cette route **ferme toutes les sessions** (cookie refresh supprimé côté serveur) → rediriger vers `/login` après succès.
- Désactiver un membre (`PATCH /admin/users/:id { isActive: false }`) ou réinitialiser son mot de passe ferme aussi immédiatement toutes ses sessions.
- Le compte OWNER et son propre compte ne sont pas modifiables via ces routes (403).

### 3.2 Journal d'audit (nouveau : `/admin/audit-logs`, OWNER uniquement)

Lecture seule, pagination standard. Pas d'action requise côté frontend sauf si un écran doit l'afficher (voir §13 API_CONTRACT.md pour la liste des actions journalisées).

### 3.3 CRM (nouveau : `/admin/customers`)

**Logique :** chaque `POST /orders` (et chaque achat de billet) crée ou met à jour automatiquement une fiche `Customer` identifiée par **téléphone + tenant**. Pas d'action requise pour créer des clients — c'est passif. Le frontend peut juste consommer `GET /admin/customers?search=&page=&limit=`.

### 3.4 Menu complet

Nouvelles routes : modification/suppression de catégorie, modification/suppression de table, réception de stock et ajustement d'inventaire (`POST /admin/products/:id/stock`), historique des mouvements. Voir §3-4 de `API_CONTRACT.md`. Aucune route existante cassée.

**Changement de comportement :** `GET /admin/orders` est maintenant **paginé** (`meta: { page, limit, total }`), `limit` par défaut 100. Si le frontend affichait déjà toute la liste sans pagination, ça continue de fonctionner (100 résultats par défaut) mais il faudra ajouter la pagination si le volume dépasse 100 commandes.

---

## 4. `feat/lot-2` — billetterie, SMS, e-mails, taxe

### 4.1 Billetterie (nouveau, gros morceau)

**Modèle mental :** un achat de billets = une `Order` avec `type: "EVENT"` (pas d'`OrderItem`, juste des `Ticket` liés). Même pattern que les commandes restauration : prix recalculé serveur, `X-Idempotency-Key` obligatoire, paiement via `POST /payments/initialize`.

**Flow à implémenter côté frontend :**
1. `GET /tenants/:slug/events` → liste des événements publiés avec `ticketTypes: [{ id, name, price, remaining }]`.
2. `POST /events/:id/tickets` avec header `X-Idempotency-Key` → renvoie une `Order` + `tickets[]`.
   - Si le total est 0 (billets gratuits) : commande déjà `PAID`, billets `VALID`, PDF envoyé par e-mail immédiatement. **Rien d'autre à faire côté frontend.**
   - Si payant : commande `PENDING`, billets `PENDING` (pas encore scannables) → enchaîner sur `POST /payments/initialize { orderId }` comme pour une commande restauration.
3. **Une réservation impayée expire après 30 minutes** (places rendues automatiquement, commande passe `CANCELLED`). Si l'utilisateur traîne sur la page de paiement Paystack au-delà, `POST /payments/initialize` renverra 409. **Le frontend doit gérer ce cas** (message "votre réservation a expiré, recommencez").
4. Le PDF des billets est accessible à `GET /tickets/:qrCode/pdf` — **réponse binaire, pas d'enveloppe JSON**. Utile si le frontend veut proposer un lien "voir mon billet" en plus de l'e-mail.

**Sécurité à connaître (pour ne pas la contourner par erreur) :**
- Rejouer la même `X-Idempotency-Key` ne renvoie la commande que si le **même `customerPhone`** est utilisé — sinon 409. Ne pas générer une nouvelle clé à chaque tentative de paiement sur la même commande, sinon on perd cette protection : garder la même clé tant que c'est le même achat.
- Les e-mails de billets sont plafonnés à 5/heure par adresse destinataire (anti-spam). Si un utilisateur teste avec la même adresse e-mail plus de 5 fois en dev, il ne recevra plus le PDF — c'est un comportement voulu, pas un bug.

**Admin :** CRUD complet events/ticket-types, capacité vérifiée côté serveur (409 si dépassement). Voir §14 `API_CONTRACT.md`.

### 4.2 SMS OTP réel

**Avant :** le code OTP était juste loggé côté serveur, inutilisable en prod.
**Maintenant :** envoi réel via Twilio ou Africa's Talking (configuré côté infra, pas de changement d'API).

**Point d'attention :** pour éviter l'énumération de comptes ET l'abus (SMS pumping), le comportement de `POST /auth/otp/request` est volontairement **identique que le numéro ait un compte ou non** :
- Réponse `{}` dans les deux cas.
- **503** uniquement si aucun fournisseur SMS n'est configuré (jamais en fonction de l'existence du compte).
- Si le SMS échoue à partir (numéro invalide, provider en panne), **aucune erreur n'est renvoyée** — ça révélerait l'existence du compte. Le frontend doit donc **prévoir un bouton "renvoyer le code"** plutôt que de compter sur une erreur explicite pour détecter un échec d'envoi.

### 4.3 E-mails transactionnels (Resend)

Envoyés automatiquement par le backend, aucune route à appeler :
- Reçu de paiement (`orderPaidEmail`) si `customerEmail` est renseigné sur la commande.
- Billets PDF à l'achat/paiement.

Si Resend n'est pas configuré (`RESEND_API_KEY`/`EMAIL_FROM` absents), l'envoi échoue silencieusement côté serveur (log seulement) — **le frontend ne doit pas dépendre de la réception effective d'un e-mail pour son flow** (ne pas bloquer un écran de confirmation en attendant un e-mail).

### 4.4 Taxe par commerce

**Nouveau champ tenant :** `PATCH /admin/tenant { taxRate?, taxIncluded? }`.
- `taxRate` en points de base (`1800` = 18%), 0 par défaut → **aucun changement de comportement tant que ce n'est pas configuré**.
- `taxIncluded` (défaut `true`) = prix affichés TTC (la taxe est extraite du total, qui ne change pas). `false` = prix HT (la taxe s'ajoute).
- Les commandes (`/orders` et achats de billets) répercutent automatiquement cette config dans `subtotal`/`tax`/`total`. **Si le frontend affiche déjà `subtotal`/`tax`/`total` séparément (pas juste `total`), aucun changement de code requis** — les valeurs seront juste correctes une fois la taxe configurée.

### 4.5 `paymentMethod` sur les commandes

`POST /orders` accepte maintenant `paymentMethod?: "CASH" | "PAY_ON_DELIVERY" | "MOBILE_MONEY" | "CARD"`. Optionnel (défaut `CASH`). Pour `MOBILE_MONEY`/`CARD`, le frontend enchaîne comme avant sur `POST /payments/initialize` — le champ est juste informatif jusqu'au paiement, où le webhook Paystack **corrige automatiquement** la valeur avec le moyen réellement utilisé (`channel` renvoyé par Paystack).

---

## 5. Checklist frontend (dans l'ordre de priorité)

1. **Gérer `mustChangePassword`** — sinon les nouveaux membres d'équipe sont bloqués sans explication (403 sur tout `/admin/*`).
2. **Gérer le 409 sur `PATCH /admin/orders/:id/status`** — transitions de statut désormais contraintes.
3. **Gérer le 403 sur `/admin/analytics/kpis`** pour les rôles STAFF/KITCHEN/CASHIER si leur UI y accède.
4. **Implémenter le flow billetterie** si l'écran Événementiel est prévu au planning (voir §4.1).
5. **Prévoir un bouton "renvoyer le code OTP"** plutôt que de réagir à une erreur d'envoi (§4.2).
6. **Ne pas bloquer sur la réception d'un e-mail** — best effort côté serveur.
7. Cosmétique : `GET /admin/orders` paginé, produit supprimé devient `isAvailable: false` au lieu de disparaître.

## 6. Ce qui n'a pas changé

Auth JWT (access/refresh, rotation, blacklist), CORS, format d'enveloppe `{ success, data, meta?, error }`, WebSocket KDS, structure des routes menu/commandes/paiement existantes. Aucune route existante n'a été supprimée ou renommée.
