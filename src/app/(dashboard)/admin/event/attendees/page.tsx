"use client";

import { AttendeesTable } from "@/components/events/attendees-table";

export default function EventAttendeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Participants & Émargement
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Suivi des acheteurs, statuts de scan aux portiques d&apos;entrée et renvoi de billets QR.
        </p>
      </div>

      <AttendeesTable />
    </div>
  );
}
