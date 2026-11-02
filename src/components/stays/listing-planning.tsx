"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiError } from "@/lib/api";
import { addDay, formatStay, todayDay } from "@/lib/stays";
import { useBlockDates, useListingCalendar } from "@/hooks/useStays";
import { StayCalendar, type CalendarMark } from "@/components/stays/stay-calendar";
import { BookingStatusBadge } from "@/components/stays/booking-list";

// Planning d'un logement (2 mois) : réservations, dates fermées par l'hôte,
// et fermeture de nouvelles dates en les sélectionnant.
export function ListingPlanning({ listingId }: { listingId: string }) {
  const [month, setMonth] = useState(`${todayDay().slice(0, 7)}-01`);
  const to = addDay(month, 62);
  const { data } = useListingCalendar(listingId, month, to);
  const blocks = useBlockDates();
  const [range, setRange] = useState<{ checkIn: string | null; checkOut: string | null }>({ checkIn: null, checkOut: null });
  const [reason, setReason] = useState("");

  const marks: CalendarMark[] = [
    ...(data?.bookings ?? []).map((b) => ({
      start: b.checkIn,
      end: b.checkOut,
      tone: b.status === "PENDING" ? ("pending" as const) : ("booked" as const),
      label: b.customerName ?? "Réservation",
    })),
    ...(data?.blocks ?? []).map((b) => ({ start: b.startDate, end: b.endDate, tone: "blocked" as const, label: b.reason ?? "Fermé" })),
  ];

  function close() {
    if (!range.checkIn || !range.checkOut) return;
    blocks.create.mutate(
      { listingId, startDate: range.checkIn, endDate: range.checkOut, ...(reason.trim() ? { reason: reason.trim() } : {}) },
      {
        onSuccess: () => {
          toast.success("Dates fermées");
          setRange({ checkIn: null, checkOut: null });
          setReason("");
        },
        onError: (err) => toast.error(apiError(err, "Fermeture impossible.")),
      }
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-border bg-card p-4">
        <StayCalendar months={2} marks={marks} selection={range} onSelect={setRange} initialMonth={month} onMonthChange={setMonth} />
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Legend className="bg-primary/85" label="Réservé" />
          <Legend className="bg-warning/30" label="Paiement en attente" />
          <Legend className="bg-muted-foreground/25" label="Fermé" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <p className="font-semibold">Fermer des dates</p>
          <p className="text-sm text-muted-foreground">
            {range.checkIn && range.checkOut
              ? formatStay(range.checkIn, range.checkOut)
              : "Sélectionnez la première puis la dernière nuit +1 sur le calendrier."}
          </p>
          <Input placeholder="Motif (travaux, usage perso…)" maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button className="w-full rounded-xl" disabled={!range.checkOut || blocks.create.isPending} onClick={close}>
            <Lock className="size-4" /> Fermer ces dates
          </Button>
        </div>

        <ul className="space-y-2">
          {(data?.bookings ?? []).map((b) => (
            <li key={b.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{b.customerName ?? b.customerPhone}</span>
                <BookingStatusBadge status={b.status} />
              </div>
              <p className="text-muted-foreground">{formatStay(b.checkIn, b.checkOut)}</p>
            </li>
          ))}
          {(data?.blocks ?? []).map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-border p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{b.reason ?? "Fermé"}</p>
                <p className="text-muted-foreground">{formatStay(b.startDate, b.endDate)}</p>
              </div>
              <button
                type="button"
                aria-label="Rouvrir ces dates"
                onClick={() => blocks.remove.mutate(b.id, { onError: (err) => toast.error(apiError(err)) })}
                className="rounded-full p-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-3 rounded-full ${className}`} /> {label}
    </span>
  );
}
