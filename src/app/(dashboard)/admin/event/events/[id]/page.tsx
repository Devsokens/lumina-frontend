"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Ticket,
  Users,
  Award,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Sparkles,
  FileCheck,
  Smartphone,
  Eye,
  Edit3,
  Copy,
  Coins,
  FileQuestion,
  Check,
  CircleDot,
  CheckSquare,
  Type,
  AlignLeft,
  Star,
  ListFilter,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { EventForm } from "@/components/events/event-form";
import type {
  Event,
  Attendee,
  CertificateDispatchRecord,
  QuestionnaireQuestion,
  TicketType,
} from "@/types/api";
import { PricingUpgradeModal } from "@/components/shared/pricing-upgrade-modal";

// Sample Event Data
const MOCK_EVENT: Event = {
  id: "evt-1",
  title: "Festival Urban Afro Libreville 2026",
  description:
    "Le plus grand festival de musiques urbaines, afro-fusion et masterclass d'Afrique Centrale. Profitez d'une programmation exceptionnelle, de concerts live avec artistes internationaux, de sessions networking VIP et d'une organisation 100% digitale avec billetterie sécurisée et QR Code infalsifiable.",
  imageUrl:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
  eventType: "CONCERT",
  hasCertificate: true,
  certificateTemplate: "ACADEMIC_GOLD",
  ticketTemplate: "GOLD_VIP",
  questionnaireEnabled: true,
  questionnaire: [
    {
      id: "q-1",
      title: "Comment avez-vous découvert cet événement ?",
      type: "SINGLE_CHOICE",
      options: [
        "Réseaux Sociaux (Instagram / TikTok)",
        "WhatsApp / Recommandation",
        "Bouche à oreille",
        "Affichage public",
      ],
      isRequired: true,
    },
    {
      id: "q-2",
      title: "Quels sont vos principaux centres d'intérêt pour cette session ?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Networking & Affaires",
        "Acquisition de compétences",
        "Concert & Ambiance Live",
        "Dégustation VIP",
      ],
      isRequired: false,
    },
    {
      id: "q-3",
      title: "Poste et Organisation / Entreprise (facultatif)",
      type: "SHORT_TEXT",
      isRequired: false,
    },
  ],
  ticketTypes: [
    {
      id: "tf-1",
      eventId: "evt-1",
      name: "Pass Standard (Accès Général)",
      price: 1000000, // 10 000 FCFA
      quantity: 350,
      sold: 140,
      ticketTemplate: "FESTIVAL_WRISTBAND",
      description: "Accès à la fosse, scène principale et village exposants.",
    },
    {
      id: "tf-2",
      eventId: "evt-1",
      name: "Pass VIP (Carré Or)",
      price: 2500000, // 25 000 FCFA
      quantity: 100,
      sold: 65,
      ticketTemplate: "GOLD_VIP",
      description: "Cocktail d'accueil offert, place assise réservée et vue plongeante.",
    },
    {
      id: "tf-3",
      eventId: "evt-1",
      name: "Table VVIP Privative (5 Pers.)",
      price: 15000000, // 150 000 FCFA
      quantity: 10,
      sold: 8,
      ticketTemplate: "GOLD_VIP",
      description: "Service majordome dédié, champagne premium et accès backstages.",
    },
  ],
  startDate: "2026-09-05T19:00:00Z",
  endDate: "2026-09-06T04:00:00Z",
  venueName: "Palais des Sports & de la Culture",
  location: "Libreville, Gabon",
  capacity: 500,
  status: "PUBLISHED",
  soldTicketsCount: 218,
  totalRevenue: 435000000, // 4 350 000 FCFA
  checkedInCount: 156,
  createdAt: "2026-08-15T10:00:00Z",
};

