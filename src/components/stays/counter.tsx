import { Minus, Plus } from "lucide-react";

// Compteur +/- (capacité d'un logement, nombre de voyageurs).
export function Counter({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between p-3">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Moins de ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="flex size-8 items-center justify-center rounded-full border border-border disabled:opacity-30">
          <Minus className="size-3.5" />
        </button>
        <span className="w-6 text-center font-medium tabular-nums">{value}</span>
        <button type="button" aria-label={`Plus de ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="flex size-8 items-center justify-center rounded-full border border-border disabled:opacity-30">
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
