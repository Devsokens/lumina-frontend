"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteAddressOffer } from "@/lib/tenant-url";

// Formules payantes affichées « Bientôt disponible » tant que le paiement des
// abonnements n'est pas ouvert (même réglage que Paramètres › Abonnement).
const PAID_OPEN = false;

const PLANS = [
  {
    name: "Démarrage (Free)",
    badge: "0 FCFA pour toujours",
    priceMonthly: 0,
    priceAnnual: 0,
    desc: "Idéal pour lancer son restaurant, tester son premier événement ou mettre en ligne son premier logement.",
    features: [
      siteAddressOffer(),
      "Jusqu'à 50 commandes / billets / réservations par mois",
      "Génération illimitée de Menus, QR Codes & Reçus",
      "Paiement au comptoir & Mobile Money",
      "Écran KDS & Calendrier basique",
      "Mode PWA Hors-Ligne natif",
    ],
    cta: "Démarrer gratuitement",
    highlight: !PAID_OPEN,
    href: "/signup",
  },
  {
    name: "Pro & Croissance",
    badge: "Le plus populaire",
    priceMonthly: 15000,
    priceAnnual: 12000,
    desc: "Pour les restaurants actifs, organisateurs d’événements et loueurs de meublés qui veulent aller plus loin.",
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
    highlight: PAID_OPEN,
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
            {PAID_OPEN
              ? "Aucun frais caché, aucun engagement. Vous ne payez que lorsque votre activité grandit."
              : "Lancez-vous gratuitement dès aujourd'hui. Les formules Pro et Entreprise arrivent très prochainement."}
          </motion.p>

          {/* Billing Switch : masquée tant que les formules payantes ne sont pas ouvertes. */}
          <div
            className={`mt-8 items-center justify-center gap-3 ${PAID_OPEN ? "flex" : "hidden"}`}
          >
            <span
              className={`text-sm font-medium ${!isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
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
            <span
              className={`text-sm font-medium ${isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              Facturation Annuelle{" "}
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                -20%
              </span>
            </span>
          </div>
        </div>

        {/* Cartes : mêmes dimensions fines que Paramètres › Abonnement
            (subscription-manager.tsx), étiquette en verre penchée en haut. */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {PLANS.map((plan, idx) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const soon = plan.priceMonthly > 0 && !PAID_OPEN;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.12 }}
                className={cn(
                  "group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200",
                  soon
                    ? "border-dashed border-border bg-muted/40"
                    : plan.highlight
                      ? "border-primary bg-card shadow-md ring-2 ring-primary/20"
                      : "border-border bg-card shadow-sm hover:border-foreground/20",
                )}
              >
                <GlassTag tone={soon ? "muted" : plan.highlight ? "primary" : "neutral"}>
                  {soon ? (
                    <>
                      <Clock className="size-3" /> Bientôt disponible
                    </>
                  ) : (
                    plan.badge
                  )}
                </GlassTag>

                <div className={cn(soon && "opacity-60 grayscale")}>
                  <h3 className="pr-24 text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 min-h-[32px] text-xs text-muted-foreground">{plan.desc}</p>

                  {/* Prix */}
                  <div className="mt-4 border-y border-border/60 py-3">
                    {soon ? (
                      <>
                        <div className="text-2xl font-extrabold text-foreground">Bientôt</div>
                        <div className="text-[11px] font-medium text-muted-foreground">Tarif communiqué à l&apos;ouverture</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-extrabold text-foreground">
                          {price.toLocaleString("fr-FR")} FCFA
                        </div>
                        <div className="text-[11px] font-medium text-muted-foreground">
                          {price === 0
                            ? "pour toujours"
                            : isAnnual
                              ? `par mois, facturé ${(price * 12).toLocaleString("fr-FR")} FCFA/an`
                              : "par mois"}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Fonctionnalités */}
                  <ul className="mt-5 flex flex-col gap-2.5 text-xs">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-foreground">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action */}
                <div className="mt-6 border-t border-border pt-4">
                  {soon ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-dashed border-border bg-background/60 py-2.5 text-xs font-semibold text-muted-foreground"
                    >
                      Bientôt disponible
                    </button>
                  ) : (
                    <Link
                      href={plan.href}
                      className={cn(
                        "flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors",
                        plan.highlight
                          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          : "border border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Étiquette en verre, légèrement penchée, posée à cheval sur le bord de la
// carte ; elle se redresse au survol de la carte.
function GlassTag({ tone, children }: { tone: "primary" | "neutral" | "muted"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "absolute -top-3.5 right-5 z-10 inline-flex rotate-[4deg] items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold",
        "bg-gradient-to-br shadow-[0_8px_20px_-8px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-white/50 backdrop-blur-md transition-transform duration-300 group-hover:rotate-0",
        "dark:ring-white/10",
        tone === "primary" && "border-primary/30 from-white/80 to-primary/20 text-primary dark:from-primary/30 dark:to-primary/10 dark:text-primary",
        tone === "neutral" && "border-white/70 from-white/85 to-white/40 text-foreground dark:border-white/15 dark:from-white/15 dark:to-white/5",
        tone === "muted" && "border-border from-white/80 to-white/40 text-muted-foreground dark:from-white/10 dark:to-white/5",
      )}
    >
      {children}
    </span>
  );
}
