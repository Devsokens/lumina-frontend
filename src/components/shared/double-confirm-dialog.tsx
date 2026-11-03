"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Step = { title: string; description: React.ReactNode; confirmLabel: string };

// Action sensible validée en deux temps : une première confirmation, puis
// une seconde qui récapitule la conséquence. Fermer à tout moment annule.
export function DoubleConfirmDialog({
  open,
  onOpenChange,
  first,
  second,
  onConfirm,
  pending,
  destructive,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  first: Step;
  second: Step;
  onConfirm: () => void;
  pending?: boolean;
  destructive?: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [wasOpen, setWasOpen] = useState(open);
  // Chaque ouverture repart de la première étape (le parent peut fermer
  // seul après succès).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setStep(1);
  }
  const current = step === 1 ? first : second;

  function change(next: boolean) {
    if (pending) return;
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmation {step}/2</p>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription asChild>
            <div>{current.description}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => change(false)} disabled={pending}>
            Annuler
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={() => (step === 1 ? setStep(2) : onConfirm())}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {current.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
