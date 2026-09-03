import { create } from "zustand";

export type ShowcaseTheme = "emerald" | "amber" | "electric" | "ruby" | "dark" | "indigo";

export type TicketTier = {
  id: string;
  name: string;
  price: number; // in FCFA
  badge?: string;
  description: string;
  benefits: string[];
  stockLeft: number;
};

export type EventItem = {
  id: string;
  title: string;
  category: "Concert & Festival" | "Conférence & Gala" | "Formation & Masterclass" | "Soirée VIP";
  date: string;
  time: string;
  location: string;
  googleMapsUrl?: string;
  description: string;
  coverImageUrl: string;
  badge?: string;
  startingPrice: number;
  isFeatured?: boolean;
  lineup?: { id: string; name: string; role: string }[];
  tickets: TicketTier[];
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  eventName: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type ShowcaseState = {
  // Appearance & Theme
  theme: ShowcaseTheme;
  fontFamily: "Outfit" | "Syne" | "Inter" | "Plus Jakarta Sans";
  mode: "dark" | "light";

  // Organization Identity
  orgName: string;
  orgTagline: string;
  orgLogoUrl: string | null;
  orgCoverUrl: string;
  aboutTitle: string;
  aboutText: string;
  
  // Hero Content
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;

  // Stats
  statParticipants: string;
  statEvents: string;
  statSatisfaction: string;
  statSecurity: string;

  // Catalog of Events
  events: EventItem[];

  // Gallery
  galleryImages: string[];

  // Testimonials & FAQ
  testimonials: Testimonial[];
  faqs: FAQItem[];

  // Contacts & Legal
  whatsappNumber: string;
  supportPhone: string;
  contactEmail: string;
  address: string;
  rccm: string;
  nif: string;
  instagramHandle: string;
  facebookUrl: string;

  // Editor UX State
  deviceView: "desktop" | "tablet" | "mobile";
  isEditingInline: boolean;
  selectedSectionId: string | null;
  activeInspectorTab: "theme" | "org" | "events" | "about" | "contact";
  isPublished: boolean;
  lastSavedAt: string | null;

  // Actions
  setTheme: (theme: ShowcaseTheme) => void;
  setFontFamily: (font: ShowcaseState["fontFamily"]) => void;
  setDeviceView: (device: "desktop" | "tablet" | "mobile") => void;
  setIsEditingInline: (isEditing: boolean) => void;
  setSelectedSectionId: (id: string | null) => void;
  setActiveInspectorTab: (tab: ShowcaseState["activeInspectorTab"]) => void;
  updateField: <K extends keyof ShowcaseState>(key: K, value: ShowcaseState[K]) => void;
  updateEvent: (id: string, updated: Partial<EventItem>) => void;
  updateEventCover: (id: string, coverImageUrl: string) => void;
  updateGalleryImage: (index: number, imageUrl: string) => void;
  addEvent: (newEvent: EventItem) => void;
  deleteEvent: (id: string) => void;
  publishShowcase: () => void;
  resetToDefaults: () => void;
};

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "Festival Urban Afro Libreville 2026",
    category: "Concert & Festival",
    date: "05 & 06 Septembre 2026",
    time: "18h00 - 05h00",
    location: "Palais des Sports, Libreville",
    googleMapsUrl: "https://maps.google.com",
    description:
      "Le plus grand rassemblement musical afro-urbain d'Afrique Centrale. 2 nuits de concerts géants, shows pyrotechniques, DJ sets et village gastronomique gabonais.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    badge: "Événement Phare",
    startingPrice: 10000,
    isFeatured: true,
    lineup: [
      { id: "l-1", name: "Fally Ipupa", role: "Headliner Live Concert" },
      { id: "l-2", name: "Creol 'La Diva'", role: "Guest Star Afro-Pop" },
      { id: "l-3", name: "DJ Dollar LBV", role: "Amapiano & Electro" },
      { id: "l-4", name: "Eboloko", role: "Gaboma Drill & Urban Show" },
    ],
    tickets: [
      {
        id: "t-std",
        name: "Pass Standard (1 Jour)",
        price: 10000,
        description: "Accès général à la fosse concert + village food & drink.",
        benefits: ["Accès Fosse Concert", "1 Boisson offerte", "Accès Village Gastronomique"],
        stockLeft: 120,
      },
      {
        id: "t-vip",
        name: "Pass VIP Carré Or",
        price: 35000,
        badge: "Recommandé",
        description: "Emplacement privilégié face à la scène avec service boisson dédié.",
        benefits: ["Tribune VIP surélevée", "Entrée Coupe-file prioritaire", "2 Conso premium + Goodies"],
        stockLeft: 45,
      },
      {
        id: "t-vvip",
        name: "Table Prestige VVIP (5 Pers)",
        price: 250000,
        badge: "Luxe & Lounge",
        description: "Salon privatif avec service majordome et bouteilles de champagne.",
        benefits: ["Salon privatif 5 personnes", "2 Bouteilles de Champagne", "Service Majordome Dédié", "Parking VIP réservé"],
        stockLeft: 8,
      },
    ],
  },
  {
    id: "evt-2",
    title: "Gala Gabon Business & Tech Awards 2026",
    category: "Conférence & Gala",
    date: "17 Octobre 2026",
    time: "19h30 - 23h30",
    location: "Hôtel Radisson Blu, Libreville",
    description:
      "La grande nuit de célébration des leaders de l'économie gabonaise, de l'innovation technologique et de l'entrepreneuriat d'Afrique Centrale.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    badge: "Gala Officiel",
    startingPrice: 50000,
    isFeatured: true,
    lineup: [
      { id: "l-5", name: "Keynote Ministérielle", role: "Discours d'Ouverture" },
      { id: "l-6", name: "Remise des Trophées", role: "12 Catégories Décernées" },
      { id: "l-7", name: "Dîner Gastronomique", role: "Chef Étoilé & Réseautage" },
    ],
    tickets: [
      {
        id: "t-gala-ind",
        name: "Place Individuelle Gala",
        price: 50000,
        description: "Accès à la cérémonie, cocktail de bienvenue et dîner assis 3 services.",
        benefits: ["Cocktail de bienvenue", "Dîner gastronomique 3 services", "Accès à l'espace B2B"],
        stockLeft: 30,
      },
      {
        id: "t-gala-table",
        name: "Table Entreprise Partenaire (8 Pers)",
        price: 400000,
        badge: "Corporate",
        description: "Table réservée au nom de votre entreprise avec mention au programme officiel.",
        benefits: ["Table 8 places réservée", "Logo sur les écrans géants", "Champagne millésimé", "Attestations de partenariat"],
        stockLeft: 5,
      },
    ],
  },
  {
    id: "evt-3",
    title: "Masterclass IA, Fintech & Business Digital",
    category: "Formation & Masterclass",
    date: "28 Novembre 2026",
    time: "09h00 - 17h00",
    location: "Institut Français du Gabon, Libreville",
    description:
      "Formation intensive et pratique avec délivrance d'une attestation officielle certifiée Giya. Automatisez vos ventes et intégrez les solutions de paiement Mobile Money.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
    badge: "Certifiant Giya",
    startingPrice: 25000,
    isFeatured: false,
    lineup: [
      { id: "l-8", name: "Marc Ondimba", role: "Expert Digital & Growth" },
      { id: "l-9", name: "Atelier Pratique", role: "Cas d'usage IA & Mobile Money" },
    ],
    tickets: [
      {
        id: "t-mc-pass",
        name: "Pass Formation & Attestation",
        price: 25000,
        description: "Journée complète de formation, supports de cours PDF et Attestation officielle vérifiable par QR code.",
        benefits: ["Accès toute la journée", "Supports & templates offerts", "Attestation certifiée Giya", "Pause-café & déjeuner inclus"],
        stockLeft: 60,
      },
    ],
  },
  {
    id: "evt-4",
    title: "Nuit Blanche VIP — Afro House & Amapiano",
    category: "Soirée VIP",
    date: "31 Décembre 2026",
    time: "22h00 - 07h00",
    location: "La Baie des Rois, Libreville",
    description:
      "Le réveillon le plus exclusif de Libreville au bord de l'océan avec un feu d'artifice géant et les meilleurs DJs de Johannesburg et Abidjan.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
    badge: "Nouvel An",
    startingPrice: 20000,
    isFeatured: false,
    lineup: [
      { id: "l-10", name: "DJ Maphorisa Experience", role: "Headliner International" },
      { id: "l-11", name: "Grand Feu d'Artifice", role: "Minuit Pile sur l'Océan" },
    ],
    tickets: [
      {
        id: "t-nb-std",
        name: "Pass Early Bird",
        price: 20000,
        description: "Accès à la soirée + coupe de champagne à minuit.",
        benefits: ["Accès au site", "Coupe de champagne à minuit", "Vue panoramique feux"],
        stockLeft: 50,
      },
      {
        id: "t-nb-vip",
        name: "Pass Lounge VIP",
        price: 60000,
        badge: "Cocktails Illimités",
        description: "Accès salon VIP privatif au bord de l'eau avec open bar soft & tapas.",
        benefits: ["Salon VIP bord de mer", "Open bar sélectionné jusqu'à 02h", "Buffet tapas gastronomique"],
        stockLeft: 20,
      },
    ],
  },
];

