"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Filter,
  Ticket,
  Users,
  CheckCircle2,
  Clock,
  Smartphone,
  Download,
  AlertCircle,
  Archive,
  Eye,
  EyeOff,
  MoreVertical,
  Check,
  X,
  QrCode,
  FileSpreadsheet,
  Send,
  ShieldCheck,
  AlertTriangle,
  Mail,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export type ReservationStatus = "PENDING" | "VALID" | "REJECTED" | "USED";

export interface GlobalReservation {
  id: string;
  ticketNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventEndDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketTypeName: string;
  ticketPrice: number; // En centimes (ex: 2500000 = 25 000 FCFA)
  status: ReservationStatus;
  scannedAt: string | null;
  purchaseDate: string;
  paymentMethod: "AIRTEL_MONEY" | "MOOV_MONEY" | "CARD";
  rejectionReason?: string;
  isArchived?: boolean; // Événement terminé depuis plus de 5 jours
}

// Mock Events
const MOCK_EVENTS = [
  {
    id: "evt-1",
    title: "Festival Urban Afro Libreville 2026",
    startDate: "2026-09-05T19:00:00Z",
    endDate: "2026-09-06T04:00:00Z",
    isEndedOver5Days: false,
  },
  {
    id: "evt-2",
    title: "Executive Masterclass Leadership & Stratégie",
    startDate: "2026-09-12T09:00:00Z",
    endDate: "2026-09-12T17:00:00Z",
    isEndedOver5Days: false,
  },
  {
    id: "evt-3",
    title: "Soirée Blanche & Champagne VIP",
    startDate: "2026-09-18T21:00:00Z",
    endDate: "2026-09-19T05:00:00Z",
    isEndedOver5Days: false,
  },
  {
    id: "evt-past-1",
    title: "Gala de Clôture Année 2025 (Passé)",
    startDate: "2025-12-31T20:00:00Z",
    endDate: "2026-01-01T04:00:00Z",
    isEndedOver5Days: true,
  },
];

