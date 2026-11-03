"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
              Créez votre compte en 2 minutes, configurez vos billets, votre menu ou vos logements, et commencez à encaisser.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-11 rounded-full bg-secondary px-5 text-sm font-bold text-yellow-950 shadow-lg shadow-secondary/30 transition-all hover:scale-105 hover:bg-yellow-400 sm:h-12 sm:px-7 sm:text-base"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <span>Créer mon compte gratuit (0 FCFA)</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
