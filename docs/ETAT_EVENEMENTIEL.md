# Module événementiel — état réel (2026-11-01)

Ce que chaque écran du secteur « événementiel » fait réellement. Remplace la version du
2026-10-05. Vue d'ensemble des deux dépôts : `giyax/ETAT_PROJET.md`. Contrat des routes :
`giyax/docs/API_CONTRACT.md` (la copie de ce dépôt a divergé, voir « Limites »).

Vérifié : `tsc`, lint (0 erreur), `next build`. Aucun test automatisé, rien testé sur appareil réel.

## Back-office

| Écran | Route | Comportement |
|---|---|---|
| Tableau de bord | `/admin/event` | KPI compacts (`StatCard`), graphiques animés : ventes 7 jours (aire), répartition (anneau), top événements ; erreur de chargement avec « Réessayer » |
| Mes événements | `/admin/event/events` | Liste, création, modification |
| Formulaire d'événement | `/admin/event/events/new`, `[id]` | 4 étapes ; « Suivant » ne publie jamais (bouton `key` distinct, Entrée bloquée dans les champs) ; publication seulement à l'étape 4 |
| Brouillon | (même écran) | Enregistré en direct dans le navigateur 500 ms après chaque saisie, clé `giya_event_draft:{tenantId}:{eventId\|new}` ; indicateur « Brouillon enregistré à HH:MM · effacer » ; effacé après publication |
| Affiche | (même écran) | Import depuis l'appareil : ré-encodage WebP/JPEG côté client, EXIF retiré, 1600 px max (`src/lib/image.ts`) ; URL `https://` appliquée au collage ou à Entrée ; erreur si l'image ne charge pas |
| Questionnaire, modèles | (même écran) | Envoyés dans `settings` et relus au rechargement (`src/lib/events.ts`) |
| Éditeur de vitrine | `/admin/event/showcase` | Part de la vitrine en ligne ; **publication automatique 2 s après chaque modification** ; « Publier » force l'envoi ; « Annuler » revient à la dernière version en ligne ; lien vers le vrai site |
| Paramètres | `/admin/event/settings` | « Mon compte », « Abonnement », « Adresse du site » (données réelles) ; logo importé ré-encodé ; thème de couleur stocké dans le navigateur |
| Réservations, participants, scan | `/admin/event/reservations`, `/attendees`, `/scan` | Inchangés : remboursement, export CSV, scan en ligne et hors ligne |

Garde de secteur : un compte d'un autre secteur est redirigé vers son propre back-office
(`components/dashboard/sector-guard.tsx`).

## Site public d'un organisateur

| Page | Route | Comportement |
|---|---|---|
| Accueil (vitrine) | `/{slug}` | Contenu publié depuis l'éditeur + événements réellement en vente. Compte relu sans cache au chargement, puis toutes les 60 s et au retour sur l'onglet ; vitrine réappliquée à chaque nouvelle publication (`hooks/useTenant.tsx`, `components/vitrine/live-showcase.tsx`) |
| Liste | `/{slug}/events` | Événements en vente |
| Détail + achat | `/{slug}/events/[id]` | Affiche, infos, formules, quantité, coordonnées ; gratuit → billets immédiats ; payant → paiement |
| Paiement simulé | `/{slug}/pay/simulate?reference=SIM-…` | Mode test du backend (`PAYMENT_SIMULATION=true`) : montant, choix Airtel/Moov, « Payer » ou « Simuler un échec », puis page de confirmation |
| Confirmation | `/{slug}/events/confirmation?reference=…` | Statut du paiement, billets PDF/QR une fois payés |

**Navigation** : barre fixe en haut de chaque page ci-dessus, sauf l'accueil
(`components/vitrine/public-top-bar.tsx`). Elle contient « ← Retour » vers le niveau précédent et
« Accueil » (avec le logo du compte s'il existe). En bas du détail, un bouton « Retour à
l'accueil ». Mêmes boutons sur mobile et ordinateur.

**Adresse** : `{slug}.{NEXT_PUBLIC_ROOT_DOMAIN}` si l'application tourne sur ce domaine, sinon
`{NEXT_PUBLIC_APP_URL}/{slug}` (`src/lib/tenant-url.ts`). Sur `giyax.vercel.app`, c'est donc
`giyax.vercel.app/{slug}`.

## PWA

- Installable : bannière Android/ordinateur (`beforeinstallprompt`), aide « Partager → Sur l'écran
  d'accueil » sur iOS après 15 s, fermée pour 14 jours (`components/pwa/pwa-manager.tsx`).
- Icônes normales et adaptatives, raccourcis Scanner / Cuisine / Tableau de bord, zones sûres iOS.
- Hors ligne : page `/~offline` ; seule l'API publique en lecture est mise en cache, jamais le
  back-office (`src/app/sw.ts`).
- Les règles de cache par défaut ne s'appliquent qu'au même domaine. Les images d'autres domaines
  (Unsplash, affiches par URL) sont chargées directement par le navigateur : plus d'erreurs CSP
  `connect-src`.

## Parcours de test de bout en bout (mode simulation)

Prérequis : backend avec `PAYMENT_SIMULATION=true`.

1. Back-office : créer un événement avec une formule payante et le publier. Modifier la vitrine,
   attendre « Publié automatiquement ».
2. Ouvrir `/{slug}` : la vitrine modifiée et l'événement apparaissent.
3. « Réserver » → détail → formule, téléphone, e-mail → « Payer et recevoir mes billets ».
4. Page de paiement simulé → « Payer » → confirmation avec les billets.
5. Back-office : la commande apparaît dans Réservations (payée, Mobile Money) et les billets dans
   Participants. Scanner un billet sur `/scan` → valide ; rembourser → nouveau scan « invalide ».

## Limites

- Questionnaire enregistré mais pas encore présenté à l'acheteur ; attestations non générées.
- Images stockées en data URL (pas de stockage objet).
- Routes IA appelées par le formulaire (`/admin/ai/*`) absentes côté backend.
- `docs/API_CONTRACT.md` de ce dépôt diverge de celui du backend : ici, sections scan et IA en
  plus ; vitrine et paiement simulé en moins. La copie du backend fait foi.
- Pas d'envoi WhatsApp/SMS des billets ; pas de push temps réel pour la billetterie (polling).
- Sous-domaines impossibles sur `*.vercel.app` : il faut un domaine propre avec DNS wildcard.
