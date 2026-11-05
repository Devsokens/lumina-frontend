import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";

// Typographie du module Événements (refonte Claude Design, 2026-11) :
// Geist pour l'interface, Geist Mono pour les numéros, Cormorant Garamond
// pour les certificats. Chargées seulement dans ce module.
const geist = Geist({ variable: "--font-ev", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-ev-mono", subsets: ["latin"], weight: ["500"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-ev-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  preload: false,
});

export const eventFontVariables = [geist.variable, geistMono.variable, cormorant.variable].join(" ");
