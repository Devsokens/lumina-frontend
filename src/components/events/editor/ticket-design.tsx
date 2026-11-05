import { TICKET_TEMPLATES, type TicketLayout } from "@/lib/ticket-templates";
import type { TicketTemplate } from "@/types/api";

// Rendu des modèles de billet dans l'éditeur (palette du design 2026-11,
// mêmes identifiants et même ordre que lib/ticket-templates.ts).
type Style = { bg: string; fg: string; accent: string; pattern?: string };

export const TEMPLATE_STYLE: Record<TicketTemplate, Style> = {
  GOLD_VIP: { bg: "#16211C", fg: "#FFFFFF", accent: "#C79A3B" },
  GALA_BLACK_TIE: { bg: "#0E0E0E", fg: "#FFFFFF", accent: "#E8E3D5" },
  ROYAL_PURPLE: { bg: "#4B1D6B", fg: "#FFFFFF", accent: "#E3B7FF" },
  FESTIVAL_WRISTBAND: { bg: "#B8326E", fg: "#FFFFFF", accent: "#FFD6E8" },
  NEON_RAVE: { bg: "#0B1030", fg: "#FFFFFF", accent: "#3BE8FF" },
  AFRO_WAX: { bg: "#D9541E", fg: "#FFFFFF", accent: "#FFD23F", pattern: "repeating-linear-gradient(135deg, rgba(255,255,255,.12) 0 6px, transparent 6px 14px)" },
  SUNSET_GRADIENT: { bg: "#E8572A", fg: "#FFFFFF", accent: "#FFE2C2" },
  OCEAN_BEACH: { bg: "#1C8FC4", fg: "#FFFFFF", accent: "#FFE08A" },
  NIGHTLIFE_DARK: { bg: "#1D1D24", fg: "#FFFFFF", accent: "#FF4D6D" },
  THEATRE_RED: { bg: "#8E1B1B", fg: "#FFFFFF", accent: "#F2C14E", pattern: "repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 4px, transparent 4px 10px)" },
  CONFERENCE_BADGE: { bg: "#FFFFFF", fg: "#16211C", accent: "#0C4A3A" },
  CORPORATE_BLUE: { bg: "#1F3A68", fg: "#FFFFFF", accent: "#8FB3E8" },
  EMERALD_SUMMIT: { bg: "#0C4A3A", fg: "#FFFFFF", accent: "#E3C34A" },
  SPORT_STADIUM: { bg: "#1E6B3A", fg: "#FFFFFF", accent: "#D8F3DC", pattern: "repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 12px, transparent 12px 24px)" },
  RACE_BIB: { bg: "#FFFFFF", fg: "#16211C", accent: "#C62828" },
  CLASSIC_PASS: { bg: "#FFFFFF", fg: "#16211C", accent: "#0C4A3A" },
  MINIMAL_MONO: { bg: "#F4F2EC", fg: "#16211C", accent: "#5E6A64" },
  PASTEL_BRUNCH: { bg: "#F3DDEB", fg: "#4A2340", accent: "#9B4D7D" },
};

const LIGHT = ["#FFFFFF", "#F4F2EC", "#F3DDEB", "#E8E3D5", "#E3B7FF", "#FFD6E8", "#3BE8FF", "#FFD23F", "#FFE2C2", "#FFE08A", "#F2C14E", "#8FB3E8", "#E3C34A", "#D8F3DC"];
const isLight = (hex: string) => LIGHT.includes(hex);

export const KIND_LABEL: Record<TicketLayout, string> = { stub: "Billet", badge: "Badge", wristband: "Bracelet" };

function QrGlyph({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" aria-hidden>
      <path fill={color} d="M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM14 0h7v7h-7zM15 1v5h5V1zM16 2h3v3h-3zM0 14h7v7H0zM1 15v5h5v-5zM2 16h3v3H2zM9 0h2v2H9zM9 4h3v2H9zM8 8h3v3H8zM12 9h2v2h-2zM14 8h2v3h-2zM18 9h3v2h-3zM9 13h2v2H9zM12 12h3v2h-3zM16 13h2v3h-2zM9 17h3v2H9zM13 16h2v3h-2zM17 18h4v3h-4z" />
    </svg>
  );
}

