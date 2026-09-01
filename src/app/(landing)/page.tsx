import { HeroSection } from "@/components/landing/hero-section";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { SectorShowcaseHub } from "@/components/landing/sector-showcase-hub";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export default function LandingPage() {
  return (
    <main className="flex-1 overflow-x-hidden">
      {/* 1. Hero Section + Marquee Partenaires (Scroll 1) */}
      <HeroSection />
      <LogoMarquee />

      {/* 2. Hub Interactif 4 Secteurs (Événementiel, Restauration, E-Commerce, Hébergement RBNB) (Scroll 2-3) */}
      <SectorShowcaseHub />

      {/* 3. Grille Tarifaire Simplifiée & Infrastructure Mobile Money (Scroll 4) */}
      <PricingPreview />

      {/* 4. Questions Fréquentes & Conversion Finale (Scroll 5) */}
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}