// Initial Global Reservations Data
const INITIAL_RESERVATIONS: GlobalReservation[] = [
  {
    id: "res-1",
    ticketNumber: "GA-EVT-9081",
    eventId: "evt-1",
    eventTitle: "Festival Urban Afro Libreville 2026",
    eventDate: "2026-09-05T19:00:00Z",
    eventEndDate: "2026-09-06T04:00:00Z",
    customerName: "Marc Ondimba",
    customerEmail: "marc.ondimba@gmail.com",
    customerPhone: "+241 77 12 34 56",
    ticketTypeName: "Pass VIP (Carré Or)",
    ticketPrice: 2500000,
    status: "USED",
    scannedAt: "2026-09-05T19:24:00Z",
    purchaseDate: "2026-08-20T14:15:00Z",
    paymentMethod: "AIRTEL_MONEY",
    isArchived: false,
  },
  {
    id: "res-2",
    ticketNumber: "GA-EVT-9082",
    eventId: "evt-1",
    eventTitle: "Festival Urban Afro Libreville 2026",
    eventDate: "2026-09-05T19:00:00Z",
    eventEndDate: "2026-09-06T04:00:00Z",
    customerName: "Aïcha Nguema",
    customerEmail: "aicha.nguema@yahoo.fr",
    customerPhone: "+241 66 98 76 54",
    ticketTypeName: "Pass VIP (Carré Or)",
    ticketPrice: 2500000,
    status: "VALID",
    scannedAt: null,
    purchaseDate: "2026-08-21T09:30:00Z",
    paymentMethod: "MOOV_MONEY",
    isArchived: false,
  },
  {
    id: "res-3",
    ticketNumber: "GA-EVT-9083",
    eventId: "evt-1",
    eventTitle: "Festival Urban Afro Libreville 2026",
    eventDate: "2026-09-05T19:00:00Z",
    eventEndDate: "2026-09-06T04:00:00Z",
    customerName: "Jean-Pierre Bongo",
    customerEmail: "jp.bongo@outlook.com",
    customerPhone: "+241 74 11 22 33",
    ticketTypeName: "Pass Standard (Accès Général)",
    ticketPrice: 1000000,
    status: "PENDING", // En attente de validation manuelle du virement
    scannedAt: null,
    purchaseDate: "2026-08-22T16:45:00Z",
    paymentMethod: "AIRTEL_MONEY",
    isArchived: false,
  },
  {
    id: "res-4",
    ticketNumber: "GA-EXEC-3011",
    eventId: "evt-2",
    eventTitle: "Executive Masterclass Leadership & Stratégie",
    eventDate: "2026-09-12T09:00:00Z",
    eventEndDate: "2026-09-12T17:00:00Z",
    customerName: "Clarisse Mba",
    customerEmail: "clarisse.mba@total-energies.ga",
    customerPhone: "+241 65 33 44 55",
    ticketTypeName: "Badge Délégué Exécutif + Certification",
    ticketPrice: 7500000,
    status: "VALID",
    scannedAt: null,
    purchaseDate: "2026-08-25T11:20:00Z",
    paymentMethod: "CARD",
    isArchived: false,
  },
  {
    id: "res-5",
    ticketNumber: "GA-EXEC-3012",
    eventId: "evt-2",
    eventTitle: "Executive Masterclass Leadership & Stratégie",
    eventDate: "2026-09-12T09:00:00Z",
    eventEndDate: "2026-09-12T17:00:00Z",
    customerName: "David Koumba",
    customerEmail: "david.koumba@pro-tech.ga",
    customerPhone: "+241 77 55 66 77",
    ticketTypeName: "Badge Délégué Exécutif + Certification",
    ticketPrice: 7500000,
    status: "PENDING", // En attente
    scannedAt: null,
    purchaseDate: "2026-08-26T18:00:00Z",
    paymentMethod: "MOOV_MONEY",
    isArchived: false,
  },
  {
    id: "res-6",
    ticketNumber: "GA-VIP-7701",
    eventId: "evt-3",
    eventTitle: "Soirée Blanche & Champagne VIP",
    eventDate: "2026-09-18T21:00:00Z",
    eventEndDate: "2026-09-19T05:00:00Z",
    customerName: "Sylvie Bekale",
    customerEmail: "sylvie.bekale@gmail.com",
    customerPhone: "+241 66 22 88 99",
    ticketTypeName: "Pass VIP Coupe-File",
    ticketPrice: 3500000,
    status: "REJECTED", // Rejeté
    scannedAt: null,
    purchaseDate: "2026-08-28T13:10:00Z",
    paymentMethod: "AIRTEL_MONEY",
    rejectionReason: "Virement Airtel Money non reçu après 24h",
    isArchived: false,
  },
  {
    id: "res-past-1",
    ticketNumber: "GA-GALA-2025-01",
    eventId: "evt-past-1",
    eventTitle: "Gala de Clôture Année 2025 (Passé)",
    eventDate: "2025-12-31T20:00:00Z",
    eventEndDate: "2026-01-01T04:00:00Z",
    customerName: "Patrick Nze",
    customerEmail: "patrick.nze@gmail.com",
    customerPhone: "+241 77 88 99 00",
    ticketTypeName: "Table Gala Prestige",
    ticketPrice: 20000000,
    status: "USED",
    scannedAt: "2025-12-31T21:10:00Z",
    purchaseDate: "2025-12-15T10:00:00Z",
    paymentMethod: "AIRTEL_MONEY",
    isArchived: true,
  },
];

