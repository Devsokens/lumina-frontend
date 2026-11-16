"use client";

import { GiyaxOverlay } from "@/components/shared/giyax-loader";
import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { setVisionSession, visionApi, type VisionSession } from "@/lib/vision";
import { eventFontVariables } from "@/lib/event-fonts";
import { cn } from "@/lib/utils";

// Connexion à la console plateforme : e-mail, mot de passe et code de
// l'application d'authentification (TOTP). Messages volontairement
// génériques : l'API ne dit jamais lequel des trois est faux.
//
// Habillage aux couleurs GiyaX (vert forêt et or du logo). Fond : le logo en
// filigrane, répété en bandes inclinées qui défilent lentement en sens
// alternés (immobile si le système demande moins d'animations).

const BRAND = {
  "--vl-bg": "#04100c",
  "--vl-card": "rgb(8 26 20 / 0.82)",
  "--vl-line": "rgb(255 255 255 / 0.09)",
  "--vl-field": "rgb(255 255 255 / 0.045)",
  "--vl-text": "#e9f2ee",
  "--vl-muted": "#8ea69b",
  "--vl-green": "#2fae86",
  "--vl-forest": "#0a4f3c",
  "--vl-gold": "#e0b13c",
} as CSSProperties;

const ROWS = 9;
const PER_ROW = 8;

function Watermark() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 flex w-[220vmax] -translate-x-1/2 -translate-y-1/2 -rotate-[16deg] flex-col gap-12 sm:gap-16">
        {Array.from({ length: ROWS }, (_, row) => (
          <div
            key={row}
            // Deux copies bout à bout : le défilement de −50 % boucle sans raccord.
            className="vision-marquee flex w-max motion-reduce:[animation-play-state:paused]"
            style={{ animationDuration: `${70 + (row % 3) * 22}s`, animationDirection: row % 2 ? "reverse" : "normal" }}
          >
            {Array.from({ length: PER_ROW * 2 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "mx-8 block h-[52px] w-[124px] shrink-0 bg-contain bg-center bg-no-repeat sm:mx-12 sm:h-[66px] sm:w-[156px]",
                  // Une bande sur deux en logo doré, l'autre en blanc : plus discret.
                  row % 2 ? "bg-[url(/brand/giyax-logo-mono.png)] opacity-[0.05]" : "bg-[url(/brand/giyax-logo-white.png)] opacity-[0.08]"
                )}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Halo vert derrière le formulaire, bords assombris : le filigrane reste un fond. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgb(10_79_60/0.55),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_45%,var(--vl-bg)_100%)]" />
    </div>
  );
}