// Sample Attendees Data
const INITIAL_ATTENDEES: Attendee[] = [
  {
    id: "att-1",
    ticketId: "t-101",
    ticketNumber: "GA-EVT-9081",
    customerName: "Marc Ondimba",
    customerEmail: "marc.ondimba@gmail.com",
    customerPhone: "+241 77 12 34 56",
    ticketTypeName: "Pass VIP (Carré Or)",
    ticketPrice: 2500000,
    status: "USED",
    scannedAt: "2026-09-05T19:24:00Z",
    purchaseDate: "2026-08-20T14:15:00Z",
  },
  {
    id: "att-2",
    ticketId: "t-102",
    ticketNumber: "GA-EVT-9082",
    customerName: "Aïcha Nguema",
    customerEmail: "aicha.nguema@yahoo.fr",
    customerPhone: "+241 66 98 76 54",
    ticketTypeName: "Pass VIP (Carré Or)",
    ticketPrice: 2500000,
    status: "USED",
    scannedAt: "2026-09-05T19:42:00Z",
    purchaseDate: "2026-08-21T09:30:00Z",
  },
  {
    id: "att-3",
    ticketId: "t-103",
    ticketNumber: "GA-EVT-9083",
    customerName: "Jean-Pierre Bongo",
    customerEmail: "jp.bongo@outlook.com",
    customerPhone: "+241 74 11 22 33",
    ticketTypeName: "Pass Standard (Accès Général)",
    ticketPrice: 1000000,
    status: "USED",
    scannedAt: "2026-09-05T20:05:00Z",
    purchaseDate: "2026-08-22T16:45:00Z",
  },
  {
    id: "att-4",
    ticketId: "t-104",
    ticketNumber: "GA-EVT-9084",
    customerName: "Clarisse Mba",
    customerEmail: "clarisse.mba@gmail.com",
    customerPhone: "+241 65 33 44 55",
    ticketTypeName: "Pass Standard (Accès Général)",
    ticketPrice: 1000000,
    status: "VALID",
    scannedAt: null,
    purchaseDate: "2026-08-25T11:20:00Z",
  },
  {
    id: "att-5",
    ticketId: "t-105",
    ticketNumber: "GA-EVT-9085",
    customerName: "David Koumba",
    customerEmail: "david.koumba@pro-tech.ga",
    customerPhone: "+241 77 55 66 77",
    ticketTypeName: "Table VVIP Privative (5 Pers.)",
    ticketPrice: 15000000,
    status: "USED",
    scannedAt: "2026-09-05T19:50:00Z",
    purchaseDate: "2026-08-26T18:00:00Z",
  },
  {
    id: "att-6",
    ticketId: "t-106",
    ticketNumber: "GA-EVT-9086",
    customerName: "Sylvie Bekale",
    customerEmail: "sylvie.bekale@gmail.com",
    customerPhone: "+241 66 22 88 99",
    ticketTypeName: "Pass Standard (Accès Général)",
    ticketPrice: 1000000,
    status: "VALID",
    scannedAt: null,
    purchaseDate: "2026-08-28T13:10:00Z",
  },
];

// Sample Certificates Dispatch Data
const INITIAL_CERTIFICATES: CertificateDispatchRecord[] = [
  {
    id: "cert-1",
    attendeeId: "att-1",
    attendeeName: "Marc Ondimba",
    attendeeEmail: "marc.ondimba@gmail.com",
    attendeePhone: "+241 77 12 34 56",
    ticketNumber: "GA-EVT-9081",
    ticketTypeName: "Pass VIP (Carré Or)",
    certificateNumber: "GA-CERT-2026-001",
    status: "SENT",
    sentAt: "2026-09-06T10:00:00Z",
    pdfUrl: "#",
  },
  {
    id: "cert-2",
    attendeeId: "att-2",
    attendeeName: "Aïcha Nguema",
    attendeeEmail: "aicha.nguema@yahoo.fr",
    attendeePhone: "+241 66 98 76 54",
    ticketNumber: "GA-EVT-9082",
    ticketTypeName: "Pass VIP (Carré Or)",
    certificateNumber: "GA-CERT-2026-002",
    status: "SENT",
    sentAt: "2026-09-06T10:01:00Z",
    pdfUrl: "#",
  },
  {
    id: "cert-3",
    attendeeId: "att-3",
    attendeeName: "Jean-Pierre Bongo",
    attendeeEmail: "jp.bongo@outlook.com",
    attendeePhone: "+241 74 11 22 33",
    ticketNumber: "GA-EVT-9083",
    ticketTypeName: "Pass Standard (Accès Général)",
    certificateNumber: "GA-CERT-2026-003",
    status: "SENT",
    sentAt: "2026-09-06T10:02:00Z",
    pdfUrl: "#",
  },
  {
    id: "cert-5",
    attendeeId: "att-5",
    attendeeName: "David Koumba",
    attendeeEmail: "david.koumba@pro-tech.ga",
    attendeePhone: "+241 77 55 66 77",
    ticketNumber: "GA-EVT-9085",
    ticketTypeName: "Table VVIP Privative (5 Pers.)",
    certificateNumber: "GA-CERT-2026-005",
    status: "PENDING_SCAN",
    sentAt: null,
    pdfUrl: "#",
  },
];

