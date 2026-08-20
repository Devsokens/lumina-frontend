import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "0 FCFA",
    tagline: "Test, micro-activité",
    features: ["Vitrine publique", "10 produits", "1 événement/mois", "QR code"],
  },
  {
    name: "Starter",
    price: "15 000 FCFA/mois",
    tagline: "PME active",
    features: ["1 secteur complet", "Paiement intégré", "3 utilisateurs", "IA basique"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "35 000 FCFA/mois",
    tagline: "Croissance",
    features: ["Multi-secteurs", "Multi-utilisateurs", "IA avancée", "Domaine personnalisé"],
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Tarification</h1>
      <p className="mt-2 text-muted-foreground">
        Commencez gratuitement, évoluez selon votre croissance.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display">{plan.name}</CardTitle>
                {plan.highlighted && <Badge>Populaire</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              <p className="mt-2 text-2xl font-semibold">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full">Choisir {plan.name}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