const DEFAULT_STATE: Omit<
  ShowcaseState,
  | "setTheme"
  | "setFontFamily"
  | "setDeviceView"
  | "setIsEditingInline"
  | "setSelectedSectionId"
  | "setActiveInspectorTab"
  | "updateField"
  | "updateEvent"
  | "updateEventCover"
  | "updateGalleryImage"
  | "addEvent"
  | "deleteEvent"
  | "publishShowcase"
  | "resetToDefaults"
> = {
  theme: "emerald",
  fontFamily: "Outfit",
  mode: "dark",

  orgName: "SOKENS DIGITAL EVENT",
  orgTagline: "Créateur des plus grandes expériences événementielles et culturelles du Gabon",
  orgLogoUrl: null,
  orgCoverUrl:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop",
  aboutTitle: "L'Excellence Événementielle au Cœur de l'Afrique",
  aboutText:
    "Depuis plus de 6 ans, notre organisation conçoit, produit et orchestre les festivals majeurs, galas d'affaires et formations professionnelles de référence à Libreville et Port-Gentil. Notre engagement : une scénographie irréprochable, une sécurité sans faille et une billetterie digitale 100% sécurisée.",

  heroBadge: "",
  heroHeadline: "Vivez des Moments Inoubliables avec nos Événements d'Exception",
  heroSubheadline:
    "Festivals musicaux majeurs, conférences de prestige et masterclasses certifiantes. Réservez vos pass officiels en quelques clics avec Airtel Money et Moov Money.",
  heroCtaText: "Explorer la Programmation",

  statParticipants: "+25 000",
  statEvents: "18+",
  statSatisfaction: "4.9/5",
  statSecurity: "100% Sécurisé",

  events: DEFAULT_EVENTS,

  galleryImages: [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
  ],

  testimonials: [
    {
      id: "test-1",
      name: "Christian Mba",
      role: "Participant Festival Urban",
      comment: "Une organisation parfaite au Palais des Sports. Achat du pass VIP par Airtel Money en 30 secondes et entrée fluide avec le QR code !",
      rating: 5,
      eventName: "Festival Urban Afro",
    },
    {
      id: "test-2",
      name: "Sonia Ntoutoume",
      role: "Directrice Marketing",
      comment: "Le Gala annuel était d'un niveau international. Ambiance feutrée, networking de grande qualité et service VIP irréprochable.",
      rating: 5,
      eventName: "Gala Business & Tech",
    },
    {
      id: "test-3",
      name: "Patrick Emane",
      role: "Entrepreneur Tech",
      comment: "Masterclass très concrète avec remise de certificat numérique officiel scannable directement à la fin de la journée. Bravo à l'équipe !",
      rating: 5,
      eventName: "Masterclass IA & Fintech",
    },
  ],

  faqs: [
    {
      id: "faq-1",
      question: "Comment reçois-je mon billet après le paiement Airtel ou Moov Money ?",
      answer: "Dès validation de votre paiement Mobile Money, votre pass sécurisé avec QR Code unique s'affiche instantanément à l'écran et vous est envoyé par e-mail et WhatsApp. Vous pouvez le télécharger en format PDF ou l'enregistrer dans votre smartphone.",
    },
    {
      id: "faq-2",
      question: "Comment se déroule le contrôle d'accès le jour de l'événement ?",
      answer: "Présentez simplement votre QR Code sur votre téléphone à l'entrée. Nos équipes scannent votre billet en 1 seconde à l'aide de nos scanners officiels Giya certifiés.",
    },
    {
      id: "faq-3",
      question: "Puis-je acheter plusieurs billets pour mes amis ou collaborateurs ?",
      answer: "Oui ! Vous pouvez sélectionner la quantité souhaitée lors de la commande. Chaque billet disposera de son propre QR Code unique et sécurisé.",
    },
    {
      id: "faq-4",
      question: "Les attestations délivrées lors des masterclasses sont-elles certifiées ?",
      answer: "Absolument. Nos attestations intègrent une clé cryptographique et un QR Code vérifiable publiquement attestant de votre présence officielle.",
    },
  ],

  whatsappNumber: "+241 77 12 34 56",
  supportPhone: "+241 74 55 66 77",
  contactEmail: "contact@sokens-digital.ga",
  address: "Boulevard Triomphal, Libreville, Gabon",
  rccm: "RCCM-LBV-2024-B-8902",
  nif: "GA-1092837-NIF",
  instagramHandle: "@sokens_digital_event",
  facebookUrl: "https://facebook.com",

  deviceView: "desktop",
  isEditingInline: false,
  selectedSectionId: null,
  activeInspectorTab: "org",
  isPublished: true,
  lastSavedAt: null,
};

