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
// Un fichier de police n'est téléchargé que si une page l'utilise.
const serif = Cormorant_Garamond({ variable: "--font-site-serif", subsets: ["latin"], weight: ["500", "600", "700"] });
const sans = Manrope({ variable: "--font-site-sans", subsets: ["latin"] });
const bold = Playfair_Display({ variable: "--font-site-bold", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-stay-fraunces", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-stay-dmsans", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-stay-grotesk", subsets: ["latin"] });
const syne = Syne({ variable: "--font-stay-syne", subsets: ["latin"] });
const dmSerif = DM_Serif_Display({ variable: "--font-stay-dmserif", subsets: ["latin"], weight: "400" });
const bricolage = Bricolage_Grotesque({ variable: "--font-stay-bricolage", subsets: ["latin"] });

export const siteFontVariables = [serif, sans, bold, fraunces, dmSans, grotesk, syne, dmSerif, bricolage]
  .map((f) => f.variable)
  .join(" ");
