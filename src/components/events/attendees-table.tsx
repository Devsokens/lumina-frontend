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

export function AttendeesTable({
  attendees,
  onOpenTicket,
}: {
  attendees: Attendee[];
  onOpenTicket?: (attendee: Attendee) => void;
}) {
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

  // Pas d'envoi WhatsApp/SMS côté serveur : on ouvre le PDF du billet.
  function handleResendTicket(att: Attendee) {
    onOpenTicket?.(att);
  }

  // Export local de la liste affichée (aucune donnée envoyée ailleurs).
  function handleExportCsv() {
    const header = ["Billet", "Nom", "Téléphone", "E-mail", "Formule", "Statut", "Scanné le"];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = filtered.map((a) =>
      [
        a.ticketNumber,
        a.customerName,
        a.customerPhone,
        a.customerEmail,
        a.ticketTypeName,
        a.status,
        a.scannedAt ? new Date(a.scannedAt).toLocaleString("fr-FR") : "",
      ]
        .map((v) => escape(String(v)))
        .join(";")
    );
    const blob = new Blob(["\uFEFF" + [header.join(";"), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "participants.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${lines.length} participant(s) exporté(s).`);
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
