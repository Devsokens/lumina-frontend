"use client";

import { useEffect, useLayoutEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Compass,
  Globe,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  ScanLine,
  Settings,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { EV_PORTAL } from "@/components/events/ev-ui";
import { GiyaxAvatar } from "@/components/ai/giyax-avatar";
import { BASE } from "@/components/dashboard/event-shell/shell-model";
import { useAuth } from "@/hooks/useAuth";
import { useCompleteOnboarding, useExperience } from "@/hooks/useExperience";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";

// Visite guidée du back-office événementiel : accueil, puis chaque zone de
// l'espace mise en lumière sur l'écran réel (éléments marqués data-tour),
// puis « Vous êtes prêt » avec les premières actions. Lancée à la première
// arrivée (GET /me/experience), et à tout moment via le bouton boussole de
// l'en-tête ou le menu du compte.

type Icon = ComponentType<{ className?: string }>;
type Spot = { target: string; title: string; text: string; icon: Icon; roles?: string[] };

const MANAGE = ["OWNER", "MANAGER"];

const SPOTS: Spot[] = [
  { target: "org", icon: Building2, title: "Votre organisation", text: "Votre nom, votre formule, et le passage d'une organisation à l'autre si vous en gérez plusieurs." },
  { target: "nav-home", icon: LayoutDashboard, title: "Tableau de bord", text: "Ventes, entrées et recettes du jour, en un coup d'œil." },
  { target: "create", icon: PlusCircle, roles: MANAGE, title: "Créer un événement", text: "Titre, date, billets : votre billetterie est en ligne en quelques minutes. GiyaX AI peut écrire la description et créer l'affiche." },
  { target: "nav-events", icon: CalendarDays, roles: MANAGE, title: "Mes événements", text: "Chaque événement en détail : participants, ventes, remboursements et attestations." },
  { target: "nav-scan", icon: ScanLine, title: "Contrôle d'accès", text: "Scannez les billets à l'entrée avec un simple téléphone, même sans réseau. Une copie de billet est refusée." },
  { target: "nav-showcase", icon: Globe, roles: MANAGE, title: "Mon site web", text: "Votre site public, à vos couleurs, où vos clients découvrent vos événements et paient en Mobile Money." },
  { target: "nav-users", icon: Users, roles: MANAGE, title: "Mon équipe", text: "Invitez vos managers et vos contrôleurs, chacun avec le bon niveau d'accès." },
  { target: "nav-settings", icon: Settings, roles: MANAGE, title: "Paramètres", text: "Logo, coordonnées, e-mails, et surtout votre compte Mobile Money pour recevoir vos recettes." },
  { target: "assistant", icon: MessageCircle, title: "GiyaX AI, votre assistante", text: "Une question, un souci, un conseil pour une décision ? Elle répond en quelques secondes, et garde l'historique de vos échanges." },
  { target: "tour", icon: Compass, title: "Revoir la visite", text: "Ce bouton relance cette visite quand vous voulez. Vous la retrouvez aussi dans le menu de votre compte." },
];

const FIRST_STEPS: { label: string; href?: string; create?: boolean; icon: Icon; roles?: string[] }[] = [
  { label: "Compléter mon organisation", href: `${BASE}/settings`, icon: Building2, roles: ["OWNER"] },
  { label: "Configurer mes versements Mobile Money", href: `${BASE}/settings?rubrique=paiements`, icon: Wallet, roles: ["OWNER"] },
  { label: "Créer mon premier événement", create: true, icon: PlusCircle, roles: MANAGE },
  { label: "Personnaliser mon site web", href: `${BASE}/showcase`, icon: Globe, roles: MANAGE },
  { label: "Scanner les billets à l'entrée", href: "/scan", icon: ScanLine, roles: ["STAFF"] },
];

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 6;
const CARD_W = 340;

// Élément visible marqué data-tour (le premier qui l'est vraiment).
function findTarget(name: string): HTMLElement | null {
  const list = document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`);
  for (const el of list) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden") return el;
  }
  return null;
}

function cardPosition(rect: Rect | null): React.CSSProperties {
  if (!rect || typeof window === "undefined") return {};
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < 640) return {};
  const gap = 18;
  const clampTop = (t: number) => Math.min(Math.max(16, t), vh - 300);
  if (rect.left + rect.width + gap + CARD_W < vw - 16) {
    return { top: clampTop(rect.top + rect.height / 2 - 120), left: rect.left + rect.width + gap };
  }
  if (rect.top + rect.height + gap + 280 < vh) {
    return { top: rect.top + rect.height + gap, left: Math.min(Math.max(16, rect.left + rect.width - CARD_W), vw - CARD_W - 16) };
  }
  return { top: clampTop(rect.top - 300), left: Math.min(Math.max(16, rect.left + rect.width - CARD_W), vw - CARD_W - 16) };
}

export function OnboardingTour() {
  const open = useShellStore((s) => s.tourOpen);
  const setOpen = useShellStore((s) => s.setTourOpen);
  const setCreateEventOpen = useShellStore((s) => s.setCreateEventOpen);
  const { user } = useAuth();
  const { data } = useExperience();
  const complete = useCompleteOnboarding();
  const role = user?.role ?? "OWNER";
  const firstName = (user?.fullName ?? "").trim().split(/\s+/)[0];
  const spots = SPOTS.filter((s) => !s.roles || s.roles.includes(role));
  const firstSteps = FIRST_STEPS.filter((s) => !s.roles || s.roles.includes(role));

  // -1 = accueil, 0..n-1 = zones, n = « Vous êtes prêt ».
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<Rect | null>(null);

  // Première arrivée : la visite s'ouvre d'elle-même (une fois par session).
  useEffect(() => {
    if (!data || data.onboardingDone) return;
    try {
      if (sessionStorage.getItem("giyax-tour-seen")) return;
    } catch {
      // stockage indisponible
    }
    const t = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(t);
  }, [data, setOpen]);

  const spot = step >= 0 && step < spots.length ? spots[step] : null;
  const target = spot?.target ?? null;

  // Position de la zone mise en lumière (suivie : redimensionnement,
  // défilement, barre latérale repliée…).
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = target ? findTarget(target) : null;
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const id = window.setInterval(measure, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.clearInterval(id);
    };
  }, [open, target]);

  function finish() {
    try {
      sessionStorage.setItem("giyax-tour-seen", "1");
    } catch {
      // ignoré
    }
    if (!data?.onboardingDone) complete.mutate();
    setOpen(false);
    window.setTimeout(() => setStep(-1), 300);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const total = spots.length;
  const next = () => setStep((s) => Math.min(s + 1, total));
  const back = () => setStep((s) => Math.max(s - 1, -1));

  const content = (
    <div className={cn(EV_PORTAL, "fixed inset-0 z-[90]")} role="dialog" aria-modal="true" aria-label="Visite guidée de votre espace">
      {/* Voile : découpé autour de la zone mise en lumière. */}
      {spot && rect ? (
        <>
          <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-[14px] transition-all duration-300 ease-out"
            style={{ ...rect, boxShadow: "0 0 0 9999px rgba(8,22,16,.66)" }}
          />
          <div aria-hidden className="giyax-tour-ring pointer-events-none absolute rounded-[14px] border-2 border-[#F5B83D] transition-all duration-300 ease-out" style={rect} />
        </>
      ) : (
        <div className="absolute inset-0 bg-[rgba(8,22,16,.66)] backdrop-blur-[3px]" />
      )}

      {/* Accueil */}
      {step === -1 && (
        <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <div className="giyax-pop w-full overflow-hidden rounded-t-[28px] bg-ev-surface text-ev-ink shadow-[0_40px_100px_rgba(0,0,0,.4)] sm:max-w-[620px] sm:rounded-[28px]">
            <div className="relative overflow-hidden bg-[radial-gradient(130%_120%_at_0%_0%,#22A374_0%,#0F5A44_45%,#0B3B2E_100%)] px-7 pb-8 pt-8 text-white sm:px-10">
              <span aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-[#F5B83D]/20 blur-3xl" />
              <span aria-hidden className="absolute -bottom-20 left-1/3 size-48 rounded-full bg-white/10 blur-3xl" />
              <button type="button" aria-label="Fermer la visite" onClick={finish} className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-[10px] bg-white/10 hover:bg-white/20">
                <X className="size-4" />
              </button>
              <span className="relative inline-flex rounded-full bg-white p-2 shadow-xl">
                <GiyaxAvatar size={72} mood="talking" halo />
              </span>
              <h2 className="relative m-0 mt-5 text-[28px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[34px]">
                Bienvenue{firstName ? `, ${firstName}` : ""} !
              </h2>
              <p className="relative m-0 mt-3 max-w-[460px] text-[15px] leading-relaxed text-white/85">
                Je suis GiyaX AI. En une minute, je vous montre l&apos;essentiel de votre espace pour vendre vos premiers billets.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 px-7 pt-6 sm:px-10">
              {(
                [
                  [Ticket, "Vendez", "Billets en ligne, Mobile Money"],
                  [ScanLine, "Contrôlez", "Scan à l'entrée, sans fraude"],
                  [Wallet, "Encaissez", "Recettes sur votre compte"],
                ] as const
              ).map(([I, t, d], i) => (
                <div key={t} className="giyax-pop flex flex-col gap-2 rounded-[16px] bg-ev-soft p-3.5" style={{ animationDelay: `${120 + i * 90}ms` }}>
                  <span className="flex size-9 items-center justify-center rounded-[10px] bg-ev-selected text-ev-primary">
                    <I className="size-[18px]" />
                  </span>
                  <span className="text-sm font-semibold">{t}</span>
                  <span className="text-xs leading-snug text-ev-muted">{d}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-2.5 px-7 pb-[max(env(safe-area-inset-bottom),28px)] pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <button type="button" onClick={finish} className="h-11 text-sm font-medium text-ev-muted hover:text-ev-ink">
                Je découvrirai seul
              </button>
              <button type="button" autoFocus onClick={next} className="flex h-12 items-center justify-center gap-2 rounded-[12px] bg-ev-primary px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(11,59,46,.3)] hover:bg-ev-primary-hover">
                Commencer la visite <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zones */}
      {spot && (
        <div
          key={step}
          className={cn(
            "giyax-pop absolute w-full rounded-t-[22px] bg-ev-surface p-5 text-ev-ink shadow-[0_24px_70px_rgba(0,0,0,.35)] sm:w-[340px] sm:rounded-[20px]",
            rect ? "bottom-0 left-0 sm:bottom-auto" : "bottom-0 left-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          )}
          style={cardPosition(rect)}
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-[12px] bg-ev-selected text-ev-primary">
              <spot.icon className="size-5" />
            </span>
            <span className="rounded-full bg-ev-soft px-2.5 py-1 text-xs font-semibold text-ev-muted">
              {step + 1} / {total}
            </span>
          </div>
          <h3 className="m-0 mt-3.5 text-[18px] font-semibold tracking-[-0.01em]">{spot.title}</h3>
          <p className="m-0 mt-1.5 text-sm leading-relaxed text-ev-ink2">{spot.text}</p>
          <div className="mt-4 flex gap-1" aria-hidden>
            {spots.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-ev-primary" : i < step ? "w-1.5 bg-ev-primary/40" : "w-1.5 bg-ev-line")} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 pb-[env(safe-area-inset-bottom)]">
            <button type="button" onClick={finish} className="text-[13px] font-medium text-ev-muted hover:text-ev-ink">
              Passer la visite
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={back} className="h-10 rounded-[10px] border border-ev-border px-3.5 text-sm font-medium hover:bg-ev-soft">
                Retour
              </button>
              <button type="button" autoFocus onClick={next} className="flex h-10 items-center gap-1.5 rounded-[10px] bg-ev-primary px-4 text-sm font-semibold text-white hover:bg-ev-primary-hover">
                {step === total - 1 ? "Terminer" : "Suivant"} <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vous êtes prêt */}
      {step === total && (
        <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-6">
          <div className="giyax-pop w-full overflow-hidden rounded-t-[28px] bg-ev-surface text-ev-ink shadow-[0_40px_100px_rgba(0,0,0,.4)] sm:max-w-[520px] sm:rounded-[28px]">
            <div className="flex flex-col items-center gap-3 px-7 pb-2 pt-8 text-center sm:px-10">
              <span className="relative flex size-20 items-center justify-center">
                <span className="giyax-halo absolute inset-0 rounded-full bg-ev-primary/25" />
                <span className="relative flex size-16 items-center justify-center rounded-full bg-ev-primary text-white shadow-[0_12px_30px_rgba(11,59,46,.35)]">
                  <Check className="size-8" strokeWidth={3} />
                </span>
              </span>
              <h2 className="m-0 text-[26px] font-bold tracking-[-0.02em]">Vous êtes prêt !</h2>
              <p className="m-0 max-w-[380px] text-[15px] leading-relaxed text-ev-ink2">Voici par où commencer. Vous pouvez revoir cette visite à tout moment avec la boussole, en haut de l&apos;écran.</p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-2 px-7 pt-4 sm:px-10">
              {firstSteps.map((s, i) => {
                const inner = (
                  <>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ev-selected text-ev-primary">
                      <s.icon className="size-[18px]" />
                    </span>
                    <span className="flex-1 text-left text-sm font-medium">{s.label}</span>
                    <ArrowRight className="size-4 text-ev-muted transition-transform group-hover:translate-x-1 group-hover:text-ev-primary" />
                  </>
                );
                const cls = "group flex w-full items-center gap-3 rounded-[14px] border border-ev-border p-3 transition-colors hover:border-ev-primary hover:bg-ev-selected/40";
                return (
                  <li key={s.label} className="giyax-pop" style={{ animationDelay: `${i * 70}ms` }}>
                    {s.create ? (
                      <button
                        type="button"
                        className={cls}
                        onClick={() => {
                          finish();
                          setCreateEventOpen(true);
                        }}
                      >
                        {inner}
                      </button>
                    ) : (
                      <Link href={s.href!} className={cls} onClick={finish}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="px-7 pb-[max(env(safe-area-inset-bottom),28px)] pt-5 sm:px-10">
              <button type="button" autoFocus onClick={finish} className="h-12 w-full rounded-[12px] bg-ev-primary text-[15px] font-semibold text-white hover:bg-ev-primary-hover">
                C&apos;est parti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
