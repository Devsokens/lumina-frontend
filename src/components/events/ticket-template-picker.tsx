"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TEMPLATE_CATEGORIES, TICKET_TEMPLATES } from "@/lib/ticket-templates";
import { TicketPreview, type TicketPreviewProps } from "@/components/events/ticket-preview";
import { cn } from "@/lib/utils";
import type { TicketTemplate } from "@/types/api";

type Props = {
  value: TicketTemplate;
  onChange: (id: TicketTemplate) => void;
  // Données réelles du formulaire, pour un aperçu fidèle.
  preview: Omit<TicketPreviewProps, "template" | "compact">;
};

// Choix du modèle de billet : vignettes filtrables + aperçu grand format.
export function TicketTemplatePicker({ value, onChange, preview }: Props) {
  const [category, setCategory] = useState<string>("Tous");
  const list = category === "Tous" ? TICKET_TEMPLATES : TICKET_TEMPLATES.filter((t) => t.category === category);

  return (
    <div className="space-y-4">
      <div className="flex justify-center rounded-2xl border border-border bg-muted/30 p-5">
        <TicketPreview {...preview} template={value} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["Tous", ...TEMPLATE_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
              category === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl border p-2.5 transition-all",
                active ? "border-primary bg-primary/5 ring-2 ring-primary/40" : "border-border hover:border-primary/40"
              )}
            >
              {active && (
                <span className="absolute top-1.5 right-1.5 z-10 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-2.5" />
                </span>
              )}
              <div className="flex h-24 items-center justify-center">
                <TicketPreview {...preview} template={t.id} compact />
              </div>
              <span className="text-[11px] font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">{TICKET_TEMPLATES.length} modèles disponibles.</p>
    </div>
  );
}
