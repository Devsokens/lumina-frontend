import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Journal des scans faits sur CET appareil (acceptés et refusés), pour
// l'onglet « Ce téléphone » de l'historique. Gardé le temps de la session du
// navigateur seulement (sessionStorage) : il contient des noms de participants.
// Les entrées acceptées de tous les scanners viennent, elles, du serveur
// (billets USED, voir components/scan/scan-history.tsx).
export type ScanLogKind = "valid" | "used" | "invalid" | "network" | "error";

export type ScanLogEntry = {
  id: string;
  at: string; // ISO
  eventId: string | null;
  kind: ScanLogKind;
  offline: boolean;
  name?: string;
  ticketType?: string;
  number?: string;
  detail?: string;
};

type ScanLogState = {
  entries: ScanLogEntry[];
  add: (entry: Omit<ScanLogEntry, "id" | "at">) => void;
  clear: (eventId: string | null) => void;
};

const MAX_ENTRIES = 200;

export const useScanLog = create<ScanLogState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) =>
        set((s) => ({
          entries: [
            { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString() },
            ...s.entries,
          ].slice(0, MAX_ENTRIES),
        })),
      clear: (eventId) => set((s) => ({ entries: s.entries.filter((e) => e.eventId !== eventId) })),
    }),
    {
      name: "giyax-scan-log",
      storage: createJSONStorage(() => sessionStorage),
      // Relu après le premier rendu (page du scanner) : pas d'écart avec le
      // rendu serveur.
      skipHydration: true,
    }
  )
);
