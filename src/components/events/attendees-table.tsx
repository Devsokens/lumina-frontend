"use client";

import { useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  QrCode,
  Send,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Attendee } from "@/types/api";

const MOCK_ATTENDEES: Attendee[] = [
  {
    id: "att-1",
    ticketId: "tk-101",
    ticketNumber: "GA-EVT-9081",
    customerName: "Jean-Paul Ndong",
    customerEmail: "jp.ndong@gmail.com",
    customerPhone: "+241 77 12 34 56",
    ticketTypeName: "Pass VIP (Carré Or)",
    ticketPrice: 2500000,
    status: "USED",
    scannedAt: "2026-09-01T20:15:00Z",
    purchaseDate: "2026-08-28T14:30:00Z",
  },
  {
    id: "att-2",
    ticketId: "tk-102",
    ticketNumber: "GA-EVT-9082",
    customerName: "Aïcha Bongo",
    customerEmail: "aicha.b@yahoo.fr",
    customerPhone: "+241 66 98 76 54",
    ticketTypeName: "Pass VIP (Carré Or)",
    ticketPrice: 2500000,
    status: "VALID",
    scannedAt: null,
    purchaseDate: "2026-08-29T10:12:00Z",
  },
  {
    id: "att-3",
    ticketId: "tk-103",
    ticketNumber: "GA-EVT-9083",
    customerName: "Brice Mba Obiang",
    customerEmail: "brice.mba@gmail.com",
    customerPhone: "+241 74 55 44 33",
    ticketTypeName: "Pass Standard",
    ticketPrice: 1000000,
    status: "USED",
    scannedAt: "2026-09-01T19:48:00Z",
    purchaseDate: "2026-08-30T18:20:00Z",
  },
  {
    id: "att-4",
    ticketId: "tk-104",
    ticketNumber: "GA-EVT-9084",
    customerName: "Clarisse Mengue",
    customerEmail: "clarisse.m@live.fr",
    customerPhone: "+241 62 11 22 33",
    ticketTypeName: "Pass Standard",
    ticketPrice: 1000000,
    status: "VALID",
    scannedAt: null,
    purchaseDate: "2026-08-31T09:05:00Z",
  },
  {
    id: "att-5",
    ticketId: "tk-105",
    ticketNumber: "GA-EVT-9085",
    customerName: "Sylvain Koumba",
    customerEmail: "sylvain.k@gmail.com",
    customerPhone: "+241 77 00 11 22",
    ticketTypeName: "Table VVIP",
    ticketPrice: 15000000,
    status: "USED",
    scannedAt: "2026-09-01T20:30:00Z",
    purchaseDate: "2026-08-25T11:45:00Z",
  },
];

export function AttendeesTable({ initialAttendees = MOCK_ATTENDEES }: { initialAttendees?: Attendee[] }) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "USED" | "VALID">("ALL");

  const filtered = attendees.filter((att) => {
    const matchSearch =
      att.customerName.toLowerCase().includes(search.toLowerCase()) ||
      att.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      att.customerPhone.includes(search);
    const matchStatus = statusFilter === "ALL" || att.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleResendTicket(att: Attendee) {
    toast.success(`Billet QR Code renvoyé par WhatsApp et SMS à ${att.customerPhone}`);
  }

  function handleExportCsv() {
    toast.success("Exportation de la liste des participants au format CSV terminée");
  }

  const scannedCount = attendees.filter((a) => a.status === "USED").length;
  const totalCount = attendees.length;

  return (
    <div className="space-y-4">
      {/* Top filter & search controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, téléphone, numéro de billet..."
              className="pl-9 h-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="inline-flex rounded-xl border border-border p-1 bg-card">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === "ALL" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tous ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("USED")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === "USED" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrés ({scannedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("VALID")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === "VALID" ? "bg-amber-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              En attente ({totalCount - scannedCount})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-xl gap-1.5 text-xs font-semibold"
            onClick={handleExportCsv}
          >
            <Download className="size-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Table Display */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Participant</th>
                <th className="px-4 py-3.5 font-semibold">N° Billet</th>
                <th className="px-4 py-3.5 font-semibold">Catégorie</th>
                <th className="px-4 py-3.5 font-semibold">Montant</th>
                <th className="px-4 py-3.5 font-semibold">Statut d&apos;entrée</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Aucun participant trouvé avec ces filtres.
                  </td>
                </tr>
              ) : (
                filtered.map((att) => (
                  <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-foreground">{att.customerName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{att.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground font-semibold">
                      {att.ticketNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-foreground">{att.ticketTypeName}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-foreground">
                      {(att.ticketPrice / 100).toLocaleString("fr-FR")} F
                    </td>
                    <td className="px-4 py-3.5">
                      {att.status === "USED" ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                          <CheckCircle2 className="size-4" />
                          <span>Scanné (Entré)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
                          <Clock className="size-4" />
                          <span>Non encore scanné</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs gap-1 text-primary hover:text-primary"
                        onClick={() => handleResendTicket(att)}
                        title="Renvoyer le QR Code par WhatsApp/SMS"
                      >
                        <Send className="size-3.5" />
                        <span className="hidden sm:inline">Renvoyer QR</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
