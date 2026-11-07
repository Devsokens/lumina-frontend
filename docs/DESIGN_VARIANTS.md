# Variantes de style des sites publics — 10 par secteur

Chaque compte choisit une variante dans son éditeur (« Site & apparence » pour restaurant, boutique et
RBNB ; barre d'édition de la vitrine pour l'événementiel). Une variante combine quatre dimensions :

- **Structure** : type de couverture, ordre des sections.
- **Ergonomie** : présentation des produits / logements / événements, bouton d'action fixe sur mobile.
- **Animations** : aucune, douce ou vive (apparitions au défilement, zoom lent de la couverture, cartes
  qui se soulèvent) ; coupées automatiquement si le visiteur limite les animations.
- **Parcours** : ce vers quoi le premier écran pousse (commander, réserver, acheter un billet, découvrir).

Les variantes réutilisent des sections partagées (pas une page par variante) : le poids de l'application
ne grossit pas avec leur nombre.

## Recherche (2026-11) — ce que font les meilleurs sites

| Secteur | Schémas observés | Sources |
|---|---|---|
| Restaurant | Sobriété haut de gamme qui dit le statut (Eleven Madison Park) ; récit de la maison avant la carte (Dishoom) ; carte lisible et réservation en un geste ; photos d'ambiance | [Krishaweb](https://www.krishaweb.com/blog/best-restaurant-website-design-examples/), [Magier](https://www.magier.com/blog/best-restaurant-website-design-examples), [MenuTiger](https://www.menutiger.com/blog/restaurant-website), [Framer](https://framer.com/blog/restaurant-website-design-examples/) |
| Événementiel | Bouton billet toujours visible (Web Summit) ; nom, dates, ville et un appel à l'action contrasté dès le premier écran ; repérage par couleur et par thème (SXSW) ; vitesse et clarté sur mobile | [Neo](https://www.neo.space/blog/event-website-examples), [Ticket Fairy](https://www.ticketfairy.com/blog/festival-websites-that-convert-design-for-mobile-speed-and-clarity-what-to-watch-how-to-buy-how-to-get-there), [Ticket Tailor](https://www.tickettailor.com/blog/6-examples-of-festival-websites-that-work-brilliantly), [MyCodelessWebsite](https://mycodelesswebsite.com/event-websites/) |
| RBNB | Module de réservation visible en permanence ; pages logement riches ; avantages de la réservation directe ; confiance affichée (Onefinestay) ; personnalité du lieu (boutique-hôtels) | [Krishaweb hôtels](https://www.krishaweb.com/blog/best-hotel-website-designs/), [Mediaboom](https://mediaboom.com/news/hotel-website-design-trends/), [WebFactory](https://www.webfactoryltd.com/top-hotel-website-template-designs-that-increase-direct-bookings/), [Lodgify](https://www.lodgify.com/blog/beautiful-lodgify-vacation-rental-websites/) |

## Restaurant / boutique — `config.site.layout` (`src/components/site/site-home.tsx`)

| Variante | Couverture | Produits | Ordre | Bouton fixe | Pour qui |
|---|---|---|---|---|---|
| Brasserie | Photo plein cadre | Carrousel | vedettes → maison → galerie → infos | — | Classique efficace |
| Gastronomique | Titre centré, photo en arche | Carte en liste | maison → vedettes → galerie → infos | — | Table haut de gamme |
| Maison | Texte / photo en regard | Rangées magazine | maison → vedettes → galerie → infos | — | Restaurant familial, histoire |
| Carte d'abord | Bandeau compact | Carte en liste | vedettes → infos → maison → galerie | Commander | Commande rapide, livraison |
| Street | Titre XXL sur couleur | Mosaïque | vedettes → galerie → maison → infos | Commander | Street-food, Instagram/TikTok |
| Terrasse | Mosaïque de photos | Carrousel | galerie → vedettes → maison → infos | — | Bar-terrasse, maquis |
| Comptoir | Bandeau compact | Grille dense | infos → vedettes → maison → galerie | Commander | Snack, fast-food |
| Lounge | Plein écran centré, zoom lent | Mosaïque | galerie → vedettes → maison → infos | — | Bar de nuit, lounge |
| Marché | Bandeau compact | Grille dense | vedettes → maison → infos → galerie | Commander | Boutique, épicerie |
| Éditorial | Texte / photo en regard | Rangées magazine | vedettes → maison → galerie → infos | — | Concept-store, créateur |

## RBNB — `config.staySite.layout` (`src/components/stays/stays-home.tsx`)

| Variante | Couverture | Logements | Pour qui |
|---|---|---|---|
| Riviera | Plein écran, recherche flottante | Grille | Résidences, villas |
| Atelier | Magazine texte / photo | Rangées alternées | Maison d'hôtes de caractère |
| Horizon | Panoramique | Carrousel de vedettes + grille | Bord de mer, lodges |
| Galerie | Mosaïque de photos | Bento | Beaux intérieurs |
| Boutique | Typographie centrée, arche | Cartes encadrées | Hôtel de charme |
| Nomade | Immersif sombre | Index numéroté | Gestionnaire multi-adresses |
| Lodge | Photo + module de recherche à côté | Grille | Réservation directe rapide |
| Carnet | Récit d'abord | Cartes encadrées | Boutique-hôtel, éco-lodge |
| Comparatif | Bandeau chiffré | Tableau (voyageurs, chambres, prix) | Appart-hôtel, long séjour |
| Panorama | Plein écran, logements en bas | Bento | Destination « coup de cœur » |

## Événementiel — modèles Nuit et Lumière (refonte 2026-11)

Le site public événementiel n'utilise plus les dix variantes ci-dessous : deux modèles conçus avec
Claude Design (`src/components/event-site/nuit.tsx`, `lumiere.tsx`), cinq palettes et quatre
typographies (`src/lib/event-site-theme.ts`), réglés dans l'éditeur `admin/event/showcase`
(`src/components/site-editor`). Correspondance avec les champs enregistrés : voir
`docs/API_CONTRACT.md` §2 (`design`, `visibleSections`). Les modèles utilisent des requêtes de conteneur
(`@container`) : l'aperçu mobile de l'éditeur affiche la vraie version mobile.

## Événementiel (ancien) — `config.showcase.layout` (`src/lib/showcase-layouts.ts`)

| Variante | Couverture | Événements | Ordre (après événements) | Bouton billets fixe |
|---|---|---|---|---|
| Scène | Centrée + chiffres | Cartes | à propos, galerie, avis, FAQ | — |
| Affiche | Affiche du prochain événement | Mur d'affiches | galerie, à propos, avis, FAQ | oui |
| Agenda | Bandeau compact | Agenda daté | FAQ, à propos, avis, galerie | oui |
| Festival | Photo plein écran + chiffres | Carrousel | galerie, avis, à propos, FAQ | oui |
| Conférence | Texte à gauche + chiffres | Agenda daté | à propos, FAQ, avis, galerie | — |
| Gala | Centrée sans chiffres | Une vedette + deux | avis, galerie, à propos, FAQ | — |
| Club | Plein écran | Mur d'affiches | galerie, avis, FAQ, à propos | oui |
| Communauté | Centrée + chiffres | Cartes | avis, galerie, à propos, FAQ | — |
| Masterclass | Texte à gauche | Une vedette + deux | FAQ, à propos, avis, galerie | oui |
| Minimal | Bandeau compact | Agenda daté | à propos, FAQ, avis, galerie | — |

## Ajouter une variante

1. Ajouter l'identifiant à la liste du frontend (`lib/site.ts`, `lib/stay-site.ts` ou
   `lib/showcase-layouts.ts`) **et** au DTO backend correspondant (`update-site.dto.ts`,
   `update-stay-site.dto.ts`, `update-showcase.dto.ts`) : sinon l'enregistrement est refusé (400).
2. Décrire son preset (couverture, présentation, ordre, bouton fixe) ; réutiliser les sections.
3. Pour RBNB, ajouter le croquis dans `LayoutThumb` (`stay-site-editor.tsx`).
