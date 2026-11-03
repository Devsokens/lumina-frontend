import type { Metadata } from "next";
import type { CSSProperties } from "react";

// Console d'administration du SaaS : jamais indexée, thème sombre dédié
// (jetons redéfinis pour tout le sous-arbre, mêmes composants que le reste).
export const metadata: Metadata = {
  title: "GiyaX Vision",
  robots: { index: false, follow: false, nocache: true },
};

const theme = {
  "--background": "#07090d",
  "--foreground": "#e6ebf2",
  "--card": "#0d1118",
  "--card-foreground": "#e6ebf2",
  "--popover": "#0d1118",
  "--popover-foreground": "#e6ebf2",
  "--muted": "#151b24",
  "--muted-foreground": "#8693a6",
  "--border": "rgb(255 255 255 / 0.08)",
  "--input": "rgb(255 255 255 / 0.12)",
  "--primary": "#2dd4bf",
  "--primary-foreground": "#04211d",
  "--ring": "#2dd4bf",
  "--chart-1": "#2dd4bf",
  "--chart-2": "#818cf8",
  "--chart-3": "#f59e0b",
  "--chart-4": "#f472b6",
  "--chart-5": "#94a3b8",
  colorScheme: "dark",
} as CSSProperties;

export default function VisionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={theme} className="min-h-dvh bg-background text-foreground">
      {children}
    </div>
  );
}
