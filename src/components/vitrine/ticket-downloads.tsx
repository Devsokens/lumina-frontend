"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/constants";
import { ticketNumber } from "@/lib/events";
import type { PurchasedTicket } from "@/types/events";

// Billets achetés : QR code affiché directement (scannable depuis l'écran
// du téléphone) et lien vers le PDF. Le code du billet sert de secret
// d'accès au PDF, voir docs/API_CONTRACT.md §14.
export function TicketDownloads({ tickets }: { tickets: PurchasedTicket[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {tickets.map((t) => (
        <li key={t.id} className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="rounded-xl bg-white p-2">
            <QRCodeSVG value={t.qrCode} size={160} level="M" />
          </div>
          <p className="font-mono text-sm font-semibold">Billet {ticketNumber(t.id)}</p>
          <Button asChild variant="outline" className="w-full justify-between">
            <a
              href={`${API_URL}/tickets/${encodeURIComponent(t.qrCode)}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Télécharger le PDF</span>
              <Download className="size-4" />
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}
