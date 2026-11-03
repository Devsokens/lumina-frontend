"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setVisionSession, visionApi, type VisionSession } from "@/lib/vision";

// Connexion à la console plateforme : e-mail, mot de passe et code de
// l'application d'authentification (TOTP). Messages volontairement
// génériques : l'API ne dit jamais lequel des trois est faux.
export default function VisionLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <form onSubmit={submit} className="relative w-full max-w-sm space-y-6 rounded-3xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur">
        <div className="space-y-2 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight">GiyaX Vision</h1>
          <p className="text-sm text-muted-foreground">Accès réservé aux administrateurs de la plateforme.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="v-email">E-mail</Label>
            <Input id="v-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="v-password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-code">Code d&apos;authentification</Label>
            <Input
              id="v-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center font-mono text-lg tracking-[0.5em]"
            />
            <p className="text-xs text-muted-foreground">Code à 6 chiffres de votre application (Google Authenticator, Aegis…).</p>
          </div>
        </div>

        {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full rounded-xl" disabled={busy || code.length !== 6}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Se connecter
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">Session de 30 minutes · toute connexion est journalisée</p>
      </form>
    </main>
  );
}
