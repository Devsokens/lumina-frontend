"use client";

import { useState, useRef } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
  Plus,
  Minus,
  QrCode,
  Lock,
  MessageCircle,
  Share2,
  Building,
  Award,
  Users,
  ChevronRight,
  HelpCircle,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Camera,
  Edit3,
  Search,
  SlidersHorizontal,
  X,
  Palette,
  Check,
} from "lucide-react";
import {
  useShowcaseStore,
  type EventItem,
  type TicketTier,
  type ShowcaseTheme,
} from "@/stores/useShowcaseStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShowcaseCanvasProps {
  isEditorMode?: boolean;
}

const THEMES: { id: ShowcaseTheme; name: string; gradient: string }[] = [
  { id: "emerald", name: "Émeraude Royal (Giya)", gradient: "from-emerald-500 to-teal-700" },
  { id: "indigo", name: "Bleu Nuit / Indigo", gradient: "from-blue-600 to-indigo-900" },
  { id: "amber", name: "Ambre Solaire (Afro Vibes)", gradient: "from-amber-500 to-orange-600" },
  { id: "electric", name: "Nuit Électrique & Cyber", gradient: "from-cyan-500 to-blue-600" },
  { id: "ruby", name: "Rubis & Soirée Prestige", gradient: "from-rose-500 to-purple-600" },
  { id: "dark", name: "Noir Onyx Minimaliste", gradient: "from-zinc-700 to-zinc-950" },
];

