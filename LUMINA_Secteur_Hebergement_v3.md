# 🏨 LUMINA — SECTEUR HÉBERGEMENT (RBNB)
## Intégration du 4ème secteur : Appartements meublés, Motels, Chambres d'hôtes
### Document d'ajustement de vision v3.0

---

## TABLE DES MATIÈRES

1. [Pourquoi l'hébergement ?](#1-pourquoi-lhébergement-)
2. [Point de rupture — Le problème exact](#2-point-de-rupture--le-problème-exact)
3. [Parcours utilisateurs détaillés](#3-parcours-utilisateurs-détaillés)
4. [Cahier des charges fonctionnel](#4-cahier-des-charges-fonctionnel)
5. [Intégration technique dans l'architecture existante](#5-intégration-technique-dans-larchitecture-existante)
6. [Innovations IA — Hébergement](#6-innovations-ia--hébergement)
7. [Stack technique ajustée (4 secteurs)](#7-stack-technique-ajustée-4-secteurs)
8. [Coût infrastructure exact — 200 à 500 clients simultanés](#8-coût-infrastructure-exact--200-à-500-clients-simultanés)
9. [Business model ajusté](#9-business-model-ajusté)
10. [Roadmap mise à jour](#10-roadmap-mise-à-jour)

---

## 1. POURQUOI L'HÉBERGEMENT ?

### Le marché africain de l'hébergement

| Indicateur | Chiffre | Source |
|------------|---------|--------|
| Dépenses hébergement Afrique | +18% CAGR 2024-2028 | McKinsey Africa |
| Touristes intra-africains | 45M/an | AfDB |
| Appartements meublés non digitalisés | 85% | Estimation terrain Gabon |
| Réservations faites par WhatsApp | 70% | Secteur informel |
| Paiement en cash à l'arrivée | 80% | Secteur informel |

### Le problème en Afrique centrale

**Pour le propriétaire (vendeur) :**
- Un appartement meublé à Libreville reçoit 80% de ses réservations par WhatsApp ou appel téléphonique
- Le propriétaire doit répondre à 15-20 messages/jour : *"C'est disponible quand ?"* — *"C'est combien ?"* — *"Il y a le wifi ?"*
- Les no-shows (réservations sans garantie) représentent 30-40% des réservations
- Aucune traçabilité fiscale, aucun reçu officiel
- Impossible de gérer plusieurs propriétés sans s'y perdre
- Le ménage, la maintenance, le linge — tout est géré à la volée

**Pour le client (voyageur) :**
- Trouver un hébergement fiable = parcours du combattant (Facebook, WhatsApp, bouche-à-oreille)
- Aucune garantie de réservation (pas de confirmation écrite, pas de reçu)
- Arrivée sur place : l'appartement n'est pas prêt, le prix a changé, le wifi ne marche pas
- Pas de paiement en ligne sécurisé (obligation de payer cash à l'arrivée)
- Aucun processus de check-in/check-out structuré
- Aucun moyen de signaler un problème post-séjour

### La concurrence actuelle

| Acteur | Force | Faiblesse |
|--------|-------|-----------|
| **Airbnb** | Mondial, connu | Pas de Mobile Money, pas adapté au marché local, commission 15-20% |
| **Booking.com** | Référence hôtelière | Complexe pour petits propriétaires, pas de gestion multi-propriétés simple |
| **Facebook / WhatsApp** | Gratuit, connu | Pas de réservation structurée, pas de paiement, pas de reçu, pas de calendrier |
| **LUMINA Hébergement** | **Mobile Money, calendrier intelligent, reçu fiscal, gestion multi-propriétés, IA** | **Doit prouver sa fiabilité** |

---

## 2. POINT DE RUPTURE — LE PROBLÈME EXACT

### Le scénario de rupture (Propriétaire)

> **Samedi 14h. Mme Kassa gère 3 appartements meublés à Angondjé.**
> 
> Son téléphone sonne. C'est un client qui veut réserver l'appartement 2 pour le weekend prochain. Elle ouvre son carnet — le carnet est à la maison, elle est au marché. Elle dit au client de rappeler dans 2h. 
> 
> Le client ne rappelle pas. Il a trouvé ailleurs.
> 
> 18h. Un autre client arrive sans prévenir. L'appartement 1 est occupé, le 2 est réservé (mais elle n'est pas sûre), le 3 est en ménage. Le client s'énerve, part, poste un avis négatif sur Facebook.
> 
> 22h. Elle compte ses réservations de la semaine. Elle a 4 réservations confirmées par WhatsApp, 2 sans réponse, 1 annulation à la dernière minute. Elle ne sait pas combien elle a gagné. Elle n'a émis aucun reçu. L'administration fiscale lui demande des justificatifs.

**Le chiffre de la douleur :**
- 30-40% de réservations perdues par manque de réponse rapide
- 25% de no-shows (réservations sans garantie)
- 5-10h/semaine perdues en gestion manuelle (messages, calendrier, ménage)
- 0 traçabilité fiscale = risque pénal
- Impossibilité de scaler au-delà de 2-3 propriétés

**Le point de rupture exact :** Quand Mme Kassa, épuisée à 23h, réalise qu'elle a perdu 3 réservations cette semaine (soit 450 000 FCFA) parce qu'elle n'a pas répondu assez vite, ou qu'un client est arrivé et que l'appartement n'était pas prêt.

### Le scénario de rupture (Client)

> **M. Ondo arrive de France pour un séjour d'affaires de 5 jours à Libreville.**
> 
> Il trouve un appartement sur Facebook. Il envoie un message WhatsApp. Pas de réponse en 4h. Il envoie un autre message à un deuxième. Réponse en 30 min : *"Oui c'est dispo, 35 000 FCFA/nuit"*. Il demande des photos. On lui envoie 3 photos floues. Il demande l'adresse exacte. On lui donne un point de rendez-vous vague.
> 
> Il arrive à Libreville. Le propriétaire n'est pas là. Il attend 45 minutes. L'appartement n'a pas de wifi comme promis. La clim ne marche pas. Il n'a aucun reçu. Il paie cash. Le lendemain, le propriétaire lui demande de partir plus tôt parce qu'un autre client arrive.
> 
> Il ne reviendra jamais. Il ne recommandera jamais.

**Le chiffre de la douleur :**
- 60% des voyageurs africains ont vécu une mauvaise expérience d'hébergement
- 45% abandonnent leur recherche faute de réponse rapide
- 80% des paiements sont en cash = risque, pas de trace
- Aucun recours en cas de litige

**Le point de rupture exact :** Quand le client, fatigué après 8h de vol, attend 45 minutes dans la rue parce que le propriétaire n'a pas de système de check-in digital, et découvre que l'appartement ne correspond pas à la description.

---

## 3. PARCOURS UTILISATEURS DÉTAILLÉS

### 3.1. Acteurs & Rôles

| Rôle | Permissions | Description |
|------|-------------|-------------|
| **Propriétaire** | Configuration complète, finances, multi-propriétés | Le propriétaire des appartements/chambres |
| **Manager** | Gestion des réservations, calendrier, équipe ménage | Employé du propriétaire |
| **Réceptionniste / Concierge** | Check-in/check-out, accueil client | Interface opérationnelle |
| **Ménage / Maintenance** | Vue des tâches, validation état des lieux | App mobile dédiée |
| **Client (Voyageur)** | Recherche, réservation, paiement, avis | Le locataire final |
| **Fiscal / Comptable** (optionnel) | Export des reçus, rapports | Accès lecture seule |

### 3.2. Parcours Propriétaire (Onboarding → Première Réservation)

```
1. Landing LUMINA → Clic "Je suis propriétaire d'hébergement"
2. Création compte (email/téléphone + mot de passe)
3. Choix du secteur "Hébergement"
4. Configuration instantanée :
   - Nom de l'établissement : "Résidences Mbolo"
   - Sous-domaine : residencesmbolo.lumina.ga
   - Type : Appartement meublé / Motel / Chambre d'hôte / Villa
   - Nombre de propriétés : 3
   - Adresse principale + coordonnées GPS
5. Arrivée sur le Dashboard Hébergement
6. Tutoriel interactif (4 étapes)
7. Ajout de la 1ère propriété :
   - Nom : "Appartement Élégance"
   - Photos (IA génère la description depuis les photos)
   - Capacité : 2 adultes + 1 enfant
   - Équipements : Wifi, Clim, TV, Cuisine, Parking
   - Tarif de base : 30 000 FCFA/nuit
   - Tarif weekend : 35 000 FCFA/nuit
   - Tarif long séjour (>7 nuits) : -15%
   - Caution : 50 000 FCFA
   - Règlement : Non-fumeur, Pas d'animaux
8. Configuration du calendrier :
   - Bloquer les dates indisponibles
   - Définir les heures check-in (14h) / check-out (12h)
   - Délai minimum avant réservation : 2h
   - Délai d'annulation gratuite : 24h avant
9. Configuration des paiements :
   - Acompte obligatoire : 30% pour valider la réservation
   - Solde à payer : 48h avant l'arrivée ou sur place
   - Mobile Money / Carte bancaire / Espèces
10. Génération du QR code de check-in (placé sur la porte)
11. Publication → Vitrine publique activée
12. 1ère réservation reçue → Notification WhatsApp/SMS + Email
```

### 3.3. Parcours Client (Voyageur)

```
1. Découvre la vitrine (Google, réseaux sociaux, bouche-à-oreille)
2. Consulte les propriétés disponibles :
   - Photos HD, description IA, équipements, avis vérifiés
   - Carte interactive (localisation exacte)
   - Disponibilité en temps réel (calendrier interactif)
3. Filtres : dates, capacité, prix max, équipements
4. Sélectionne une propriété → détail complet
5. Choisit les dates → calendrier met à jour le prix total
6. Ajout options : petit-déj (+5 000 FCFA/jour), transfert aéroport (+15 000 FCFA)
7. Formulaire : nom, email, téléphone, nombre de voyageurs
8. Paiement acompte (30%) : Mobile Money (USSD push ou QR)
9. Reçu de réservation généré automatiquement (PDF fiscal)
10. Confirmation email + WhatsApp avec :
    - QR code de check-in
    - Adresse exacte + itinéraire Google Maps
    - Contact propriétaire
    - Règlement intérieur
    - Code WiFi (affiché après check-in)
11. Jour J : scan du QR à l'entrée → porte déverrouillée (smart lock) ou notification au propriétaire
12. Check-in digital : signature électronique, état des lieux photos
13. Pendant le séjour : chat avec le propriétaire, demande de service (ménage, petit-déj)
14. Check-out : état des lieux sortie, remise caution, avis
15. Post-séjour : reçu final, demande d'avis, programme fidélité
```

### 3.4. Parcours Réceptionniste (Check-in/Check-out)

```
1. Reçoit notification "Nouveau check-in dans 2h"
2. Prépare la chambre (app mobile ménage)
3. Client arrive → scan QR ou recherche par nom
4. Vérification identité (photo pièce d'identité)
5. Check-in digital : signature écran, état des lieux entrée (photos)
6. Remise des clés / code porte
7. Client part → notification check-out
8. État des lieux sortie, photos comparatives
9. Remise caution si tout est OK
10. Signalement maintenance si besoin
```

---

## 4. CAHIER DES CHARGES FONCTIONNEL

### 4.1. Module Hébergement — Fonctionnalités

| Fonctionnalité | Priorité | Description |
|----------------|----------|-------------|
| **Gestion des propriétés** | P0 | CRUD propriétés, photos, description, équipements, règlement |
| **Calendrier de disponibilité** | P0 | Vue mensuelle/hebdomadaire, blocage dates, saisonnalité |
| **Moteur de réservation** | P0 | Sélection dates, calcul prix, options, acompte/solde |
| **Paiement en ligne** | P0 | Acompte 30%, solde, Mobile Money, carte, cash |
| **Reçu fiscal auto** | P0 | Génération PDF avec numéro unique, TVA, signature |
| **Vitrine publique** | P0 | Page propriété, photos, avis, carte, disponibilité |
| **Check-in/check-out digital** | P0 | QR code, signature électronique, état des lieux photos |
| **Gestion des équipements** | P1 | Inventaire par propriété, maintenance, alertes |
| **Ménage & Maintenance** | P1 | Planning tâches, app mobile, validation photos |
| **Multi-propriétés** | P1 | Dashboard global, stats croisées, comparaison |
| **Tarification dynamique** | P1 | Tarifs weekend, saison, long séjour, dernière minute |
| **Chat intégré** | P1 | Client ↔ propriétaire, traduction auto |
| **Avis vérifiés** | P1 | Post-séjour uniquement, modération |
| **Programme fidélité** | P2 | Points, réductions, statuts |
| **Smart Lock intégration** | P2 | Génération code porte, QR d'accès |
| **Channel Manager** | P2 | Synchro Airbnb, Booking.com (API) |
| **Rapports fiscaux** | P2 | Export mensuel/annuel pour comptable |
| **Assurance réservation** | P3 | Garantie annulation, protection propriétaire |

### 4.2. Matrice des prix et règles

```typescript
// Exemple de configuration tarifaire
interface PricingConfig {
  basePrice: number;           // 30 000 FCFA
  weekendMultiplier: 1.15;     // +15% vendredi-samedy
  seasonalRates: {
    high: { multiplier: 1.3, dates: "15/12-15/01" },
    low: { multiplier: 0.85, dates: "01/03-30/04" }
  };
  longStayDiscount: {
    threshold: 7,              // > 7 nuits
    discount: 0.15             // -15%
  };
  lastMinuteDiscount: {
    threshold: 2,              // < 2 jours avant
    discount: 0.10             // -10%
  };
  depositPercent: 30;          // Acompte 30%
  cancellationPolicy: {
    freeUntil: 24,             // 24h avant
    penaltyPercent: 50         // 50% après
  };
}
```

---

## 5. INTÉGRATION TECHNIQUE DANS L'ARCHITECTURE EXISTANTE

### 5.1. Schéma Prisma — Ajouts pour Hébergement

```prisma
// ============================================================
// SECTEUR HÉBERGEMENT — Tables additionnelles
// ============================================================

model Property {
  id            String   @id @default(uuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  name          String
  slug          String
  description   String   @db.Text
  type          PropertyType  // APARTMENT, MOTEL_ROOM, GUEST_HOUSE, VILLA, STUDIO

  address       String
  city          String
  country       String   @default("GA")
  latitude      Float?
  longitude     Float?

  maxGuests     Int      @default(2)
  maxAdults     Int      @default(2)
  maxChildren   Int      @default(0)

  basePrice     Int      // Prix de base en centimes (FCFA)
  currency      String   @default("XAF")

  pricingConfig Json?    // Configuration tarifaire (JSONB)
  rules         Json?    // Règlement intérieur

  amenities     Amenity[]
  photos        PropertyPhoto[]
  rooms         Room[]
  bookings      Booking[]
  availability  Availability[]
  maintenanceTasks MaintenanceTask[]

  isActive      Boolean  @default(true)
  isPublished   Boolean  @default(false)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([tenantId])
  @@index([slug])
  @@index([city])
}

model Room {
  id            String    @id @default(uuid())
  propertyId    String
  property      Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  name          String    // "Chambre principale", "Suite"
  roomNumber    String?   // Pour hôtels/motels
  bedType       BedType   // SINGLE, DOUBLE, QUEEN, KING, BUNK
  bedCount      Int       @default(1)

  photos        PropertyPhoto[]
  amenities     Amenity[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([propertyId])
}

model Amenity {
  id            String     @id @default(uuid())
  name          String     // "Wifi", "Clim", "Parking"
  icon          String?    // Icône Lucide
  category      AmenityCategory // COMFORT, TECHNOLOGY, KITCHEN, SAFETY, LEISURE

  properties    Property[]
  rooms         Room[]
}

model PropertyPhoto {
  id            String     @id @default(uuid())
  propertyId    String?
  property      Property?  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  roomId        String?
  room          Room?      @relation(fields: [roomId], references: [id], onDelete: Cascade)

  url           String
  order         Int        @default(0)
  isMain        Boolean    @default(false)

  createdAt     DateTime   @default(now())
}

model Availability {
  id            String     @id @default(uuid())
  propertyId    String
  property      Property   @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  date          DateTime   @db.Date
  isAvailable   Boolean    @default(true)
  isBlocked     Boolean    @default(false)  // Bloqué manuellement par le propriétaire
  priceOverride Int?       // Prix spécifique pour cette date

  reason        String?    // "Maintenance", "Propriétaire occupe"

  @@unique([propertyId, date])
  @@index([propertyId, date])
}

model Booking {
  id                String        @id @default(uuid())
  tenantId          String
  tenant            Tenant        @relation(fields: [tenantId], references: [id])
  propertyId        String
  property          Property      @relation(fields: [propertyId], references: [id])

  // Client
  guestName         String
  guestEmail        String
  guestPhone        String
  guestIdNumber     String?       // Numéro pièce d'identité
  guestIdPhoto      String?       // Photo pièce d'identité

  // Dates
  checkInDate       DateTime      @db.Date
  checkOutDate      DateTime      @db.Date
  checkInTime       String        @default("14:00")
  checkOutTime      String        @default("12:00")

  // Prix
  nightsCount       Int
  basePrice         Int           // Prix unitaire/nuit
  totalBase         Int           // basePrice * nights
  optionsTotal      Int           @default(0)
  discountAmount    Int           @default(0)
  totalAmount       Int           // Total à payer
  depositAmount     Int           // Acompte versé
  balanceAmount     Int           // Solde restant

  // Statut
  status            BookingStatus @default(PENDING)  // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
  paymentStatus     PaymentStatus @default(PENDING)

  // Check-in/out
  checkInAt         DateTime?
  checkOutAt        DateTime?
  checkInPhotos     Json?         // Photos état des lieux entrée
  checkOutPhotos    Json?         // Photos état des lieux sortie
  checkInSignature  String?       // URL signature électronique
  checkOutSignature String?

  // Reçu
  receiptNumber     String?       @unique  // NUM-2026-000001
  receiptUrl        String?

  // Avis
  review            Review?

  // Options
  options           BookingOption[]

  // Paiements
  payments          Payment[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([tenantId])
  @@index([propertyId])
  @@index([status])
  @@index([checkInDate])
  @@index([guestEmail])
}

model BookingOption {
  id            String    @id @default(uuid())
  bookingId     String
  booking       Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  name          String    // "Petit-déjeuner", "Transfert aéroport"
  price         Int
  quantity      Int       @default(1)
}

model MaintenanceTask {
  id            String          @id @default(uuid())
  propertyId    String
  property      Property        @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  type          TaskType        // CLEANING, REPAIR, INSPECTION, INVENTORY
  status        TaskStatus      @default(PENDING)  // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

  scheduledAt   DateTime
  completedAt   DateTime?

  assignedTo    String?         // User ID (ménage)
  notes         String?
  photos        Json?           // Photos avant/après

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([propertyId])
  @@index([status])
  @@index([scheduledAt])
}

model Review {
  id            String    @id @default(uuid())
  bookingId     String    @unique
  booking       Booking   @relation(fields: [bookingId], references: [id])

  rating        Int       // 1-5
  cleanliness   Int?      // 1-5
  comfort       Int?      // 1-5
  location      Int?      // 1-5
  value         Int?      // 1-5
  comment       String?   @db.Text

  isVerified    Boolean   @default(true)  // Vérifié (séjour effectué)
  isPublished   Boolean   @default(false) // Modération propriétaire

  createdAt     DateTime  @default(now())
}

// Enums
enum PropertyType {
  APARTMENT
  MOTEL_ROOM
  GUEST_HOUSE
  VILLA
  STUDIO
  HOTEL_ROOM
  HOSTEL_BED
}

enum BedType {
  SINGLE
  DOUBLE
  QUEEN
  KING
  BUNK
  SOFA
}

enum AmenityCategory {
  COMFORT
  TECHNOLOGY
  KITCHEN
  BATHROOM
  SAFETY
  LEISURE
  ACCESSIBILITY
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
  NO_SHOW
}

enum TaskType {
  CLEANING
  REPAIR
  INSPECTION
  INVENTORY
  PREPARATION
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### 5.2. Intégration dans l'architecture 2 repos

```
┌─────────────────────────────────────────────────────────────┐
│              LUMINA — ARCHITECTURE 4 SECTEURS               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BACKEND (NestJS + Prisma + PostgreSQL)                     │
│  ├── 📁 modules/                                            │
│  │   ├── 📁 auth/                                           │
│  │   ├── 📁 tenants/                                        │
│  │   ├── 📁 restaurants/     ← Secteur 1                   │
│  │   ├── 📁 events/          ← Secteur 2                   │
│  │   ├── 📁 shops/           ← Secteur 3                   │
│  │   ├── 📁 accommodations/  ← Secteur 4 (NOUVEAU)        │
│  │   │   ├── properties.controller.ts                      │
│  │   │   ├── properties.service.ts                         │
│  │   │   ├── bookings.controller.ts                        │
│  │   │   ├── bookings.service.ts                           │
│  │   │   ├── calendar.controller.ts                        │
│  │   │   ├── calendar.service.ts                           │
│  │   │   ├── checkin.controller.ts                         │
│  │   │   ├── checkin.service.ts                            │
│  │   │   ├── maintenance.controller.ts                     │
│  │   │   ├── maintenance.service.ts                        │
│  │   │   └── dto/                                          │
│  │   ├── 📁 payments/                                       │
│  │   ├── 📁 ai/                                             │
│  │   └── 📁 exports/                                        │
│  └── 📁 prisma/                                             │
│      └── schema.prisma  ← Tables accommodations ajoutées    │
│                                                             │
│  FRONTEND (Next.js 14 App Router)                           │
│  ├── 📁 app/                                                │
│  │   ├── 📁 (dashboard)/admin/                             │
│  │   │   ├── 📁 restaurant/                                │
│  │   │   ├── 📁 event/                                     │
│  │   │   ├── 📁 shop/                                      │
│  │   │   └── 📁 accommodation/  ← Secteur 4 (NOUVEAU)    │
│  │   │       ├── 📁 properties/                            │
│  │   │       ├── 📁 calendar/                              │
│  │   │       ├── 📁 bookings/                              │
│  │   │       ├── 📁 checkin/                               │
│  │   │       ├── 📁 maintenance/                           │
│  │   │       └── 📁 reports/                               │
│  │   ├── 📁 [tenant]/                                      │
│  │   │   └── 📁 accommodation/  ← Vitrine publique        │
│  │   └── 📁 (scan)/                                        │
│  │       └── 📁 checkin/  ← Scan QR check-in               │
│  └── 📁 components/                                         │
│      └── 📁 accommodation/  ← Composants spécifiques      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. INNOVATIONS IA — HÉBERGEMENT

| Fonction | Description IA | Valeur ajoutée |
|----------|---------------|----------------|
| **Générateur de description** | Photos uploadées → IA génère description SEO + traduction | Gain 30 min/propriété |
| **Pricing dynamique IA** | Analyse demande locale, événements, saison → suggère prix optimal | +15-25% revenus |
| **Chatbot réservation 24/7** | Répond aux questions, vérifie dispo, guide vers réservation | 0 réservation perdue |
| **Prévision d'occupation** | Prédit taux remplissage 30 jours → suggère promo | Optimisation revenus |
| **Détection maintenance IA** | Photos état des lieux → détecte dégradation (tache, casse) | Réclamations -40% |
| **Traduction auto** | Description + chat traduits en 5 langues | Marché international |
| **Recommandation voyageur** | Analyse préférences → suggère propriété + activités locales | Taux conversion +20% |
| **Génération reçu fiscal** | Données réservation → reçu conforme législation locale | 100% traçable |
| **Analyse avis** | Synthèse automatique des points forts/faibles | Amélioration continue |
| **Smart check-in** | QR code + reconnaissance faciale (option) | Check-in 30 secondes |

---

## 7. STACK TECHNIQUE AJUSTÉE (4 SECTEURS)

### Aucun changement de stack

Le secteur Hébergement s'intègre dans l'architecture existante **sans ajout technologique**. Les mêmes services suffisent :

| Couche | Technologie | Utilisation Hébergement |
|--------|-------------|------------------------|
| **Backend** | NestJS + Prisma | CRUD propriétés, réservations, calendrier |
| **Frontend** | Next.js 14 | Dashboard + vitrine hébergement |
| **Database** | PostgreSQL + Supabase | Tables Property, Booking, Availability |
| **Cache** | Redis | Calendrier dispo, sessions, rate limit |
| **Storage** | Cloudflare R2 | Photos propriétés, reçus PDF |
| **Paiement** | Paystack | Acompte + solde réservations |
| **IA** | OpenAI | Description, chatbot, pricing |
| **Email** | Resend | Confirmation, reçu, rappels |
| **PDF** | Puppeteer/Gotenberg | Reçus fiscaux, contrats |
| **Carte** | Mapbox / Google Maps | Localisation propriétés |

---

## 8. COÛT INFRASTRUCTURE EXACT — 200 À 500 CLIENTS SIMULTANÉS

### Hypothèses de charge

| Métrique | Valeur | Détail |
|----------|--------|--------|
| Utilisateurs simultanés (peak) | 500 | 200 propriétaires + 300 voyageurs |
| Requêtes/minute (peak) | 3 000 | 500 users × 6 req/min |
| Requêtes/mois | 10 000 000 | Incluant API, vitrines, scans |
| Stockage | 500 GB | Photos propriétés, documents, PDFs |
| Bande passante sortante | 2 000 GB/mois | Photos, assets, API |
| Emails/mois | 50 000 | Confirmations, reçus, rappels |
| Requêtes IA/mois | 10 000 | Descriptions, chatbot, traductions |

### Configuration RECOMMANDÉE (Production stable)

| Service | Spécification | Coût mensuel |
|---------|---------------|:------------:|
| **Backend (Hetzner CPX41)** | 8 vCPU, 16 GB RAM, 240 GB SSD | **$29.12** |
| **Database (Supabase Pro + 500GB)** | 8 GB DB + 500 GB stockage | **$60.00** |
| **Redis (Upstash Pro 100K)** | 100K req/jour, persistance | **$30.00** |
| **Frontend (Vercel Pro)** | 1 TB bandwidth, 6000 build min | **$20.00** |
| **Stockage fichiers (Cloudflare R2)** | 500 GB, 0 egress fees | **$7.50** |
| **CDN (Cloudflare Pro)** | Cache global, DDoS, SSL | **$20.00** |
| **Email (Resend 50K)** | 50 000 emails/mois | **$20.00** |
| **IA (OpenAI GPT-4o-mini)** | 10 000 requêtes/mois | **$15.00** |
| **Monitoring (Sentry Team)** | 50K errors, performance | **$26.00** |
| **Domaine (.com + .ga)** | 2 domaines | **$1.00** |
| **Backup (AWS S3 Glacier)** | Archives automatiques | **$5.00** |
| | | |
| **TOTAL INFRASTRUCTURE** | | **$233.62/mois** |
| **TOTAL ANNUEL** | | **$2,803/an** |
| **EN FCFA** (1$ = 600 FCFA) | | **140,170 FCFA/mois** |

### Configuration BUDGET (MVP, free tiers max)

| Service | Spécification | Coût mensuel |
|---------|---------------|:------------:|
| **Backend (Railway Pro)** | 4 vCPU, 8 GB RAM | **$55.00** |
| **Database (Supabase Pro base)** | 8 GB DB, 100 GB storage | **$25.00** |
| **Redis (Upstash Free)** | 10K req/jour | **$0.00** |
| **Frontend (Vercel Pro)** | 1 TB bandwidth | **$20.00** |
| **Stockage (Supabase Storage)** | 100 GB inclus | **$0.00** |
| **CDN (Cloudflare Free)** | Cache de base | **$0.00** |
| **Email (Resend Free)** | 3 000 emails/mois | **$0.00** |
| **IA (OpenAI GPT-4o-mini)** | 3 000 requêtes | **$5.00** |
| **Monitoring (Sentry Free)** | 5K errors | **$0.00** |
| **Domaine (.ga)** | Gratuit ARCEP | **$0.00** |
| | | |
| **TOTAL BUDGET** | | **$105.00/mois** |
| **EN FCFA** | | **63,000 FCFA/mois** |

### Configuration ENTERPRISE (Scale 1000+ concurrents)

| Service | Spécification | Coût mensuel |
|---------|---------------|:------------:|
| **Backend (Hetzner 2×CPX41 + LB)** | 16 vCPU, 32 GB, load balancer | **$69.23** |
| **Database (Supabase Team + 1TB)** | 1 TB stockage, priorité support | **$150.00** |
| **Redis (Upstash Pro 1M)** | 1M req/jour | **$80.00** |
| **Frontend (Vercel Enterprise)** | Bandwidth illimité | **$150.00** |
| **Stockage (Cloudflare R2 2TB)** | 2 TB | **$30.00** |
| **CDN (Cloudflare Business)** | SLA 100%, support prioritaire | **$200.00** |
| **Email (Resend 200K)** | 200 000 emails | **$60.00** |
| **IA (OpenAI + Claude)** | 50 000 requêtes | **$50.00** |
| **Monitoring (Sentry Business)** | 500K errors | **$80.00** |
| **Domaine (multi)** | 5 domaines | **$5.00** |
| **Backup automatisé** | Multi-région | **$20.00** |
| | | |
| **TOTAL ENTERPRISE** | | **$894.23/mois** |
| **EN FCFA** | | **536,540 FCFA/mois** |

### Coûts transactionnels (Paystack / Mobile Money)

Ces coûts sont **variables** et dépendent du volume de transactions :

| Volume mensuel | Nombre transactions | Commission Paystack (1.5% + 100 FCFA) |
|----------------|:-------------------:|:---------------------------------------:|
| 10 000 000 FCFA | 100 | 160 000 FCFA ($267) |
| 50 000 000 FCFA | 500 | 800 000 FCFA ($1,333) |
| 100 000 000 FCFA | 1 000 | 1 600 000 FCFA ($2,667) |

> **Note** : Paystack prélève la commission sur chaque transaction. Ce n'est PAS un coût fixe mensuel pour toi — c'est déduit du montant encaissé par le propriétaire (ou facturé au client selon ton modèle).

### Récapitulatif final

| Configuration | Coût infra/mois | Coût infra/an | En FCFA/mois |
|:-------------:|:---------------:|:-------------:|:------------:|
| **BUDGET (MVP)** | $105 | $1,260 | 63,000 FCFA |
| **RECOMMANDÉE** | $234 | $2,803 | 140,170 FCFA |
| **ENTERPRISE** | $894 | $10,731 | 536,540 FCFA |

**Recommandation pour LUMINA :** Commencer avec la **configuration BUDGET** ($105/mois = 63 000 FCFA) pour les 3 premiers mois. Passer à la **RECOMMANDÉE** ($234/mois = 140 170 FCFA) dès que tu atteins 100 clients actifs.

---

## 9. BUSINESS MODEL AJUSTÉ

### Plans mis à jour (4 secteurs)

| Plan | Prix/mois | Secteurs inclus | Limites |
|------|:---------:|:---------------:|---------|
| **Free** | 0 FCFA | 1 secteur au choix | 1 propriété, 5 événements/an, 20 produits, 10 réservations/mois, branding LUMINA |
| **Starter** | 15 000 FCFA | 1 secteur | Fonctions complètes 1 secteur, 3 utilisateurs, vitrine perso |
| **Pro** | 35 000 FCFA | 2 secteurs | Multi-utilisateurs, IA avancée, domaine perso, exports Drive |
| **Business** | 75 000 FCFA | 4 secteurs (tous) | Multi-secteurs, multi-propriétés (10+), API, support prioritaire |
| **Enterprise** | Sur devis | Illimité | Multi-locations, SLA, onboarding, hébergement dédié |

### Commission par secteur

| Secteur | Commission LUMINA | Justification |
|---------|:-----------------:|---------------|
| Événementiel | 2.5% / billet | Gestion billetterie, scan, certificats |
| Restauration | 1.5% / commande | Commande en ligne, paiement, livraison |
| E-commerce | 1.5% / transaction | Vente en ligne, stock, livraison |
| **Hébergement** | **3% / réservation** | **Calendrier, reçu fiscal, check-in digital, garantie** |

> **Pourquoi 3% sur l'hébergement ?** Parce que la valeur perçue est plus forte (reçu fiscal, calendrier complexe, check-in digital). Airbnb prend 15-20%, Booking 12-15%. À 3%, tu es 5× moins cher avec des services équivalents voire supérieurs pour le marché local.

---

## 10. ROADMAP MISE À JOUR

### Phase 1 : FONDATION (Semaines 1-4)
- [ ] Architecture 2 repos (backend + frontend)
- [ ] Auth multi-tenant + sous-domaines
- [ ] Module Core (billing, config, rôles)
- [ ] Design System + premières maquettes

### Phase 2 : SECTEUR PILOTE — RESTAURATION (Semaines 5-10)
- [ ] Menu digital + QR code
- [ ] Commande + KDS
- [ ] Paiement Mobile Money
- [ ] Beta 5 restaurants Libreville

### Phase 3 : SECTEUR 2 — ÉVÉNEMENTIEL (Semaines 11-16)
- [ ] Billetterie + scan
- [ ] Certificats
- [ ] Beta 3 organisateurs

### Phase 4 : SECTEUR 3 — E-COMMERCE (Semaines 17-24)
- [ ] Catalogue + checkout
- [ ] Livraison
- [ ] Beta 5 boutiques

### Phase 5 : SECTEUR 4 — HÉBERGEMENT (Semaines 25-34) ← NOUVEAU
- [ ] Gestion propriétés + calendrier
- [ ] Moteur réservation + paiement acompte
- [ ] Reçu fiscal auto
- [ ] Check-in/check-out digital
- [ ] Beta 5 propriétaires (appartements + motel)

### Phase 6 : IA & POLISH (Semaines 35-40)
- [ ] IA transverse (4 secteurs)
- [ ] App mobile scan
- [ ] Optimisation performances
- [ ] Documentation

### Phase 7 : LANCEMENT DÉMO (Semaine 41+)
- [ ] Landing page 4 secteurs
- [ ] Onboarding automatisé
- [ ] Campagne acquisition
- [ ] Collecte feedbacks V2

---

## ANNEXE : COMPARAISON AVEC AIRBNB / BOOKING

| Critère | Airbnb | Booking.com | **LUMINA Hébergement** |
|---------|:------:|:-----------:|:----------------------:|
| Commission | 15-20% | 12-15% | **3%** |
| Paiement | Carte internationale | Carte internationale | **Mobile Money + Carte + Cash** |
| Reçu fiscal | Non | Non | **Oui, auto, conforme OHADA** |
| Calendrier | Oui | Oui | **Oui + IA pricing** |
| Check-in digital | Non | Non | **Oui, QR code** |
| Chatbot 24/7 | Non | Non (robot basique) | **Oui, IA locale** |
| Multi-propriétés | Limité | Oui | **Oui, dashboard unifié** |
| Ménage intégré | Non | Non | **Oui, planning + app** |
| Marché cible | International | International | **Afrique centrale, local** |
| Langue | 30+ langues | 40+ langues | **Français + Anglais + Espagnol** |
| Support | Email (48h) | Email (24h) | **WhatsApp + téléphone (immédiat)** |

---

**LUMINA Hébergement ne concurrence pas Airbnb. Il remplace le carnet papier, le WhatsApp, et le cash.**
