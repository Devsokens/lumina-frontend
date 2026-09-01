"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";


const FAQS = [
  {
    question: "Comment mes clients ou invités accèdent-ils à mes services ?",
    answer: "Vos clients n'ont AUCUNE application à télécharger. Ils scannent simplement votre QR code ou cliquent sur votre lien (monresto.giya.ga). Vos billets, menus, catalogues ou fiches d'hébergement s'ouvrent instantanément.",
  },
  {
    question: "Comment s'effectue l'encaissement via Airtel Money et Moov Money ?",
    answer: "Le client sélectionne son opérateur et valide via le prompt USSD sur son téléphone. Les fonds sont sécurisés instantanément et votre tableau de bord Giya met à jour les ventes en temps réel.",
  },
  {
    question: "Est-ce que Giya fonctionne en cas de coupure Internet ?",
    answer: "Oui ! Giya intègre la technologie PWA Offline-First. Si la connexion coupe, vous pouvez continuer à saisir les commandes et scanner les billets d'entrée. Dès que le réseau revient, tout est synchronisé sans aucune perte de données.",
  },
  {
    question: "Comment fonctionne l'anti-fraude billetterie ?",
    answer: "Chaque billet émis comporte un QR code cryptographique unique. Au scan avec l'application Giya, le billet est validé en moins de 1 seconde et marqué comme utilisé. Les captures d'écran et doublons sont rejetés immédiatement.",
  },
  {
    question: "Qu'en est-il du secteur Hébergement & RBNB ?",
    answer: "Giya gère vos appartements meublés et motels avec un calendrier en direct, l'encaissement d'acompte 30% Mobile Money anti-no-show, et l'émission automatique de reçus fiscaux certifiés avec signature électronique.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-16 lg:py-24 bg-muted/20 border-t border-border/70">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Questions fréquentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Tout ce que vous devez savoir pour démarrer sereinement avec Giya.
          </motion.p>
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-colors hover:border-primary/40"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-display text-base font-bold text-foreground sm:text-lg">
                    {faq.question}
                  </span>
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-300 ${isOpen ? "rotate-180 bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <ChevronDown className="size-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
