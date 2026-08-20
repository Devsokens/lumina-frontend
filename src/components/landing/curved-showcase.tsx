"use client";

import { useState, useRef, useEffect } from "react";
import {
  Smartphone,
  Monitor,
  ChefHat,
  Ticket,
  ArrowUpRight,
  TrendingUp,
  QrCode,
  CheckCircle2,
  Zap,
  ShoppingBag,
  Wine,
  PackageCheck
} from "lucide-react";

interface ShowcaseItem {
  id: string;
  title: string;
  role: string;
  badge: string;
  badgeColor: string;
  screenHeader: string;
  accentGradient: string;
  borderColor: string;
  type: "mobile" | "desktop" | "kds";
}

const ITEMS: ShowcaseItem[] = [
  {
    id: "item-1",
    title: "Vitrine & Commande Table",
    role: "Smartphone Client (PWA)",
    badge: "0 App requise",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    screenHeader: "le-palmier.lumina.ga",
    accentGradient: "from-[#0a3527] via-[#051c14] to-[#020d09]",
    borderColor: "border-emerald-500/50",
    type: "mobile",
  },
  {
    id: "item-2",
    title: "Dashboard Dirigeant",
    role: "Tablette & Desktop Admin",
    badge: "Temps Réel",
    badgeColor: "bg-secondary/20 text-secondary border-secondary/30",
    screenHeader: "lumina.ga/admin/analytics",
    accentGradient: "from-[#203128] via-[#111c16] to-[#080e0b]",
    borderColor: "border-secondary/50",
    type: "desktop",
  },
  {
    id: "item-3",
    title: "Écran Cuisine (KDS Live)",
    role: "Écran Tactile Cuisine",
    badge: "Synchro < 200ms",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    screenHeader: "KDS Screen #01 • Poste Chaud",
    accentGradient: "from-[#331616] via-[#1c0c0c] to-[#0d0606]",
    borderColor: "border-red-500/50",
    type: "kds",
  },
  {
    id: "item-4",
    title: "Boutique E-Commerce",
    role: "Vitrine Mode & Retail",
    badge: "Airtel / Moov Money",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    screenHeader: "boutique-elegance.lumina.ga",
    accentGradient: "from-[#112740] via-[#0b1726] to-[#050c14]",
    borderColor: "border-blue-500/50",
    type: "desktop",
  },
  {
    id: "item-5",
    title: "Scanner Portier Anti-Fraude",
    role: "Application Portier PWA",
    badge: "Scan 0.2s Laser",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    screenHeader: "Scan PWA • Festival 2026",
    accentGradient: "from-[#332009] via-[#1c1205] to-[#0e0902]",
    borderColor: "border-amber-500/50",
    type: "mobile",
  },
  {
    id: "item-6",
    title: "Comptoir Bar & Lounge",
    role: "KDS Boissons & Cocktails",
    badge: "File d'attente Bar",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    screenHeader: "KDS Bar #02 • Lounge VIP",
    accentGradient: "from-[#291538] via-[#170b20] to-[#0b050f]",
    borderColor: "border-purple-500/50",
    type: "kds",
  },
  {
    id: "item-7",
    title: "Gestion des Stocks & Alertes",
    role: "Approvisionnement Live",
    badge: "0 Rupture",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    screenHeader: "lumina.ga/admin/stocks",
    accentGradient: "from-[#122e22] via-[#091a13] to-[#040e0a]",
    borderColor: "border-emerald-500/50",
    type: "desktop",
  },
];

const NUM_ITEMS = ITEMS.length;
const RADIUS = 680; // Radius in pixels for semi-circle curvature