export default function VisionLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeFocus, setCodeFocus] = useState(false);
  const codeField = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data } = await visionApi.post<{ data: VisionSession }>("/auth/login", { email, password, code });
      setVisionSession(data.data);
      router.replace("/vision");
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      setError(
        status === 429
          ? "Trop de tentatives. Réessayez dans 15 minutes."
          : status === 404
            ? "Console non activée sur ce serveur."
            : "Identifiants ou code invalides."
      );
      setCode("");
      codeField.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  const field =
    "h-11 w-full rounded-[12px] border border-(--vl-line) bg-(--vl-field) pl-11 pr-4 text-[15px] text-(--vl-text) outline-none transition-colors placeholder:text-(--vl-muted)/60 focus:border-(--vl-green) focus:bg-white/[0.07]";
  const label = "text-[13px] font-medium text-(--vl-text)";
  const icon = "pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-(--vl-muted)";

  return (
    <main style={BRAND} className={cn(eventFontVariables, "relative flex h-dvh items-center justify-center overflow-hidden bg-(--vl-bg) px-4 font-ev text-(--vl-text)")}>
      <Watermark />
      <GiyaxOverlay show={busy} label="Connexion à la console…" />

      <form
        onSubmit={submit}
        className="relative max-h-[calc(100dvh-24px)] w-full max-w-[420px] overflow-y-auto rounded-[24px] [scrollbar-width:none] border border-(--vl-line) bg-(--vl-card) shadow-[0_40px_120px_rgb(0_0_0/0.55)] backdrop-blur-xl"
      >
        {/* Filet or, rappel du trait du logo. */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--vl-gold),transparent)]" />

        <div className="flex flex-col items-center gap-3 px-7 pt-7 text-center sm:px-9 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:pt-5">
          <Image src="/brand/giyax-logo-white.png" alt="GiyaX" width={480} height={203} priority className="h-[46px] w-auto [@media(max-height:700px)]:h-[38px]" />
          <span className="flex items-center gap-2 rounded-full border border-(--vl-gold)/35 bg-(--vl-gold)/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--vl-gold)">
            <span className="size-1.5 rounded-full bg-(--vl-gold)" />
            Vision
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-ev text-xl font-semibold tracking-[-0.01em]">Console de la plateforme</h1>
            <p className="m-0 text-[13px] text-(--vl-muted)">Accès réservé aux administrateurs GiyaX.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 px-7 pb-6 pt-5 sm:px-9 [@media(max-height:700px)]:gap-2.5 [@media(max-height:700px)]:pb-4 [@media(max-height:700px)]:pt-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="v-email" className={label}>
              E-mail
            </label>
            <div className="relative">
              <Mail className={icon} />
              <input id="v-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@giyax.com" className={field} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="v-password" className={label}>
              Mot de passe
            </label>
            <div className="relative">
              <Lock className={icon} />
              <input
                id="v-password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(field, "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[10px] text-(--vl-muted) hover:bg-white/[0.06] hover:text-(--vl-text)"
              >
                {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="v-code" className={cn(label, "flex items-center gap-2")}>
              <KeyRound className="size-4 text-(--vl-gold)" />
              Code d&apos;authentification
            </label>
            {/* Un seul champ (collage et saisie automatique du code conservés), affiché en six cases. */}
            <div className="relative">
              <input
                id="v-code"
                ref={codeField}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onFocus={() => setCodeFocus(true)}
                onBlur={() => setCodeFocus(false)}
                aria-describedby="v-code-help"
                className="absolute inset-0 z-10 h-full w-full cursor-text rounded-[14px] bg-transparent text-transparent caret-transparent outline-none"
              />
              <div aria-hidden className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, i) => {
                  const active = codeFocus && i === Math.min(code.length, 5);
                  return (
                    <span
                      key={i}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-[12px] border bg-(--vl-field) text-lg font-semibold tabular-nums transition-colors",
                        active ? "border-(--vl-gold) bg-white/[0.07]" : code[i] ? "border-(--vl-green)/60" : "border-(--vl-line)"
                      )}
                    >
                      {code[i] ?? (active ? <span className="h-5 w-px animate-pulse bg-(--vl-gold)" /> : "")}
                    </span>
                  );
                })}
              </div>
            </div>
            <p id="v-code-help" className="m-0 text-xs text-(--vl-muted)">
              Les 6 chiffres de votre application d&apos;authentification.
            </p>
          </div>

          {error && (
            <p role="alert" className="m-0 rounded-[14px] border border-[#E5484D]/40 bg-[#E5484D]/10 px-3.5 py-2.5 text-sm text-[#ff8589]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[linear-gradient(180deg,#2fae86,#12805f)] text-[15px] font-semibold text-white shadow-[0_10px_30px_rgb(18_128_95/0.35)] transition-[filter,opacity] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--vl-gold) disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Se connecter
          </button>
        </div>

        <p className="m-0 flex items-center justify-center gap-2 border-t border-(--vl-line) px-7 py-3 text-center text-xs text-(--vl-muted)">
          <Lock className="size-3.5" />
          Session de 30 minutes · chaque connexion est journalisée
        </p>
      </form>
    </main>
  );
}