interface EventManagePageProps {
  params: Promise<{ id: string }>;
}

export default function EventManagePage({ params }: EventManagePageProps) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<"INFO" | "RESERVATIONS" | "CERTIFICATES" | "STATS">("INFO");
  const [eventData, setEventData] = useState<Event>(MOCK_EVENT);
  const [attendees, setAttendees] = useState<Attendee[]>(INITIAL_ATTENDEES);
  const [certificates, setCertificates] = useState<CertificateDispatchRecord[]>(INITIAL_CERTIFICATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [reservationFilter, setReservationFilter] = useState<"ALL" | "SCANNED" | "PENDING">("ALL");
  const [isSendingCertificates, setIsSendingCertificates] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCertUpgradeModalOpen, setIsCertUpgradeModalOpen] = useState(false);

  // Scanned / Present attendees count
  const scannedAttendees = attendees.filter((a) => a.status === "USED");
  const pendingAttendees = attendees.filter((a) => a.status === "VALID");

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerPhone.includes(searchQuery);

    if (reservationFilter === "SCANNED") return matchesSearch && a.status === "USED";
    if (reservationFilter === "PENDING") return matchesSearch && a.status === "VALID";
    return matchesSearch;
  });

  // Action: Manually Mark as Scanned
  function handleMarkAsScanned(attendeeId: string) {
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? { ...a, status: "USED" as const, scannedAt: new Date().toISOString() }
          : a
      )
    );
    toast.success("Billet marqué comme scanné / présent !");
  }

  // Action: Resend Pass via WhatsApp / SMS
  function handleResendPass(attendee: Attendee) {
    toast.success(`Billet n°${attendee.ticketNumber} renvoyé par WhatsApp à ${attendee.customerPhone}`);
  }

  // Action: Copy Share Link
  function handleCopyShareLink() {
    navigator.clipboard?.writeText(window.location.origin + "/demo-event-tenant/event");
    toast.success("Lien public de la billetterie copié !");
  }

  // Action: Mass Dispatch Certificates to all Scanned Attendees (> 15 is PRO paid)
  function handleMassDispatchCertificates() {
    const scannedOnly = attendees.filter((a) => a.status === "USED");
    if (scannedOnly.length === 0) {
      toast.error("Aucun participant n'a encore été scanné pour cet événement.");
      return;
    }

    // Limit to 15 certifications in Free plan
    if (scannedOnly.length > 15) {
      setIsCertUpgradeModalOpen(true);
      return;
    }

    setIsSendingCertificates(true);
    setTimeout(() => {
      const updatedCerts: CertificateDispatchRecord[] = scannedOnly.map((a, i) => ({
        id: `cert-gen-${Date.now()}-${i}`,
        attendeeId: a.id,
        attendeeName: a.customerName,
        attendeeEmail: a.customerEmail,
        attendeePhone: a.customerPhone,
        ticketNumber: a.ticketNumber,
        ticketTypeName: a.ticketTypeName,
        certificateNumber: `GA-CERT-2026-${String(i + 1).padStart(3, "0")}`,
        status: "SENT",
        sentAt: new Date().toISOString(),
        pdfUrl: "#",
      }));

      setCertificates(updatedCerts);
      setIsSendingCertificates(false);
      toast.success(
        `🎉 ${scannedOnly.length} certifications officielles générées et transmises par Email & WhatsApp aux participants scannés !`
      );
    }, 1200);
  }

  const totalCalculatedCapacity =
    eventData.ticketTypes?.reduce((acc, f) => acc + (f.quantity || 0), 0) ??
    eventData.capacity ??
    0;

  const totalPotentialRevenue =
    eventData.ticketTypes?.reduce(
      (acc, f) => acc + (f.quantity * f.price) / 100,
      0
    ) ?? 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href="/admin/event/events"
              className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
            >
              <ChevronLeft className="size-3.5" />
              Mes Événements
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-md">
              {eventData.title}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {eventData.title}
            </h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
              En Vente • {eventData.soldTicketsCount} vendus
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit3 className="size-3.5" />
            <span>Modifier</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
          >
            <Link href="/demo-event-tenant/event" target="_blank">
              <Eye className="size-3.5" />
              <span>Voir vitrine</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Link href="/admin/event/scanner">
              <QrCode className="size-3.5" />
              <span>Scanner pass</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 TABS NAVIGATION (COMPACT & PROPORTIONNÉ) */}
      <div className="flex items-center justify-start">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-muted/50 border border-border gap-1 overflow-x-auto max-w-full shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("INFO")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "INFO"
                ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Calendar className="size-3.5 text-primary" />
            <span>1. Informations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RESERVATIONS")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "RESERVATIONS"
                ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Users className="size-3.5 text-primary" />
            <span>2. Réservations ({attendees.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CERTIFICATES")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "CERTIFICATES"
                ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Award className="size-3.5 text-amber-500" />
            <span>3. Certifications</span>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-mono text-amber-600 font-bold">
              {scannedAttendees.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("STATS")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "STATS"
                ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <BarChart3 className="size-3.5 text-primary" />
            <span>4. Statistiques</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ONGLET 1 : INFORMATIONS & VUE RÉSUMÉE AVEC CARTE FLOTTANTE STICKY */}
      {/* ========================================================================= */}
      {activeTab === "INFO" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (Left - 8 cols) : Event Details Presentation */}
          <div className="lg:col-span-8 space-y-6">
            {/* Event Cover Flyer & Headline */}
            <div className="relative rounded-3xl border border-border overflow-hidden bg-card shadow-xs group">
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={eventData.imageUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"}
                  alt={eventData.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="rounded-full bg-primary text-white px-3 py-1 text-xs font-bold shadow-md">
                    {eventData.eventType === "CONCERT"
                      ? "Concert & Festival"
                      : eventData.eventType === "CONFERENCE"
                      ? "Conférence & Formation"
                      : "Événement VIP"}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                    {eventData.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-white/80 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary" />
                      {new Date(eventData.startDate).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      {eventData.venueName || eventData.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-5 sm:p-6 space-y-3">
                <h3 className="font-bold text-sm text-foreground">À propos de l&apos;événement</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {eventData.description}
                </p>
              </div>
            </div>

            {/* Ticket Formulas Section */}
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="size-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">
                    Formules de Billetterie & Tarifs ({eventData.ticketTypes?.length ?? 0})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Jauge: {totalCalculatedCapacity} places
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eventData.ticketTypes?.map((formula) => (
                  <div
                    key={formula.id}
                    className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground">{formula.name}</h4>
                      <span className="font-mono font-bold text-xs text-emerald-500">
                        {((formula.price ?? 0) / 100).toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {formula.description || "Accès standard à l'événement."}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      <span>Quota : {formula.quantity} places</span>
                      <span>Vendus : {formula.sold || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questionnaire Preview Section */}
            {eventData.questionnaireEnabled && eventData.questionnaire && (
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="size-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      Questionnaire d&apos;Inscription Configuré ({eventData.questionnaire.length} questions)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono rounded bg-primary/10 text-primary px-2 py-0.5 font-bold">
                    Google Forms Style
                  </span>
                </div>

                <div className="space-y-2.5">
                  {eventData.questionnaire.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          {q.title}
                        </span>
                        {q.isRequired && (
                          <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.2 rounded">
                            Obligatoire
                          </span>
                        )}
                      </div>

                      {q.options && (
                        <div className="flex flex-wrap gap-1.5 pl-6 pt-1">
                          {q.options.map((opt, optIdx) => (
                            <span
                              key={optIdx}
                              className="rounded-lg bg-card border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                              • {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Preview Section */}
            {eventData.hasCertificate && (
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="size-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-foreground">
                      Attestation & Certification Officielle
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono rounded bg-amber-500/15 text-amber-600 px-2 py-0.5 font-bold">
                    Prestige Académique & Or
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shrink-0">
                    <Award className="size-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-foreground">
                      Certificat d&apos;Accomplissement avec QR Code Infalsifiable
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Délivré automatiquement aux participants scannés à l&apos;entrée.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Floating Sidebar (Right - 4 cols) : Stays fixed on scroll */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="rounded-3xl border-2 border-primary/30 bg-card p-5 shadow-lg shadow-primary/5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  Pilotage Rapide
                </span>
                <span className="rounded-full bg-emerald-500/15 text-emerald-500 px-2 py-0.5 text-[10px] font-bold">
                  En Vente
                </span>
              </div>

              {/* Big Modify Button (Opens Slide-over Sheet Modal) */}
              <Button
                type="button"
                size="lg"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm shadow-md shadow-primary/25 gap-2 py-5.5 hover:bg-primary/90"
              >
                <Edit3 className="size-4" />
                <span>Modifier les informations</span>
              </Button>

              {/* Quick Specs Summary */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" /> Capacité totale
                  </span>
                  <strong className="text-foreground">{totalCalculatedCapacity} places</strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Coins className="size-3.5 text-emerald-500" /> CA Potentiel
                  </span>
                  <strong className="text-emerald-500 font-mono">
                    {totalPotentialRevenue.toLocaleString("fr-FR")} FCFA
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Ticket className="size-3.5 text-primary" /> Formules de pass
                  </span>
                  <strong className="text-foreground">
                    {eventData.ticketTypes?.length ?? 0} actives
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FileQuestion className="size-3.5 text-primary" /> Questionnaire
                  </span>
                  <strong className="text-foreground">
                    {eventData.questionnaireEnabled ? `${eventData.questionnaire?.length || 0} questions` : "Désactivé"}
                  </strong>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs justify-start gap-2 h-9"
                >
                  <Link href="/demo-event-tenant/event" target="_blank">
                    <Eye className="size-3.5 text-primary" />
                    <span>Ouvrir la vitrine publique</span>
                    <ExternalLink className="size-3 ml-auto opacity-50" />
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShareLink}
                  className="w-full rounded-xl text-xs justify-start gap-2 h-9"
                >
                  <Share2 className="size-3.5 text-primary" />
                  <span>Copier le lien public WhatsApp</span>
                  <Copy className="size-3 ml-auto opacity-50" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 2 : RÉSERVATIONS & PARTICIPANTS */}
      {/* ========================================================================= */}
      {activeTab === "RESERVATIONS" && (
        <div className="space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground font-medium">Total Inscrits</span>
              <p className="font-display text-2xl font-bold text-foreground mt-1">
                {attendees.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ {eventData.capacity}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground font-medium">Scannés / Présents</span>
              <p className="font-display text-2xl font-bold text-emerald-500 mt-1">
                {scannedAttendees.length}
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {Math.round((scannedAttendees.length / (attendees.length || 1)) * 100)}% de taux de présence
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground font-medium">En Attente de Scan</span>
              <p className="font-display text-2xl font-bold text-amber-500 mt-1">
                {pendingAttendees.length}
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">Billets valides</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground font-medium">Recettes Encaissées</span>
              <p className="font-display text-2xl font-bold text-foreground font-mono mt-1">
                {(((eventData.totalRevenue ?? 0) / 100)).toLocaleString("fr-FR")} F
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">
                Mobile Money 100% garanti
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone ou N° billet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setReservationFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  reservationFilter === "ALL"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tous ({attendees.length})
              </button>
              <button
                type="button"
                onClick={() => setReservationFilter("SCANNED")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  reservationFilter === "SCANNED"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Scannés ({scannedAttendees.length})
              </button>
              <button
                type="button"
                onClick={() => setReservationFilter("PENDING")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  reservationFilter === "PENDING"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                En attente ({pendingAttendees.length})
              </button>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Participant</th>
                    <th className="py-3.5 px-4">Pass & Catégorie</th>
                    <th className="py-3.5 px-4">N° Billet</th>
                    <th className="py-3.5 px-4">Montant Payé</th>
                    <th className="py-3.5 px-4">Statut d&apos;Entrée</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAttendees.map((att) => (
                    <tr key={att.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {att.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">{att.customerName}</p>
                            <p className="text-[11px] text-muted-foreground">{att.customerEmail}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{att.customerPhone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-foreground">
                        {att.ticketTypeName}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {att.ticketNumber}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {((att.ticketPrice ?? 0) / 100).toLocaleString("fr-FR")} FCFA
                      </td>

                      <td className="py-3 px-4">
                        {att.status === "USED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            <CheckCircle2 className="size-3" /> Scanné / Présent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                            <Clock className="size-3" /> En attente de scan
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {att.status === "VALID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-lg text-[11px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => handleMarkAsScanned(att.id)}
                            >
                              Valider Scan
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => handleResendPass(att)}
                            title="Renvoyer par WhatsApp"
                          >
                            <Smartphone className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 3 : CERTIFICATIONS & ENVOI AUX BILLETS SCANNÉS */}
      {/* ========================================================================= */}
      {activeTab === "CERTIFICATES" && (
        <div className="space-y-6">
          {/* Mass Dispatch Banner */}
          <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-card to-amber-500/10 p-6 sm:p-7 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white">
                  <Award className="size-4" />
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Génération & Envoi des Certifications Officielles
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Les certifications sont réservées aux participants ayant le statut <strong>&quot;Scanné / Présent&quot;</strong>.
                Chaque diplôme est généré nominativement avec signature officielle et QR Code de vérification d&apos;authenticité.
              </p>
              <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> {scannedAttendees.length} participants éligibles
                </span>
                <span className="text-muted-foreground">
                  {certificates.filter((c) => c.status === "SENT").length} déjà expédiés
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px]">
                  Plan Gratuit : 15 certificats inclus
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <Button
                size="lg"
                onClick={handleMassDispatchCertificates}
                disabled={isSendingCertificates || scannedAttendees.length === 0}
                className="rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 gap-2 py-6 px-5"
              >
                <Send className="size-4" />
                <span>
                  {isSendingCertificates
                    ? "Génération & Expédition..."
                    : `Envoyer les diplômes (${scannedAttendees.length})`}
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setIsCertUpgradeModalOpen(true)}
                className="rounded-2xl border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold text-xs gap-1.5 py-6"
                title="Délivrer plus de 15 certifications avec le Plan PRO"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Illimité (PRO)</span>
              </Button>
            </div>
          </div>

          {/* Certificate Live Preview & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Certificate Mockup */}
            <div className="lg:col-span-6 rounded-3xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck className="size-4 text-amber-500" />
                  Aperçu du Diplôme Nominatif Émis
                </span>
                <span className="text-[10px] font-mono rounded bg-amber-500/15 text-amber-600 px-2 py-0.5 font-bold">
                  Prestige Académique & Or
                </span>
              </div>

              {/* Realistic Diploma Mockup */}
              <div className="rounded-2xl border-2 border-double border-amber-600/70 p-5 space-y-3 text-center bg-[#faf8f2] dark:bg-[#15130f] text-zinc-900 dark:text-zinc-100 shadow-inner">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400">
                    N° GA-CERT-2026-001
                  </span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-amber-500 text-black text-xs font-extrabold shadow-sm">
                    ★
                  </span>
                </div>

                <div className="font-serif text-sm font-extrabold tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                  CERTIFICAT D&apos;ACCOMPLISSEMENT
                </div>
                <div className="h-0.5 w-24 mx-auto bg-amber-500/60" />

                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                  Atteste que <strong className="text-zinc-900 dark:text-white text-sm">Marc Ondimba</strong> a participé avec succès à
                </p>
                <p className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  {eventData.title}
                </p>

                <div className="flex justify-between items-end pt-3 border-t border-amber-600/30 text-[8px] text-zinc-500">
                  <div className="text-left">
                    <div className="font-serif italic font-bold text-amber-600 text-xs">Dr. Paul Mba</div>
                    <span>Direction Pédagogique Giya</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-black p-1 rounded-lg border border-amber-500/30">
                    <QrCode className="size-6 text-black dark:text-white" />
                    <span className="text-[7px] font-mono font-bold">VÉRIFIÉ GIYA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Issued Certificates Table */}
            <div className="lg:col-span-6 rounded-3xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-bold text-foreground">
                  Certificats Émis & Suivi des Envois ({certificates.length})
                </span>
                <span className="text-[10px] text-muted-foreground">Format PDF Téléchargeable</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-foreground">{cert.attendeeName}</p>
                        <span className="font-mono text-[9px] text-amber-600 font-bold">
                          {cert.certificateNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{cert.attendeeEmail}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {cert.status === "SENT" ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="size-2.5" /> Envoyé
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-500 flex items-center gap-1">
                          <Clock className="size-2.5" /> En attente
                        </span>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={() => toast.success(`Téléchargement du certificat ${cert.certificateNumber}`)}
                        title="Télécharger le PDF"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 4 : STATISTIQUES & ANALYSE VISUELLE DU QUESTIONNAIRE */}
      {/* ========================================================================= */}
      {activeTab === "STATS" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground">Taux de Scan / Présence</span>
              <p className="font-display text-2xl font-bold text-emerald-500 mt-1">
                71.5%
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                156 présents sur 218 vendus
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground">Répartition Mobile Money</span>
              <p className="font-display text-2xl font-bold text-foreground mt-1">
                Airtel (72%)
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Moov Money (28%)
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground">Taux de Remplissage</span>
              <p className="font-display text-2xl font-bold text-foreground mt-1">
                43.6%
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Capacité: 500 places
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs text-muted-foreground">Score de Satisfaction</span>
              <p className="font-display text-2xl font-bold text-amber-500 mt-1">
                4.8 / 5 ★
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Basé sur 184 réponses
              </span>
            </div>
          </div>

          {/* Section: Réponses au Questionnaire (Style Google Forms Analytics) */}
          <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileQuestion className="size-4" />
                </span>
                <h3 className="font-display text-base font-bold text-foreground">
                  Analyse Visuelle des Réponses au Questionnaire (184 répondants)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">Google Forms Analytics</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Question 1: Single Choice (SVG Donut Chart) */}
              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground">
                    1. Comment avez-vous découvert l&apos;événement ?
                  </h4>
                  <span className="text-[10px] font-mono rounded bg-primary/15 text-primary px-2 py-0.5 font-bold">
                    Choix Unique
                  </span>
                </div>

                {/* SVG Donut Chart with Legends */}
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
                  <div className="relative size-36">
                    <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                      {/* Segment 1: Instagram (45%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeDasharray="45 100"
                        strokeDashoffset="0"
                      />
                      {/* Segment 2: WhatsApp (32%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="5"
                        strokeDasharray="32 100"
                        strokeDashoffset="-45"
                      />
                      {/* Segment 3: Bouche à oreille (15%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="5"
                        strokeDasharray="15 100"
                        strokeDashoffset="-77"
                      />
                      {/* Segment 4: Affichage (8%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="5"
                        strokeDasharray="8 100"
                        strokeDashoffset="-92"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-lg font-bold text-foreground">184</span>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">Réponses</span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Réseaux Sociaux :</span>
                      <strong className="text-foreground">45% (83)</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-sky-500" />
                      <span className="text-muted-foreground">WhatsApp / Amis :</span>
                      <strong className="text-foreground">32% (59)</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Bouche à oreille :</span>
                      <strong className="text-foreground">15% (28)</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-purple-500" />
                      <span className="text-muted-foreground">Affichage public :</span>
                      <strong className="text-foreground">8% (14)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 2: Multiple Choice (Horizontal Progress Bars) */}
              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground">
                    2. Principaux centres d&apos;intérêt pour cette session
                  </h4>
                  <span className="text-[10px] font-mono rounded bg-primary/15 text-primary px-2 py-0.5 font-bold">
                    Choix Multiples
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Networking & Opportunités B2B</span>
                      <span className="font-bold text-foreground">78% (144 votes)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Acquisition de Compétences & Masterclass</span>
                      <span className="font-bold text-foreground">65% (120 votes)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Concert & Ambiance Live</span>
                      <span className="font-bold text-foreground">52% (96 votes)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "52%" }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Dégustation & Espace VIP Lounge</span>
                      <span className="font-bold text-foreground">38% (70 votes)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "38%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 3: Rating Scale (Stars & Distribution) */}
              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground">
                    3. Niveau de satisfaction globale / Attentes
                  </h4>
                  <span className="text-[10px] font-mono rounded bg-amber-500/15 text-amber-600 px-2 py-0.5 font-bold">
                    Échelle 1 à 5 ★
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-display text-4xl font-extrabold text-amber-500">4.8</p>
                    <div className="flex justify-center text-amber-400 text-xs mt-1">
                      ★★★★★
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">184 avis</span>
                  </div>

                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 font-mono text-[11px]">5 ★</span>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "82%" }} />
                      </div>
                      <span className="font-bold w-8 text-right">82%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 font-mono text-[11px]">4 ★</span>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "14%" }} />
                      </div>
                      <span className="font-bold w-8 text-right">14%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 font-mono text-[11px]">3 ★</span>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "4%" }} />
                      </div>
                      <span className="font-bold w-8 text-right">4%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 4: Short Text Answers (Word Cloud / Verbatims) */}
              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground">
                    4. Profils & Organisations déclarés
                  </h4>
                  <span className="text-[10px] font-mono rounded bg-primary/15 text-primary px-2 py-0.5 font-bold">
                    Texte Court
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    CEO Sokens Digital (18)
                  </span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    Directeur Marketing (14)
                  </span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    Développeur Fullstack (12)
                  </span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    Étudiant Master 2 (24)
                  </span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    Consultant RH & Stratégie (9)
                  </span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    Chef de Projet Digital (11)
                  </span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    Cadre Bancaire (8)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER SHEET MODAL (GLISSE DE LA DROITE VERS LA GAUCHE) */}
      {/* ========================================================================= */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[850px] overflow-y-auto p-6 sm:p-8 border-l border-border bg-card"
        >
          <SheetHeader className="mb-6 border-b border-border pb-4">
            <SheetTitle className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Modifier l&apos;Événement
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Ajustez les informations générales, l&apos;affiche, les formules de pass, le questionnaire d&apos;inscription et le modèle de certification.
            </SheetDescription>
          </SheetHeader>

          <EventForm
            initialData={eventData}
            onSuccess={(updated) => {
              setEventData((prev) => ({ ...prev, ...updated }));
              setIsEditModalOpen(false);
              toast.success("Événement mis à jour avec succès !");
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Pricing Upgrade Modal for Certifications Limit */}
      <PricingUpgradeModal
        isOpen={isCertUpgradeModalOpen}
        onClose={() => setIsCertUpgradeModalOpen(false)}
        feature="CERTIFICATES_LIMIT"
      />
    </div>
  );
}
