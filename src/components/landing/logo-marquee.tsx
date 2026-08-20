"use client";

import { motion } from "framer-motion";

interface Partner {
  name: string;
  category: string;
  logoText: string;
  badge?: string;
}

const PARTNERS: Partner[] = [
  { name: "Airtel Money", category: "Mobile Money", logoText: "airtel money" },
  { name: "Moov Africa", category: "Mobile Money", logoText: "moov money" },
  { name: "Paystack", category: "Passerelle Paiement", logoText: "paystack" },
  { name: "BGFIBank", category: "Banque Partenaire", logoText: "BGFIBank" },
  { name: "Visa", category: "Carte Bancaire", logoText: "VISA" },
  { name: "Mastercard", category: "Carte Bancaire", logoText: "mastercard" },
  { name: "CLIKPAY", category: "Agrégateur Gabon", logoText: "CLIKPAY" },
  { name: "Orabank", category: "Services Financiers", logoText: "ORABANK" },
  { name: "UBA", category: "Banque Panafricaine", logoText: "UBA" },
  { name: "Supabase", category: "Infrastructure Cloud", logoText: "supabase" },
];

export function LogoMarquee() {
  // Duplicate for infinite seamless scroll
  const duplicatedPartners = [...PARTNERS, ...PARTNERS];

  return (
    <section className="relative py-12 bg-background/50 border-b border-border/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Propulsé par les leaders financiers & technologiques d&apos;Afrique
        </motion.p>
      </div>

      {/* Marquee Container with Gradient Mask */}
      <div className="relative w-full overflow-hidden marquee-mask py-2">
        <div className="animate-marquee flex items-center gap-10 sm:gap-14 lg:gap-18">
          {duplicatedPartners.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="group flex items-center gap-2.5 shrink-0 opacity-65 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center rounded-xl border border-border/80 bg-card/60 px-4 py-2 shadow-xs group-hover:border-primary/40 group-hover:bg-card">
                <span className="font-display text-sm sm:text-base font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {partner.logoText}
                </span>
                <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {partner.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
