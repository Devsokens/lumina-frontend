"use client";

import { toast } from "sonner";
import { CalendarDays, LogIn, LogOut, Phone, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiError } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import { BOOKING_STATUS, formatStay } from "@/lib/stays";
import { useUpdateBookingStatus } from "@/hooks/useStays";
import type { Booking, BookingStatus } from "@/types/stays";
import { cn } from "@/lib/utils";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = BOOKING_STATUS[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", s.className)}>{s.label}</span>;
}

// Réservations avec leurs actions d'accueil (arrivée, départ, annulation).
// Sert à la page Réservations et aux arrivées / départs du tableau de bord.
export function BookingList({ bookings, empty }: { bookings: Booking[]; empty: string }) {
  const update = useUpdateBookingStatus();

  function act(id: string, status: "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED", done: string) {
    if (status === "CANCELLED" && !window.confirm("Annuler cette réservation ? Les dates seront libérées.")) return;
    update.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(done),
        onError: (err) => toast.error(apiError(err, "Action impossible.")),
      }
    );
  }

  if (bookings.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li key={b.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{b.customerName || "Voyageur"}</p>
              <p className="truncate text-sm text-muted-foreground">{b.listing?.title}</p>
            </div>
            <BookingStatusBadge status={b.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {formatStay(b.checkIn, b.checkOut)} · {b.nights} nuit(s)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" /> {b.guests}
            </span>
            <a href={`tel:${b.customerPhone}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Phone className="size-4" /> {b.customerPhone}
            </a>
            {b.order && <span className="font-medium text-foreground">{formatXAF(b.order.total)}</span>}
          </div>
          {b.note && <p className="mt-2 rounded-xl bg-muted/50 p-2 text-sm">« {b.note} »</p>}
          {(b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "PENDING") && (
            <div className="mt-3 flex flex-wrap gap-2">
              {b.status === "CONFIRMED" && (
                <Button size="sm" className="rounded-xl" disabled={update.isPending} onClick={() => act(b.id, "CHECKED_IN", "Arrivée enregistrée")}>
                  <LogIn className="size-4" /> Arrivée
                </Button>
              )}
              {b.status === "CHECKED_IN" && (
                <Button size="sm" className="rounded-xl" disabled={update.isPending} onClick={() => act(b.id, "CHECKED_OUT", "Départ enregistré")}>
                  <LogOut className="size-4" /> Départ
                </Button>
              )}
              {b.status !== "CHECKED_IN" && (
                <Button size="sm" variant="ghost" className="rounded-xl text-destructive" disabled={update.isPending} onClick={() => act(b.id, "CANCELLED", "Réservation annulée")}>
                  <X className="size-4" /> Annuler
                </Button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
