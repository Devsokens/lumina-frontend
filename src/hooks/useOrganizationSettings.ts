"use client";

import { useState, useEffect } from "react";

export interface ColorPreset {
  id: string;
  name: string;
  primaryLight: string;
  primaryDark: string;
  ringLight: string;
  ringDark: string;
  sidebarFrom: string;
  sidebarVia: string;
  sidebarTo: string;
  sidebarBorder: string;
  badgeBg: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "emerald",
    name: "Émeraude Royal (Giya)",
    primaryLight: "#0a4f3c",
    primaryDark: "#2fae86",
    ringLight: "#059669",
    ringDark: "#34d399",
    sidebarFrom: "#052b20",
    sidebarVia: "#04241a",
    sidebarTo: "#021811",
    sidebarBorder: "#0d4a37",
    badgeBg: "bg-emerald-500",
  },
  {
    id: "indigo",
    name: "Bleu Nuit / Indigo",
    primaryLight: "#1d4ed8",
    primaryDark: "#3b82f6",
    ringLight: "#2563eb",
    ringDark: "#60a5fa",
    sidebarFrom: "#0f172a",
    sidebarVia: "#0c1322",
    sidebarTo: "#080c16",
    sidebarBorder: "#1e293b",
    badgeBg: "bg-blue-600",
  },
  {
    id: "purple",
    name: "Pourpre & Violet Impérial",
    primaryLight: "#6d28d9",
    primaryDark: "#8b5cf6",
    ringLight: "#7c3aed",
    ringDark: "#a78bfa",
    sidebarFrom: "#2e1065",
    sidebarVia: "#220c4b",
    sidebarTo: "#160731",
    sidebarBorder: "#4c1d95",
    badgeBg: "bg-purple-600",
  },
  {
    id: "amber",
    name: "Noir Onyx & Or Chaud",
    primaryLight: "#b45309",
    primaryDark: "#f59e0b",
    ringLight: "#d97706",
    ringDark: "#fbbf24",
    sidebarFrom: "#1c1917",
    sidebarVia: "#141210",
    sidebarTo: "#0c0a09",
    sidebarBorder: "#292524",
    badgeBg: "bg-amber-600",
  },
  {
    id: "bordeaux",
    name: "Rubis & Bordeaux Prestige",
    primaryLight: "#b91c1c",
    primaryDark: "#ef4444",
    ringLight: "#dc2626",
    ringDark: "#f87171",
    sidebarFrom: "#450a0a",
    sidebarVia: "#330707",
    sidebarTo: "#1f0404",
    sidebarBorder: "#5f1010",
    badgeBg: "bg-red-600",
  },
  {
    id: "ocean",
    name: "Océan Pétrole & Turquoise",
    primaryLight: "#0e7490",
    primaryDark: "#06b6d4",
    ringLight: "#0891b2",
    ringDark: "#22d3ee",
    sidebarFrom: "#083344",
    sidebarVia: "#062633",
    sidebarTo: "#041a22",
    sidebarBorder: "#0e4a60",
    badgeBg: "bg-cyan-600",
  },
];

export interface OrganizationSettings {
  name: string;
  logo: string | null;
  colorId: string;
  customHex?: string;
}

const DEFAULT_SETTINGS: OrganizationSettings = {
  name: "SOKENS DIGITAL EVENT",
  logo: null,
  colorId: "emerald",
};

const STORAGE_KEY = "giya_org_settings";
const EVENT_NAME = "giya_org_settings_changed";

export function applyThemeVariables(preset: ColorPreset) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const primary = isDark ? preset.primaryDark : preset.primaryLight;
  const ring = isDark ? preset.ringDark : preset.ringLight;

  root.style.setProperty("--primary", primary);
  root.style.setProperty("--sidebar-primary", primary);
  root.style.setProperty("--ring", ring);
  root.style.setProperty("--chart-1", primary);
}

export function useOrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const activePreset =
    COLOR_PRESETS.find((p) => p.id === settings.colorId) ?? COLOR_PRESETS[0];

  useEffect(() => {
    applyThemeVariables(activePreset);

    function handleStorageChange() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
          setSettings(parsed);
          const found = COLOR_PRESETS.find((p) => p.id === parsed.colorId) ?? COLOR_PRESETS[0];
          applyThemeVariables(found);
        }
      } catch (err) {
        console.error("Error reading org settings", err);
      }
    }

    window.addEventListener(EVENT_NAME, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [activePreset]);

  function saveSettings(newSettings: Partial<OrganizationSettings>) {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    const targetPreset =
      COLOR_PRESETS.find((p) => p.id === updated.colorId) ?? COLOR_PRESETS[0];
    applyThemeVariables(targetPreset);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (err) {
      console.error("Error saving org settings", err);
    }
  }

  return {
    settings,
    saveSettings,
    activePreset,
    COLOR_PRESETS,
  };
}
