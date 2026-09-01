"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Utensils,
  Ticket,
  ShoppingBag,
  TrendingUp,
  QrCode
} from "lucide-react";


export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[550px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-secondary/15 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 -z-10 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Main Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:leading-[1.1]"
          >
            Digitalisez votre activité en{" "}
            <span className="relative whitespace-nowrap">
              <span className="bg-gradient-to-r from-primary via-emerald-600 to-secondary bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-secondary">
                5 minutes chrono
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-secondary/70"
                viewBox="0 0 250 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9C60 3 190 3 247 9"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            La plateforme tout-en-un pour les <strong>Événements</strong>, <strong>Restaurants</strong>, <strong>Commerces</strong> et <strong>Hébergements RBNB</strong>. 
            Billetterie anti-fraude, menus QR & KDS, réservations meublés et paiements directs <strong>Airtel & Moov Money</strong>.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="group h-13 rounded-full bg-primary px-8 text-base font-semibold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50 hover:scale-[1.02]"
            >
              <Link href="/signup" className="flex items-center gap-2">
                <span>Créer mon compte Giya gratuit</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 rounded-full border-border/80 bg-card/60 px-7 text-base font-medium backdrop-blur-md hover:bg-card hover:border-primary/50"
            >
              <a href="#secteurs" className="flex items-center gap-2">
                <span>Explorer les 4 secteurs</span>
              </a>
            </Button>
          </motion.div>

          {/* Trust Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>0 FCFA pour démarrer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sous-domaine offert (nom.giya.ga)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>PWA Offline (Fonctionne sans Internet)</span>
            </div>
          </motion.div>

        </div>

        {/* Hero Visual Mockup with Floating HUD Badges */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative mx-auto mt-14 max-w-5xl"
        >
          {/* Main Mockup Container */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/70 p-3 shadow-2xl backdrop-blur-xl sm:p-4 glow-primary">
            {/* Top Bar Mockup Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 px-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-400/80" />
                <span className="size-3 rounded-full bg-yellow-400/80" />
                <span className="size-3 rounded-full bg-green-400/80" />
                <span className="ml-3 rounded-md bg-muted/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                  https://festival-urban.giya.ga
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline font-mono">Giya Realtime Sync (10ms)</span>
              </div>
            </div>

            {/* Inner Interactive Product Teaser Grid */}
            <div className="grid gap-4 p-3 sm:grid-cols-4 sm:p-5">
              {/* Sector 1: Event */}
              <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-background/80 p-4 transition-all hover:border-amber-500/50 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                    <Ticket className="size-4.5" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-500">
                    Anti-Fraude
                  </span>
                </div>
                <h4 className="mt-3 font-display font-semibold text-foreground text-sm">Événements</h4>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">Billetterie & scan PWA à la seconde.</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] font-mono text-muted-foreground">
                  <span>Pass VIP</span>
                  <span className="font-semibold text-emerald-500">Scanné ✓</span>
                </div>
              </div>

              {/* Sector 2: Restaurant */}
              <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-background/80 p-4 transition-all hover:border-emerald-500/50 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                    <Utensils className="size-4.5" />
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-500">
                    KDS Cuisine
                  </span>
                </div>
                <h4 className="mt-3 font-display font-semibold text-foreground text-sm">Restauration</h4>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">Menu QR dynamique & bons cuisine.</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] font-mono text-muted-foreground">
                  <span>Table #04</span>
                  <span className="font-semibold text-foreground">18 500 F</span>
                </div>
              </div>

              {/* Sector 3: Shop */}
              <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-background/80 p-4 transition-all hover:border-blue-500/50 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600">
                    <ShoppingBag className="size-4.5" />
                  </div>
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-500">
                    Moov/Airtel
                  </span>
                </div>
                <h4 className="mt-3 font-display font-semibold text-foreground text-sm">E-Commerce</h4>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">Boutique WhatsApp & stocks sync.</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] font-mono text-muted-foreground">
                  <span>Paiement</span>
                  <span className="font-semibold text-foreground">Direct</span>
                </div>
              </div>

              {/* Sector 4: Accommodation */}
              <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-background/80 p-4 transition-all hover:border-purple-500/50 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600">
                    <QrCode className="size-4.5" />
                  </div>
                  <span className="rounded-full bg-purple-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-purple-400">
                    RBNB
                  </span>
                </div>
                <h4 className="mt-3 font-display font-semibold text-foreground text-sm">Hébergement</h4>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">Calendrier & reçu fiscal certifié.</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] font-mono text-muted-foreground">
                  <span>Acompte 30%</span>
                  <span className="font-semibold text-purple-400">Validé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Live Badge 1 (Top Right) */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-6 -right-4 hidden rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md sm:flex items-center gap-3"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <TrendingUp className="size-5" />
            </div>
            <div className="text-left">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ventes en direct</p>
              <p className="font-mono text-sm font-bold text-foreground">+342 000 FCFA <span className="text-emerald-500 font-sans text-xs">(Aujourd&apos;hui)</span></p>
            </div>
          </motion.div>

          {/* Floating Live Badge 2 (Bottom Left) */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-6 -left-4 hidden rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md sm:flex items-center gap-3"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <QrCode className="size-5" />
            </div>
            <div className="text-left">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Scan PWA Natif</p>
              <p className="font-mono text-xs font-semibold text-foreground">Validation instantanée hors-ligne</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
