# LUMINA / GIYA — Spécifications & Paramètres Backend (Master Reference)

> **Document de référence pour le Backend NestJS / PostgreSQL**  
> Ce document détaille l'ensemble des modules, routes d'API, structures de données (JSON Schemas), règles métier, sécurité et politiques de monétisation (Free vs PRO / GIYA AI).

---

## 1. Architecture Globale & Multi-Tenant

### 1.1 Principe d'Isolation des Données
* Chaque requête authentifiée contient le token JWT incluant le `tenantId` et le `userId`.
* Toute requête en base de données PostgreSQL applique un filtre strict `WHERE tenant_id = :tenantId` (ou Row-Level Security).
* **Sous-domaine / Slug public** : `[slug].giya.ga` ou `api.giya.ga/v1/tenants/:slug/...`

### 1.2 Niveaux d'Abonnement & Monétisation
| Fonctionnalité | Formule FREE (Gratuit) | Formule PRO / GIYA AI (Payant) |
| :--- | :--- | :--- |
| **Comptes Utilisateurs** | Max 2 utilisateurs | Utilisateurs illimités |
| **Génération Vitrine GIYA AI** | 2 essais de démonstration | Générations illimitées |
| **Génération d'Affiches par IA** | Non inclus (Aperçu avec filigrane) | Générations HD illimitées |
| **Certificats & Attestations** | Jusqu'à 15 participants / event | Participants illimités |
| **Sections Vitrine Personnalisées** | Blocs standards uniquement | Blocs sur-mesure (RSVP Mariage, Compte à rebours 3D, Sponsors...) |
| **Sous-domaine & Nom de Domaine** | `[slug].giya.ga` | Domaine personnalisé (`monsite.ga`) |

---

## 2. Module Organisation & Paramètres Globaux

### 2.1 Schéma de Données (`Organization`)
```json
{
  "id": "org-uuid-1234",
  "tenantId": "tenant-uuid-1234",
  "name": "SOKENS DIGITAL EVENT",
  "tagline": "Créateur des plus grandes expériences événementielles et culturelles du Gabon",
  "logoUrl": "https://cdn.giya.ga/uploads/orgs/logo-sokens.png",
  "coverUrl": "https://cdn.giya.ga/uploads/orgs/cover-sokens.jpg",
  "theme": "emerald", // "emerald" | "amber" | "electric" | "ruby" | "dark" | "indigo"
  "fontFamily": "Outfit",
  "rccm": "RG/LBV/2023B1234",
  "nif": "0987654321A",
  "whatsappNumber": "+24177123456",
  "supportPhone": "+24166987654",
  "contactEmail": "contact@sokens-digital.ga",
  "address": "Boulevard Triomphal, Libreville, Gabon",
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-04T10:00:00.000Z"
}
```

### 2.2 Endpoints Backend
* `GET /v1/organizations/me` : Récupère les paramètres de l'organisation active.
* `PUT /v1/organizations/me` : Met à jour les coordonnées, palette et logo.
* `POST /v1/organizations/upload-logo` : Upload multipart/form-data vers le stockage S3/Cloudflare R2 (validation MIME image, max 5 Mo).

---

## 3. Module Site Vitrine & Moteur GIYA AI

### 3.1 Consultation Publique (Accessible aux acheteurs sans token)
* **Route** : `GET /v1/tenants/:slug/showcase`
* **Mise en cache** : Cache CDN / Redis de 60 secondes pour résister aux pics de charge.
* **Réponse JSON** :
```json
{
  "orgName": "SOKENS DIGITAL EVENT",
  "orgTagline": "Créateur des plus grandes expériences événementielles...",
  "orgLogoUrl": "https://...",
  "orgCoverUrl": "https://...",
  "theme": "emerald",
  "fontFamily": "Outfit",
  "heroHeadline": "Vivez des Moments Inoubliables avec nos Événements d'Exception",
  "heroSubheadline": "Festivals musicaux majeurs, conférences de prestige...",
  "heroCtaText": "Explorer la Programmation",
  "aboutTitle": "L'Excellence Événementielle au Cœur de l'Afrique",
  "aboutText": "Depuis plus de 6 ans, notre organisation conçoit...",
  "statParticipants": "+25 000",
  "statEvents": "18+",
  "statSatisfaction": "4.9/5",
  "statSecurity": "100%",
  "galleryImages": ["https://...", "https://..."],
  "testimonials": [
    {
      "id": "t-1",
      "name": "Arnaud Mengue",
      "role": "Directeur Général, Tech Gabon",
      "comment": "Une organisation irréprochable et des pass reçus instantanément sur WhatsApp.",
      "rating": 5,
      "eventName": "Gala Gabon Tech 2026"
    }
  ],
  "faqs": [
    {
      "id": "faq-1",
      "question": "Comment reçois-je mon billet après paiement ?",
      "answer": "Votre pass officiel muni d'un QR code sécurisé est immédiatement téléchargeable et envoyé par SMS/WhatsApp."
    }
  ],
  "events": [ /* Liste des événements actifs */ ]
}
```

