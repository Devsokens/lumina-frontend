"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  QrCode,
  Lock,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useShowcaseStore, type TicketTier } from "@/stores/useShowcaseStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ShowcaseCanvas() {
  const {
    theme,
    fontFamily,
    deviceView,
    isEditingInline,
    siteTitle,
    heroHeadline,
    heroSubheadline,
    eventDate,
    eventTime,
    eventLocation,
    ctaText,
    coverImageUrl,
    whatsappNumber,
    instagramHandle,
    tickets,
    artists,
    updateField,
  } = useShowcaseStore();

  // State for simulated ticket purchasing
  const [selectedTicket, setSelectedTicket] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [phoneBuyer, setPhoneBuyer] = useState("077 12 34 56");
  const [nameBuyer, setNameBuyer] = useState("Jean-Marc Obiang");
  const [operator, setOperator] = useState<"AIRTEL" | "MOOV">("AIRTEL");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Theme styling helpers
  const getThemeColors = () => {
    switch (theme) {
      case "emerald":
        return {
          primary: "bg-emerald-600 hover:bg-emerald-500 text-white",
          primaryText: "text-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          glow: "from-emerald-600/30 to-teal-900/40",
          accentBorder: "border-emerald-500/40",
        };
      case "electric":
        return {
          primary: "bg-cyan-500 hover:bg-cyan-400 text-black font-bold",
          primaryText: "text-cyan-400",
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
          glow: "from-cyan-600/30 to-blue-900/40",
          accentBorder: "border-cyan-500/40",
        };
      case "ruby":
        return {
          primary: "bg-rose-600 hover:bg-rose-500 text-white",
          primaryText: "text-rose-400",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          glow: "from-rose-600/30 to-purple-900/40",
          accentBorder: "border-rose-500/40",
        };
      case "dark":
        return {
          primary: "bg-white hover:bg-zinc-200 text-black font-bold",
          primaryText: "text-zinc-300",
          badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
          glow: "from-zinc-800/40 to-black/80",
          accentBorder: "border-zinc-700",
        };
      case "amber":
      default:
        return {
          primary: "bg-amber-500 hover:bg-amber-400 text-black font-bold",
          primaryText: "text-amber-400",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          glow: "from-amber-600/30 to-orange-950/50",
          accentBorder: "border-amber-500/40",
        };
    }
  };

  const themeColors = getThemeColors();

  function handleBuyClick(ticket: TicketTier) {
    setSelectedTicket(ticket);
    setQuantity(1);
    setIsPaymentSuccess(false);
    setIsCheckoutOpen(true);
  }

  function handleSimulatePayment() {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentSuccess(true);
      toast.success("Paiement Mobile Money validé ! Billet QR généré.");
    }, 1500);
  }

  // Device width wrapper
  const containerWidthClass =
    deviceView === "mobile"
      ? "max-w-[390px] min-h-[750px] shadow-2xl rounded-[40px] border-8 border-zinc-800"
      : deviceView === "tablet"
      ? "max-w-[768px] min-h-[850px] shadow-2xl rounded-3xl border-4 border-zinc-800"
      : "w-full rounded-2xl shadow-xl border border-border";

  return (
    <div className="flex justify-center overflow-x-auto p-2 sm:p-4 bg-muted/30 rounded-3xl">
      <div
        className={`relative overflow-hidden bg-[#090b0e] text-white transition-all duration-300 ${containerWidthClass}`}
        style={{ fontFamily }}
      >
        {/* Device Top Speaker Notch for Mobile */}
        {deviceView === "mobile" && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 bg-zinc-800 rounded-full z-50 pointer-events-none" />
        )}

        {/* 1. Public Storefront Navbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#090b0e]/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            {isEditingInline ? (
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => updateField("siteTitle", e.target.value)}
                className="bg-transparent font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-white border-b border-dashed border-sky-400 focus:outline-none focus:bg-white/10 px-1 rounded"
                title="Cliquer pour éditer le nom"
              />
            ) : (
              <span className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                {siteTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <MessageCircle className="size-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </header>

        {/* 2. Hero Section with Festival Flyer Backdrop */}
        <section className="relative overflow-hidden px-4 py-12 sm:px-8 sm:py-16">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs"
            style={{ backgroundImage: `url(${coverImageUrl})` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${themeColors.glow} to-[#090b0e]`} />

          <div className="relative z-10 mx-auto max-w-2xl text-center space-y-4">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Billetterie Officielle Giya</span>
            </div>

            {/* Editable Hero Headline */}
            {isEditingInline ? (
              <textarea
                value={heroHeadline}
                onChange={(e) => updateField("heroHeadline", e.target.value)}
                rows={2}
                className="w-full text-center bg-transparent font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white border-2 border-dashed border-sky-400/80 rounded-xl p-2 focus:outline-none focus:bg-white/10"
                title="Cliquez pour éditer le grand titre"
              />
            ) : (
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {heroHeadline}
              </h1>
            )}

            {/* Editable Subtitle */}
            {isEditingInline ? (
              <textarea
                value={heroSubheadline}
                onChange={(e) => updateField("heroSubheadline", e.target.value)}
                rows={2}
                className="w-full text-center bg-transparent text-xs sm:text-sm text-zinc-300 border-2 border-dashed border-sky-400/80 rounded-xl p-2 focus:outline-none focus:bg-white/10"
                title="Cliquez pour éditer le sous-titre"
              />
            ) : (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl mx-auto">
                {heroSubheadline}
              </p>
            )}

            {/* Event Key Details Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-zinc-200">
              <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                <Calendar className="size-4 text-primary" />
                {isEditingInline ? (
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => updateField("eventDate", e.target.value)}
                    className="bg-transparent border-b border-dashed border-sky-400 focus:outline-none"
                  />
                ) : (
                  <span>{eventDate}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                <MapPin className="size-4 text-primary" />
                {isEditingInline ? (
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => updateField("eventLocation", e.target.value)}
                    className="bg-transparent border-b border-dashed border-sky-400 focus:outline-none"
                  />
                ) : (
                  <span>{eventLocation}</span>
                )}
              </div>
            </div>

            {/* CTA Button Scroll to Tickets */}
            <div className="pt-4">
              <a
                href="#billets"
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold shadow-xl transition-transform hover:scale-105 active:scale-95 ${themeColors.primary}`}
              >
                <span>{ctaText}</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        {/* 3. Lineup / Artists Section */}
        <section className="px-4 py-8 sm:px-8 border-t border-white/10 bg-white/[0.02]">
          <div className="text-center mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Lineup & Artistes
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Les plus grands artistes en live sur scène
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center space-y-2 backdrop-blur-md hover:border-white/20 transition-all"
              >
                <div className="size-12 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-display font-bold text-sm text-white shadow-md">
                  {artist.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                    {artist.name}
                  </h4>
                  <p className="text-[10px] text-primary truncate font-medium">{artist.role}</p>
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">{artist.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Ticket Booking Tier Section */}
        <section id="billets" className="px-4 py-10 sm:px-8 border-t border-white/10">
          <div className="text-center mb-8">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-[11px] font-bold text-primary">
              Sélectionnez vos Pass
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Tarifs & Réservation Immédiate
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Paiement 100% sécurisé via <strong>Airtel Money</strong> et <strong>Moov Money</strong>.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-5 transition-all backdrop-blur-md ${
                  t.badge
                    ? `${themeColors.accentBorder} bg-white/10 shadow-xl`
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {t.badge && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold text-black uppercase tracking-wider shadow-md">
                    {t.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-white">{t.name}</h3>
                    <p className="text-xs text-zinc-300 mt-1">{t.description}</p>
                  </div>

                  <div className="border-y border-white/10 py-3">
                    <span className="font-display text-2xl font-extrabold text-white">
                      {t.price.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono ml-1">FCFA</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {t.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    onClick={() => handleBuyClick(t)}
                    className={`w-full rounded-xl text-xs font-bold ${themeColors.primary}`}
                  >
                    <Ticket className="size-3.5 mr-1.5" />
                    <span>Acheter ce Pass</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Security & Guarantee Banner */}
        <section className="border-t border-white/10 bg-white/5 px-4 py-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Billet QR Sécurisé Anti-Fraude</p>
                <p className="text-[11px] text-zinc-400">
                  Chaque pass est certifié et reçu instantanément par SMS & WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded bg-white/10 px-2 py-1 font-mono text-[10px] text-white">
                AIRTEL MONEY
              </span>
              <span className="rounded bg-white/10 px-2 py-1 font-mono text-[10px] text-white">
                MOOV MONEY
              </span>
              <span className="rounded bg-white/10 px-2 py-1 font-mono text-[10px] text-white">
                VISA / MASTERCARD
              </span>
            </div>
          </div>
        </section>

        {/* 6. Footer */}
        <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-zinc-500">
          <p>© 2026 {siteTitle}. Propulsé par Giya Technologies.</p>
        </footer>
      </div>

      {/* Simulated Mobile Money Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="rounded-3xl border-border bg-card p-6 sm:max-w-md shadow-2xl">
          {!isPaymentSuccess ? (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Ticket className="size-5 text-primary" />
                  <span>Acheter mon Pass</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Finalisez votre commande en toute sécurité via Mobile Money.
                </DialogDescription>
              </DialogHeader>

              {selectedTicket && (
                <div className="space-y-4 py-2">
                  {/* Selected Ticket summary */}
                  <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-foreground">{selectedTicket.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedTicket.price.toLocaleString("fr-FR")} FCFA / unité
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="size-6 flex items-center justify-center rounded-lg hover:bg-muted text-foreground"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-mono font-bold text-xs px-1">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="size-6 flex items-center justify-center rounded-lg hover:bg-muted text-foreground"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Buyer details */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Nom complet du titulaire
                      </label>
                      <input
                        type="text"
                        value={nameBuyer}
                        onChange={(e) => setNameBuyer(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                        placeholder="Ex: Jean-Marc Obiang"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Numéro Mobile Money pour débit
                      </label>
                      <input
                        type="text"
                        value={phoneBuyer}
                        onChange={(e) => setPhoneBuyer(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                        placeholder="077 XX XX XX"
                      />
                    </div>
                  </div>

                  {/* Operator Choice */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Moyen de paiement Mobile Money
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setOperator("AIRTEL")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                          operator === "AIRTEL"
                            ? "border-red-500 bg-red-500/10 text-red-500"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="size-2 rounded-full bg-red-500" />
                        <span>Airtel Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOperator("MOOV")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                          operator === "MOOV"
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="size-2 rounded-full bg-blue-500" />
                        <span>Moov Money</span>
                      </button>
                    </div>
                  </div>

                  {/* Total to pay */}
                  <div className="flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 p-3">
                    <span className="font-semibold text-xs text-foreground">Total à payer</span>
                    <span className="font-display text-lg font-extrabold text-primary font-mono">
                      {(selectedTicket.price * quantity).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  {isProcessing ? "Validation USSD..." : "Payer maintenant"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* Payment Success & QR Pass Display */
            <div className="text-center space-y-4 py-4">
              <div className="size-14 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="size-8" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Paiement Confirmé !
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Votre pass QR a été généré et envoyé au <strong>{phoneBuyer}</strong>.
                </p>
              </div>

              {/* Mock QR Pass Card */}
              <div className="rounded-3xl border border-primary/30 bg-muted/40 p-4 space-y-3 shadow-md">
                <div className="flex justify-center p-3 bg-white rounded-2xl">
                  <QrCode className="size-36 text-black" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">{nameBuyer}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    Billet ID : #GA-EVT-9082 • {selectedTicket?.name}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full rounded-xl font-bold"
              >
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
