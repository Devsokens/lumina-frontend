"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDay, inRange, todayDay, toDay } from "@/lib/stays";
import { cn } from "@/lib/utils";

export type CalendarMark = { start: string; end: string; tone: "booked" | "pending" | "blocked"; label?: string };

type Props = {
  // Plages occupées [start, end[ (réservations, fermetures).
  marks: CalendarMark[];
  // Sélection d'un séjour (site public, fermeture de dates) ; absent = lecture seule.
  selection?: { checkIn: string | null; checkOut: string | null };
  onSelect?: (range: { checkIn: string | null; checkOut: string | null }) => void;
  months?: 1 | 2;
  // Mois affiché au départ ("AAAA-MM-01").
  initialMonth?: string;
  onMonthChange?: (month: string) => void;
  allowPast?: boolean;
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const TONES: Record<CalendarMark["tone"], string> = {
  booked: "bg-primary/85 text-primary-foreground",
  pending: "bg-warning/30 text-foreground",
  blocked: "bg-muted-foreground/25 text-muted-foreground line-through",
};

function monthStart(day: string) {
  return `${day.slice(0, 7)}-01`;
}

function shiftMonth(month: string, n: number) {
  const d = new Date(`${month}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return toDay(d);
}

// Calendrier de séjour : sélecteur de dates (arrivée → départ) sur le site
// public, planning en lecture seule dans le back-office. Une seule grille,
// deux usages.
export function StayCalendar({
  marks,
  selection,
  onSelect,
  months = 1,
  initialMonth,
  onMonthChange,
  allowPast = false,
}: Props) {
  const today = todayDay();
  const [month, setMonth] = useState(initialMonth ?? monthStart(today));
  const markOf = (day: string) => marks.find((m) => inRange(day, m));

  function go(n: number) {
    const next = shiftMonth(month, n);
    setMonth(next);
    onMonthChange?.(next);
  }

  // Nuits libres entre l'arrivée et `day` (exclu) : pas de séjour à cheval
  // sur une réservation.
  function rangeFree(checkIn: string, checkOut: string) {
    for (let d = checkIn; d < checkOut; d = addDay(d, 1)) if (markOf(d)) return false;
    return true;
  }

  function pick(day: string) {
    if (!onSelect || !selection) return;
    const { checkIn, checkOut } = selection;
    if (checkIn && !checkOut && day > checkIn && rangeFree(checkIn, day)) {
      onSelect({ checkIn, checkOut: day });
    } else if (!markOf(day)) {
      onSelect({ checkIn: day, checkOut: null });
    }
  }

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={!allowPast && month <= monthStart(today)}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Mois suivant"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className={cn("grid gap-6", months === 2 && "md:grid-cols-2")}>
        {Array.from({ length: months }, (_, i) => (
          <Month
            key={i}
            month={shiftMonth(month, i)}
            today={today}
            allowPast={allowPast}
            markOf={markOf}
            selection={selection}
            onPick={onSelect ? pick : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function Month({
  month,
  today,
  allowPast,
  markOf,
  selection,
  onPick,
}: {
  month: string;
  today: string;
  allowPast: boolean;
  markOf: (day: string) => CalendarMark | undefined;
  selection?: { checkIn: string | null; checkOut: string | null };
  onPick?: (day: string) => void;
}) {
  const first = new Date(`${month}T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7; // lundi = 0
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const title = first.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
  const { checkIn, checkOut } = selection ?? { checkIn: null, checkOut: null };

  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold capitalize">{title}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="pb-1 font-medium text-muted-foreground">
            {w}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = addDay(month, i);
          const mark = markOf(day);
          const past = !allowPast && day < today;
          const isEdge = day === checkIn || day === checkOut;
          const inside = checkIn && checkOut && day > checkIn && day < checkOut;
          const disabled = past || (!!onPick && !!mark && !(checkIn && !checkOut && day > checkIn));
          return (
            <button
              key={day}
              type="button"
              title={mark?.label}
              disabled={!onPick || disabled}
              onClick={() => onPick?.(day)}
              className={cn(
                "mx-auto flex aspect-square w-full max-w-10 items-center justify-center rounded-full text-sm transition-colors",
                past && "text-muted-foreground/40",
                mark && !past && TONES[mark.tone],
                inside && "rounded-none bg-primary/10",
                isEdge && "bg-foreground font-semibold text-background",
                onPick && !disabled && !isEdge && "hover:ring-1 hover:ring-foreground",
                day === today && !isEdge && "font-bold underline underline-offset-4"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
