"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  UtensilsCrossed,
  ShoppingBag,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Calendar,
  Sparkles,
  QrCode,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SectorKey = "event" | "restaurant" | "shop" | "accommodation";

interface SectorData {
  id: SectorKey;
  label: string;
  badge: string;
  title: string;
  tagline: string;
  accentColor: string;
  icon: typeof Ticket;
  benefits: string[];
  metrics: { value: string; label: string }[];
  interactiveType: "event-scan" | "kds-order" | "shop-cart" | "stay-booking";
}

const SECTORS_DATA: Record<SectorKey, SectorData> = {
  event: {
    id: "event",
    label: "Événementiel",
    badge: "Anti-Fraude & Billetterie",
    title: "Vendez vos billets et contrôlez les entrées à la seconde",
    tagline:
      "Finis les faux billets et les pertes. Billetterie en ligne instantanée, QR codes cryptographiques infalsifiables et scan ultra-rapide hors-ligne.",
    accentColor: "from-amber-500/20 to-orange-500/20 border-orange-500/30 text-orange-400",
    icon: Ticket,
    benefits: [
      "QR code dynamique unique par billet avec signature HMAC",
      "Scanner PWA ultra-rapide utilisable même sans connexion Internet",
      "Catégories de places sur-mesure (Standard, VIP, Pass 2 Jours)",
      "Paiement Mobile Money direct et virement automatique",
    ],
    metrics: [
      { value: "< 1s", label: "Temps de scan par invité" },
      { value: "100%", label: "Protection anti-doublon" },
      { value: "2.5%", label: "Commission la plus basse" },
    ],
    interactiveType: "event-scan",
  },
  restaurant: {
    id: "restaurant",
    label: "Restauration",
    badge: "Menu QR & KDS Cuisine",
    title: "Prenez les commandes et synchronisez la cuisine en direct",
    tagline:
      "Vos clients scannent et commandent à table. Les bons partent instantanément sur l'écran cuisine sans aucun aller-retour serveur.",
    accentColor: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    icon: UtensilsCrossed,
    benefits: [
      "Menu digital interactif avec photos HD et modification de prix en 1 clic",
      "Écran cuisine KDS plein écran avec timer de préparation par plat",
      "Suivi précis des stocks et alertes automatiques avant rupture",
      "Encaissement à table via Mobile Money ou au comptoir",
    ],
    metrics: [
      { value: "+35%", label: "Rotation des tables" },
      { value: "-12 min", label: "Temps d'attente client" },
      { value: "0 papier", label: "Tickets 100% numériques" },
    ],
    interactiveType: "kds-order",
  },
  shop: {
    id: "shop",
    label: "E-Commerce",
    badge: "Boutique & Stocks",
    title: "Vendez en ligne avec paiement Mobile Money direct",
    tagline:
      "Transformez vos abonnés WhatsApp et réseaux sociaux en acheteurs réguliers avec une vitrine ultra-rapide et sécurisée.",
    accentColor: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    icon: ShoppingBag,
    benefits: [
      "Lien de boutique élégant partageable sur WhatsApp et Instagram",
      "Encaissement instantané Airtel Money & Moov Money sans intermédiaire",
      "Gestion des stocks en temps réel et alertes de réapprovisionnement",
      "Génération automatique des bordereaux de livraison",
    ],
    metrics: [
      { value: "3 clics", label: "Tunnel d'achat WhatsApp" },
      { value: "24/7", label: "Encaissement automatisé" },
      { value: "+40%", label: "Panier moyen constaté" },
    ],
    interactiveType: "shop-cart",
  },
  accommodation: {
    id: "accommodation",
    label: "Hébergement & RBNB",
    badge: "Nouveau • RBNB & Motels",
    title: "Gérez vos appartements meublés, réservations et reçus fiscaux",
    tagline:
      "Fini le carnet papier et les no-shows. Calendrier de disponibilité temps réel, acompte Mobile Money sécurisé et check-in digital.",
    accentColor: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
    icon: Building2,
    benefits: [
      "Calendrier intelligent synchronisé avec tarification dynamique weekend/saison",
      "Acompte Mobile Money (30%) obligatoire pour bloquer les dates sans no-show",
      "Génération automatique de reçus fiscaux certifiés avec signature PDF",
      "Check-in digital avec scan de pièce d'identité et état des lieux photos",
    ],
    metrics: [
      { value: "-90%", label: "De réservations perdues" },
      { value: "3%", label: "Commission vs 15-20% Airbnb" },
      { value: "100%", label: "Reçus conformes & traçables" },
    ],
    interactiveType: "stay-booking",
  },
};

