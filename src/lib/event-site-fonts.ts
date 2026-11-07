import { Bricolage_Grotesque, Fraunces, Geist, Geist_Mono, Manrope, Unbounded } from "next/font/google";

// Polices du site vitrine événementiel (modèles Nuit et Lumière, refonte
// 2026-11) : site public et aperçu de l'éditeur. preload: false : seule la
// typographie choisie par l'organisateur est téléchargée.
// Axe « opsz » : lettres plus serrées en très grand corps, comme la maquette.
const bricolage = Bricolage_Grotesque({ variable: "--font-es-bricolage", subsets: ["latin"], axes: ["opsz"], preload: false });
const manrope = Manrope({ variable: "--font-es-manrope", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], preload: false });
const fraunces = Fraunces({ variable: "--font-es-fraunces", subsets: ["latin"], weight: ["500", "600", "700", "800"], preload: false });
const unbounded = Unbounded({ variable: "--font-es-unbounded", subsets: ["latin"], weight: ["500", "700", "800"], preload: false });
const geist = Geist({ variable: "--font-es-geist", subsets: ["latin"], weight: ["400", "500", "600", "700"], preload: false });
const geistMono = Geist_Mono({ variable: "--font-es-geist-mono", subsets: ["latin"], weight: ["500"], preload: false });

export const eventSiteFontVariables = [bricolage, manrope, fraunces, unbounded, geist, geistMono].map((f) => f.variable).join(" ");
