"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle, Panel } from "@/components/vision/vision-ui";
import { getVisionSession, visionApi } from "@/lib/vision";

// Changement de mot de passe de l'administrateur connecté : mot de passe
// actuel + code d'authentification frais exigés par l'API.
export default function VisionAccountPage() {
  const admin = getVisionSession()?.admin;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const strong = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{14,}$/.test(next);
  const ready = current && strong && next === confirm && code.length === 6;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    try {
      await visionApi.post("/auth/password", { currentPassword: current, newPassword: next, code });
      toast.success("Mot de passe modifié.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      toast.error(
        status === 429
          ? "Trop de tentatives. Réessayez dans 15 minutes."
          : status === 400
            ? "Nouveau mot de passe refusé (trop faible ou identique)."
            : "Mot de passe actuel ou code invalide."
      );
    } finally {
      setCode("");
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Mon compte" subtitle={admin ? `${admin.name} · ${admin.email}` : undefined} />
      <Panel title="Changer le mot de passe" className="max-w-lg" aside={<KeyRound className="size-4 text-muted-foreground" />}>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cur">Mot de passe actuel</Label>
            <Input id="cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">Nouveau mot de passe</Label>
            <Input id="new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
            <p className={`text-xs ${next && !strong ? "text-destructive" : "text-muted-foreground"}`}>
              Au moins 14 caractères, avec lettres, chiffres et un symbole.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conf">Confirmer</Label>
            <Input id="conf" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {confirm && confirm !== next && <p className="text-xs text-destructive">Les deux saisies diffèrent.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="otp">Code d&apos;authentification</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="font-mono tracking-[0.4em]"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={!ready || busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Changer le mot de passe
          </Button>
        </form>
      </Panel>
    </>
  );
}
