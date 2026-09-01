"use client";

import { useState } from "react";
import {
  ScanLine,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Camera,
  Keyboard,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ScanValidationState = "IDLE" | "VALID" | "ALREADY_USED" | "INVALID";

export default function EventScannerPage() {
  const [manualCode, setManualCode] = useState("");
  const [status, setStatus] = useState<ScanValidationState>("IDLE");
  const [ticketDetails, setTicketDetails] = useState<{
    number: string;
    guest: string;
    type: string;
    event: string;
    scannedAt?: string;
  } | null>(null);

  const [scannedHistory, setScannedHistory] = useState<
    Array<{ code: string; name: string; type: string; time: string; valid: boolean }>
  >([
    {
      code: "GA-EVT-9081",
      name: "Jean-Paul Ndong",
      type: "Pass VIP (Carré Or)",
      time: "20:15",
      valid: true,
    },
    {
      code: "GA-EVT-9083",
      name: "Brice Mba Obiang",
      type: "Pass Standard",
      time: "19:48",
      valid: true,
    },
  ]);

  function handleValidateCode(codeToTest?: string) {
    const code = (codeToTest ?? manualCode).trim().toUpperCase();
    if (!code) {
      toast.error("Veuillez saisir ou scanner un code de billet");
      return;
    }

    // Fraud check simulation
    if (code === "GA-EVT-9081" || code.includes("USED")) {
      setStatus("ALREADY_USED");
      setTicketDetails({
        number: code,
        guest: "Jean-Paul Ndong",
        type: "Pass VIP",
        event: "Festival Urban Afro 2026",
        scannedAt: "Il y a 12 minutes au Portail 1",
      });
      toast.error("ALERTE : Ce billet a DÉJÀ été scanné !");
    } else if (code.startsWith("GA-EVT") || code.length >= 6) {
      setStatus("VALID");
      const guestName = code.includes("82") ? "Aïcha Bongo" : "Invité Privilégié";
      setTicketDetails({
        number: code,
        guest: guestName,
        type: "Pass VIP All-Access",
        event: "Festival Urban Afro 2026",
      });
      setScannedHistory((prev) => [
        {
          code,
          name: guestName,
          type: "Pass VIP",
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          valid: true,
        },
        ...prev,
      ]);
      toast.success("Billet Valide — Accès Autorisé");
    } else {
      setStatus("INVALID");
      setTicketDetails(null);
      toast.error("Billet Invalide ou Inconnu");
    }
  }

  function handleReset() {
    setStatus("IDLE");
    setTicketDetails(null);
    setManualCode("");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
              PWA Mode Portique Actif
            </span>
            <span className="text-xs text-muted-foreground">• Synchronisation instantanée</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
            Contrôle d&apos;Accès & Scanner
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Validation ultra-rapide des billets QR Code aux portails d&apos;entrée.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground font-semibold">
            Portail #01 • Principal
          </span>
        </div>
      </div>

      {/* Main Validation Stage */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left: Interactive Scanner / Input HUD */}
        <div className="md:col-span-7 space-y-4">
          <div
            className={`rounded-3xl border p-6 text-center transition-all ${
              status === "IDLE"
                ? "border-border bg-card shadow-sm"
                : status === "VALID"
                ? "border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/10"
                : status === "ALREADY_USED"
                ? "border-red-500 bg-red-500/10 shadow-xl shadow-red-500/10"
                : "border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/10"
            }`}
          >
            {status === "IDLE" && (
              <div className="py-6 space-y-4">
                <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-pulse">
                  <ScanLine className="size-10" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Prêt pour le prochain billet
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Présentez le QR code devant l&apos;objectif ou entrez le code alphanumérique ci-dessous.
                  </p>
                </div>
              </div>
            )}

            {status === "VALID" && (
              <div className="py-4 space-y-3">
                <div className="size-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
                  <ShieldCheck className="size-9" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                    ACCÈS AUTORISÉ
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-foreground mt-1">
                    {ticketDetails?.guest}
                  </h3>
                  <p className="text-sm font-semibold text-emerald-500 mt-0.5">
                    {ticketDetails?.type} • N° {ticketDetails?.number}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs mt-2"
                  onClick={handleReset}
                >
                  Scanner Billet Suivant (Entrée Validée)
                </Button>
              </div>
            )}

            {status === "ALREADY_USED" && (
              <div className="py-4 space-y-3">
                <div className="size-16 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                  <XCircle className="size-9" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest block">
                    REFUS D&apos;ACCÈS — BILLET DÉJÀ UTILISÉ
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-foreground mt-1">
                    {ticketDetails?.guest}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scanné : {ticketDetails?.scannedAt}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs border-red-500/30 text-red-400 mt-2"
                  onClick={handleReset}
                >
                  Réinitialiser
                </Button>
              </div>
            )}

            {status === "INVALID" && (
              <div className="py-4 space-y-3">
                <div className="size-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                  <AlertTriangle className="size-9" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-amber-600 uppercase tracking-widest block">
                    CODE NON RECONNU
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ce billet n&apos;existe pas dans la base de données de cet événement.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs mt-2"
                  onClick={handleReset}
                >
                  Réessayer
                </Button>
              </div>
            )}
          </div>

          {/* Manual Input Bar */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Keyboard className="size-4 text-primary" />
              Saisie manuelle rapide du code billet
            </span>

            <div className="flex gap-2">
              <Input
                placeholder="Ex: GA-EVT-9082"
                className="h-11 rounded-xl font-mono uppercase"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleValidateCode();
                }}
              />
              <Button
                className="rounded-xl bg-primary text-white font-semibold px-5"
                onClick={() => handleValidateCode()}
              >
                Valider
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground self-center">Tests rapides :</span>
              <button
                type="button"
                onClick={() => {
                  setManualCode("GA-EVT-9082");
                  handleValidateCode("GA-EVT-9082");
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground"
              >
                GA-EVT-9082 (Valide VIP)
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualCode("GA-EVT-9081");
                  handleValidateCode("GA-EVT-9081");
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground"
              >
                GA-EVT-9081 (Déjà Scanné)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Scanned Feed */}
        <div className="md:col-span-5 rounded-3xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                <Zap className="size-4 text-amber-500" />
                Derniers Passages (Portique 1)
              </h4>
              <span className="text-[11px] font-mono text-muted-foreground">Temps réel</span>
            </div>

            <div className="space-y-2.5">
              {scannedHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {item.code} • {item.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-emerald-500">
                      {item.time}
                    </span>
                    <span className="block text-[10px] text-emerald-500">Autorisé ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Total entrées portail : <strong>156</strong></span>
            <span className="text-emerald-500 font-medium">99.9% Fluidité</span>
          </div>
        </div>
      </div>
    </div>
  );
}
