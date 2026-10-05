"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/constants";
import { ticketNumber } from "@/lib/events";
import type { PurchasedTicket } from "@/types/events";

// Liens vers le PDF de chaque billet (le code du billet sert de secret
// d'accès, voir docs/API_CONTRACT.md §14).
export function TicketDownloads({ tickets }: { tickets: PurchasedTicket[] }) {
  return (
    <ul className="space-y-2">
      {tickets.map((t) => (
        <li key={t.id}>
          <Button asChild variant="outline" className="w-full justify-between">
            <a
              href={`${API_URL}/tickets/${encodeURIComponent(t.qrCode)}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Billet {ticketNumber(t.id)}</span>
              <Download className="size-4" />
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}
