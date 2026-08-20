"use client";

import { motion } from "framer-motion";
import { UserPlus, QrCode, Smartphone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: "01",
    title: "Créez votre espace en 2 minutes",
    desc: "Choisissez votre secteur, renseignez le nom de votre établissement et obtenez immédiatement votre sous-domaine dédié gratuit (ex: monresto.lumina.ga).",
    icon: UserPlus,
    badge: "Sans carte bancaire",
  },
  {
    step: "02",
    title: "Ajoutez vos articles & Générez vos QR",
    desc: "Importez votre menu, vos billets d'événements ou vos produits. LUMINA génère automatiquement vos QR codes vectoriels prêts à imprimer pour vos tables ou affiches.",
    icon: QrCode,
    badge: "QR HD Imprimables",
  },
  {
    step: "03",
    title: "Encaissez & Pilotez en temps réel",
    desc: "Vos clients scannent et paient via Airtel Money ou Moov Money. Vos commandes arrivent instantanément en cuisine ou sur votre smartphone, avec suivi des stocks.",
    icon: Smartphone,
    badge: "Zéro délai de reversement",
  },
];

export function WorkflowSection() {
  return (
    <section id="features" className="relative py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Comment fonctionne LUMINA ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base text-muted-foreground sm:text-lg"
          >
            Passez de l&apos;informel au digital professionnel en trois étapes guidées et intuitives.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-xs transition-all hover:shadow-xl hover:border-primary/40 group"
              >
                <div>
                  {/* Top Step Pill & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-black text-primary/30 group-hover:text-primary transition-colors">
                      {step.step}
                    </span>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <Icon className="size-6" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-yellow-800 dark:text-secondary">
                      {step.badge}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-border/50 pt-4 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Étape vérifiée &bull; Prêt en production</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <Button asChild size="lg" className="rounded-full bg-primary px-8 text-white shadow-lg shadow-primary/25 hover:bg-primary/90">
            <Link href="/signup" className="flex items-center gap-2">
              <span>Démarrer l&apos;onboarding maintenant</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