function computeCardTransform(idx: number, rotationDeg: number, isHovered: boolean) {
  const baseAngleDeg = (360 / NUM_ITEMS) * idx;
  const currentAngleDeg = (baseAngleDeg - rotationDeg + 360) % 360;
  const angleRad = (currentAngleDeg * Math.PI) / 180;

  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);

  const isVisible = cosVal > -0.3;

  const x = sinVal * RADIUS;
  const z = (cosVal - 1) * 350;
  const y = (1 - cosVal) * 110;
  const tiltZ = sinVal * 18;
  const tiltY = -sinVal * 24;

  const scale = isHovered ? 1.12 : 0.8 + cosVal * 0.28;
  const opacity = isVisible ? Math.max(0.3, cosVal + 0.15) : 0;
  const zIndex = isHovered ? 100 : Math.round((cosVal + 1) * 30);

  return {
    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateZ(${isHovered ? 0 : tiltZ}deg) rotateY(${isHovered ? 0 : tiltY}deg) scale(${scale})`,
    opacity,
    zIndex,
    isVisible,
  };
}

export function CurvedShowcase() {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const reqRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const pausedRef = useRef(false);
  const hoveredRef = useRef<string | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Rotation state lives in refs and is applied directly to the DOM every frame,
  // so hovering/pausing never triggers a React re-render of the (heavy) card contents.
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!pausedRef.current) {
        rotationRef.current = (rotationRef.current + delta * 0.015) % 360;
      }

      ITEMS.forEach((item, idx) => {
        const el = cardRefs.current[idx];
        if (!el) return;
        const isHovered = hoveredRef.current === item.id;
        const { transform, opacity, zIndex, isVisible } = computeCardTransform(
          idx,
          rotationRef.current,
          isHovered
        );
        el.style.transform = transform;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = isVisible ? "auto" : "none";
      });

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  return (
    <section className="relative py-12 lg:py-16 overflow-hidden bg-[#060c09] text-white border-y border-white/10 select-none">
      {/* Background Ambience & Spotlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_10%,rgba(10,79,60,0.55),transparent)]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[850px] rounded-full bg-secondary/15 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
          Un écosystème digital qui pilote tout votre établissement
        </h2>

        <p className="mt-2 text-sm text-neutral-300 sm:text-base max-w-2xl mx-auto">
          Vitrine client, dashboard dirigeant, écran cuisine, scanner d&apos;entrée et gestion des stocks : une seule plateforme LUMINA, synchronisée en temps réel sur tous vos écrans.
        </p>
      </div>

      {/* 3D Curved Semi-Circle Stage Container */}
      <div
        onMouseEnter={() => {
          pausedRef.current = true;
          setIsPaused(true);
          cardRefs.current.forEach((el) => {
            if (el) el.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease";
          });
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
          setIsPaused(false);
          hoveredRef.current = null;
          setHoveredCardId(null);
          cardRefs.current.forEach((el) => {
            if (el) el.style.transition = "opacity 0.2s linear";
          });
        }}
        className="relative mt-8 sm:mt-12 h-[420px] sm:h-[460px] w-full overflow-hidden flex items-center justify-center [perspective:1300px]"
      >
        {/* Curved Track Visual Guide Light (Subtle Arc glow behind cards) */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[300px] rounded-[50%] border-t-2 border-emerald-500/20 shadow-[0_-20px_50px_rgba(10,79,60,0.3)]" />


        {ITEMS.map((item, idx) => {
          const isHovered = hoveredCardId === item.id;
          const initial = computeCardTransform(idx, 0, isHovered);

          return (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              onMouseEnter={() => {
                hoveredRef.current = item.id;
                setHoveredCardId(item.id);
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "45%",
                transform: initial.transform,
                opacity: initial.opacity,
                zIndex: initial.zIndex,
                transformStyle: "preserve-3d",
                transition: "opacity 0.2s linear",
                willChange: "transform, opacity",
              }}
              className={`group cursor-pointer rounded-3xl border ${
                isHovered
                  ? "border-secondary shadow-[0_25px_70px_-10px_rgba(244,185,66,0.45)]"
                  : `${item.borderColor} shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]`
              } bg-gradient-to-b ${item.accentGradient} p-4 sm:p-5 ${
                item.type === "mobile"
                  ? "w-[240px] sm:w-[270px] h-[370px] sm:h-[410px]"
                  : "w-[290px] sm:w-[350px] lg:w-[360px] h-[370px] sm:h-[410px]"
              }`}
            >
              {/* Gloss Reflection Overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 to-transparent opacity-60" />

              {/* Mockup Window Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-400/80" />
                  <span className="size-2 rounded-full bg-yellow-400/80" />
                  <span className="size-2 rounded-full bg-green-400/80" />
                </div>
                <span className="font-mono text-[10px] text-white/60 truncate max-w-[130px]">
                  {item.screenHeader}
                </span>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              {/* Inner UI Mockup Content */}
              <div className="mt-3 flex h-[calc(100%-70px)] flex-col justify-between">
                <div>
                  {/* Content 1: Client Mobile */}
                  {item.id === "item-1" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <Smartphone className="size-4" />
                        <span className="font-mono text-xs font-bold tracking-wide">Menu Table #04</span>
                      </div>
                      <div className="rounded-xl border border-white/15 bg-white/10 p-2.5">
                        <p className="text-xs font-bold text-white">Capitaine Braisé</p>
                        <p className="text-[10px] text-white/80">Poisson frais + Alloco doré</p>
                        <p className="mt-1 font-mono text-xs font-extrabold text-secondary">8 500 FCFA</p>
                      </div>
                      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 p-1.5 text-center text-[10px] font-mono font-bold text-emerald-200">
                        ✓ Commande envoyée en cuisine
                      </div>
                    </div>
                  )}

                  {/* Content 2: Admin Dashboard */}
                  {item.id === "item-2" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-semibold flex items-center gap-1.5">
                          <Monitor className="size-3.5 text-secondary" />
                          Gérance Live
                        </span>
                        <span className="font-mono text-emerald-300 font-extrabold flex items-center gap-1">
                          <TrendingUp className="size-3" /> +42%
                        </span>
                      </div>
                      <div className="rounded-xl border border-white/15 bg-white/10 p-2.5">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-white/70">Ventes du jour</p>
                        <p className="font-mono text-lg font-black text-white">542 000 FCFA</p>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full w-4/5 bg-secondary rounded-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-white/90">
                        <div className="rounded-lg bg-white/10 p-1.5 border border-white/10 font-bold">46 Commandes</div>
                        <div className="rounded-lg bg-white/10 p-1.5 border border-white/10 font-bold text-emerald-300">Airtel 88%</div>
                      </div>
                    </div>
                  )}

                  {/* Content 3: KDS Screen */}
                  {item.id === "item-3" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-200 font-bold flex items-center gap-1.5">
                          <ChefHat className="size-4" />
                          Poste Chaud Live
                        </span>
                        <span className="font-mono text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                          <Zap className="size-3" /> 180ms
                        </span>
                      </div>
                      <div className="rounded-xl border-2 border-red-500/50 bg-red-500/25 p-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-white">TABLE 4 (EN COURS)</span>
                          <span className="text-red-300 font-extrabold">03:45 min</span>
                        </div>
                        <p className="text-xs text-white mt-1 font-bold">1x Mérou Braisé • 2x Alloco</p>
                      </div>
                      <div className="rounded-lg border border-white/15 bg-white/10 p-1.5 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white font-medium">TABLE 1</span>
                        <span className="text-emerald-300 font-bold">Prêt Servir ✓</span>
                      </div>
                    </div>
                  )}

                  {/* Content 4: Shop Catalog */}
                  {item.id === "item-4" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-300">
                        <ShoppingBag className="size-4" />
                        <span className="font-mono text-xs font-bold">Vitrine Mode & Wax</span>
                      </div>
                      <div className="rounded-xl border border-white/15 bg-white/10 p-2 flex items-center gap-2.5">
                        <div className="size-9 rounded-lg bg-blue-500/30 flex items-center justify-center text-base">
                          👗
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Robe Soie Emeraude</p>
                          <p className="font-mono text-xs text-blue-300 font-black">38 000 FCFA</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-blue-500/40 bg-blue-500/20 p-1.5 text-center text-[10px] font-mono font-bold text-blue-200">
                        Paiement Moov Money reçu ✓
                      </div>
                    </div>
                  )}

                  {/* Content 5: Event Scanner */}
                  {item.id === "item-5" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-300">
                        <Ticket className="size-4" />
                        <span className="font-mono text-xs font-bold">Scanner Portier PWA</span>
                      </div>
                      <div className="rounded-xl border border-dashed border-amber-500/60 bg-black/60 p-2 text-center">
                        <QrCode className="size-11 mx-auto text-amber-300 animate-pulse" />
                        <p className="mt-0.5 text-[9px] font-mono text-amber-200 font-semibold">Scan Laser 0.2s</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/30 border border-emerald-500/50 p-1 text-center text-[10px] font-mono text-emerald-200 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="size-3" /> PASS VIP #9842 VALIDE
                      </div>
                    </div>
                  )}

                  {/* Content 6: Bar KDS */}
                  {item.id === "item-6" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-purple-200">
                        <Wine className="size-4" />
                        <span className="font-mono text-xs font-bold">Comptoir Bar & Lounge</span>
                      </div>
                      <div className="rounded-xl border border-purple-500/40 bg-purple-500/20 p-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-white font-bold">SALON VIP #2</span>
                          <span className="text-purple-200 font-bold">2 min</span>
                        </div>
                        <p className="text-xs text-white mt-1 font-semibold">2x Cocktails Bissap Spécial</p>
                      </div>
                      <div className="rounded-lg border border-white/15 bg-white/10 p-1 text-center text-[10px] font-mono font-medium text-white/80">
                        Prêt à être servi
                      </div>
                    </div>
                  )}

                  {/* Content 7: Stock Management */}
                  {item.id === "item-7" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <PackageCheck className="size-4" />
                        <span className="font-mono text-xs font-bold">Stocks Ingrédients</span>
                      </div>
                      <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/10 border border-white/10 font-medium">
                          <span className="text-white">Mérou Frais</span>
                          <span className="text-emerald-300 font-black">14 kg (OK)</span>
                        </div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/10 border border-white/10 font-medium">
                          <span className="text-white">Régimes Banane</span>
                          <span className="text-secondary font-black">4 restants</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Footer Item */}
                <div className="border-t border-white/15 pt-2 flex items-center justify-between">
                  <div>
                    <p className="font-display text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-white/70">{item.role}</p>
                  </div>
                  <div className="flex size-5 items-center justify-center rounded-full bg-white/15 group-hover:bg-secondary group-hover:text-yellow-950 transition-colors">
                    <ArrowUpRight className="size-3" />
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Interactive Controls & Status Ticker */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${!isPaused ? "animate-ping opacity-75" : "opacity-0"}`}></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>{isPaused ? "Détails de l'écran affichés" : "Synchronisation temps réel active"}</span>
        </div>

        <span className="hidden sm:inline">&bull;</span>

        <span className="text-neutral-400">
          Un seul compte LUMINA, tous vos points de contact connectés
        </span>
      </div>
    </section>
  );
}
