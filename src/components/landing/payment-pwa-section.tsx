"use client";

import { motion } from "framer-motion";
import { Smartphone, WifiOff, CheckCircle, Database } from "lucide-react";


export function PaymentPwaSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-muted/20 border-y border-border/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              Conçu pour l&apos;Afrique : Mobile Money & Mode Hors-Ligne
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Nous savons que les coupures Internet et les terminaux de paiement coûteux freinent votre croissance. 
              LUMINA intègre les solutions de paiement que vos clients utilisent chaque jour et fonctionne même en zone blanche.
            </motion.p>

            {/* Value bullets */}
            <div className="mt-8 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="flex items-start gap-3.5"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Smartphone className="size-4.5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">Airtel Money & Moov Money sans intermédiaire</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Encaissez directement par push USSD sur le téléphone du client en quelques secondes.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3.5"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-yellow-800 dark:text-secondary">
                  <WifiOff className="size-4.5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">Architecture PWA Offline-First</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Les serveurs peuvent continuer à prendre les commandes et scanner les billets même sans connexion 4G/Wifi.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                className="flex items-start gap-3.5"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Database className="size-4.5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">Souveraineté des Données & Export Automatique</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Sauvegarde quotidienne et automatique de vos ventes et catalogues directement sur votre Google Drive ou Dropbox personnel.</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Showcase Card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            >
              {/* Payment Brand Logos Bar */}
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <span className="font-mono text-xs font-bold uppercase text-muted-foreground">Moyens de paiement acceptés</span>
                <span className="flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="size-3.5" /> 100% Vérifié
                </span>
              </div>

              {/* Badges Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                  <span className="font-mono text-base font-black text-red-600 dark:text-red-400">airtel</span>
                  <span className="text-[11px] font-semibold text-foreground mt-1">Airtel Money</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
                  <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400">moov</span>
                  <span className="text-[11px] font-semibold text-foreground mt-1">Moov Money</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/40 p-4 text-center col-span-2 sm:col-span-1">
                  <span className="font-mono text-base font-black text-primary">VISA / MC</span>
                  <span className="text-[11px] font-semibold text-foreground mt-1">Cartes bancaires</span>
                </div>
              </div>

              {/* Offline Sync Live Indicator */}
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">Synchronisation Automatique PWA</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Actif</span>
                </div>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  En cas de coupure de courant ou de fibre à Libreville ou à l&apos;intérieur du pays, le système stocke localement les scans et commandes. Dès que le réseau revient, tout est réconcilié automatiquement sans perte ni doublon.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
