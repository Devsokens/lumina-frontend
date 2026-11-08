import { create } from "zustand";

// Cadre du back-office événementiel (refonte 2026-11) : barre latérale
// repliée, palette de recherche, visite guidée, demande d'avis, création
// d'un événement depuis n'importe quelle page, offre Business, nouvelle organisation.

const COLLAPSED_KEY = "giyax-sidebar-collapsed";

function readCollapsed() {
  try {
    return typeof window !== "undefined" && localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

type ShellState = {
  collapsed: boolean;
  paletteOpen: boolean;
  tourOpen: boolean;
  feedbackOpen: boolean;
  createEventOpen: boolean;
  businessOpen: boolean;
  newOrgOpen: boolean;
  setCollapsed: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setTourOpen: (v: boolean) => void;
  setFeedbackOpen: (v: boolean) => void;
  setCreateEventOpen: (v: boolean) => void;
  setBusinessOpen: (v: boolean) => void;
  setNewOrgOpen: (v: boolean) => void;
  hydrate: () => void;
};

export const useShellStore = create<ShellState>((set) => ({
  collapsed: false,
  paletteOpen: false,
  tourOpen: false,
  feedbackOpen: false,
  createEventOpen: false,
  businessOpen: false,
  newOrgOpen: false,
  setCollapsed: (collapsed) => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      // stockage indisponible : réglage gardé pour la session seulement
    }
    set({ collapsed });
  },
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setTourOpen: (tourOpen) => set({ tourOpen }),
  setFeedbackOpen: (feedbackOpen) => set({ feedbackOpen }),
  setCreateEventOpen: (createEventOpen) => set({ createEventOpen }),
  setBusinessOpen: (businessOpen) => set({ businessOpen }),
  setNewOrgOpen: (newOrgOpen) => set({ newOrgOpen }),
  // Lu après le montage (le rendu serveur ne connaît pas localStorage).
  hydrate: () => set({ collapsed: readCollapsed() }),
}));
