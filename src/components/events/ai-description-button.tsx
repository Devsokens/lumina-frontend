"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { aiError, isPlanLimited, useGenerateDescription, type DescriptionInput } from "@/hooks/useAi";
import { PricingUpgradeModal } from "@/components/shared/pricing-upgrade-modal";
import { cn } from "@/lib/utils";

const TONES: { id: NonNullable<DescriptionInput["tone"]>; label: string }[] = [
  { id: "festif", label: "Festif" },
  { id: "professionnel", label: "Professionnel" },
  { id: "premium", label: "Premium" },
];

type Props = {
  context: Omit<DescriptionInput, "tone" | "notes">;
  onApply: (text: string) => void;
};

// Rédaction assistée : l'organisateur relit le texte proposé avant de
// remplacer sa description.
export function AiDescriptionButton({ context, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [tone, setTone] = useState<DescriptionInput["tone"]>("festif");
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState("");
  const generate = useGenerateDescription();

  function openDialog() {
    if (!context.title.trim()) {
      toast.error("Saisissez d'abord le titre de l'événement.");
      return;
    }
    setOpen(true);
  }

  async function run() {
    try {
      setDraft(await generate.mutateAsync({ ...context, tone, notes: notes || undefined }));
    } catch (err) {
      if (isPlanLimited(err)) {
        setOpen(false);
        setUpgradeOpen(true);
      } else toast.error(aiError(err));
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px] text-primary" onClick={openDialog}>
        <Sparkles className="size-3" /> Rédiger avec l&apos;IA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Description assistée
            </DialogTitle>
            <DialogDescription>Proposition à partir du titre, du type, du lieu et de la date.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "flex-1 rounded-xl border px-2 py-1.5 text-xs font-semibold",
                    tone === t.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Éléments à mentionner (facultatif)</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Artistes, intervenants, programme, dress code…"
                className="resize-none text-xs"
              />
            </div>
            {draft && (
              <div className="space-y-1">
                <Label className="text-xs">Proposition (modifiable)</Label>
                <Textarea rows={6} value={draft} onChange={(e) => setDraft(e.target.value)} className="text-xs leading-relaxed" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={run} disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {draft ? "Régénérer" : "Générer"}
            </Button>
            <Button
              type="button"
              disabled={!draft}
              onClick={() => {
                onApply(draft);
                setOpen(false);
                setDraft("");
              }}
            >
              Utiliser ce texte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PricingUpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="GENERAL" />
    </>
  );
}
