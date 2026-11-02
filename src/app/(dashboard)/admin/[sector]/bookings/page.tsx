"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingList } from "@/components/stays/booking-list";
import { useBookings } from "@/hooks/useStays";
import { cn } from "@/lib/utils";

const SCOPES = [
  ["upcoming", "À venir et en cours"],
  ["past", "Passées"],
] as const;

export default function BookingsPage() {
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const { data, isLoading } = useBookings(scope);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">Réservations</h1>
        <p className="text-sm text-muted-foreground">Enregistrez les arrivées et les départs de vos voyageurs.</p>
      </div>
      <div className="flex gap-1 rounded-xl bg-muted p-1 text-sm font-medium sm:w-fit">
        {SCOPES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setScope(key)}
            className={cn("flex-1 rounded-lg px-4 py-2 sm:flex-none", scope === key ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            {label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <BookingList
          bookings={data ?? []}
          empty={scope === "upcoming" ? "Aucune réservation à venir." : "Aucune réservation passée."}
        />
      )}
    </div>
  );
}
