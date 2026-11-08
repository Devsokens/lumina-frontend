"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { toast } from "sonner";
import { ArrowLeft, Check, ListChecks, Loader2, MessageSquareText, Sparkles, X } from "lucide-react";
import { EV_PORTAL } from "@/components/events/ev-ui";
import { GiyaxAvatar } from "@/components/ai/giyax-avatar";
import { useExperience, useSendFeedback, useSnoozeFeedback, type FeedbackInput } from "@/hooks/useExperience";
import { useShellStore } from "@/stores/useShellStore";
import { apiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// « Aidez-nous à améliorer votre expérience » : quelques questions, des
// idées libres, ou les deux. Proposée régulièrement (FeedbackPrompter) et
// toujours accessible depuis le menu du compte. Réponses : POST /me/feedback,
// lues dans la console /vision.

type Mode = FeedbackInput["mode"];
type Step = "intro" | "rating" | "nps" | "likes" | "improve" | "free" | "done";

const FLOW: Record<Mode, Step[]> = {
  survey: ["rating", "nps", "likes", "improve"],
  free: ["free"],
  both: ["rating", "nps", "likes", "improve", "free"],
};

const FACES = [
  { v: 1, emoji: "😣", label: "Difficile" },
  { v: 2, emoji: "😕", label: "Bof" },
  { v: 3, emoji: "😐", label: "Correct" },
  { v: 4, emoji: "🙂", label: "Bien" },
  { v: 5, emoji: "😍", label: "J'adore" },
];

const LIKES = ["Billetterie en ligne", "Contrôle d'accès", "Mon site web", "Paiements Mobile Money", "Attestations", "Mon équipe", "GiyaX AI", "Statistiques"];
const IMPROVE = ["Simplicité", "Rapidité", "Paiements et versements", "Design", "Fonctionnalités manquantes", "Support", "Application mobile", "Prix"];
const CATEGORIES: { id: NonNullable<FeedbackInput["category"]>; label: string; emoji: string }[] = [
  { id: "idee", label: "Une idée", emoji: "💡" },
  { id: "probleme", label: "Un problème", emoji: "🐞" },
  { id: "autre", label: "Autre chose", emoji: "💬" },
];

const STEP_TITLE: Record<Exclude<Step, "intro" | "done">, string> = {
  rating: "Comment trouvez-vous GiyaX aujourd'hui ?",
  nps: "Recommanderiez-vous GiyaX à un autre organisateur ?",
  likes: "Qu'utilisez-vous le plus ?",
  improve: "Que devrions-nous améliorer en priorité ?",
  free: "Qu'aimeriez-vous voir évoluer ?",
};

function npsTone(n: number) {
  return n <= 6 ? "bg-[#E5484D] text-white border-[#E5484D]" : n <= 8 ? "bg-[#F5B83D] text-[#2A1F05] border-[#F5B83D]" : "bg-ev-primary text-white border-ev-primary";
}

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm transition-all",
        on ? "border-ev-primary bg-ev-selected font-semibold text-ev-primary" : "border-ev-border bg-ev-surface text-ev-ink2 hover:border-ev-dash"
      )}
    >
      {on && <Check className="size-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}

export function FeedbackModal() {
  const pathname = usePathname();
  const open = useShellStore((s) => s.feedbackOpen);
  const setOpen = useShellStore((s) => s.setFeedbackOpen);
  const send = useSendFeedback();
  const snooze = useSnoozeFeedback();

  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [rating, setRating] = useState<number | null>(null);
  const [nps, setNps] = useState<number | null>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [improve, setImprove] = useState<string[]>([]);
  const [category, setCategory] = useState<NonNullable<FeedbackInput["category"]>>("idee");
  const [message, setMessage] = useState("");

  function reset() {
    setMode(null);
    setStep("intro");
    setRating(null);
    setNps(null);
    setLikes([]);
    setImprove([]);
    setCategory("idee");
    setMessage("");
  }

  // Fermer sans envoyer : on repropose dans quelques jours.
  function close() {
    if (step !== "done") snooze.mutate();
    setOpen(false);
    window.setTimeout(reset, 250);
  }

  const flow = mode ? FLOW[mode] : [];
  const index = flow.indexOf(step);
  const last = index === flow.length - 1;

  function start(m: Mode) {
    setMode(m);
    setStep(FLOW[m][0]);
  }

  async function submit() {
    if (!mode) return;
    try {
      await send.mutateAsync({
        mode,
        ...(rating ? { rating } : {}),
        ...(nps !== null ? { nps } : {}),
        ...(likes.length ? { likes } : {}),
        ...(improve.length ? { improvements: improve } : {}),
        ...(mode !== "survey" && message.trim() ? { category, message: message.trim() } : {}),
        page: pathname,
      });
      setStep("done");
    } catch (err) {
      toast.error(apiError(err, "Envoi impossible, réessayez."));
    }
  }

  function next() {
    if (last) void submit();
    else setStep(flow[index + 1]);
  }

  const toggle = (list: string[], set: (v: string[]) => void, v: string, max = 12) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v]);

  const canSend = step !== "free" || message.trim().length > 0 || mode === "both";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-[rgba(10,24,18,.5)] backdrop-blur-[4px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            EV_PORTAL,
            "fixed inset-x-0 bottom-0 z-[80] flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[24px] bg-ev-surface text-ev-ink shadow-[0_30px_80px_rgba(12,22,18,.35)] outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-6 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(580px,calc(100%-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:data-[state=open]:zoom-in-95"
          )}
        >
          {/* En-tête */}
          {step === "intro" ? (
            <div className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_10%_0%,#1C8A64_0%,#0F5A44_45%,#0B3B2E_100%)] px-6 pb-7 pt-7 text-white sm:px-8">
              <span aria-hidden className="absolute -right-10 -top-10 size-44 rounded-full bg-[#F5B83D]/15 blur-2xl" />
              <span aria-hidden className="absolute -bottom-16 left-10 size-40 rounded-full bg-white/10 blur-2xl" />
              <DialogPrimitive.Close aria-label="Fermer" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-[10px] bg-white/10 hover:bg-white/20">
                <X className="size-4" />
              </DialogPrimitive.Close>
              <span className="relative inline-flex rounded-full bg-white p-1.5 shadow-lg">
                <GiyaxAvatar size={52} halo />
              </span>
              <DialogPrimitive.Title className="relative mt-4 text-[26px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
                Aidez-nous à améliorer votre expérience
              </DialogPrimitive.Title>
              <p className="relative m-0 mt-2 max-w-[440px] text-[15px] leading-relaxed text-white/80">
                Deux minutes pour façonner le GiyaX de demain. Chaque réponse est lue par l&apos;équipe.
              </p>
            </div>
          ) : step === "done" ? (
            <DialogPrimitive.Title className="sr-only">Merci</DialogPrimitive.Title>
          ) : (
            <div className="flex flex-col gap-3 border-b border-ev-line px-6 pb-4 pt-5 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => (index > 0 ? setStep(flow[index - 1]) : setStep("intro"))} className="flex items-center gap-1.5 text-[13px] font-medium text-ev-muted hover:text-ev-ink">
                  <ArrowLeft className="size-4" /> Retour
                </button>
                <span className="text-xs font-semibold text-ev-muted">
                  {index + 1} sur {flow.length}
                </span>
                <DialogPrimitive.Close aria-label="Fermer" className="flex size-8 items-center justify-center rounded-[8px] text-ev-muted hover:bg-ev-soft">
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>
              <span className="h-1.5 overflow-hidden rounded-full bg-ev-line">
                <span className="block h-full rounded-full bg-ev-primary transition-[width] duration-300" style={{ width: `${((index + 1) / flow.length) * 100}%` }} />
              </span>
              <DialogPrimitive.Title className="m-0 pt-1 text-[20px] font-semibold leading-snug tracking-[-0.01em]">{STEP_TITLE[step]}</DialogPrimitive.Title>
            </div>
          )}

          {/* Contenu */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {step === "intro" && (
              <div className="flex flex-col gap-3">
                {(
                  [
                    ["survey", ListChecks, "Répondre à quelques questions", "4 questions rapides, environ 1 minute."],
                    ["free", MessageSquareText, "Partager mes idées", "Ce que vous aimeriez voir arriver, ou ce qui vous gêne."],
                    ["both", Sparkles, "Les deux", "Les questions, puis vos idées."],
                  ] as const
                ).map(([m, Icon, title, desc]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => start(m)}
                    className="group flex items-center gap-4 rounded-[16px] border border-ev-border bg-ev-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ev-primary hover:shadow-[0_10px_30px_rgba(11,59,46,.12)]"
                  >
                    <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-[14px]", m === "both" ? "bg-[#F5B83D]/20 text-[#9A6A0A]" : "bg-ev-selected text-ev-primary")}>
                      <Icon className="size-6" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2 text-[15px] font-semibold">
                        {title}
                        {m === "both" && <span className="rounded-full bg-[#F5B83D] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#2A1F05]">Idéal</span>}
                      </span>
                      <span className="text-[13px] text-ev-muted">{desc}</span>
                    </span>
                    <ArrowLeft className="size-4 rotate-180 text-ev-muted transition-transform group-hover:translate-x-1 group-hover:text-ev-primary" />
                  </button>
                ))}
                <p className="m-0 pt-2 text-center text-xs leading-relaxed text-ev-muted">Vos réponses servent uniquement à améliorer GiyaX.</p>
              </div>
            )}

            {step === "rating" && (
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {FACES.map((f) => (
                  <button
                    key={f.v}
                    type="button"
                    aria-pressed={rating === f.v}
                    onClick={() => setRating(f.v)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-[16px] border py-4 transition-all",
                      rating === f.v ? "scale-[1.04] border-ev-primary bg-ev-selected shadow-[0_8px_24px_rgba(11,59,46,.15)]" : "border-ev-border hover:border-ev-dash"
                    )}
                  >
                    <span className={cn("text-[30px] leading-none transition-transform sm:text-[36px]", rating === f.v && "scale-110")}>{f.emoji}</span>
                    <span className={cn("text-[11px] sm:text-xs", rating === f.v ? "font-semibold text-ev-primary" : "text-ev-muted")}>{f.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === "nps" && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-11 sm:gap-1.5">
                  {Array.from({ length: 11 }, (_, n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={nps === n}
                      onClick={() => setNps(n)}
                      className={cn("flex h-11 items-center justify-center rounded-[10px] border text-sm font-semibold transition-all", nps === n ? npsTone(n) : "border-ev-border hover:border-ev-dash")}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-ev-muted">
                  <span>Pas du tout</span>
                  <span>Sans hésiter</span>
                </div>
              </div>
            )}

            {step === "likes" && (
              <div className="flex flex-wrap gap-2">
                {LIKES.map((l) => (
                  <Chip key={l} on={likes.includes(l)} onClick={() => toggle(likes, setLikes, l)}>
                    {l}
                  </Chip>
                ))}
              </div>
            )}

            {step === "improve" && (
              <div className="flex flex-col gap-3">
                <span className="text-[13px] text-ev-muted">Jusqu&apos;à 3 choix.</span>
                <div className="flex flex-wrap gap-2">
                  {IMPROVE.map((l) => (
                    <Chip key={l} on={improve.includes(l)} onClick={() => toggle(improve, setImprove, l, 3)}>
                      {l}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {step === "free" && (
              <div className="flex flex-col gap-4">
                <div role="radiogroup" aria-label="Type de retour" className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={category === c.id}
                      onClick={() => setCategory(c.id)}
                      className={cn("flex flex-col items-center gap-1 rounded-[14px] border py-3 text-[13px] transition-all", category === c.id ? "border-ev-primary bg-ev-selected font-semibold text-ev-primary" : "border-ev-border text-ev-ink2 hover:border-ev-dash")}
                    >
                      <span className="text-xl leading-none">{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
                <label className="flex flex-col gap-1.5">
                  <textarea
                    rows={5}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    autoFocus
                    placeholder={
                      category === "probleme"
                        ? "Décrivez ce qui s'est passé et sur quelle page…"
                        : "Ex. : pouvoir exporter les participants en Excel, une appli pour le scan, des billets VIP avec table…"
                    }
                    className="resize-none rounded-[14px] border border-ev-border bg-ev-surface px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-ev-muted focus:border-ev-primary focus:shadow-[0_0_0_3px_var(--ev-mint)]"
                  />
                  <span className="self-end text-xs text-ev-muted">{message.length} / 2000</span>
                </label>
              </div>
            )}

            {step === "done" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <span className="relative flex size-24 items-center justify-center">
                  <span className="giyax-halo absolute inset-0 rounded-full bg-ev-primary/25" />
                  <span className="giyax-pop relative flex size-20 items-center justify-center rounded-full bg-ev-primary text-white shadow-[0_12px_30px_rgba(11,59,46,.35)]">
                    <Check className="size-10" strokeWidth={3} />
                  </span>
                </span>
                <span className="text-[24px] font-bold tracking-[-0.02em]">Merci, c&apos;est précieux !</span>
                <p className="m-0 max-w-[380px] text-[15px] leading-relaxed text-ev-ink2">Votre avis arrive directement chez l&apos;équipe GiyaX. Nous vous tiendrons au courant des nouveautés.</p>
                <span className="mt-1 flex items-center gap-2 text-[13px] text-ev-muted">
                  <GiyaxAvatar size={28} mood="talking" /> GiyaX AI vous dit à bientôt
                </span>
              </div>
            )}
          </div>

          {/* Pied */}
          {step === "intro" ? (
            <div className="flex justify-center border-t border-ev-line px-6 py-3.5">
              <button type="button" onClick={close} className="text-[13px] font-medium text-ev-muted hover:text-ev-ink">
                Plus tard
              </button>
            </div>
          ) : step === "done" ? (
            <div className="border-t border-ev-line px-6 py-4 sm:px-8">
              <button type="button" onClick={close} className="h-12 w-full rounded-[12px] bg-ev-primary text-[15px] font-semibold text-white hover:bg-ev-primary-hover">
                Fermer
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 border-t border-ev-line px-6 py-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:px-8">
              {last ? (
                <span />
              ) : (
                <button type="button" onClick={next} className="text-[13px] font-medium text-ev-muted hover:text-ev-ink">
                  Passer
                </button>
              )}
              <button
                type="button"
                onClick={next}
                disabled={send.isPending || (last && !canSend)}
                className="flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-[12px] bg-ev-primary px-6 text-[15px] font-semibold text-white transition-colors hover:bg-ev-primary-hover disabled:opacity-50"
              >
                {send.isPending && <Loader2 className="size-4 animate-spin" />}
                {last ? "Envoyer" : "Continuer"}
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Propose l'avis quand il est dû (serveur : pas le premier jour, puis tous
// les 3 jours si on le ferme, 30 jours après une réponse), une minute après
// l'arrivée, une seule fois par session, jamais par-dessus autre chose.
const SESSION_KEY = "giyax-feedback-prompted";

export function FeedbackPrompter() {
  const { data } = useExperience();
  const due = !!data?.feedbackDue;

  useEffect(() => {
    if (!due) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // stockage indisponible : on propose quand même
    }
    const t = window.setTimeout(() => {
      const s = useShellStore.getState();
      if (document.hidden || s.tourOpen || s.feedbackOpen || s.createEventOpen || s.paletteOpen || s.newOrgOpen || s.businessOpen) return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignoré
      }
      s.setFeedbackOpen(true);
    }, 60_000);
    return () => window.clearTimeout(t);
  }, [due]);

  return null;
}
