"use client";

import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";


const TESTIMONIALS = [
  {
    name: "Jean-Paul Mba",
    role: "Propriétaire de Restaurant & Lounge",
    location: "Libreville, Gabon",
    quote: "Le système de commande QR par table a divisé par trois le temps d'attente lors des rushs du week-end. L'écran cuisine KDS synchronisé en direct a totalement éliminé les erreurs de commande de nos serveurs.",
    rating: 5,
    sector: "Restauration",
  },
  {
    name: "Christelle Koumba",
    role: "Directrice d'Agence Événementielle",
    location: "Port-Gentil, Gabon",
    quote: "La billetterie anti-fraude a changé nos événements. Plus aucun billet faux ou dupliqué à l'entrée. Le scanner PWA sur téléphone fonctionne même quand le réseau 4G est saturé devant la salle.",
    rating: 5,
    sector: "Événementiel",
  },
  {
    name: "Yannick Ndong",
    role: "Fondateur de Concept Store Mode",
    location: "Libreville, Gabon",
    quote: "Je vendais uniquement sur WhatsApp sans traçabilité. Avec ma boutique LUMINA, mes clients sélectionnent leurs articles et paient directement via Airtel Money. C'est propre, rapide et rassurant pour mes acheteurs.",
    rating: 5,
    sector: "Boutique & Retail",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-20 lg:py-28 bg-muted/20 border-t border-border/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Adopté par les entrepreneurs qui font bouger le secteur
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base text-muted-foreground sm:text-lg"
          >
            Découvrez comment LUMINA transforme au quotidien la gestion et la rentabilité de leurs établissements.
          </motion.p>
        </div>

        {/* Reviews Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-xs transition-all hover:shadow-xl hover:border-primary/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-secondary">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-secondary" />
                    ))}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                    {item.sector}
                  </span>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-foreground/90 italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-8 border-t border-border/60 pt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-bold text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                  <p className="text-[11px] font-mono text-primary font-medium">{item.location}</p>
                </div>
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-4.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
