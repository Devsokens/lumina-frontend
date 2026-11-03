import {
  Bricolage_Grotesque,
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Manrope,
  Playfair_Display,
  Space_Grotesk,
  Syne,
} from "next/font/google";

// Polices de titre proposées dans « Site & apparence » (lib/site.ts,
// lib/stay-site.ts), utilisées par le site public et l'aperçu du back-office.
// preload: false : la police dépend du réglage du tenant, précharger les 9
// coûterait 9 fichiers par visite. Seule celle réellement affichée se charge.
const serif = Cormorant_Garamond({ variable: "--font-site-serif", subsets: ["latin"], preload: false, weight: ["500", "600", "700"] });
const sans = Manrope({ variable: "--font-site-sans", subsets: ["latin"], preload: false });
const bold = Playfair_Display({ variable: "--font-site-bold", subsets: ["latin"], preload: false });
const fraunces = Fraunces({ variable: "--font-stay-fraunces", subsets: ["latin"], preload: false });
const dmSans = DM_Sans({ variable: "--font-stay-dmsans", subsets: ["latin"], preload: false });
const grotesk = Space_Grotesk({ variable: "--font-stay-grotesk", subsets: ["latin"], preload: false });
const syne = Syne({ variable: "--font-stay-syne", subsets: ["latin"], preload: false });
const dmSerif = DM_Serif_Display({ variable: "--font-stay-dmserif", subsets: ["latin"], preload: false, weight: "400" });
const bricolage = Bricolage_Grotesque({ variable: "--font-stay-bricolage", subsets: ["latin"], preload: false });

export const siteFontVariables = [serif, sans, bold, fraunces, dmSans, grotesk, syne, dmSerif, bricolage]
  .map((f) => f.variable)
  .join(" ");