export default function GlobalReservationsPage() {
  const [reservations, setReservations] = useState<GlobalReservation[]>(INITIAL_RESERVATIONS);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReservationStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Active Dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Confirmation Modals State
  const [validatingReservation, setValidatingReservation] = useState<GlobalReservation | null>(null);
  const [rejectingReservation, setRejectingReservation] = useState<GlobalReservation | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("Virement Mobile Money non reçu");

  // Check if current selected event is past > 5 days
  const selectedEventObj = MOCK_EVENTS.find((e) => e.id === selectedEventId);
  const isSelectedEventPastOver5Days = selectedEventObj?.isEndedOver5Days ?? false;

  // Filter logic
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      // 5-days rule: if not explicitly showing archived, hide reservations with isArchived = true
      if (!showArchived && res.isArchived) return false;

      // Event Filter
      if (selectedEventId !== "ALL" && res.eventId !== selectedEventId) return false;

      // Status Filter
      if (statusFilter !== "ALL" && res.status !== statusFilter) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          res.customerName.toLowerCase().includes(q) ||
          res.customerEmail.toLowerCase().includes(q) ||
          res.customerPhone.includes(q) ||
          res.ticketNumber.toLowerCase().includes(q) ||
          res.eventTitle.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [reservations, selectedEventId, statusFilter, searchQuery, showArchived]);

  // Counts by status (active only)
  const activeReservations = reservations.filter((r) => !r.isArchived);
  const countPending = activeReservations.filter((r) => r.status === "PENDING").length;
  const countValid = activeReservations.filter((r) => r.status === "VALID").length;
  const countScanned = activeReservations.filter((r) => r.status === "USED").length;
  const countRejected = activeReservations.filter((r) => r.status === "REJECTED").length;

  // Actions
  function confirmValidation() {
    if (!validatingReservation) return;
    const resId = validatingReservation.id;

    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId ? { ...r, status: "VALID" } : r
      )
    );

    toast.success(
      `Réservation validée ! Le billet officiel avec QR code a été envoyé par email à ${validatingReservation.customerEmail}`
    );
    setValidatingReservation(null);
  }

  function confirmRejection() {
    if (!rejectingReservation) return;
    const resId = rejectingReservation.id;

    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId
          ? { ...r, status: "REJECTED", rejectionReason: rejectionReasonInput }
          : r
      )
    );

    toast.error(`Réservation rejetée. Notification envoyée au ${rejectingReservation.customerPhone}`);
    setRejectingReservation(null);
  }

  function handleMarkAsScanned(res: GlobalReservation) {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === res.id ? { ...r, status: "USED", scannedAt: new Date().toISOString() } : r
      )
    );
    toast.success(`Participant ${res.customerName} scanné et marqué présent !`);
    setOpenMenuId(null);
  }

  function handleResendTicket(res: GlobalReservation) {
    toast.success(`Billet officiel renvoyé par Email (${res.customerEmail}) et WhatsApp (${res.customerPhone})`);
    setOpenMenuId(null);
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Réservations & Inscriptions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Suivi centralisé des réservations, validation manuelle des virements et délivrance des billets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.success("Exportation de la liste des réservations en cours (CSV)...")}
            className="rounded-xl text-xs gap-1.5"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-500" />
            <span>Exporter</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Link href="/admin/event/scanner">
              <QrCode className="size-3.5" />
              <span>Contrôle d&apos;accès</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar — Identique à la page Mes Événements */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-xs">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, N° de pass..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-xs rounded-xl bg-muted/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "ALL"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous ({activeReservations.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "PENDING"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            En attente ({countPending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("VALID")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "VALID"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Validés ({countValid})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("USED")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "USED"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Scannés ({countScanned})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("REJECTED")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "REJECTED"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rejetés ({countRejected})
          </button>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Event Selector Dropdown */}
          <select
            aria-label="Filtrer par événement"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="h-8 rounded-lg border border-border bg-muted/30 px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[180px] truncate"
          >
            <option value="ALL">Tous les événements</option>
            {MOCK_EVENTS.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} {evt.isEndedOver5Days ? "(Archivé)" : ""}
              </option>
            ))}
          </select>

          {/* Archive Toggle Button */}
          <Button
            type="button"
            variant={showArchived ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="h-8 text-xs rounded-lg gap-1 text-muted-foreground hover:text-foreground px-2"
            title="Afficher les réservations d'événements passés (> 5 jours)"
          >
            {showArchived ? <EyeOff className="size-3" /> : <Archive className="size-3" />}
            <span className="hidden md:inline">{showArchived ? "Masquer > 5j" : "Archivés > 5j"}</span>
          </Button>
        </div>
      </div>

      {/* Notice Banner when Selected Event is Past > 5 days */}
      {isSelectedEventPastOver5Days && !showArchived && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              Cet événement s&apos;est achevé il y a plus de 5 jours. Les réservations sont archivées par défaut.
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowArchived(true)}
            className="rounded-xl text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold shrink-0 h-8"
          >
            <Eye className="size-3.5 mr-1" />
            Afficher les réservations
          </Button>
        </div>
      )}

      {/* Global Reservations Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        {filteredReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Participant & Contact</th>
                  <th className="py-3.5 px-4">Événement Associé</th>
                  <th className="py-3.5 px-4">Formule & Billet</th>
                  <th className="py-3.5 px-4">Montant & Mode</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-muted/20 transition-colors relative">
                    {/* Participant */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {res.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs">{res.customerName}</p>
                          <p className="text-[11px] text-muted-foreground">{res.customerEmail}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{res.customerPhone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Event Title & Date */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-[200px]">
                        <p className="font-semibold text-foreground text-xs truncate">
                          {res.eventTitle}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-2.5 text-primary" />
                          {new Date(res.eventDate).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </td>

                    {/* Formula & Ticket Number */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-medium text-foreground">{res.ticketTypeName}</p>
                        <span className="font-mono text-[10px] text-muted-foreground font-bold">
                          {res.ticketNumber}
                        </span>
                      </div>
                    </td>

                    {/* Payment & Price */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <p className="font-mono font-bold text-foreground">
                          {((res.ticketPrice ?? 0) / 100).toLocaleString("fr-FR")} FCFA
                        </p>
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            res.paymentMethod === "AIRTEL_MONEY"
                              ? "bg-red-500/15 text-red-600"
                              : res.paymentMethod === "MOOV_MONEY"
                              ? "bg-blue-500/15 text-blue-600"
                              : "bg-zinc-500/15 text-zinc-600"
                          }`}
                        >
                          {res.paymentMethod === "AIRTEL_MONEY"
                            ? "Airtel Money"
                            : res.paymentMethod === "MOOV_MONEY"
                            ? "Moov Money"
                            : "Carte"}
                        </span>
                      </div>
                    </td>

                    {/* Statut Badge (En attente, Validé, Rejeté, Scanné) */}
                    <td className="py-3.5 px-4">
                      {res.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                          <Clock className="size-3" /> En attente
                        </span>
                      )}

                      {res.status === "VALID" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                          <Check className="size-3" /> Validé
                        </span>
                      )}

                      {res.status === "USED" && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            <CheckCircle2 className="size-3" /> Scanné
                          </span>
                          {res.scannedAt && (
                            <span className="text-[9px] text-muted-foreground block font-mono">
                              {new Date(res.scannedAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      )}

                      {res.status === "REJECTED" && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/30 px-2 py-0.5 text-[10px] font-bold text-destructive">
                            <X className="size-3" /> Rejeté
                          </span>
                          {res.rejectionReason && (
                            <span className="text-[9px] text-destructive/80 block max-w-[130px] truncate" title={res.rejectionReason}>
                              {res.rejectionReason}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 3-Dots Actions Menu */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="relative inline-block text-left">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
                          onClick={() => setOpenMenuId(openMenuId === res.id ? null : res.id)}
                        >
                          <MoreVertical className="size-4" />
                        </Button>

                        {/* Dropdown Menu Popup */}
                        {openMenuId === res.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-52 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-40 text-left space-y-0.5 animate-in fade-in zoom-in-95">
                              {/* ACTION 1: VALIDER LA RÉSERVATION (Pour PENDING) */}
                              {res.status === "PENDING" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setValidatingReservation(res);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                                >
                                  <Check className="size-3.5" />
                                  <span>Valider la réservation</span>
                                </button>
                              )}

                              {/* ACTION 2: REJETER LA RÉSERVATION (Pour PENDING ou VALID) */}
                              {(res.status === "PENDING" || res.status === "VALID") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingReservation(res);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <X className="size-3.5" />
                                  <span>Rejeter la réservation</span>
                                </button>
                              )}

                              {/* ACTION 3: VALIDER LE SCAN MANUEL (Pour VALID) */}
                              {res.status === "VALID" && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsScanned(res)}
                                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                                >
                                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                                  <span>Marquer comme Scanné</span>
                                </button>
                              )}

                              {/* ACTION 4: RENVOYER LE BILLET EMAIL & WHATSAPP */}
                              {(res.status === "VALID" || res.status === "USED") && (
                                <button
                                  type="button"
                                  onClick={() => handleResendTicket(res)}
                                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                                >
                                  <Send className="size-3.5 text-primary" />
                                  <span>Renvoyer le Billet (Email)</span>
                                </button>
                              )}

                              {/* ACTION 5: TÉLÉCHARGER LE PASS PDF */}
                              {(res.status === "VALID" || res.status === "USED") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    toast.success(`Téléchargement du Pass PDF ${res.ticketNumber} en cours...`);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                                >
                                  <Download className="size-3.5 text-muted-foreground" />
                                  <span>Télécharger le Pass</span>
                                </button>
                              )}

                              {/* RE-VALIDATION POUR REJETÉ */}
                              {res.status === "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setValidatingReservation(res);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                                >
                                  <Check className="size-3.5" />
                                  <span>Réexaminer & Valider</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Ticket className="size-10 text-muted-foreground mx-auto" />
            <div>
              <p className="font-bold text-sm text-foreground">
                Aucune réservation trouvée
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                {isSelectedEventPastOver5Days
                  ? "Cet événement est achevé depuis plus de 5 jours. Cliquez sur 'Afficher archivés' pour voir son historique."
                  : "Aucune réservation ne correspond à vos filtres actuels."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMATION DE VALIDATION MANUELLE & ENVOI DU BILLET            */}
      {/* ========================================================================= */}
      {validatingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground">
                  Valider la Réservation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Confirmation du paiement et expédition du billet par email.
                </p>
              </div>
            </div>

            {/* Transaction Summary Card */}
            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Participant :</span>
                <span className="font-bold text-foreground">{validatingReservation.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Événement :</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {validatingReservation.eventTitle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Formule :</span>
                <span className="font-medium text-foreground">{validatingReservation.ticketTypeName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <span className="font-bold text-foreground">Montant à encaisser :</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {((validatingReservation.ticketPrice ?? 0) / 100).toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Mail className="size-3.5" /> Envoi Automatique du Billet Officiel
              </p>
              <p className="text-[11px] leading-relaxed">
                Après avoir vérifié la réception du transfert sur votre compte{" "}
                <strong>
                  {validatingReservation.paymentMethod === "AIRTEL_MONEY" ? "Airtel Money" : "Moov Money"}
                </strong>
                , cette action validera le pass et expédiera immédiatement le QR code officiel par email à{" "}
                <span className="font-mono text-foreground font-semibold">{validatingReservation.customerEmail}</span>.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValidatingReservation(null)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={confirmValidation}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Check className="size-3.5" />
                <span>Confirmer & Envoyer le Billet</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMATION DE REJET DE RÉSERVATION                             */}
      {/* ========================================================================= */}
      {rejectingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground">
                  Rejeter la Réservation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Refus du virement ou annulation de la place.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                Êtes-vous sûr de vouloir rejeter la réservation de{" "}
                <strong className="text-foreground">{rejectingReservation.customerName}</strong> ({rejectingReservation.ticketTypeName}) ?
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Motif du rejet</Label>
                <select
                  aria-label="Motif du rejet"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Virement Mobile Money non reçu après délai">Virement Mobile Money non reçu après délai</option>
                  <option value="Montant du transfert incorrect">Montant du transfert incorrect</option>
                  <option value="Demande d'annulation par le participant">Demande d&apos;annulation par le participant</option>
                  <option value="Billet en double / Fraude suspectée">Billet en double / Fraude suspectée</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRejectingReservation(null)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={confirmRejection}
                className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-xs gap-1.5 shadow-md shadow-destructive/20"
              >
                <X className="size-3.5" />
                <span>Confirmer le Rejet</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