### 3.2 Générateur Intelligent GIYA AI (Option PRO & Cadrage Interactif)
* **Route** : `POST /v1/ai/generate-showcase`
* **Authentification** : Requise (`Admin` ou `Éditeur`).
* **Corps de la Requête (Request Body avec Cadrage)** :
```json
{
  "prompt": "Je suis une agence de mariages féeriques et galas de prestige à Libreville.",
  "sector": "EVENT",
  "language": "fr",
  "framing": {
    "targetVibe": "luxury", // "luxury" | "popular" | "corporate" | "academy"
    "ticketType": "vip_tables", // "vip_tables" | "standard_tiered" | "rsvp_guest" | "certified_pass"
    "preferredPalette": "ruby" // "ruby" | "amber" | "emerald" | "indigo" | "electric" | "dark"
  }
}
```
* **Logique Métier Backend** :
  1. Vérifier si le tenant a souscrit au plan **PRO** ou possède des crédits d'essai restants.
  2. Injecter les critères de cadrage (`targetVibe`, `ticketType`, `preferredPalette`) dans le *System Prompt* LLM (OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini Flash).
  3. Retourner le payload structuré avec textes captivants, thématique de couleur et événements d'exemple ultra-ciblés.

---

## 4. Module Événements, Programmation & Billetterie

