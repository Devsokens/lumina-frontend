"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Ticket,
  ShoppingBag,
  CheckCircle2,
  Clock,
  QrCode,
  Smartphone,
  Plus,
  CreditCard,
  ChefHat
} from "lucide-react";
import { Button } from "@/components/ui/button";


type DemoTab = "restaurant" | "event" | "shop";

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("restaurant");

  // Restaurant State
  const [restaurantOrders, setRestaurantOrders] = useState([
    { id: "CMD-204", table: "Table 2", item: "Capitaine Braisé + Alloco", price: "8 500 FCFA", status: "En cuisine", time: "il y a 2 min" },
    { id: "CMD-203", table: "Table 5", item: "Poulet Nyembwe + Riz", price: "6 000 FCFA", status: "Prêt", time: "il y a 7 min" },
  ]);
  const [newOrderAdded, setNewOrderAdded] = useState(false);

  const addSimulatedOrder = () => {
    if (newOrderAdded) return;
    const newOrder = {
      id: `CMD-${Math.floor(Math.random() * 800 + 300)}`,
      table: "Table 4 (QR Scan)",
      item: "Brochettes de Mérou + Jus Bissap",
      price: "9 500 FCFA",
      status: "Reçu en direct",
      time: "À l'instant",
    };
    setRestaurantOrders([newOrder, ...restaurantOrders]);
    setNewOrderAdded(true);
    setTimeout(() => setNewOrderAdded(false), 4000);
  };

  // Event State
  const [scannedTicket, setScannedTicket] = useState<{
    id: string;
    holder: string;
    type: string;
    time: string;
    status: "VALID" | "ALREADY_USED";
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedTicket({
        id: "LUM-VIP-8842",
        holder: "Marcelle Ondo",
        type: "Pass VIP Concert Festival",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        status: "VALID",
      });
    }, 600);
  };

  // Shop State
  const [shopPaid, setShopPaid] = useState(false);
  const [payingWith, setPayingWith] = useState<"airtel" | "moov" | null>(null);

  const triggerPayment = (provider: "airtel" | "moov") => {
    setPayingWith(provider);
    setTimeout(() => {
      setPayingWith(null);
      setShopPaid(true);
      setTimeout(() => setShopPaid(false), 5000);
    }, 1200);
  };

  return (
    <section id="demo" className="relative py-20 lg:py-28 overflow-hidden bg-background">
      {/* Background Accent Grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="pointer-events-none absolute bottom-0 right-10 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Expérimentez LUMINA en temps réel
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base text-muted-foreground sm:text-lg"
          >
            Sélectionnez votre secteur et interagissez directement avec les écrans clients et administrateurs.
          </motion.p>
        </div>

        {/* Sector Interactive Switcher Tabs */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-border bg-card/80 p-1.5 shadow-md backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab("restaurant")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === "restaurant"
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Utensils className="size-4" />
              <span>Restauration & KDS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("event")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === "event"
                  ? "bg-secondary text-yellow-950 shadow-md shadow-secondary/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ticket className="size-4" />
              <span>Événementiel & Scan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("shop")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === "shop"
                  ? "bg-accent text-white shadow-md shadow-accent/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="size-4" />
              <span>Boutique & Mobile Money</span>
            </button>
          </div>
        </div>

        {/* Interactive Demo Surface Box */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* RESTAURANT VIEW */}
            {activeTab === "restaurant" && (
              <motion.div
                key="restaurant"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 p-6 lg:grid-cols-12 lg:p-8"
              >
                {/* Left Side: Client QR Menu Simulator */}
                <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/80 bg-background/60 p-5 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <QrCode className="size-5 text-primary" />
                        <span className="font-display text-sm font-bold">Vue Client (Smartphone)</span>
                      </div>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                        Table 4 • Menu Actif
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-border/60 bg-card p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">Brochettes de Mérou</p>
                          <p className="text-xs text-muted-foreground">Poisson frais du Cap Esterias + Alloco</p>
                          <span className="font-mono text-xs font-semibold text-primary">7 500 FCFA</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-mono">En stock</span>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-card p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">Jus de Bissap Maison</p>
                          <p className="text-xs text-muted-foreground">Infusion fraîche aux feuilles de menthe</p>
                          <span className="font-mono text-xs font-semibold text-primary">2 000 FCFA</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-mono">En stock</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <Button
                      type="button"
                      onClick={addSimulatedOrder}
                      disabled={newOrderAdded}
                      className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 font-medium py-5 shadow-md shadow-primary/20"
                    >
                      {newOrderAdded ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="size-4" /> Commande envoyée en cuisine !
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="size-4" /> Simuler la commande de la Table 4
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right Side: Kitchen KDS Screen */}
                <div className="lg:col-span-7 rounded-2xl border border-primary/20 bg-[#0c1813] text-white p-5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                        <ChefHat className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-bold text-white">Écran Cuisine (KDS Live)</h4>
                        <p className="text-[11px] text-emerald-300/80 font-mono">Synchronisation WebSocket : &lt;200ms</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-mono text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En service
                    </span>
                  </div>

                  {/* Orders Queue in Kitchen */}
                  <div className="mt-4 space-y-3">
                    {restaurantOrders.map((order, idx) => (
                      <motion.div
                        key={order.id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`rounded-xl p-4 border transition-all ${
                          idx === 0 && newOrderAdded
                            ? "border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-secondary">{order.id}</span>
                            <span className="font-semibold text-sm text-white">{order.table}</span>
                          </div>
                          <span className="font-mono text-xs text-white/60 flex items-center gap-1">
                            <Clock className="size-3" /> {order.time}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-emerald-100">{order.item}</p>
                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
                          <span className="font-mono text-xs text-white/70">{order.price}</span>
                          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-mono text-emerald-300">
                            {order.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* EVENT VIEW */}
            {activeTab === "event" && (
              <motion.div
                key="event"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 p-6 lg:grid-cols-12 lg:p-8"
              >
                {/* Left Side: Ticket Visual */}
                <div className="lg:col-span-6 rounded-2xl border border-border bg-gradient-to-br from-amber-500/10 via-card to-card p-6">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <span className="font-mono text-xs font-bold text-yellow-700 dark:text-secondary">BILLET OFFICIEL SÉCURISÉ</span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-xs font-mono">100% Crypté</span>
                  </div>

                  <div className="mt-6 flex flex-col items-center text-center">
                    <div className="relative rounded-2xl border-2 border-dashed border-secondary/60 bg-background p-4 shadow-sm">
                      <QrCode className="size-32 text-foreground" />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/5">
                        <div className="rounded-md bg-secondary/90 px-2 py-0.5 text-[10px] font-bold text-yellow-950">
                          LUMINA ANTI-FRAUDE
                        </div>
                      </div>
                    </div>

                    <h4 className="mt-4 font-display text-lg font-bold text-foreground">Festival Culturel Gabon 2026</h4>
                    <p className="text-xs text-muted-foreground">Palais des Sports • Libreville</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1 font-mono text-xs">
                      <span>Pass VIP : Marcelle Ondo</span>
                      <span>•</span>
                      <span className="font-bold text-primary">25 000 FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: PWA Fast Scanner Simulator */}
                <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="size-5 text-secondary" />
                        <span className="font-display text-sm font-bold">Scanner PWA Portier</span>
                      </div>
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">Mode Hors-Ligne Prêt</span>
                    </div>

                    <div className="mt-5">
                      <Button
                        type="button"
                        onClick={simulateScan}
                        disabled={isScanning}
                        className="w-full py-6 rounded-xl bg-secondary text-yellow-950 hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20"
                      >
                        {isScanning ? "Scan du QR en cours (0.2s)..." : "⚡ Lancer le Scan d'Entrée"}
                      </Button>
                    </div>

                    {/* Scan Result Animation */}
                    <div className="mt-6">
                      {scannedTicket ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-300"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
                            <div>
                              <p className="font-bold text-base">BILLET VALIDE ✓ ENTRÉE AUTORISÉE</p>
                              <p className="text-xs mt-0.5">{scannedTicket.holder} — {scannedTicket.type}</p>
                              <p className="font-mono text-[11px] text-muted-foreground mt-1">Validé à {scannedTicket.time} • Zéro duplicata</p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                          Cliquez sur le bouton pour simuler la vérification instantanée du pass par la caméra.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 font-mono">
                    <span>Temps de scan : &lt; 0.3 sec</span>
                    <span>Contrôle anti-duplicata matériel</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SHOP VIEW */}
            {activeTab === "shop" && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 p-6 lg:grid-cols-12 lg:p-8"
              >
                {/* Left Side: Product Showcase */}
                <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-display text-sm font-bold">Vitrine en ligne • boutique-elegance.lumina.ga</span>
                    <span className="font-mono text-xs text-accent">Panier : 1 article</span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border/70 bg-background p-4 flex items-center gap-4">
                    <div className="size-16 rounded-xl bg-accent/15 flex items-center justify-center text-accent text-xl font-bold">
                      👗
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-foreground">Robe Soie & Wax Moderne</p>
                      <p className="text-xs text-muted-foreground">Taille M • Couleur Emeraude & Or</p>
                      <p className="font-mono font-bold text-primary mt-1">32 000 FCFA</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2.5 text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-mono">32 000 FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison Libreville (Akanda / Glass)</span>
                      <span className="font-mono">2 000 FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border/50">
                      <span>Total à régler</span>
                      <span className="font-mono text-primary font-bold">34 000 FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Mobile Money Simulator */}
                <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="size-5 text-accent" />
                        <span className="font-display text-sm font-bold">Encaissement Mobile Money</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">Paystack / CLIKPAY</span>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                      Choisissez le moyen de paiement pour simuler l&apos;encaissement instantané sur votre compte :
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={() => triggerPayment("airtel")}
                        disabled={payingWith !== null}
                        className="py-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 font-bold"
                      >
                        {payingWith === "airtel" ? "Validation..." : "🔴 Airtel Money"}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => triggerPayment("moov")}
                        disabled={payingWith !== null}
                        className="py-5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 font-bold"
                      >
                        {payingWith === "moov" ? "Validation..." : "🔵 Moov Money"}
                      </Button>
                    </div>

                    {/* Payment Success Toast */}
                    <div className="mt-6">
                      {shopPaid ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-300"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
                            <div>
                              <p className="font-bold text-sm">Paiement reçu avec succès (34 000 FCFA)</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Reçu WhatsApp envoyé au client • Stock décrémenté en temps réel.</p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                          Cliquez sur Airtel Money ou Moov Money pour tester le flux de confirmation immédiate.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 font-mono">
                    <span>Aucun TPE physique nécessaire</span>
                    <span>Fonds disponibles immédiatement</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
