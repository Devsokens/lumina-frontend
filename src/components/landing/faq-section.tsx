"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicSiteLabel } from "@/lib/tenant-url";

const FAQS = [
  {
    question: "Comment mes clients accèdent-ils à mes services ?",
    answer:
      `Vos clients n'ont aucune application à télécharger. Ils scannent votre QR code ou ouvrent votre lien (${publicSiteLabel("monactivite")}) : vos billets, votre menu ou vos logements s'affichent aussitôt sur leur téléphone.`,
  },
  {
    question: "Comment s'effectue l'encaissement via Airtel Money et Moov Money ?",
    answer:
      "Le client choisit son opérateur et valide le paiement sur son téléphone. Le paiement est confirmé automatiquement et votre tableau de bord GiyaX se met à jour en temps réel.",
  },
  {
    question: "Est-ce que GiyaX fonctionne en cas de coupure Internet ?",
    answer:
      "Le contrôle d'entrée continue de fonctionner hors connexion : les billets scannés sont vérifiés sur place puis synchronisés dès que le réseau revient, sans perte de données.",
  },
  {
    question: "Comment fonctionne l'anti-fraude de la billetterie ?",
    answer:
      "Chaque billet comporte un QR code unique. Au scan, il est validé en moins d'une seconde et marqué comme utilisé : une capture d'écran ou un doublon est refusé immédiatement.",
  },
  {
    question: "Que propose GiyaX pour les logements RBNB ?",
    answer:
      "Un calendrier de disponibilités en direct pour tous vos meublés, la réservation et le paiement en ligne par vos voyageurs, et des reçus et factures générés automatiquement.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative border-t border-border/70 bg-muted/25 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-8">
        {/* Photo (gauche) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative order-2 lg:sticky lg:top-28 lg:order-1"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-2xl shadow-primary/15 sm:aspect-[16/10] lg:aspect-[4/5]">
            <Image
              src="/images/landing/faq.jpg"
              alt="Une cliente sourit en consultant son téléphone"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
          {/* Liseré or, rappel du X du logo */}
          <div aria-hidden="true" className="absolute -bottom-3 -right-3 -z-10 hidden size-40 rounded-[1.75rem] bg-secondary/70 lg:block" />
        </motion.div>

        {/* Questions (droite) */}
        <div className="order-1 lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Tout ce que vous devez savoir pour démarrer sereinement avec GiyaX.
          </p>

          <div className="mt-8 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.question}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-card transition-colors",
                    isOpen ? "border-primary/40 shadow-md shadow-primary/5" : "border-border/80 hover:border-primary/30",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${idx}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${idx}`}
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                    >
                      <span className="font-display text-base font-semibold text-foreground sm:text-lg">
                        {faq.question}
                      </span>
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                          isOpen ? "rotate-180 bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <ChevronDown className="size-4" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-a-${idx}`}
                        role="region"
                        aria-labelledby={`faq-q-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