export function ShowcaseCanvas({ isEditorMode = false }: ShowcaseCanvasProps) {
  const {
    theme,
    setTheme,
    fontFamily,
    deviceView,
    orgName,
    orgTagline,
    orgLogoUrl,
    orgCoverUrl,
    aboutTitle,
    aboutText,
    heroHeadline,
    heroSubheadline,
    heroCtaText,
    statParticipants,
    statEvents,
    statSatisfaction,
    statSecurity,
    events,
    galleryImages,
    testimonials,
    faqs,
    whatsappNumber,
    supportPhone,
    contactEmail,
    address,
    rccm,
    nif,
    updateField,
    updateEvent,
    updateEventCover,
    updateGalleryImage,
  } = useShowcaseStore();

  // In-Page Event Search & Category Filter (Visible on main page)
  const [homeEventSearch, setHomeEventSearch] = useState("");
  const [homeCategoryFilter, setHomeCategoryFilter] = useState("Tous");

  // Full Catalog Modal State (Opened by 4th card or button)
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("Tous");

  // Event Details & Booking Modal State
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [phoneBuyer, setPhoneBuyer] = useState("077 12 34 56");
  const [nameBuyer, setNameBuyer] = useState("Jean-Marc Obiang");
  const [emailBuyer, setEmailBuyer] = useState("jm.obiang@gmail.com");
  const [operator, setOperator] = useState<"AIRTEL" | "MOOV">("AIRTEL");
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [generatedTicketRef, setGeneratedTicketRef] = useState("GA-LBV-9082");

  // FAQ open/close state
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  // Hidden File Input Refs for direct image uploads
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroCoverInputRef = useRef<HTMLInputElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const eventCoverInputRef = useRef<HTMLInputElement>(null);
  const [targetEventCoverId, setTargetEventCoverId] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [targetGalleryIdx, setTargetGalleryIdx] = useState<number | null>(null);

  // File Upload Handlers
  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void,
    successMessage: string
  ) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner un fichier image (PNG, JPG, SVG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onSuccess(result);
        toast.success(successMessage);
      };
      reader.readAsDataURL(file);
    }
  }

  // Theme styling helpers
  const getThemeStyles = () => {
    switch (theme) {
      case "emerald":
        return {
          primary: "bg-emerald-600 hover:bg-emerald-500 text-white",
          primaryText: "text-emerald-400",
          primaryBorder: "border-emerald-500/40",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          glow: "from-emerald-600/30 to-teal-900/40",
          cardBg: "bg-emerald-950/20 border-emerald-500/20",
          ring: "ring-emerald-500",
        };
      case "electric":
        return {
          primary: "bg-cyan-500 hover:bg-cyan-400 text-black font-bold",
          primaryText: "text-cyan-400",
          primaryBorder: "border-cyan-500/40",
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
          glow: "from-cyan-600/30 to-blue-900/40",
          cardBg: "bg-cyan-950/20 border-cyan-500/20",
          ring: "ring-cyan-500",
        };
      case "ruby":
        return {
          primary: "bg-rose-600 hover:bg-rose-500 text-white",
          primaryText: "text-rose-400",
          primaryBorder: "border-rose-500/40",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          glow: "from-rose-600/30 to-purple-900/40",
          cardBg: "bg-rose-950/20 border-rose-500/20",
          ring: "ring-rose-500",
        };
      case "indigo":
        return {
          primary: "bg-blue-600 hover:bg-blue-500 text-white",
          primaryText: "text-blue-400",
          primaryBorder: "border-blue-500/40",
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          glow: "from-blue-600/30 to-indigo-950/40",
          cardBg: "bg-blue-950/20 border-blue-500/20",
          ring: "ring-blue-500",
        };
      case "dark":
        return {
          primary: "bg-white hover:bg-zinc-200 text-black font-bold",
          primaryText: "text-zinc-200",
          primaryBorder: "border-zinc-700",
          badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
          glow: "from-zinc-800/40 to-black/80",
          cardBg: "bg-zinc-900/60 border-zinc-800",
          ring: "ring-zinc-400",
        };
      case "amber":
      default:
        return {
          primary: "bg-amber-500 hover:bg-amber-400 text-black font-bold",
          primaryText: "text-amber-400",
          primaryBorder: "border-amber-500/40",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          glow: "from-amber-600/30 to-orange-900/40",
          cardBg: "bg-amber-950/20 border-amber-500/20",
          ring: "ring-amber-500",
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Container width simulator based on deviceView
  const getDeviceClass = () => {
    switch (deviceView) {
      case "mobile":
        return "max-w-[400px] shadow-2xl rounded-3xl border border-zinc-800 overflow-hidden my-4";
      case "tablet":
        return "max-w-[768px] shadow-2xl rounded-3xl border border-zinc-800 overflow-hidden my-4";
      case "desktop":
      default:
        return "w-full rounded-3xl border border-white/10 overflow-hidden shadow-2xl";
    }
  };

  function handleOpenEventDetails(evt: EventItem) {
    setActiveEvent(evt);
    setSelectedTicket(evt.tickets[0] || null);
    setQuantity(1);
    setIsCheckoutStep(false);
    setIsPaymentSuccess(false);
  }

  function handleProceedToPayment() {
    if (!nameBuyer.trim() || !phoneBuyer.trim()) {
      toast.error("Veuillez renseigner votre nom et votre numéro de téléphone pour le pass.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentSuccess(true);
      setGeneratedTicketRef(`GA-${Math.floor(100000 + Math.random() * 900000)}`);
      toast.success("Paiement validé avec succès ! Votre pass officiel est généré.");
    }, 1200);
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Home filtered events based on visible search input & filter pills
  const homeFilteredEvents = events.filter((evt) => {
    const matchesCategory =
      homeCategoryFilter === "Tous" || evt.category === homeCategoryFilter;
    const matchesSearch =
      homeEventSearch.trim() === "" ||
      evt.title.toLowerCase().includes(homeEventSearch.toLowerCase()) ||
      evt.location.toLowerCase().includes(homeEventSearch.toLowerCase()) ||
      evt.description.toLowerCase().includes(homeEventSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Events in the Full Catalog Modal
  const catalogFilteredEvents = events.filter((evt) => {
    const matchesCategory =
      catalogCategory === "Tous" || evt.category === catalogCategory;
    const matchesQuery =
      catalogSearchQuery.trim() === "" ||
      evt.title.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(catalogSearchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Modal scrollbar class helper
  const modalScrollClass =
    "overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent";

  return (
    <div
      className={`mx-auto bg-[#090b0e] text-white transition-all ${getDeviceClass()} relative`}
      style={{ fontFamily }}
    >
      {/* HIDDEN FILE INPUTS FOR DIRECT UPLOADS */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) =>
          handleImageUpload(
            e,
            (url) => updateField("orgLogoUrl", url),
            "Logo de l'organisation mis à jour !"
          )
        }
        className="hidden"
      />
      <input
        ref={heroCoverInputRef}
        type="file"
        accept="image/*"
        onChange={(e) =>
          handleImageUpload(
            e,
            (url) => updateField("orgCoverUrl", url),
            "Image de couverture Hero mise à jour !"
          )
        }
        className="hidden"
      />
      <input
        ref={aboutImageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) =>
          handleImageUpload(
            e,
            (url) => updateField("orgCoverUrl", url),
            "Photo de la section À Propos mise à jour !"
          )
        }
        className="hidden"
      />
      <input
        ref={eventCoverInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (targetEventCoverId) {
            handleImageUpload(
              e,
              (url) => updateEventCover(targetEventCoverId, url),
              "Affiche de l'événement mise à jour !"
            );
          }
        }}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (targetGalleryIdx !== null) {
            handleImageUpload(
              e,
              (url) => updateGalleryImage(targetGalleryIdx, url),
              "Photo de la galerie mise à jour !"
            );
          }
        }}
        className="hidden"
      />

      {/* QUICK FLOATING PALETTE BAR IN EDITOR MODE */}
      {isEditorMode && (
        <div className="bg-zinc-950/95 border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-30">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 text-[11px]">
              <Edit3 className="size-3" />
              Mode Édition Directe
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Cliquez directement sur n&apos;importe quel texte ou survolez une image pour la modifier.
            </span>
          </div>

          {/* Quick Theme Swatches */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400 font-semibold mr-1">Thème :</span>
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                title={t.name}
                className={`size-6 rounded-lg bg-gradient-to-br ${t.gradient} border transition-all flex items-center justify-center text-white ${
                  theme === t.id
                    ? "border-white ring-2 ring-white scale-110 shadow-md"
                    : "border-white/20 opacity-75 hover:opacity-100"
                }`}
              >
                {theme === t.id && <Check className="size-3 stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. STICKY TOP NAVIGATION OF THE ORGANIZATION */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090b0e]/90 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          {/* Logo & Name (Directly Editable) */}
          <div className="flex items-center gap-3 group relative">
            <div
              onClick={() => isEditorMode && logoInputRef.current?.click()}
              className={`relative size-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center shrink-0 ${
                isEditorMode ? "cursor-pointer hover:border-amber-400 transition-colors" : ""
              }`}
              title={isEditorMode ? "Cliquez pour changer le logo" : undefined}
            >
              {orgLogoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={orgLogoUrl}
                  alt={orgName}
                  className="size-full object-contain p-0.5"
                />
              ) : (
                <span className="font-extrabold text-sm text-white">{orgName.charAt(0)}</span>
              )}
              {isEditorMode && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-amber-400">
                  <Camera className="size-4" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              {isEditorMode ? (
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => updateField("orgName", e.target.value)}
                  className="font-display font-extrabold text-sm sm:text-base tracking-tight text-white bg-transparent border-b border-dashed border-white/20 hover:border-amber-400 focus:outline-none focus:border-amber-400 w-full truncate"
                  title="Modifier le nom de l'organisation"
                />
              ) : (
                <span className="font-display font-extrabold text-sm sm:text-base tracking-tight text-white block truncate">
                  {orgName}
                </span>
              )}
              {isEditorMode ? (
                <input
                  type="text"
                  value={orgTagline}
                  onChange={(e) => updateField("orgTagline", e.target.value)}
                  className="text-[10px] text-zinc-400 bg-transparent border-b border-dashed border-white/10 hover:border-amber-400 focus:outline-none focus:border-amber-400 w-full truncate"
                  title="Modifier le slogan"
                />
              ) : (
                <span className="text-[10px] text-white/60 font-medium hidden sm:block truncate">
                  {orgTagline}
                </span>
              )}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-white/80">
            <button
              type="button"
              onClick={() => scrollToSection("events-section")}
              className="hover:text-white transition-colors"
            >
              Événements
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("about-section")}
              className="hover:text-white transition-colors"
            >
              À Propos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("gallery-section")}
              className="hover:text-white transition-colors"
            >
              Galerie
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("testimonials-section")}
              className="hover:text-white transition-colors"
            >
              Avis
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("faq-section")}
              className="hover:text-white transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Top Action */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsCatalogOpen(true)}
              className={`rounded-xl text-xs font-bold px-4 gap-1.5 shadow-lg ${themeStyle.primary}`}
            >
              <Ticket className="size-3.5" />
              <span>Billetterie</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION OF THE ORGANIZATION (NO ETIQUETTES / BADGES) */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-8 group">
        {/* Ambient Glows */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-gradient-to-b ${themeStyle.glow} blur-[120px] pointer-events-none opacity-60`}
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity transition-all"
          style={{ backgroundImage: `url(${orgCoverUrl})` }}
        />

        {/* Hero Cover Upload Trigger (Visible in Editor Mode) */}
        {isEditorMode && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => heroCoverInputRef.current?.click()}
              className="rounded-xl text-xs font-bold bg-black/70 hover:bg-black text-white border border-white/20 gap-1.5 backdrop-blur-md shadow-lg"
            >
              <Camera className="size-3.5 text-amber-400" />
              <span>Changer la Couverture Hero</span>
            </Button>
          </div>
        )}

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          {/* Main Headline */}
          {isEditorMode ? (
            <textarea
              value={heroHeadline}
              onChange={(e) => updateField("heroHeadline", e.target.value)}
              rows={2}
              className="w-full font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto bg-transparent border border-dashed border-white/20 hover:border-amber-400 focus:outline-none focus:border-amber-400 text-center rounded-2xl p-2 resize-none"
            />
          ) : (
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
              {heroHeadline}
            </h1>
          )}

          {/* Subheadline */}
          {isEditorMode ? (
            <textarea
              value={heroSubheadline}
              onChange={(e) => updateField("heroSubheadline", e.target.value)}
              rows={2}
              className="w-full mx-auto max-w-2xl text-xs sm:text-base text-zinc-300 leading-relaxed bg-transparent border border-dashed border-white/20 hover:border-amber-400 focus:outline-none focus:border-amber-400 text-center rounded-xl p-2 resize-none"
            />
          ) : (
            <p className="mx-auto max-w-2xl text-xs sm:text-base text-zinc-300 leading-relaxed">
              {heroSubheadline}
            </p>
          )}

          {/* Action CTAs (Clean without emojis) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => setIsCatalogOpen(true)}
              className={`rounded-2xl text-sm font-bold px-7 py-6 gap-2 shadow-xl ${themeStyle.primary}`}
            >
              <span>{heroCtaText.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim() || "Explorer la Programmation"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Key Stats Strip (Directly Editable in Editor Mode) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center space-y-1">
              {isEditorMode ? (
                <input
                  type="text"
                  value={statParticipants}
                  onChange={(e) => updateField("statParticipants", e.target.value)}
                  className={`w-full font-display text-2xl font-black ${themeStyle.primaryText} bg-transparent text-center focus:outline-none border-b border-dashed border-white/20`}
                />
              ) : (
                <p className={`font-display text-2xl font-black ${themeStyle.primaryText}`}>
                  {statParticipants}
                </p>
              )}
              <p className="text-[11px] text-zinc-400 font-medium">Participants Accueillis</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center space-y-1">
              {isEditorMode ? (
                <input
                  type="text"
                  value={statEvents}
                  onChange={(e) => updateField("statEvents", e.target.value)}
                  className={`w-full font-display text-2xl font-black ${themeStyle.primaryText} bg-transparent text-center focus:outline-none border-b border-dashed border-white/20`}
                />
              ) : (
                <p className={`font-display text-2xl font-black ${themeStyle.primaryText}`}>
                  {statEvents}
                </p>
              )}
              <p className="text-[11px] text-zinc-400 font-medium">Éditions & Événements</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center space-y-1">
              {isEditorMode ? (
                <input
                  type="text"
                  value={statSatisfaction}
                  onChange={(e) => updateField("statSatisfaction", e.target.value)}
                  className={`w-full font-display text-2xl font-black ${themeStyle.primaryText} bg-transparent text-center focus:outline-none border-b border-dashed border-white/20`}
                />
              ) : (
                <p className={`font-display text-2xl font-black ${themeStyle.primaryText}`}>
                  {statSatisfaction}
                </p>
              )}
              <p className="text-[11px] text-zinc-400 font-medium">Avis & Satisfaction</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center space-y-1">
              {isEditorMode ? (
                <input
                  type="text"
                  value={statSecurity}
                  onChange={(e) => updateField("statSecurity", e.target.value)}
                  className={`w-full font-display text-2xl font-black ${themeStyle.primaryText} bg-transparent text-center focus:outline-none border-b border-dashed border-white/20`}
                />
              ) : (
                <p className={`font-display text-2xl font-black ${themeStyle.primaryText}`}>
                  {statSecurity}
                </p>
              )}
              <p className="text-[11px] text-zinc-400 font-medium">Billets QR Anti-Fraude</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION ÉVÉNEMENTS (AVEC BARRE DE RECHERCHE VISIBLE DIRECTEMENT SUR LA PAGE) */}
      <section id="events-section" className="py-16 px-4 sm:px-8 border-t border-white/10 bg-[#06080a]">
        <div className="mx-auto max-w-6xl space-y-7">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <Ticket className="size-3.5" />
                <span>Programmation en Vedette</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Nos Grands Événements à la Une
              </h2>
            </div>

            <Button
              onClick={() => setIsCatalogOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl border-white/20 text-xs font-bold gap-1.5 self-start sm:self-auto"
            >
              <Search className="size-3.5 text-emerald-400" />
              <span>Ouvrir le Catalogue Complet ({events.length})</span>
            </Button>
          </div>

          {/* Direct Search Bar & Category Filter directly visible on this section */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="text"
                value={homeEventSearch}
                onChange={(e) => setHomeEventSearch(e.target.value)}
                placeholder="Rechercher un événement (ex: Festival, Gala, Masterclass, Libreville)..."
                className="w-full h-11 rounded-2xl bg-white/5 border border-white/15 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {homeEventSearch && (
                <button
                  type="button"
                  onClick={() => setHomeEventSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 w-full md:w-auto overflow-x-auto">
              {["Tous", "Concert & Festival", "Conférence & Gala", "Formation & Masterclass", "Soirée VIP"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setHomeCategoryFilter(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                      homeCategoryFilter === cat
                        ? `${themeStyle.primary} shadow-md`
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 4 Cards Linear Row: 3 Events + 1 "Voir Tout le Catalogue" Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 3 FIRST MATCHING EVENTS */}
            {homeFilteredEvents.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl relative"
              >
                {/* Event Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.coverImageUrl}
                    alt={evt.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Direct Poster Upload Button in Editor Mode */}
                  {isEditorMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetEventCoverId(evt.id);
                        eventCoverInputRef.current?.click();
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-black/80 hover:bg-black text-amber-400 border border-white/20 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Changer l'affiche"
                    >
                      <Camera className="size-3" />
                      <span>Modifier</span>
                    </button>
                  )}

                  {/* Badges on Banner */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                      {evt.category}
                    </span>
                  </div>

                  {/* Starting Price Tag */}
                  <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 px-2 py-0.5">
                    <span className={`font-mono font-black text-xs ${themeStyle.primaryText}`}>
                      Dès {evt.startingPrice.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>

                {/* Event Body Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {isEditorMode ? (
                      <input
                        type="text"
                        value={evt.title}
                        onChange={(e) => updateEvent(evt.id, { title: e.target.value })}
                        className="w-full font-display font-extrabold text-sm text-white bg-transparent border-b border-dashed border-white/20 hover:border-amber-400 focus:outline-none focus:border-amber-400"
                        title="Modifier le titre"
                      />
                    ) : (
                      <h3 className="font-display font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1" title={evt.title}>
                        {evt.title}
                      </h3>
                    )}

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1 pt-1 text-[11px] text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-rose-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-white/10">
                    <Button
                      onClick={() => handleOpenEventDetails(evt)}
                      className={`w-full rounded-xl text-xs font-bold py-2 gap-1.5 shadow-md ${themeStyle.primary}`}
                    >
                      <Ticket className="size-3.5" />
                      <span>Réserver</span>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* 4TH CARD: INTERACTIVE "VOIR TOUT LE CATALOGUE" PORTAL CARD */}
            <div
              onClick={() => setIsCatalogOpen(true)}
              className="group rounded-3xl border-2 border-dashed border-white/20 hover:border-emerald-500 bg-gradient-to-br from-emerald-950/30 via-white/[0.02] to-teal-950/30 p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] shadow-2xl relative overflow-hidden min-h-[340px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <Search className="size-5" />
                  </div>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    +{events.length - 3 > 0 ? events.length - 3 : "Tous"} Événements
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    Voir Tout le Catalogue
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Accédez à la programmation complète, utilisez la recherche par mot-clé et réservez vos billets en ligne.
                  </p>
                </div>

                <div className="space-y-1 pt-1 text-[10px] text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                    <span>Moteur de recherche direct</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                    <span>Filtres par catégorie & date</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                    <span>Paiement Airtel & Moov Money</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-400 group-hover:underline">
                  Ouvrir le catalogue
                </span>
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500 text-black group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION À PROPOS DE L'ORGANISATION & NOTRE VISION */}
      <section id="about-section" className="py-16 px-4 sm:px-8 border-t border-white/10 bg-[#090b0e]">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Award className="size-3.5" />
              <span>Savoir-Faire & Vision</span>
            </div>

            {isEditorMode ? (
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => updateField("aboutTitle", e.target.value)}
                className="w-full font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight bg-transparent border-b border-dashed border-white/20 hover:border-amber-400 focus:outline-none"
              />
            ) : (
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {aboutTitle}
              </h2>
            )}

            {isEditorMode ? (
              <textarea
                value={aboutText}
                onChange={(e) => updateField("aboutText", e.target.value)}
                rows={5}
                className="w-full text-xs sm:text-sm text-zinc-300 leading-relaxed bg-transparent border border-dashed border-white/20 hover:border-amber-400 focus:outline-none rounded-xl p-2 resize-none"
              />
            ) : (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {aboutText}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Scénographie & Régie Haute Définition</h4>
                  <p className="text-[11px] text-zinc-400">Équipements son et lumière de niveau festival international.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Billetterie & Paiement Mobile Money Instantané</h4>
                  <p className="text-[11px] text-zinc-400">Achat direct par Airtel Money et Moov Money sans intermédiaire.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Contrôle d&apos;Accès & Attestations Certifiées</h4>
                  <p className="text-[11px] text-zinc-400">QR codes infalsifiables et diplômes numériques délivrés après présence.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={orgCoverUrl}
              alt={orgName}
              className="rounded-2xl w-full h-80 object-cover"
            />
            {isEditorMode && (
              <button
                type="button"
                onClick={() => aboutImageInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-bold text-xs transition-opacity"
              >
                <Camera className="size-5 text-amber-400" />
                <span>Remplacer la Photo À Propos</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 5. GALERIE & MOMENTS FORTS (NO ETIQUETTES / BADGES) */}
      <section id="gallery-section" className="py-16 px-4 sm:px-8 border-t border-white/10 bg-[#06080a]">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Galerie des Moments Forts
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Retour en images sur l&apos;énergie et la ferveur de nos dernières productions au Gabon.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative h-44 sm:h-60 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Galerie ${idx + 1}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition-colors" />

                {/* Direct Image Upload on Hover in Editor Mode */}
                {isEditorMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetGalleryIdx(idx);
                      galleryInputRef.current?.click();
                    }}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-bold text-xs transition-opacity"
                  >
                    <Camera className="size-4 text-amber-400" />
                    <span>Changer la Photo</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AVIS DES PARTICIPANTS & TÉMOIGNAGES (NO ETIQUETTES / BADGES) */}
      <section id="testimonials-section" className="py-16 px-4 sm:px-8 border-t border-white/10 bg-[#090b0e]">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ce que disent nos Participants
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Des milliers de festivaliers, congressistes et professionnels nous font confiance chaque année.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4 flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    &ldquo;{test.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{test.name}</h4>
                    <p className="text-[10px] text-zinc-400">{test.role}</p>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {test.eventName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOIRE AUX QUESTIONS (FAQ) */}
      <section id="faq-section" className="py-16 px-4 sm:px-8 border-t border-white/10 bg-[#06080a]">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <HelpCircle className="size-3.5" />
              <span>Assistance & Réponses</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Foire Aux Questions Billetterie
            </h2>
          </div>

          <div className="space-y-3 pt-4">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="size-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="size-4 text-zinc-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FOOTER OFFICIEL & COORDONNÉES */}
      <footer className="border-t border-white/10 bg-[#040507] py-12 px-4 sm:px-8 text-xs text-zinc-400">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                {orgLogoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={orgLogoUrl}
                    alt={orgName}
                    className="size-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 text-white font-extrabold text-xs">
                    {orgName.charAt(0)}
                  </div>
                )}
                <span className="font-display font-extrabold text-base text-white">
                  {orgName}
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-md">
                {orgTagline}. Billetterie officielle en ligne et organisation d&apos;événements de référence au Gabon.
              </p>
              <p className="text-[10px] font-mono text-zinc-500">
                NIF : {nif} • RCCM : {rccm}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact & Support</h4>
              <p className="text-xs text-zinc-300">{address}</p>
              <p className="text-xs text-emerald-400 font-mono">WhatsApp : {whatsappNumber}</p>
              <p className="text-xs text-zinc-300 font-mono">Tél : {supportPhone}</p>
              <p className="text-xs text-zinc-300">{contactEmail}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Moyens de Paiement</h4>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-lg bg-red-600/20 border border-red-500/30 px-2.5 py-1 text-[11px] font-bold text-red-400">
                  Airtel Money
                </span>
                <span className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-2.5 py-1 text-[11px] font-bold text-blue-400">
                  Moov Money
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 pt-1">Paiements 100% sécurisés et billets instantanés.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
            <p>© {new Date().getFullYear()} {orgName}. Tous droits réservés.</p>
            <p className="flex items-center gap-1.5 text-zinc-400">
              <span>Propulsé par la billetterie</span>
              <strong className="text-white font-display">Giya</strong>
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON (ALWAYS ACCESSIBLE) */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-2xl shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 group font-bold text-xs"
        title="Discuter sur WhatsApp"
      >
        <MessageCircle className="size-5 fill-white text-[#25D366]" />
        <span className="hidden sm:inline font-semibold">Besoin d&apos;aide ? WhatsApp</span>
      </a>

      {/* 9. MODAL DÉDIÉE : CATALOGUE COMPLET DES ÉVÉNEMENTS (OUVERTE PAR LA 4E CARTE) */}
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent
          className={`rounded-3xl border border-white/20 bg-[#0d1117] text-white p-6 sm:max-w-4xl max-h-[85vh] shadow-2xl space-y-6 ${modalScrollClass}`}
        >
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Ticket className="size-3.5" />
                <span>Billetterie & Programmation Officielle</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 font-mono">
                {catalogFilteredEvents.length} Événement(s) trouvé(s)
              </span>
            </div>
            <DialogTitle className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Catalogue Complet des Événements — {orgName}
            </DialogTitle>
          </DialogHeader>

          {/* Search Bar & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="text"
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                placeholder="Rechercher un festival, concert, conférence, lieu (Libreville)..."
                className="w-full h-11 rounded-2xl bg-white/5 border border-white/15 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {catalogSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCatalogSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
              {["Tous", "Concert & Festival", "Conférence & Gala", "Formation & Masterclass", "Soirée VIP"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatalogCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      catalogCategory === cat
                        ? `${themeStyle.primary} shadow-md`
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {catalogFilteredEvents.length > 0 ? (
              catalogFilteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.coverImageUrl}
                      alt={evt.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                        {evt.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-1">
                      <span className="font-mono font-black text-xs text-emerald-400">
                        Dès {evt.startingPrice.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="font-display font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                      <div className="space-y-1 pt-1 text-[11px] text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{evt.date} • {evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3 text-rose-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setIsCatalogOpen(false);
                        handleOpenEventDetails(evt);
                      }}
                      className={`w-full rounded-xl text-xs font-bold py-2 gap-1.5 shadow-md ${themeStyle.primary}`}
                    >
                      <Ticket className="size-3.5" />
                      <span>Réserver mon Pass</span>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 space-y-2 border border-dashed border-white/15 rounded-3xl bg-white/[0.02]">
                <Search className="size-8 text-zinc-500 mx-auto" />
                <p className="text-xs font-bold text-white">Aucun événement ne correspond à votre recherche</p>
                <p className="text-[11px] text-zinc-400">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCatalogSearchQuery("");
                    setCatalogCategory("Tous");
                  }}
                  className="rounded-xl text-xs mt-2 border-white/20"
                >
                  Réinitialiser la recherche
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 10. MODAL DÉTAILS DE L'ÉVÉNEMENT & TUNNEL DE RÉSERVATION MOBILE MONEY */}
      {activeEvent && (
        <Dialog open={Boolean(activeEvent)} onOpenChange={(open) => !open && setActiveEvent(null)}>
          <DialogContent
            className={`rounded-3xl border border-white/20 bg-[#0d1117] text-white p-0 sm:max-w-xl max-h-[85vh] shadow-2xl ${modalScrollClass}`}
          >
            {/* Header Image */}
            <div className="relative h-44 w-full bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeEvent.coverImageUrl}
                alt={activeEvent.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/50 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-[11px] font-bold text-white">
                  {activeEvent.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {!isCheckoutStep ? (
                /* STEP 1: EVENT DETAILS & TICKET SELECTION */
                <div className="space-y-4">
                  <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="font-display text-xl sm:text-2xl font-extrabold text-white">
                      {activeEvent.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-300">
                      {activeEvent.description}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Practical Details */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 grid grid-cols-2 gap-2.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-emerald-400" />
                      <span>{activeEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-amber-400" />
                      <span>{activeEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="size-3.5 text-rose-400" />
                      <span>{activeEvent.location}</span>
                    </div>
                  </div>

                  {/* Lineup / Intervenants if any */}
                  {activeEvent.lineup && activeEvent.lineup.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Users className="size-3.5 text-amber-400" />
                        <span>Artistes & Intervenants</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeEvent.lineup.map((art) => (
                          <div
                            key={art.id}
                            className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs"
                          >
                            <span className="font-bold text-white">{art.name}</span>
                            <span className="text-[10px] text-zinc-400 ml-1.5">({art.role})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ticket Tiers Selection */}
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Ticket className="size-3.5 text-emerald-400" />
                      <span>Choisissez votre formule de Pass</span>
                    </h4>

                    <div className="space-y-2">
                      {activeEvent.tickets.map((tkt) => {
                        const isSelected = selectedTicket?.id === tkt.id;
                        return (
                          <div
                            key={tkt.id}
                            onClick={() => setSelectedTicket(tkt)}
                            className={`rounded-2xl border p-3.5 cursor-pointer transition-all ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">{tkt.name}</span>
                                {tkt.badge && (
                                  <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                    {tkt.badge}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-extrabold text-sm text-emerald-400">
                                {tkt.price.toLocaleString("fr-FR")} FCFA
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1">{tkt.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tkt.benefits.map((b, idx) => (
                                <span key={idx} className="text-[10px] text-zinc-300 flex items-center gap-1">
                                  <CheckCircle2 className="size-2.5 text-emerald-400" />
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity & Total */}
                  {selectedTicket && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Nombre de Pass</p>
                        <p className="text-[11px] text-zinc-400">
                          Total : {(selectedTicket.price * quantity).toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="size-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="font-mono font-bold text-sm text-white w-4 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="size-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setIsCheckoutStep(true)}
                    disabled={!selectedTicket}
                    className={`w-full rounded-2xl py-6 text-sm font-bold shadow-xl ${themeStyle.primary}`}
                  >
                    <span>Continuer vers le Paiement</span>
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              ) : !isPaymentSuccess ? (
                /* STEP 2: BUYER FORM & MOBILE MONEY PAYMENT */
                <div className="space-y-4">
                  <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="font-display text-xl font-extrabold text-white flex items-center gap-2">
                      <Lock className="size-5 text-emerald-400" />
                      <span>Paiement Sécurisé Mobile Money</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-300">
                      Renseignez vos coordonnées pour recevoir votre billet avec QR code sécurisé.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Summary Card */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Événement :</span>
                      <span className="font-bold text-white">{activeEvent.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Formule :</span>
                      <span className="font-bold text-emerald-400">
                        {quantity}x {selectedTicket?.name}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-sm">
                      <span className="text-white">Montant Total :</span>
                      <span className="font-mono text-emerald-400">
                        {((selectedTicket?.price || 0) * quantity).toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Buyer Fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">
                        Nom & Prénom du Participant
                      </label>
                      <input
                        type="text"
                        value={nameBuyer}
                        onChange={(e) => setNameBuyer(e.target.value)}
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Ex: Jean-Marc Obiang"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">
                        Numéro Téléphone (WhatsApp pour le Billet)
                      </label>
                      <input
                        type="tel"
                        value={phoneBuyer}
                        onChange={(e) => setPhoneBuyer(e.target.value)}
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        placeholder="077 12 34 56"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">
                        Email de Réception
                      </label>
                      <input
                        type="email"
                        value={emailBuyer}
                        onChange={(e) => setEmailBuyer(e.target.value)}
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder="votre.email@gmail.com"
                      />
                    </div>
                  </div>

                  {/* Mobile Money Operator Selection */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Moyen de Paiement Gabon
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setOperator("AIRTEL")}
                        className={`rounded-2xl border p-3 text-center transition-all ${
                          operator === "AIRTEL"
                            ? "border-red-500 bg-red-500/20 ring-1 ring-red-500"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <span className="font-bold text-xs text-red-400 block">Airtel Money</span>
                        <span className="text-[10px] text-zinc-400">Push direct USSD</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOperator("MOOV")}
                        className={`rounded-2xl border p-3 text-center transition-all ${
                          operator === "MOOV"
                            ? "border-blue-500 bg-blue-500/20 ring-1 ring-blue-500"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <span className="font-bold text-xs text-blue-400 block">Moov Money</span>
                        <span className="text-[10px] text-zinc-400">Push direct USSD</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCheckoutStep(false)}
                      className="rounded-xl border-white/20 text-xs"
                    >
                      Retour
                    </Button>
                    <Button
                      onClick={handleProceedToPayment}
                      disabled={isProcessing}
                      className={`flex-1 rounded-2xl py-6 text-xs sm:text-sm font-bold shadow-xl ${themeStyle.primary}`}
                    >
                      {isProcessing ? (
                        <span>Validation en cours...</span>
                      ) : (
                        <span>
                          Payer {((selectedTicket?.price || 0) * quantity).toLocaleString("fr-FR")} FCFA
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* STEP 3: PAYMENT SUCCESS & GENERATED TICKET PASS */
                <div className="text-center space-y-4 py-2">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="size-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-extrabold text-white">
                      Réservation & Billet Validés !
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Votre pass sécurisé a été généré et envoyé à <strong className="text-white">{phoneBuyer}</strong>.
                    </p>
                  </div>

                  {/* Generated QR Pass Preview */}
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3 max-w-sm mx-auto text-center shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px]">
                      <span className="font-bold text-white">{activeEvent.title}</span>
                      <span className="font-mono text-emerald-400 font-bold">{generatedTicketRef}</span>
                    </div>

                    <div className="size-36 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-inner">
                      <QrCode className="size-32 text-zinc-900" />
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-white">{nameBuyer}</p>
                      <p className="text-[11px] text-emerald-400 font-semibold">{selectedTicket?.name} (x{quantity})</p>
                      <p className="text-[10px] text-zinc-400">{activeEvent.date} • {activeEvent.location}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      onClick={() => {
                        toast.success("Pass officiel téléchargé avec succès.");
                      }}
                      className="flex-1 rounded-2xl py-5 text-xs font-bold bg-white text-zinc-900 hover:bg-zinc-200 gap-1.5"
                    >
                      <Download className="size-4" />
                      <span>Télécharger mon Billet PDF</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setActiveEvent(null)}
                      className="rounded-2xl border-white/20 text-xs"
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
