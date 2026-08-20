import { HeroSection } from "@/components/landing/hero-section";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { StatsTicker } from "@/components/landing/stats-ticker";
import { CurvedShowcase } from "@/components/landing/curved-showcase";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { BentoSectors } from "@/components/landing/bento-sectors";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { WhyLuminaSection } from "@/components/landing/why-lumina-section";
import { PaymentPwaSection } from "@/components/landing/payment-pwa-section";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export default function LandingPage() {
  return (
    <main className="flex-1 overflow-x-hidden">
      {/* 1. Hero Section with Glow, CTAs & Floating Live Cards */}
      <HeroSection />

      {/* 2. Infinite Partner & Payment Provider Auto-Scroll Marquee */}
      <LogoMarquee />

      {/* 3. Key Metrics & Speed Ticker */}
      <StatsTicker />

      {/* 4. 3D Arc Curved Mockups Showcase (Dribbble Fan Animation) */}
      <CurvedShowcase />

      {/* 5. Interactive Hands-on Demo (Restaurant KDS / Event Ticket Scan / Mobile Money Shop) */}
      <InteractiveDemo />

      {/* 6. Bento Grid Sector Deep-Dive & PWA Offline Advantages */}
      <BentoSectors />

      {/* 7. 3-Step Guided Workflow */}
      <WorkflowSection />

      {/* 7bis. Why LUMINA - Auto-Rotating Differentiators Showcase */}
      <WhyLuminaSection />

      {/* 8. Payment Infrastructure (Airtel & Moov Money) & Offline Resilience */}
      <PaymentPwaSection />

      {/* 9. Interactive ROI & Financial Impact Calculator */}
      <RoiCalculator />

      {/* 10. Verified Customer Testimonials & Social Proof */}
      <TestimonialsSection />

      {/* 11. Freemium to Scale Pricing Grid */}
      <PricingPreview />

      {/* 12. Frequently Asked Questions Accordion */}
      <FaqSection />

      {/* 13. Final High-Impact Conversion Banner */}
      <FinalCtaSection />
    </main>
  );
}



