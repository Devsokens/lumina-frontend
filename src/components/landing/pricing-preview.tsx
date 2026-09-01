"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


const PLANS = [
  {
    name: "Démarrage (Free)",
    badge: "0 FCFA pour toujours",
    priceMonthly: 0,
    priceAnnual: 0,
    desc: "Idéal pour lancer son restaurant, tester son premier événement ou ouvrir sa boutique en ligne.",
    features: [
      "Sous-domaine offert (nom.giya.ga)",
      "Jusqu'à 50 commandes / billets / réservations par mois",
      "Génération illimitée de Menus, QR Codes & Reçus",
      "Paiement au comptoir & Mobile Money",
      "Écran KDS & Calendrier basique",
      "Mode PWA Hors-Ligne natif",
    ],
    cta: "Démarrer gratuitement",
    highlight: false,
    href: "/signup",
  },
  {
    name: "Pro & Croissance",
    badge: "Le plus populaire",
    priceMonthly: 15000,
    priceAnnual: 12000,
    desc: "Pour les restaurants actifs, organisateurs d'événements et commerçants cherchant la performance.",
    features: [
      "Tout ce qui est dans le plan Free",
      "Paiement Airtel Money & Moov Money intégré",
      "Commandes & Billets illimités",
      "Écrans KDS illimités (Cuisine + Bar + Four)",
      "Anti-fraude billetterie renforcé",
      "Gestion des stocks & alertes d'épuisement",
      "Assistant IA basique (descriptions & visuels)",
      "Export automatique Google Drive & Dropbox",
      "Support WhatsApp prioritaire 7j/7",
    ],
    cta: "Choisir le plan Pro",
    highlight: true,
    href: "/signup?plan=pro",
  },
  {
    name: "Entreprise & Réseau",
    badge: "Multi-sites",
    priceMonthly: 45000,
    priceAnnual: 38000,
    desc: "Pour les chaînes de restaurants, festivals majeurs (>2000 pers) et franchises commerciales.",
    features: [
      "Tout ce qui est dans le plan Pro",
      "Assistant IA avancé (chatbot, prévisions, recommandations)",
      "Multi-établissements & multi-caisses",
      "Accès API & intégration sur-mesure",
      "Formation de vos équipes sur site",
      "Nom de domaine personnalisé (.ga, .com)",
      "Account Manager dédié",
    ],
    cta: "Contacter l'équipe",
    highlight: false,
    href: "/signup?plan=enterprise",
  },
];

export function PricingPreview() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="tarifs" className="relative py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Démarrez à 0 FCFA, évoluez selon votre succès
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base text-muted-foreground sm:text-lg"
          >
            Aucun frais caché, aucun engagement. Vous ne payez que lorsque votre activité grandit.
          </motion.p>

          {/* Billing Switch */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Facturation Mensuelle
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-muted p-1 transition-colors hover:bg-muted/80"
              aria-label="Changer de période de facturation"
            >
              <span
                className={`inline-block size-5 rounded-full bg-primary transition-transform ${
                  isAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Facturation Annuelle <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">-20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan, idx) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                  plan.highlight
                    ? "border-2 border-primary bg-card shadow-2xl shadow-primary/10 glow-primary scale-105"
                    : "border border-border/80 bg-card shadow-xs hover:border-primary/40 hover:shadow-lg"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md">
                    Recommandé pour les PME
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {plan.badge}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {plan.desc}
                  </p>

                  <div className="mt-6 border-y border-border/60 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-4xl font-extrabold text-foreground">
                        {price.toLocaleString()}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">FCFA / mois</span>
                    </div>
                    {isAnnual && price > 0 && (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        Facturé annuellement (soit {(price * 12).toLocaleString()} FCFA/an)
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="mt-6 space-y-3 text-xs">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mt-0.5">
                          <Check className="size-2.5" />
                        </div>
                        <span className="text-foreground/90 font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    asChild
                    size="lg"
                    className={`w-full rounded-2xl font-semibold transition-all ${
                      plan.highlight
                        ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Link href={plan.href} className="flex items-center justify-center gap-2">
                      <span>{plan.cta}</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