// Miniature d'un modèle (galerie) ou aperçu agrandi.
export function TicketMini({
  id,
  title,
  formula,
  meta,
  price,
  large,
}: {
  id: TicketTemplate;
  title: string;
  formula: string;
  meta?: string;
  price?: string;
  large?: boolean;
}) {
  const t = TICKET_TEMPLATES.find((x) => x.id === id) ?? TICKET_TEMPLATES[0];
  const s = TEMPLATE_STYLE[t.id];
  const stub = isLight(s.bg) ? "#F1EFE9" : "#FFFFFF";
  const dash = isLight(s.bg) ? "#CFCBC0" : "rgba(0,0,0,.25)";
  const chipFg = isLight(s.accent) ? "#16211C" : "#FFFFFF";
  const shadow = "0 3px 8px rgba(22,33,28,.16)";
  const FORMULA = formula.toUpperCase();

  if (t.layout === "badge") {
    const w = large ? 92 : 70;
    return (
      <span style={{ width: w, height: large ? 124 : 94, borderRadius: 8, overflow: "hidden", background: s.bg, display: "flex", flexDirection: "column", alignItems: "center", gap: large ? 5 : 4, boxShadow: shadow }}>
        <span style={{ alignSelf: "stretch", height: 6, background: s.accent }} />
        <span style={{ padding: `0 ${large ? 7 : 6}px`, fontSize: large ? 7 : 6.5, fontWeight: 600, lineHeight: 1.2, textAlign: "center", color: s.fg }}>{title}</span>
        {large && <span style={{ fontSize: 7.5, fontWeight: 600, color: s.accent }}>Nom du participant</span>}
        <span style={{ height: 9, padding: "0 5px", borderRadius: 999, background: s.accent, color: chipFg, fontSize: 4.5, fontWeight: 700, letterSpacing: "0.08em", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>{FORMULA}</span>
        <QrGlyph size={large ? 26 : 20} color={s.fg} />
      </span>
    );
  }
  if (t.layout === "wristband") {
    return (
      <span style={{ width: 162, height: 28, borderRadius: 999, background: s.bg, display: "flex", alignItems: "center", gap: 6, padding: "0 4px 0 12px", boxSizing: "border-box", boxShadow: shadow }}>
        <span style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontSize: 7, fontWeight: 600, color: s.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
          <span style={{ fontSize: 5, fontWeight: 700, letterSpacing: "0.1em", color: s.accent, whiteSpace: "nowrap" }}>
            {FORMULA}
            {price ? ` · ${price}` : ""}
          </span>
        </span>
        <span style={{ width: 22, height: 22, borderRadius: 999, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <QrGlyph size={14} color="#16211C" />
        </span>
      </span>
    );
  }
  return (
    <span style={{ width: 156, height: 64, borderRadius: 7, overflow: "hidden", display: "flex", boxShadow: shadow }}>
      <span style={{ flex: 1, backgroundColor: s.bg, backgroundImage: s.pattern ?? "none", padding: "8px 9px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, minWidth: 0 }}>
        <span style={{ fontSize: 6, fontWeight: 700, letterSpacing: "0.12em", color: s.accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{FORMULA}</span>
        <span style={{ fontSize: 8.5, fontWeight: 600, lineHeight: 1.2, color: s.fg }}>{title}</span>
        {meta && <span style={{ fontSize: 5.5, color: s.fg, opacity: 0.8 }}>{meta}</span>}
      </span>
      <span style={{ width: 42, background: stub, borderLeft: `1.5px dashed ${dash}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <QrGlyph size={22} color="#16211C" />
      </span>
    </span>
  );
}
