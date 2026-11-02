import { Cormorant_Garamond, Manrope, Playfair_Display } from "next/font/google";

// Polices de titre proposées dans « Site & apparence » (lib/site.ts),
// utilisées par le site public et l'aperçu du back-office.
const serif = Cormorant_Garamond({ variable: "--font-site-serif", subsets: ["latin"], weight: ["500", "600", "700"] });
const sans = Manrope({ variable: "--font-site-sans", subsets: ["latin"] });
const bold = Playfair_Display({ variable: "--font-site-bold", subsets: ["latin"] });

export const siteFontVariables = `${serif.variable} ${sans.variable} ${bold.variable}`;