export function SectorShowcaseHub() {
  const [activeTab, setActiveTab] = useState<SectorKey>("event");
  const sector = SECTORS_DATA[activeTab];

  return (
    <section id="secteurs" className="relative scroll-mt-20 py-16 sm:py-24 overflow-hidden bg-background">
      {/* Background glow tailored to active sector */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={`h-[450px] w-[650px] rounded-full blur-[140px] opacity-15 transition-all duration-700 ${
            activeTab === "event"
              ? "bg-amber-500"
              : activeTab === "restaurant"
              ? "bg-emerald-500"
              : activeTab === "shop"
              ? "bg-blue-500"
              : "bg-purple-500"
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>4 Secteurs Clés Réunis sur Giya</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Une seule plateforme adaptée aux réalités de votre métier
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Sélectionnez votre activité pour voir comment Giya simplifie vos encaissements et votre gestion quotidienne.
          </p>
        </div>

        {/* 4-Sector Pill Navigation Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-sm">
            {(Object.keys(SECTORS_DATA) as SectorKey[]).map((key) => {
              const item = SECTORS_DATA[key];
              const Icon = item.icon;
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSectorTab"
                      className="absolute inset-0 rounded-xl bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="size-4" />
                    {item.label}
                    {key === "accommodation" && (
                      <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-[10px] font-bold text-secondary uppercase">
                        Nouveau
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Sector Card & Simulator Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid gap-8 lg:grid-cols-12 items-stretch"
          >
            {/* Left: Value Proposition & Pain Points */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm backdrop-blur-sm">
              <div>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${sector.accentColor}`}>
                    <sector.icon className="size-6 text-foreground" />
                  </div>
                  <span className="text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-muted text-foreground">
                    {sector.badge}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  {sector.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {sector.tagline}
                </p>

                <div className="mt-6 space-y-3">
                  {sector.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-sm font-medium text-foreground/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Footer */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {sector.metrics.map((m, i) => (
                    <div key={i} className="text-center sm:text-left">
                      <p className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                        {m.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild className="rounded-xl bg-primary text-white font-medium shadow-md shadow-primary/20 hover:bg-primary/90">
                    <Link href={`/signup`}>
                      Créer un compte {sector.label}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl border-border">
                    <Link href="/login">Voir la démo</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Interactive Sector Mini-Simulator */}
            <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-muted/40 p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
              
              {activeTab === "event" && <EventSimulator />}
              {activeTab === "restaurant" && <RestaurantSimulator />}
              {activeTab === "shop" && <ShopSimulator />}
              {activeTab === "accommodation" && <AccommodationSimulator />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
 * 1. Event Simulator: Ticket Scan Verification & VIP Pass
 * ------------------------------------------------------------- */
function EventSimulator() {
  const [scanState, setScanState] = useState<"ready" | "scanned" | "fraud">("ready");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <QrCode className="size-3.5 text-primary" />
          Simulateur Contrôle d&apos;Entrée
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
          Portail 1 • VIP
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wide">
              FESTIVAL URBAN AFRO 2026
            </span>
            <h4 className="font-display text-lg font-bold text-foreground">Pass VIP All-Access</h4>
            <p className="text-xs text-muted-foreground">Titulaire : Marc Anthony M.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-foreground">#EVT-88392</span>
            <p className="text-[11px] text-emerald-500 font-semibold">Payé Airtel Money</p>
          </div>
        </div>

        {/* Scanner Simulation Result */}
        <div
          className={`rounded-xl p-4 border transition-all ${
            scanState === "ready"
              ? "border-dashed border-border bg-muted/50 text-center"
              : scanState === "scanned"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/50 bg-red-500/10 text-red-400"
          }`}
        >
          {scanState === "ready" && (
            <div className="py-2">
              <QrCode className="size-8 mx-auto text-muted-foreground animate-pulse mb-2" />
              <p className="text-xs font-medium text-foreground">Placez le billet sous le scanner</p>
              <p className="text-[11px] text-muted-foreground">Testez les boutons d&apos;action ci-dessous</p>
            </div>
          )}
          {scanState === "scanned" && (
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-8 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">BILLET VALIDE — ACCÈS AUTORISÉ</p>
                <p className="text-xs text-muted-foreground">Pass VIP • Emplacement Carré Or • Entrée enregistrée à l&apos;instant</p>
              </div>
            </div>
          )}
          {scanState === "fraud" && (
            <div className="flex items-center gap-3">
              <Zap className="size-8 text-red-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">ALERTE : BILLET DÉJÀ CONSOMMÉ</p>
                <p className="text-xs text-muted-foreground">Scanné il y a 4 min au Portail 2 • Tentative de duplication rejetée</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            onClick={() => setScanState("scanned")}
          >
            Scanner Billet Valide
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-xl text-xs font-semibold text-red-400 border-red-500/30 hover:bg-red-500/10"
            onClick={() => setScanState("fraud")}
          >
            Tester Détection Fraude
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={() => setScanState("ready")}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 2. Restaurant Simulator: Live Kitchen KDS Ticket
 * ------------------------------------------------------------- */
function RestaurantSimulator() {
  const [orderStatus, setOrderStatus] = useState<"PREPARING" | "READY" | "SERVED">("PREPARING");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Flame className="size-3.5 text-orange-400" />
          Écran Cuisine KDS en direct
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
          Table 04 • 2 Couverts
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="font-display text-base font-bold text-foreground">Commande #CMD-104</span>
            <p className="text-xs text-muted-foreground">Envoyée par QR Code Client</p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              orderStatus === "PREPARING"
                ? "bg-amber-500/20 text-amber-400 animate-pulse"
                : orderStatus === "READY"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {orderStatus === "PREPARING" ? "⏳ En Préparation (3 min)" : orderStatus === "READY" ? "✅ Prêt à Servir" : "📦 Livré"}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1">
            <span className="font-medium text-foreground">1× Poulet Nyembwe + Banane Plantain</span>
            <span className="font-mono text-xs text-muted-foreground">7 500 FCFA</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-medium text-foreground">1× Poisson Braisé Bar Entier (Piment doux)</span>
            <span className="font-mono text-xs text-muted-foreground">10 000 FCFA</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-medium text-foreground">2× Jus de Gingembre Ananas frais</span>
            <span className="font-mono text-xs text-muted-foreground">3 000 FCFA</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total : <strong className="text-foreground">20 500 FCFA</strong> (Moov Money)</span>
          <div className="flex gap-2">
            {orderStatus === "PREPARING" && (
              <Button
                size="sm"
                className="rounded-xl bg-primary text-white text-xs font-semibold"
                onClick={() => setOrderStatus("READY")}
              >
                Sonner Serveur (Prêt)
              </Button>
            )}
            {orderStatus === "READY" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-xs font-semibold"
                onClick={() => setOrderStatus("SERVED")}
              >
                Clôturer Ticket
              </Button>
            )}
            {orderStatus === "SERVED" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground"
                onClick={() => setOrderStatus("PREPARING")}
              >
                Relancer simulation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 3. Shop Simulator: Express WhatsApp Checkout
 * ------------------------------------------------------------- */
function ShopSimulator() {
  const [paid, setPaid] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Smartphone className="size-3.5 text-blue-400" />
          Tunnel d&apos;achat E-Commerce
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold">
          Stock Sync en temps réel
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-xl bg-muted flex items-center justify-center font-display font-bold text-xl text-primary border border-border">
            👟
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-semibold text-blue-400 uppercase">Sneakers Store LBV</span>
            <h4 className="font-display text-base font-bold text-foreground">Sneaker Edition Limitée Low</h4>
            <p className="text-xs text-muted-foreground">Taille 43 • Stock restant : 3 unités</p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-lg text-foreground">45 000 F</p>
            <p className="text-[11px] text-emerald-500 font-medium">Livraison 24h</p>
          </div>
        </div>

        {paid ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-1">
            <CheckCircle2 className="size-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-foreground">PAIEMENT AIRTEL MONEY VALIDÉ</p>
            <p className="text-[11px] text-muted-foreground">Bordereau #LIV-992 généré et envoyé au client par SMS</p>
            <Button
              size="sm"
              variant="ghost"
              className="text-[11px] h-7 text-primary mt-2"
              onClick={() => setPaid(false)}
            >
              Recommencer
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Moyen de règlement</span>
              <span className="font-semibold text-foreground">Airtel Money (Push USSD)</span>
            </div>
            <Button
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
              onClick={() => setPaid(true)}
            >
              Simuler Paiement Direct (45 000 FCFA)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 4. Accommodation Simulator: Instant Booking & Fiscal Receipt
 * ------------------------------------------------------------- */
function AccommodationSimulator() {
  const [reserved, setReserved] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Calendar className="size-3.5 text-purple-400" />
          Réservation Hébergement RBNB
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold">
          Acompte 30% Sécurisé
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
              RÉSIDENCES MBOLO • SABLIÈRE
            </span>
            <h4 className="font-display text-base font-bold text-foreground">Appartement F3 Vue Mer</h4>
            <p className="text-xs text-muted-foreground">Wifi fibre • Clim • Parking sécurisé</p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-base text-foreground">35 000 F <span className="text-xs font-normal text-muted-foreground">/nuit</span></p>
            <p className="text-[10px] text-muted-foreground">3 nuits = 105 000 F</p>
          </div>
        </div>

        {reserved ? (
          <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-purple-400" />
              <p className="text-xs font-bold text-foreground">RÉSERVATION CONFIRMÉE — REÇU FISCAL #REC-2026-0042</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Acompte de 31 500 FCFA (30%) encaissé. Reçu PDF horodaté conforme transmis au voyageur avec code d&apos;accès WiFi & QR Check-in.
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="text-[11px] h-7 text-purple-400"
              onClick={() => setReserved(false)}
            >
              Tester une autre date
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border">
                <span className="text-muted-foreground text-[10px] block">Arrivée</span>
                <span className="font-bold text-foreground">Vendredi 14h</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border">
                <span className="text-muted-foreground text-[10px] block">Départ</span>
                <span className="font-bold text-foreground">Lundi 12h (3 nuits)</span>
              </div>
            </div>
            <Button
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20"
              onClick={() => setReserved(true)}
            >
              Simuler Réservation & Acompte 30% (31 500 FCFA)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
