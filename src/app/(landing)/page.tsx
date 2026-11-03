import { HeroSection } from "@/components/landing/hero-section";
import { ClientLogos } from "@/components/landing/client-logos";
import { SectorShowcaseHub } from "@/components/landing/sector-showcase-hub";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export default function LandingPage() {
  return (
    <main className="flex-1 overflow-x-clip">
      {/* 1. Hero + film de présentation */}
      <HeroSection />
      {/* 2. Ils utilisent GiyaX : logos des clients (#clients) */}
      <ClientLogos />
      {/* 3. Secteurs : Événementiel, Restauration, RBNB (#secteurs) */}
      <SectorShowcaseHub />
      {/* 4. Tarifs (#tarifs) */}
      <PricingPreview />
      {/* 5. Questions fréquentes (#faq) + appel final */}
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
