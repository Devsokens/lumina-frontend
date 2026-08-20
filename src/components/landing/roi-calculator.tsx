"use client";

import { useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


export function RoiCalculator() {
  const [ordersPerDay, setOrdersPerDay] = useState(35);
  const [avgTicket, setAvgTicket] = useState(7500);

  // Estimations
  const monthlyRevenue = ordersPerDay * avgTicket * 30;
  const estimatedFraudSaved = Math.round(monthlyRevenue * 0.08); // 8% lost in errors/manual leakage
  const timeSavedHours = Math.round(ordersPerDay * 0.15 * 30); // ~15 mins saved per order batch

  return (
    <section className="relative py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl backdrop-blur-xl lg:p-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Sliders */}
            <div className="lg:col-span-6">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Calculez le gain pour votre établissement
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ajustez votre volume d&apos;activité quotidien pour estimer vos gains en traçabilité et en temps.
              </p>

              {/* Slider 1: Orders per day */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>Commandes ou Billets / jour</span>
                  <span className="font-mono text-primary font-bold text-lg">{ordersPerDay}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={ordersPerDay}
                  onChange={(e) => setOrdersPerDay(Number(e.target.value))}
                  className="mt-3 w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground mt-1">
                  <span>5 / jour</span>
                  <span>100 / jour</span>
                  <span>200+ / jour</span>
                </div>
              </div>

              {/* Slider 2: Average ticket */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>Panier moyen par commande / billet</span>
                  <span className="font-mono text-primary font-bold text-lg">{avgTicket.toLocaleString()} FCFA</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="35000"
                  step="500"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="mt-3 w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground mt-1">
                  <span>2 000 FCFA</span>
                  <span>15 000 FCFA</span>
                  <span>35 000+ FCFA</span>
                </div>
              </div>
            </div>

            {/* Right Column: Calculated Impact */}
            <div className="lg:col-span-6 rounded-2xl border border-primary/20 bg-background/80 p-6 shadow-inner">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-xs uppercase text-muted-foreground">Impact mensuel estimé</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="size-3.5" /> Croissance accélérée
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">Chiffre d&apos;affaires mensuel</p>
                  <p className="mt-1 font-mono text-xl font-extrabold text-foreground sm:text-2xl">
                    {monthlyRevenue.toLocaleString()} <span className="text-xs font-normal">FCFA</span>
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">Pertes évitées (Anti-fraude)</p>
                  <p className="mt-1 font-mono text-xl font-extrabold text-emerald-700 dark:text-emerald-400 sm:text-2xl">
                    +{estimatedFraudSaved.toLocaleString()} <span className="text-xs font-normal">FCFA/mois</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary/10 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-yellow-900 dark:text-secondary">Temps administratif économisé</p>
                  <p className="text-xs text-muted-foreground">Moins d&apos;erreurs de caisse et de saisie</p>
                </div>
                <span className="font-mono text-xl font-extrabold text-yellow-900 dark:text-secondary">
                  ~{timeSavedHours}h <span className="text-xs font-normal">/ mois</span>
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Prêt à rentabiliser votre activité ?</span>
                <Button asChild size="sm" className="rounded-full bg-primary text-white hover:bg-primary/90">
                  <Link href="/signup" className="flex items-center gap-1.5">
                    <span>Créer mon compte</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
