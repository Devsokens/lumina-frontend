"use client";

import { motion } from "framer-motion";
import {
  Utensils,
  Ticket,
  ShoppingBag,
  WifiOff,
  Check,
  ArrowUpRight,
  ChefHat,
  Sparkles
} from "lucide-react";
import Link from "next/link";


export function BentoSectors() {
  return (
    <section id="secteurs" className="relative py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Trois secteurs, une seule plateforme puissante
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base text-muted-foreground sm:text-lg"
          >
            Chaque secteur bénéficie d&apos;outils taillés sur mesure pour éliminer les pertes, accélérer le service et maximiser le chiffre d&apos;affaires.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          {/* Bento Card 1: Restauration (Spans 2 cols on tablet/desktop for high impact) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/50 md:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Utensils className="size-6" />
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
                Smart Dining & Bar
              </span>
            </div>

            <div className="mt-6">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Restauration, Bars & Lounges
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xl">
                Transformez l&apos;expérience de vos clients avec des menus QR sans contact, une prise de commande fluide et un écran cuisine (KDS) synchronisé à la milliseconde.
              </p>
            </div>

            {/* Feature List */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">QR codes personnalisés par numéro de table</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Écran cuisine KDS avec alertes sonores & statut</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Décrémentation de stock en temps réel</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Additions partagées & paiement Mobile Money</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-yellow-700 dark:text-secondary mt-0.5">
                  <Sparkles className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Descriptions de plats générées par IA en un clic</span>
              </div>
            </div>

            {/* Bottom visual accent */}
            <div className="mt-8 rounded-2xl border border-border/70 bg-muted/40 p-4 font-mono text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ChefHat className="size-4 text-primary" />
                <span>Temps de transmission moyen : &lt;200ms</span>
              </span>
              <span className="text-primary font-semibold font-sans">99.4% de satisfaction</span>
            </div>
          </motion.div>

          {/* Bento Card 2: Offline-First & PWA */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-950/10 p-8 shadow-sm transition-all hover:shadow-xl hover:border-emerald-500/50"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <WifiOff className="size-6" />
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Offline-First
                </span>
              </div>

              <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                Résilience Hors-Ligne (PWA)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Conçu spécialement pour résister aux coupures de réseau. Les menus, tickets et commandes restent accessibles et se synchronisent dès la reconnexion.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-mono text-emerald-800 dark:text-emerald-300">
              ✓ Cache intelligent IndexedDB<br />
              ✓ Zéro interruption de service<br />
              ✓ Application PWA légère (&lt; 2 Mo)
            </div>
          </motion.div>

          {/* Bento Card 3: Événementiel & Billetterie */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-secondary/50"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/20 text-yellow-700 dark:text-secondary">
                  <Ticket className="size-6" />
                </div>
                <span className="rounded-full bg-secondary/20 px-3 py-1 font-mono text-xs font-semibold text-yellow-800 dark:text-secondary">
                  Anti-Fraude
                </span>
              </div>

              <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                Événements & Billetterie
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Éliminez définitivement la fraude de billets. Génération de pass QR cryptés et scanner d&apos;entrée ultra-rapide fonctionnant sans Internet.
              </p>
            </div>

            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-secondary shrink-0" />
                <span>Scan ultra-rapide (&lt;0.3s par visiteur)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-secondary shrink-0" />
                <span>Anti-duplicata matériel instantané</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-secondary shrink-0" />
                <span>Billets envoyés par WhatsApp & PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-secondary shrink-0" />
                <span>Titre, description & visuel d&apos;affiche générés par IA</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 4: Commerce & Retail (Spans 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-accent/50 md:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent dark:text-blue-400">
                <ShoppingBag className="size-6" />
              </div>
              <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-semibold text-accent dark:text-blue-400">
                Social Commerce
              </span>
            </div>

            <div className="mt-6">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Boutiques, Mode & Commerce de Détail
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xl">
                Passez de la vente informelle sur WhatsApp à une vraie vitrine e-commerce professionnelle sous votre propre sous-domaine avec encaissement Mobile Money direct.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent dark:text-blue-400 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Sous-domaine dédié gratuit (ex: nom.lumina.ga)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent dark:text-blue-400 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Paiement Airtel Money & Moov Money instantané</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent dark:text-blue-400 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Partage direct de produits sur WhatsApp & Instagram</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent dark:text-blue-400 mt-0.5">
                  <Check className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Suivi des livraisons et stocks d&apos;articles</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-yellow-700 dark:text-secondary mt-0.5">
                  <Sparkles className="size-3" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Fiches produits (texte & visuel) générées par IA</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <span>Créer ma boutique</span>
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
