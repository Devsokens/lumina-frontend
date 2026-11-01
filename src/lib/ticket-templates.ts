import type { EventType, TicketTemplate } from "@/types/api";

// Catalogue des modèles visuels de billet. Couleurs en valeurs CSS (styles
// inline) : elles sont dynamiques, Tailwind ne peut pas les générer.
// `layout` : stub = billet avec talon détachable, badge = badge vertical
// (conférence, salon), wristband = bracelet / bandeau horizontal.
export type TicketLayout = "stub" | "badge" | "wristband";

export type TicketTemplateDef = {
  id: TicketTemplate;
  label: string;
  category: "Prestige" | "Festival" | "Pro" | "Sport" | "Spectacle" | "Sobre";
  layout: TicketLayout;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  // Fond du QR (toujours clair pour rester lisible au scan).
  qrBackground?: string;
};

export const TICKET_TEMPLATES: TicketTemplateDef[] = [
  { id: "GOLD_VIP", label: "VIP Or", category: "Prestige", layout: "stub", background: "linear-gradient(135deg,#0d0d0d,#1a1508 60%,#0d0d0d)", foreground: "#fef3c7", accent: "#f59e0b", muted: "#a8a29e" },
  { id: "GALA_BLACK_TIE", label: "Gala Black Tie", category: "Prestige", layout: "stub", background: "linear-gradient(160deg,#000,#1c1c1c)", foreground: "#ffffff", accent: "#e5e5e5", muted: "#a3a3a3" },
  { id: "ROYAL_PURPLE", label: "Royal Pourpre", category: "Prestige", layout: "stub", background: "linear-gradient(135deg,#2e1065,#581c87)", foreground: "#faf5ff", accent: "#fbbf24", muted: "#d8b4fe" },
  { id: "FESTIVAL_WRISTBAND", label: "Bracelet Festival", category: "Festival", layout: "wristband", background: "linear-gradient(90deg,#db2777,#7c3aed)", foreground: "#ffffff", accent: "#fde047", muted: "#fbcfe8" },
  { id: "NEON_RAVE", label: "Néon Rave", category: "Festival", layout: "stub", background: "linear-gradient(135deg,#020617,#0f172a)", foreground: "#e0f2fe", accent: "#22d3ee", muted: "#94a3b8" },
  { id: "AFRO_WAX", label: "Afro Wax", category: "Festival", layout: "stub", background: "repeating-linear-gradient(45deg,#c2410c 0 14px,#ea580c 14px 28px)", foreground: "#fff7ed", accent: "#fde047", muted: "#fed7aa" },
  { id: "SUNSET_GRADIENT", label: "Sunset", category: "Festival", layout: "wristband", background: "linear-gradient(90deg,#f97316,#e11d48)", foreground: "#ffffff", accent: "#fef08a", muted: "#ffe4e6" },
  { id: "OCEAN_BEACH", label: "Beach Party", category: "Festival", layout: "stub", background: "linear-gradient(135deg,#0891b2,#0ea5e9 55%,#fde68a)", foreground: "#ffffff", accent: "#fef9c3", muted: "#e0f2fe" },
  { id: "NIGHTLIFE_DARK", label: "Club Nuit", category: "Spectacle", layout: "stub", background: "linear-gradient(135deg,#18181b,#3f3f46)", foreground: "#fafafa", accent: "#f43f5e", muted: "#a1a1aa" },
  { id: "THEATRE_RED", label: "Théâtre Rideau", category: "Spectacle", layout: "stub", background: "linear-gradient(135deg,#7f1d1d,#b91c1c)", foreground: "#fef2f2", accent: "#fcd34d", muted: "#fecaca" },
  { id: "CONFERENCE_BADGE", label: "Badge Conférence", category: "Pro", layout: "badge", background: "linear-gradient(180deg,#ffffff,#f1f5f9)", foreground: "#0f172a", accent: "#2563eb", muted: "#64748b" },
  { id: "CORPORATE_BLUE", label: "Corporate", category: "Pro", layout: "badge", background: "linear-gradient(180deg,#1e3a8a,#1e40af)", foreground: "#eff6ff", accent: "#93c5fd", muted: "#bfdbfe" },
  { id: "EMERALD_SUMMIT", label: "Sommet Émeraude", category: "Pro", layout: "badge", background: "linear-gradient(180deg,#064e3b,#047857)", foreground: "#ecfdf5", accent: "#fcd34d", muted: "#a7f3d0" },
  { id: "SPORT_STADIUM", label: "Stade", category: "Sport", layout: "stub", background: "linear-gradient(135deg,#14532d,#16a34a)", foreground: "#f0fdf4", accent: "#facc15", muted: "#bbf7d0" },
  { id: "RACE_BIB", label: "Dossard Course", category: "Sport", layout: "badge", background: "linear-gradient(180deg,#fafafa,#e5e5e5)", foreground: "#171717", accent: "#dc2626", muted: "#525252" },
  { id: "CLASSIC_PASS", label: "Classique", category: "Sobre", layout: "stub", background: "#ffffff", foreground: "#111827", accent: "#059669", muted: "#6b7280" },
  { id: "MINIMAL_MONO", label: "Minimal", category: "Sobre", layout: "stub", background: "#f5f5f4", foreground: "#1c1917", accent: "#1c1917", muted: "#78716c" },
  { id: "PASTEL_BRUNCH", label: "Pastel Brunch", category: "Sobre", layout: "wristband", background: "linear-gradient(90deg,#fce7f3,#e0e7ff)", foreground: "#3b0764", accent: "#be185d", muted: "#6b21a8" },
];

export const TEMPLATE_CATEGORIES = ["Prestige", "Festival", "Spectacle", "Pro", "Sport", "Sobre"] as const;

export function getTicketTemplate(id?: string | null): TicketTemplateDef {
  return TICKET_TEMPLATES.find((t) => t.id === id) ?? TICKET_TEMPLATES[0];
}

// Modèle proposé par défaut selon le type d'événement.
export function defaultTemplateFor(type?: EventType): TicketTemplate {
  switch (type) {
    case "CONCERT":
      return "FESTIVAL_WRISTBAND";
    case "CONFERENCE":
      return "CONFERENCE_BADGE";
    case "NIGHTLIFE":
      return "NIGHTLIFE_DARK";
    case "EXHIBITION":
      return "CORPORATE_BLUE";
    case "SPORTS":
      return "SPORT_STADIUM";
    case "SHOW":
      return "THEATRE_RED";
    default:
      return "GOLD_VIP";
  }
}