### 4.1 Catégories d'Événements Supportées
1. `Concert & Festival` (Festivals musicaux, concerts géants)
2. `Conférence & Gala` (Dîners d'affaires, remises de prix, sommets B2B)
3. `Mariage & Célébration` (Mariages, vins d'honneur, réceptions privées, anniversaires VIP)
4. `Formation & Masterclass` (Ateliers certifiants avec attestations)
5. `Soirée VIP` (Réveillons, beach parties, soirées clubbing)

### 4.2 Schéma de Données (`Event` & `TicketTier`)
```json
{
  "id": "evt-uuid-5678",
  "tenantId": "tenant-uuid-1234",
  "title": "Grand Mariage Princier — Célébration Royale & Vin d'Honneur",
  "category": "Mariage & Célébration",
  "date": "19 Décembre 2026",
  "time": "16h00 - 04h00",
  "location": "Domaine Privé de la Sablière, Libreville",
  "googleMapsUrl": "https://maps.google.com/?q=Sabliere+Libreville",
  "description": "Cérémonie laïque au jardin, vin d'honneur au champagne millésimé et dîner gastronomique 4 services.",
  "coverImageUrl": "https://cdn.giya.ga/uploads/events/mariage-royal.jpg",
  "badge": "Mariage Royal",
  "startingPrice": 35000,
  "isFeatured": true,
  "status": "PUBLISHED", // "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SOLDOUT"
  "lineup": [
    { "id": "l-1", "name": "Cérémonie Laïque", "role": "16h30 au Jardin" },
    { "id": "l-2", "name": "Orchestre Philharmonique", "role": "Ambiance Cocktail" }
  ],
  "tickets": [
    {
      "id": "tkt-uuid-1",
      "name": "Pass Invité d'Honneur (RSVP)",
      "price": 35000,
      "badge": "Nominatif",
      "description": "Accès complet vin d'honneur, dîner assis gastronomique et soirée dansante.",
      "benefits": ["Place nominative assignée", "Cocktail champagne", "Menu dégustation 4 services"],
      "totalStock": 100,
      "stockLeft": 45
    },
    {
      "id": "tkt-uuid-2",
      "name": "Table Famille & Témoins (8 Pers)",
      "price": 250000,
      "badge": "Table Prestige",
      "description": "Table ronde dédiée avec sommelier et champagne millésimé.",
      "benefits": ["Table 8 places réservée", "Service sommelier dédié", "Accès salon VIP"],
      "totalStock": 10,
      "stockLeft": 3
    }
  ]
}
```

### 4.3 Endpoints Backend Événements
* `GET /v1/events` : Liste filtrée (`?category=...&search=...&status=PUBLISHED`).
* `POST /v1/events` : Création d'un événement avec ses formules de pass.
* `PUT /v1/events/:id` : Mise à jour de l'événement et des tarifs.
* `DELETE /v1/events/:id` : Suppression ou archivage logique.
* `POST /v1/events/:id/cover` : Téléversement de l'affiche publicitaire.

---

## 5. Module Paiement Mobile Money & Délivrance des Billets

### 5.1 Initiation du Paiement Mobile Money
* **Route** : `POST /v1/payments/mobile-money/initiate`
* **Corps de Requête** :
```json
{
  "tenantId": "tenant-uuid-1234",
  "eventId": "evt-uuid-5678",
  "ticketTierId": "tkt-uuid-1",
  "quantity": 2,
  "buyerName": "Jean-Marc Obiang",
  "buyerPhone": "077123456",
  "buyerEmail": "jm.obiang@gmail.com",
  "operator": "AIRTEL" // "AIRTEL" | "MOOV"
}
```
* **Réponse Backend** :
```json
{
  "success": true,
  "transactionId": "TX-GA-982341",
  "status": "PENDING_USSD",
  "message": "Veuillez valider la demande de débit sur votre téléphone (Airtel Money / Moov Money)."
}
```

### 5.2 Webhook de Confirmation Opérateur
* **Routes** : `POST /v1/webhooks/airtel-money` & `POST /v1/webhooks/moov-money`
* **Sécurité** :
  * Validation de la signature cryptographique (`X-Signature` HMAC-SHA256).
  * Traitement idempotent avec verrou distribué sur `transactionId`.
* **Actions post-paiement réussies** :
  1. Décrémenter le stock `stockLeft` de la formule de pass.
  2. Générer le billet sécurisé avec token JWT signé dans le QR Code.
  3. Déclencher l'envoi WhatsApp/SMS du billet au client.

### 5.3 Sécurité du QR Code Anti-Fraude
Le QR Code scanné lors du contrôle d'accès contient un token JWT signé par clé privée RSA :
```json
{
  "ref": "GA-LBV-9082",
  "eventId": "evt-uuid-5678",
  "tenantId": "tenant-uuid-1234",
  "buyerName": "Jean-Marc Obiang",
  "ticketTier": "Pass Invité d'Honneur (RSVP)",
  "quantity": 2,
  "issuedAt": 1788223200,
  "sig": "d2f8e1..."
}
```
* Lors du scan au guichet via l'application de contrôle, le scanneur valide la signature même hors-ligne et invalide le billet pour empêcher toute réutilisation.

---

## 6. Module Gestion des Utilisateurs & Rôles

### 6.1 Règles de Quota Free vs PRO
* **Formule FREE** : Limite stricte à **2 utilisateurs maximum par organisation**. Toute tentative d'ajout d'un 3e compte renvoie un code HTTP `403 Forbidden` avec invitation à souscrire à Giya PRO.
* **Formule PRO** : Création d'utilisateurs illimitée.

### 6.2 Modèle de Données Utilisateur (`TenantUser`)
```json
{
  "id": "user-uuid-99",
  "tenantId": "tenant-uuid-1234",
  "fullName": "Aïcha Ndong",
  "email": "aicha.ndong@sokens-digital.ga",
  "role": "ADMIN", // "SUPER_ADMIN" | "ADMIN"
  "jobTitle": "Directrice Événementielle & Billetterie",
  "status": "ACTIVE", // "ACTIVE" | "INVITED" | "SUSPENDED"
  "permissions": {
    "events": "EDITOR", // "EDITOR" | "VIEWER" | "NONE"
    "ticketing": "EDITOR",
    "attendees": "EDITOR",
    "showcase": "EDITOR",
    "settings": "VIEWER"
  },
  "createdAt": "2026-09-02T14:30:00.000Z"
}
```

### 6.3 Endpoints Utilisateurs
* `GET /v1/users` : Liste des collaborateurs de l'organisation.
* `POST /v1/users` : Invitation d'un nouveau collaborateur (avec vérification du quota Free).
* `PUT /v1/users/:id` : Modification des permissions (Éditeur / Lecteur par module).
* `DELETE /v1/users/:id` : Révocation d'accès.

---

## 7. Module Attestations & Certificats Certifiés GIYA

### 7.1 Règles Métier
* **Formule FREE** : Génération d'attestations certifiées pour **jusqu'à 15 participants maximum** par masterclass / formation.
* **Au-delà de 15 participants** : Fonctionnalité payante réservée aux comptes **Giya PRO**.

### 7.2 Endpoint de Vérification Publique
* `GET /v1/certificates/verify/:certificateId` : Endpoint public permettant à un employeur ou partenaire de scanner le QR code d'une attestation et de vérifier son authenticité en ligne.

---

## 8. Checklist d'Implémentation Backend NestJS

- [ ] **Auth & Guard Multi-Tenant** : Extraction du `tenantId` dans le middleware JWT.
- [ ] **Module Organisation** : CRUD `GET/PUT /v1/organizations/me`.
- [ ] **Module Showcase Public** : `GET /v1/tenants/:slug/showcase` avec cache Redis.
- [ ] **Module GIYA AI** : `POST /v1/ai/generate-showcase` connecté à OpenAI / Gemini avec JSON Schema.
- [ ] **Module Événements & Pass** : Support des 5 catégories dont `Mariage & Célébration`.
- [ ] **Module Mobile Money Gabon** : Intégration API Airtel Money & Moov Money avec Webhooks idempotents.
- [ ] **Module Contrôle Quota Utilisateurs** : Blocage à 2 comptes en version Free.
- [ ] **Module Certificats** : Blocage au-delà de 15 attestations en version Free.
