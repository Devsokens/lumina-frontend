import { create } from "zustand";

// Cadre du back-office événementiel (refonte 2026-11) : barre latérale
// repliée, palette de recherche (⌘K), raccourcis clavier, création d'un
// événement depuis n'importe quelle page, offre Business, nouvelle organisation.

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
  shortcutsOpen: boolean;
  createEventOpen: boolean;
  businessOpen: boolean;
  newOrgOpen: boolean;
  setCollapsed: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setShortcutsOpen: (v: boolean) => void;
  setCreateEventOpen: (v: boolean) => void;
  setBusinessOpen: (v: boolean) => void;
  setNewOrgOpen: (v: boolean) => void;
  hydrate: () => void;
};

export const useShellStore = create<ShellState>((set) => ({
  collapsed: false,
  paletteOpen: false,
  shortcutsOpen: false,
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
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
  setCreateEventOpen: (createEventOpen) => set({ createEventOpen }),
  setBusinessOpen: (businessOpen) => set({ businessOpen }),
  setNewOrgOpen: (newOrgOpen) => set({ newOrgOpen }),
  // Lu après le montage (le rendu serveur ne connaît pas localStorage).
  hydrate: () => set({ collapsed: readCollapsed() }),
}));
