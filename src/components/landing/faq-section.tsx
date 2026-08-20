"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";


const FAQS = [
  {
    question: "Comment mes clients accèdent-ils à mon menu ou à mes billets ?",
    answer: "Vos clients n'ont AUCUNE application à télécharger. Ils scannent simplement votre QR code avec l'appareil photo de leur téléphone (Android ou iPhone) ou cliquent sur votre lien (monresto.lumina.ga). Votre menu ou catalogue s'ouvre instantanément en moins d'une seconde.",
  },
  {
    question: "Comment s'effectue l'encaissement via Airtel Money et Moov Money ?",
    answer: "Lors du paiement, le client sélectionne son opérateur (Airtel Money ou Moov Money) et saisit son numéro. Une notification de validation USSD s'affiche sur son téléphone pour confirmer le code PIN. Une fois validé, vous recevez les fonds directement et la commande passe automatiquement au statut 'Payé'.",
  },
  {
    question: "Est-ce que LUMINA fonctionne en cas de coupure Internet ?",
    answer: "Oui ! LUMINA est développé avec la technologie PWA Offline-First. Si la connexion Internet faiblit ou coupe à Libreville ou en province, vous pouvez continuer à saisir les commandes et scanner les billets d'entrée. Dès que la 4G/Wifi est rétablie, toutes les données sont automatiquement synchronisées.",
  },
  {
    question: "Comment le système anti-fraude de billetterie empêche-t-il les duplicatas ?",
    answer: "Chaque billet émis comporte une signature cryptographique unique. Lorsque le portier scanne le QR code avec l'application scanner PWA de LUMINA, le billet est instantanément marqué comme consommé en mémoire locale et sur le serveur. Toute tentative de présenter une capture d'écran ou une photocopie est immédiatement rejetée avec une alerte rouge.",
  },
  {
    question: "Puis-je exporter mes données de ventes et de clients ?",
    answer: "Absolument. Chez LUMINA, nous garantissons la souveraineté totale de vos données. Vous pouvez exporter vos rapports en PDF/CSV à tout moment, et même activer la synchronisation quotidienne automatique vers votre compte Google Drive ou Dropbox personnel.",
  },
  {
    question: "Combien de temps prend la mise en place de mon espace ?",
    answer: "Moins de 5 minutes chrono ! Vous vous inscrivez gratuitement, choisissez votre secteur (Restaurant, Événement, Boutique), entrez le nom de votre établissement, et votre plateforme est immédiatement opérationnelle avec vos QR codes prêts à imprimer.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-20 lg:py-28 bg-muted/20 border-t border-border/70">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Questions fréquemment posées
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base text-muted-foreground"
          >
            Tout ce que vous devez savoir pour démarrer sereinement avec LUMINA.
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