export const useShowcaseStore = create<ShowcaseState>((set) => ({
  ...DEFAULT_STATE,

  setTheme: (theme) => set({ theme }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setDeviceView: (deviceView) => set({ deviceView }),
  setIsEditingInline: (isEditingInline) => set({ isEditingInline }),
  setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
  setActiveInspectorTab: (activeInspectorTab) => set({ activeInspectorTab }),

  updateField: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    })),

  updateEvent: (id, updated) =>
    set((state) => ({
      events: state.events.map((evt) => (evt.id === id ? { ...evt, ...updated } : evt)),
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    })),

  updateEventCover: (id, coverImageUrl) =>
    set((state) => ({
      events: state.events.map((evt) => (evt.id === id ? { ...evt, coverImageUrl } : evt)),
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    })),

  updateGalleryImage: (index, imageUrl) =>
    set((state) => {
      const copy = [...state.galleryImages];
      copy[index] = imageUrl;
      return {
        galleryImages: copy,
        lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
    }),

  addEvent: (newEvent) =>
    set((state) => ({
      events: [newEvent, ...state.events],
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((evt) => evt.id !== id),
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    })),

  publishShowcase: () =>
    set({
      isPublished: true,
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }),

  resetToDefaults: () => set({ ...DEFAULT_STATE }),
}));
