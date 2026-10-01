"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Code de secours imprimé sous le QR du billet (QR abîmé, écran cassé…).
// Même chemin que le scan caméra : backend en ligne, manifeste hors ligne.
const MIN_LENGTH = 32;

export function ManualEntry({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const trimmed = code.trim();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed.length < MIN_LENGTH) return;
        onSubmit(trimmed);
        setCode("");
      }}
    >
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Saisir le code du billet"
        aria-label="Code du billet"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={500}
        className="h-11 bg-white/95 font-mono text-sm text-neutral-900"
      />
      <Button type="submit" className="h-11" disabled={disabled || trimmed.length < MIN_LENGTH}>
        <Keyboard className="size-4" />
        Valider
      </Button>
    </form>
  );
}
