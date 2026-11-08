import type { Metadata } from "next";
import { PricingPreview } from "@/components/landing/pricing-preview";

export const metadata: Metadata = {
  title: "Tarifs · GiyaX",
  description: "Démarrez gratuitement avec GiyaX. Les formules Pro et Entreprise arrivent très prochainement.",
};

// Même présentation que la section « Tarifs » de la page d'accueil : une
// seule source pour les formules (components/landing/pricing-preview.tsx).
export default function PricingPage() {
  return (
    <main>
      <PricingPreview />
    </main>
  );
}
