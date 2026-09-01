import { create } from "zustand";

export type ShowcaseTheme = "amber" | "emerald" | "electric" | "ruby" | "dark";

export type TicketTier = {
  id: string;
  name: string;
  price: number; // in FCFA
  badge?: string;
  description: string;
  benefits: string[];
  stockLeft: number;
};

export type LineupArtist = {
  id: string;
  name: string;
  role: string;
  time: string;
  imageUrl?: string;
};

export type ShowcaseState = {
  // Appearance & Theme
  theme: ShowcaseTheme;
  fontFamily: "Outfit" | "Syne" | "Inter" | "Plus Jakarta Sans";
  mode: "dark" | "light";

  // Content
  siteTitle: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventGoogleMapsUrl: string;
  ctaText: string;

  // Visuals
  coverImageUrl: string;
  logoText: string;

  // Lineup
  artists: LineupArtist[];

  // Tickets
  tickets: TicketTier[];

  // Contacts & Socials
  whatsappNumber: string;
  instagramHandle: string;
  supportPhone: string;

  // Editor UX State
  deviceView: "desktop" | "tablet" | "mobile";
  isEditingInline: boolean;
  selectedSectionId: string | null;
  activeInspectorTab: "theme" | "content" | "tickets" | "lineup" | "contact";
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
  updateTicket: (id: string, updated: Partial<TicketTier>) => void;
  updateArtist: (id: string, updated: Partial<LineupArtist>) => void;
  publishShowcase: () => void;
  resetToDefaults: () => void;
};

const DEFAULT_STATE: Omit<
  ShowcaseState,
  | "setTheme"
  | "setFontFamily"
  | "setDeviceView"
  | "setIsEditingInline"
  | "setSelectedSectionId"
  | "setActiveInspectorTab"
  | "updateField"
  | "updateTicket"
  | "updateArtist"
  | "publishShowcase"
  | "resetToDefaults"
> = {
  theme: "amber",
  fontFamily: "Outfit",
  mode: "dark",

  siteTitle: "Festival Urban Afro Libreville 2026",
  tagline: "Le plus grand rassemblement afro-urbain d'Afrique Centrale",
  heroHeadline: "Vibrez au rythme des plus grands artistes Afro & Urbains",
  heroSubheadline:
    "2 Nuits exceptionnelles de concerts live, DJ sets internationaux et village gastronomique à Libreville.",
  eventDate: "Vendredi 05 & Samedi 06 Septembre 2026",
  eventTime: "18h00 - 05h00 (Portes à 17h30)",
  eventLocation: "Palais des Sports & de la Culture, Libreville",
  eventGoogleMapsUrl: "https://maps.google.com",
  ctaText: "Réserver mon Pass Maintenant",

  coverImageUrl:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
  logoText: "FESTIVAL URBAN AFRO",

  artists: [
    {
      id: "art-1",
      name: "Fally Ipupa",
      role: "Headliner Live Concert",
      time: "Vendredi 23h30",
    },
    {
      id: "art-2",
      name: "Creol 'La Diva'",
      role: "Guest Star Afro-Pop",
      time: "Vendredi 21h30",
    },
    {
      id: "art-3",
      name: "DJ Dollar LBV",
      role: "Electronic & Amapiano Master",
      time: "Samedi 01h00",
    },
    {
      id: "art-4",
      name: "Eboloko",
      role: "Gaboma Drill & Urban Show",
      time: "Samedi 22h00",
    },
  ],

  tickets: [
    {
      id: "t-std",
      name: "Pass Standard (1 Jour)",
      price: 10000,
      description: "Accès général à la fosse concert + village food & drink.",
      benefits: ["Accès Fosse Concert", "1 Boisson offerte", "Accès Village Food"],
      stockLeft: 120,
    },
    {
      id: "t-vip",
      name: "Pass VIP Carré Or",
      price: 35000,
      badge: "Plus Populaire",
      description: "Accès prioritaire, espace surélevé, cocktail et parking réservé.",
      benefits: [
        "Accès coupe-file prioritaire",
        "Espace Lounge VIP surélevé",
        "Open Bar soft & cocktails légers",
        "Place de parking sécurisée",
      ],
      stockLeft: 24,
    },
    {
      id: "t-vvip",
      name: "Table Prestige VVIP (5 Personnes)",
      price: 250000,
      badge: "Prestige",
      description: "Table privée vue directe scène avec service de bouteilles de luxe.",
      benefits: [
        "Pass pour 5 personnes",
        "Table privée réservée",
        "2 Bouteilles Premium au choix",
        "Serveur dédié & service voiturier",
      ],
      stockLeft: 4,
    },
  ],

  whatsappNumber: "+241 77 00 00 00",
  instagramHandle: "@festivalurbanafro",
  supportPhone: "+241 66 12 34 56",

  deviceView: "desktop",
  isEditingInline: true,
  selectedSectionId: null,
  activeInspectorTab: "theme",
  isPublished: true,
  lastSavedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
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
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),

  updateTicket: (id, updated) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    })),

  updateArtist: (id, updated) =>
    set((state) => ({
      artists: state.artists.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    })),

  publishShowcase: () =>
    set({
      isPublished: true,
      lastSavedAt: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }),

  resetToDefaults: () => set(DEFAULT_STATE),
}));
