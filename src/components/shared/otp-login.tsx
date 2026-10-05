"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import type { AuthUser } from "@/stores/useAuthStore";

const PHONE_FORMAT = /^\+?[0-9]{8,15}$/;

// Connexion par code SMS (POST /auth/otp/request puis /auth/otp/verify).
// Sert aussi de recours en cas de mot de passe oublié.
export function OtpLogin({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const { requestOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const normalized = phone.replace(/[\s.()-]/g, "");

  async function send() {
    if (!PHONE_FORMAT.test(normalized)) {
      toast.error("Numéro invalide (ex. +24177123456).");
      return;
    }
    setBusy(true);
    try {
      await requestOtp(normalized);
      setSent(true);
      // Réponse identique que le numéro ait un compte ou non (anti-énumération).
      toast.success("Si ce numéro a un compte, un code vous a été envoyé par SMS.");
    } catch (err) {
      toast.error(apiError(err, "Envoi du code impossible."));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(code)) {
      toast.error("Le code comporte 6 chiffres.");
      return;
    }
    setBusy(true);
    try {
      onSuccess(await verifyOtp({ phone: normalized, code }));
    } catch (err) {
      toast.error(apiError(err, "Code incorrect ou expiré."));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={verify} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="otp-phone">Téléphone</Label>
        <Input
          id="otp-phone"
          type="tel"
          className="h-11 rounded-xl"
          placeholder="+241 77 12 34 56"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          disabled={sent}
        />
      </div>
      {sent && (
        <div className="space-y-1.5">
          <Label htmlFor="otp-code">Code reçu par SMS</Label>
          <Input
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="h-11 rounded-xl font-mono tracking-[0.4em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      )}
      {sent ? (
        <div className="flex gap-2">
          <Button type="submit" className="h-11 flex-1 rounded-xl" disabled={busy}>
            {busy ? "Vérification…" : "Se connecter"}
          </Button>
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={send} disabled={busy}>
            Renvoyer
          </Button>
        </div>
      ) : (
        <Button type="button" className="h-11 w-full rounded-xl" onClick={send} disabled={busy}>
          {busy ? "Envoi…" : "Recevoir un code"}
        </Button>
      )}
    </form>
  );
}
