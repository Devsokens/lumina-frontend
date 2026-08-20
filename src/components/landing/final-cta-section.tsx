"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0a382c] to-[#041a14] p-8 text-center text-white shadow-2xl glow-primary sm:p-14 lg:p-20"
        >
          {/* Ambient Lighting Background Accents */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            {/* Title */}
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Prêt à digitaliser votre activité dès aujourd&apos;hui ?
            </h2>

            {/* Subtitle */}
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-xl">
              Créez votre compte en 2 minutes, configurez vos menus, billets ou articles, et commencez à encaisser par Mobile Money.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-14 rounded-full bg-secondary px-8 text-base font-bold text-yellow-950 shadow-xl shadow-secondary/30 transition-all hover:bg-yellow-400 hover:scale-105"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <span>Créer mon compte gratuit (0 FCFA)</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-white/30 bg-white/10 px-7 text-base font-medium text-white backdrop-blur-md hover:bg-white/20"
              >
                <a href="#demo" className="flex items-center gap-2">
                  <Zap className="size-4 text-secondary" />
                  <span>Revoir la démo interactive</span>
                </a>
              </Button>
            </div>

            {/* Micro guarantees */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-secondary" />
                <span>Aucune carte bancaire requise</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-secondary" />
                <span>Sécurité certifiée TLS 1.3</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-secondary" />
                <span>Sous-domaine offert à vie</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
