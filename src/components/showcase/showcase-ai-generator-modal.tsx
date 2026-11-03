"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  Heart,
  Music,
  Briefcase,
  GraduationCap,
  Wine,
  Loader2,
  X,
  Mic,
  Zap,
  CheckCircle2,
  ChevronLeft,
  Palette,
  Ticket,
  Bot,
  User,
  Check,
  Crown,
  Flame,
  Building2,
  MailCheck,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShowcaseStore, type ShowcaseTheme, type EventItem } from "@/stores/useShowcaseStore";
import { toast } from "sonner";

interface AIGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GeneratorStep =
  | "PROMPT"
  | "QUESTION_VIBE"
  | "QUESTION_TICKETS"
  | "QUESTION_PALETTE"
  | "GENERATING";

interface AIPreset {
  id: string;
  icon: typeof Heart;
  label: string;
  prompt: string;
  theme: ShowcaseTheme;
  orgName: string;
  orgTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutTitle: string;
  aboutText: string;
  events: EventItem[];
}

const PRESETS: AIPreset[] = [
  {
    id: "wedding",
    icon: Heart,
    label: "Mariages & Réceptions",
    prompt: "Je suis une agence de mariages féeriques, réceptions privées et galas de luxe à Libreville.",
    theme: "ruby",
    orgName: "ÉLÉGANCE ROYALE WEDDING & EVENTS",
    orgTagline: "L'art de sublimer vos plus belles unions et réceptions privées au Gabon",
    heroHeadline: "Des Mariages d'Exception & des Réceptions Inoubliables",
    heroSubheadline:
      "Scénographie florale haute couture, dîners d'exception au coucher du soleil et gestion complète des tables VIP. Confirmez vos présences et réservez vos accès en toute sérénité.",
    aboutTitle: "Créateurs d'Émotions & de Célébrations Royales",
    aboutText:
      "Depuis 7 ans, Élégance Royale orchestre les plus somptueuses unions à la Sablière, au bord de l'océan et dans les plus grands domaines du Gabon. Notre engagement : une logistique invisible, un service d'orfèvre et un accompagnement sur-mesure pour votre grand jour.",
    events: [
      {
        id: "evt-w1",
        title: "Grand Mariage Princier — Célébration Royale & Vin d'Honneur",
        category: "Mariage & Célébration",
        date: "19 Décembre 2026",
        time: "16h00 - 04h00",
        location: "Domaine Privé de la Sablière, Libreville",
        description:
          "Cérémonie laïque au jardin, vin d'honneur au champagne millésimé, dîner gastronomique 4 services et soirée dansante sous chapiteau de cristal.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
        badge: "Mariage Royal",
        startingPrice: 35000,
        isFeatured: true,
        lineup: [
          { id: "lw-1", name: "Cérémonie & Échange des Vœux", role: "16h30 au Jardin" },
          { id: "lw-2", name: "Orchestre Cordes & Live Band", role: "Ambiance Cocktail" },
          { id: "lw-3", name: "Dîner Gastronomique & Pièce Montée", role: "Chef Traiteur Étoilé" },
        ],
        tickets: [
          {
            id: "tw-1",
            name: "Pass Invité d'Honneur (RSVP)",
            price: 35000,
            badge: "Nominatif",
            description: "Accès complet vin d'honneur, dîner gastronomique et open bar sélectionné.",
            benefits: ["Place nominative assignée", "Cocktail champagne", "Menu dégustation 4 services", "Cadeau d'accueil"],
            stockLeft: 50,
          },
          {
            id: "tw-2",
            name: "Table Famille & Témoins (8 Pers)",
            price: 250000,
            badge: "Table Prestige",
            description: "Table ronde d'honneur avec service sommelier dédié et champagne millésimé.",
            benefits: ["Table 8 places réservée", "Service sommelier dédié", "Bouteilles d'exception", "Accès salon privé"],
            stockLeft: 5,
          },
        ],
      },
      {
        id: "evt-w2",
        title: "Gala Annuel des Couples & Renouvellement de Vœux",
        category: "Conférence & Gala",
        date: "14 Février 2027",
        time: "20h00 - 02h00",
        location: "Hôtel Radisson Blu, Libreville",
        description:
          "Une soirée romantique d'exception rythmée par un concert acoustique live, un dîner aux chandelles et une piste de danse féerique.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
        badge: "Saint-Valentin Prestige",
        startingPrice: 50000,
        isFeatured: true,
        tickets: [
          {
            id: "tw-3",
            name: "Formule Duo Romantique",
            price: 90000,
            badge: "Duo 2 Personnes",
            description: "Dîner gastronomique 3 services pour deux avec bouteille de champagne offerte.",
            benefits: ["Table romantique pour 2", "Menu gastronomique complet", "Bouteille de champagne", "Photo souvenir pro"],
            stockLeft: 25,
          },
        ],
      },
    ],
  },
  {
    id: "festival",
    icon: Music,
    label: "Festivals & Concerts",
    prompt: "Nous sommes un label de production organisant les plus grands festivals afro-house et concerts urbains à Libreville.",
    theme: "amber",
    orgName: "AFRO VIBES ENTERTAINMENT",
    orgTagline: "Le temple des méga-concerts et de la culture afro-urbaine en Afrique Centrale",
    heroHeadline: "La Ferveur des Plus Grands Concerts & Festivals d'Afrique",
    heroSubheadline:
      "Vivez des shows pyrotechniques spectaculaires, des têtes d'affiche internationales et une ambiance survoltée. Vos pass officiels 100% sécurisés par Mobile Money.",
    aboutTitle: "L'Énergie Pure du Live & de la Scénographie",
    aboutText:
      "Avec plus de 50 000 festivaliers accueillis, Afro Vibes Entertainment produit les événements musicaux les plus attendus du Gabon. Sonorisation Line-Array de pointe, écrans géants LED et billetterie anti-fraude GiyaX.",
    events: [
      {
        id: "evt-f1",
        title: "Festival Urban Afro Libreville 2026",
        category: "Concert & Festival",
        date: "05 & 06 Septembre 2026",
        time: "18h00 - 05h00",
        location: "Palais des Sports, Libreville",
        description:
          "2 nuits de concerts géants avec Fally Ipupa, Creol, Eboloko et les meilleurs DJs du continent.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        badge: "Événement Phare",
        startingPrice: 10000,
        isFeatured: true,
        tickets: [
          {
            id: "tf-1",
            name: "Pass Standard (1 Jour)",
            price: 10000,
            description: "Accès fosse concert + village gastronomique.",
            benefits: ["Accès Fosse Concert", "1 Boisson offerte", "Accès Village"],
            stockLeft: 200,
          },
          {
            id: "tf-2",
            name: "Pass VIP Carré Or",
            price: 35000,
            badge: "Recommandé",
            description: "Tribune VIP surélevée avec coupe-file et consos.",
            benefits: ["Tribune VIP surélevée", "Entrée Coupe-file", "2 Conso premium + Goodies"],
            stockLeft: 40,
          },
        ],
      },
    ],
  },
  {
    id: "corporate",
    icon: Briefcase,
    label: "Conférences & Galas",
    prompt: "Organisation de sommets économiques, conférences tech et remises de prix institutionnelles à Libreville.",
    theme: "indigo",
    orgName: "GABON BUSINESS FORUM & SUMMITS",
    orgTagline: "Le carrefour des décideurs économiques, investisseurs et leaders d'Afrique Centrale",
    heroHeadline: "Les Grands Rendez-Vous de l'Économie & de l'Innovation",
    heroSubheadline:
      "Conférences plénières de haut niveau, sessions de networking B2B stratégiques et dîners de gala d'affaires. Réservez les pass de vos délégations en ligne.",
    aboutTitle: "L'Excellence du Dialogue Économique & du Réseautage",
    aboutText:
      "Gabon Business Forum connecte les chefs d'entreprise, délégations ministérielles et entrepreneurs innovants. Nos événements offrent une vitrine de premier plan pour accélérer les partenariats panafricains.",
    events: [
      {
        id: "evt-c1",
        title: "Gala Gabon Business & Tech Awards 2026",
        category: "Conférence & Gala",
        date: "17 Octobre 2026",
        time: "19h30 - 23h30",
        location: "Hôtel Radisson Blu, Libreville",
        description:
          "La grande nuit de célébration des leaders de l'économie gabonaise et de l'innovation technologique.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
        badge: "Gala Officiel",
        startingPrice: 50000,
        isFeatured: true,
        tickets: [
          {
            id: "tc-1",
            name: "Place Individuelle Gala",
            price: 50000,
            description: "Cérémonie, cocktail de bienvenue et dîner assis 3 services.",
            benefits: ["Cocktail de bienvenue", "Dîner gastronomique", "Accès B2B"],
            stockLeft: 35,
          },
          {
            id: "tc-2",
            name: "Table Entreprise Partenaire (8 Pers)",
            price: 400000,
            badge: "Corporate",
            description: "Table réservée au nom de votre entreprise avec mention au programme officiel.",
            benefits: ["Table 8 places réservée", "Logo sur écrans", "Champagne millésimé", "Attestation partenaire"],
            stockLeft: 6,
          },
        ],
      },
    ],
  },
  {
    id: "training",
    icon: GraduationCap,
    label: "Formations & Masterclasses",
    prompt: "Académie de formations professionnelles, masterclasses certifiantes et ateliers pratiques.",
    theme: "emerald",
    orgName: "ACADÉMIE DIGITALE & LEADERSHIP GABON",
    orgTagline: "Accélérez vos compétences et certifiez votre expertise avec les leaders du continent",
    heroHeadline: "Formez-vous avec les Meilleurs Experts Africains",
    heroSubheadline:
      "Masterclasses intensives avec attestations certifiées vérifiables par QR code GiyaX. Places limitées.",
    aboutTitle: "L'Excellence Pédagogique & l'Impact Métier",
    aboutText:
      "Des programmes immersifs conçus pour les cadres, entrepreneurs et créateurs de valeur au Gabon.",
    events: [
      {
        id: "evt-t1",
        title: "Masterclass IA, Fintech & Business Digital",
        category: "Formation & Masterclass",
        date: "28 Novembre 2026",
        time: "09h00 - 17h00",
        location: "Institut Français du Gabon, Libreville",
        description: "Formation intensive et délivrance de certificat officiel GiyaX vérifiable en ligne.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
        badge: "Certifiant GiyaX",
        startingPrice: 25000,
        isFeatured: true,
        tickets: [
          {
            id: "tt-1",
            name: "Pass Formation & Attestation",
            price: 25000,
            description: "Journée complète, supports PDF et Attestation certifiée QR code.",
            benefits: ["Accès toute la journée", "Supports offerts", "Attestation certifiée", "Déjeuner inclus"],
            stockLeft: 40,
          },
        ],
      },
    ],
  },
  {
    id: "party",
    icon: Wine,
    label: "Soirées VIP & Réveillons",
    prompt: "Organisation de soirées privées haut de gamme, nuits blanches et réveillons VIP.",
    theme: "electric",
    orgName: "VIP NIGHTLIFE EXPERIENCE",
    orgTagline: "L'art de la fête et des nuits d'exception à Libreville",
    heroHeadline: "Les Nuits les Plus Exclusives de Libreville",
    heroSubheadline: "DJs internationaux, salons privatifs et champagne au bord de l'eau.",
    aboutTitle: "L'Élite de la Nuit Gabonaise",
    aboutText: "Des expériences immersives dans des cadres d'exception avec un service bouteille haut de gamme.",
    events: [
      {
        id: "evt-p1",
        title: "Nuit Blanche Afro House & Amapiano",
        category: "Soirée VIP",
        date: "31 Décembre 2026",
        time: "22h00 - 07h00",
        location: "La Baie des Rois, Libreville",
        description: "Le réveillon de l'année avec feux d'artifice et têtes d'affiches mondiales.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
        badge: "Nouvel An",
        startingPrice: 20000,
        isFeatured: true,
        tickets: [
          {
            id: "tp-1",
            name: "Pass Early Bird",
            price: 20000,
            description: "Accès soirée + coupe de champagne à minuit.",
            benefits: ["Accès site", "Coupe à minuit", "Vue panoramique feux"],
            stockLeft: 60,
          },
        ],
      },
    ],
  },
];

interface VibeOption {
  id: string;
  title: string;
  desc: string;
  icon: typeof Crown;
}

const VIBE_OPTIONS: VibeOption[] = [
  {
    id: "luxury",
    title: "Luxe & Prestige VIP",
    desc: "Mariages princiers, galas d'exception, tables d'honneur & service sommelier",
    icon: Crown,
  },
  {
    id: "popular",
    title: "Grand Public & Festival",
    desc: "Concerts géants, festivals culturels, billetterie massive & early birds",
    icon: Flame,
  },
  {
    id: "corporate",
    title: "Corporate & Institutionnel",
    desc: "Sommets économiques, forums B2B, délégations officielles & badges",
    icon: Building2,
  },
  {
    id: "academy",
    title: "Formation & Académie",
    desc: "Masterclasses, séminaires certifiants avec attestations QR code",
    icon: GraduationCap,
  },
];

interface TicketOption {
  id: string;
  title: string;
  desc: string;
  icon: typeof Ticket;
}

const TICKET_OPTIONS: TicketOption[] = [
  {
    id: "vip_tables",
    title: "Pass VIP & Tables Privatives",
    desc: "Tarifs différenciés, carrés d'or, tables d'honneur et packs boissons",
    icon: Crown,
  },
  {
    id: "standard_tiered",
    title: "Billetterie Grand Public & Early Bird",
    desc: "Tarifs par vagues (Promo, Standard, VIP) avec compteurs en direct",
    icon: Ticket,
  },
  {
    id: "rsvp_guest",
    title: "Inscriptions RSVP & Nominatives",
    desc: "Confirmation de présence en direct, gestion du plan de table et traiteur",
    icon: MailCheck,
  },
  {
    id: "certified_pass",
    title: "Pass Formation & Attestation QR",
    desc: "Accès journée, supports offerts et certificat officiel sécurisé",
    icon: QrCode,
  },
];

interface PaletteOption {
  id: ShowcaseTheme;
  title: string;
  desc: string;
  gradientClass: string;
}

const PALETTE_OPTIONS: PaletteOption[] = [
  {
    id: "ruby",
    title: "Rubis & Or Royal",
    desc: "Rouge profond & dorures pour mariages et galas d'exception",
    gradientClass: "from-rose-600 via-rose-500 to-amber-500",
  },
  {
    id: "amber",
    title: "Ambre Solaire",
    desc: "Énergie chaleureuse pour festivals et concerts live",
    gradientClass: "from-amber-500 via-orange-500 to-amber-400",
  },
  {
    id: "emerald",
    title: "Émeraude GiyaX",
    desc: "Vert souverain et prestige pour événements d'excellence",
    gradientClass: "from-emerald-500 via-teal-500 to-emerald-400",
  },
  {
    id: "indigo",
    title: "Bleu Nuit B2B",
    desc: "Sobriété et élégance pour sommets d'affaires & tech",
    gradientClass: "from-indigo-600 via-blue-500 to-cyan-400",
  },
  {
    id: "electric",
    title: "Cyber Cyan & Violet",
    desc: "Ambiance nocturne moderne pour soirées clubbing & DJs",
    gradientClass: "from-cyan-400 via-blue-500 to-violet-600",
  },
  {
    id: "dark",
    title: "Noir Onyx & Titane",
    desc: "Minimalisme sombre et intemporel pour vitrine épurée",
    gradientClass: "from-zinc-700 via-zinc-800 to-zinc-500",
  },
];

export function ShowcaseAIGeneratorModal({ open, onOpenChange }: AIGeneratorModalProps) {
  const { applyAIGeneratedShowcase } = useShowcaseStore();
  const [step, setStep] = useState<GeneratorStep>("PROMPT");
  const [prompt, setPrompt] = useState(
    "Je suis une agence de mariages féeriques et galas de prestige à Libreville."
  );

  // User interactive choices
  const [selectedVibeId, setSelectedVibeId] = useState("luxury");
  const [selectedTicketId, setSelectedTicketId] = useState("vip_tables");
  const [selectedPalette, setSelectedPalette] = useState<ShowcaseTheme>("ruby");

  const [generationProgress, setGenerationProgress] = useState("");

  // Typewriter Animation Effect for the Header (Claude style)
  const fullSubheadline = "Comment puis-je concevoir votre vitrine aujourd'hui ?";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (!open) {
      setTypedText("");
      setStep("PROMPT");
      return;
    }
    let currentIndex = 0;
    setTypedText("");
    const interval = setInterval(() => {
      if (currentIndex <= fullSubheadline.length) {
        setTypedText(fullSubheadline.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [open]);

  function handleSelectPreset(preset: AIPreset) {
    setPrompt(preset.prompt);
    setSelectedPalette(preset.theme);
    if (preset.id === "wedding") {
      setSelectedVibeId("luxury");
      setSelectedTicketId("vip_tables");
    } else if (preset.id === "festival") {
      setSelectedVibeId("popular");
      setSelectedTicketId("standard_tiered");
    } else if (preset.id === "corporate") {
      setSelectedVibeId("corporate");
      setSelectedTicketId("vip_tables");
    } else if (preset.id === "training") {
      setSelectedVibeId("academy");
      setSelectedTicketId("certified_pass");
    } else if (preset.id === "party") {
      setSelectedVibeId("luxury");
      setSelectedTicketId("standard_tiered");
    }
  }

  // Smooth auto-advancing when an option is clicked + user can go back anytime
  function handleSelectVibe(id: string) {
    setSelectedVibeId(id);
    setTimeout(() => {
      setStep("QUESTION_TICKETS");
    }, 180);
  }

  function handleSelectTicket(id: string) {
    setSelectedTicketId(id);
    setTimeout(() => {
      setStep("QUESTION_PALETTE");
    }, 180);
  }

  function handleSelectPalette(theme: ShowcaseTheme) {
    setSelectedPalette(theme);
  }

  function handlePreviousStep() {
    if (step === "QUESTION_VIBE") setStep("PROMPT");
    else if (step === "QUESTION_TICKETS") setStep("QUESTION_VIBE");
    else if (step === "QUESTION_PALETTE") setStep("QUESTION_TICKETS");
  }

  function handleNextFromPrompt() {
    if (!prompt.trim()) {
      toast.error("Veuillez décrire brièvement votre projet événementiel.");
      return;
    }
    setStep("QUESTION_VIBE");
  }

  function handleFinalizeGeneration() {
    setStep("GENERATING");
    setGenerationProgress("Analyse de vos réponses et cadrage de l'univers de marque...");

    setTimeout(() => {
      setGenerationProgress("Rédaction des textes publicitaires & adaptation des pass...");
    }, 500);

    setTimeout(() => {
      setGenerationProgress("Application de la palette chromatique & billetterie Mobile Money...");
    }, 1000);

    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let selectedPreset = PRESETS[0]; // Wedding default

      if (
        lower.includes("festival") ||
        lower.includes("concert") ||
        lower.includes("afro") ||
        lower.includes("musique") ||
        selectedVibeId === "popular"
      ) {
        selectedPreset = PRESETS[1];
      } else if (
        lower.includes("business") ||
        lower.includes("conférence") ||
        lower.includes("forum") ||
        lower.includes("sommet") ||
        lower.includes("b2b") ||
        selectedVibeId === "corporate"
      ) {
        selectedPreset = PRESETS[2];
      } else if (
        lower.includes("formation") ||
        lower.includes("masterclass") ||
        lower.includes("certif") ||
        selectedVibeId === "academy"
      ) {
        selectedPreset = PRESETS[3];
      } else if (
        lower.includes("soirée") ||
        lower.includes("party") ||
        lower.includes("reveillon") ||
        lower.includes("vip")
      ) {
        selectedPreset = PRESETS[4];
      }

      applyAIGeneratedShowcase({
        theme: selectedPalette || selectedPreset.theme,
        orgName: selectedPreset.orgName,
        orgTagline: selectedPreset.orgTagline,
        heroHeadline: selectedPreset.heroHeadline,
        heroSubheadline: selectedPreset.heroSubheadline,
        aboutTitle: selectedPreset.aboutTitle,
        aboutText: selectedPreset.aboutText,
        events: selectedPreset.events,
      });

      setStep("PROMPT");
      onOpenChange(false);
      toast.success("Site vitrine complet généré et personnalisé avec succès par GiyaX AI !");
    }, 1600);
  }

  if (!open) return null;

  // Step Number for Header Progress indicator (1 to 4)
  const stepIndex =
    step === "PROMPT"
      ? 1
      : step === "QUESTION_VIBE"
      ? 2
      : step === "QUESTION_TICKETS"
      ? 3
      : step === "QUESTION_PALETTE"
      ? 4
      : 4;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => step !== "GENERATING" && onOpenChange(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modern Slide-Over Drawer with Strict Viewport Fit (No excessive scroll) */}
      <div className="relative w-full max-w-xl h-full bg-[#11141a] border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-2xl z-[70] animate-in slide-in-from-right duration-300">
        {/* Top Header Bar with Easy Back & Step Jump Navigation */}
        <div className="space-y-3 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step !== "PROMPT" && step !== "GENERATING" ? (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-2.5 py-1 text-xs font-semibold transition-colors border border-white/10"
                  title="Revenir à l'étape précédente"
                >
                  <ChevronLeft className="size-4" />
                  <span>Retour</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
                  <Sparkles className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>GiyaX AI Co-Pilot</span>
                </div>
              )}
            </div>

            {/* Step Counter Indicator */}
            {step !== "GENERATING" && (
              <span className="text-xs font-semibold text-zinc-400">
                Étape <strong className="text-white">{stepIndex}</strong> / 4
              </span>
            )}

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={step === "GENERATING"}
              className="flex size-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Interactive Step Progress Bar (Clickable to jump back) */}
          {step !== "GENERATING" && (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setStep("PROMPT")}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  stepIndex >= 1 ? "bg-amber-400" : "bg-white/10"
                }`}
                title="1. Description du projet"
              />
              <button
                type="button"
                onClick={() => setStep("QUESTION_VIBE")}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  stepIndex >= 2 ? "bg-amber-400" : "bg-white/10"
                }`}
                title="2. Univers & Cible"
              />
              <button
                type="button"
                onClick={() => setStep("QUESTION_TICKETS")}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  stepIndex >= 3 ? "bg-amber-400" : "bg-white/10"
                }`}
                title="3. Billetterie & Accès"
              />
              <button
                type="button"
                onClick={() => setStep("QUESTION_PALETTE")}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  stepIndex >= 4 ? "bg-emerald-400" : "bg-white/10"
                }`}
                title="4. Identité Visuelle"
              />
            </div>
          )}
        </div>

        {/* ================= STEP 1 : PROMPT INITIAL ================= */}
        {step === "PROMPT" && (
          <div className="space-y-6 flex-1 flex flex-col justify-center py-2 animate-in fade-in duration-200">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
                  <Sparkles className="size-6 stroke-[2.2] animate-pulse" />
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Salut
                </h2>
              </div>

              <p className="text-sm text-zinc-300 font-medium min-h-[26px]">
                <span>{typedText}</span>
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-amber-400 animate-pulse align-middle" />
              </p>
            </div>

            {/* Prompt Input Box */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-4 space-y-3 shadow-inner focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/40 transition-all">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Décrivez votre activité événementielle, vos types de pass ou votre ville (ex: Agence de mariages féeriques à Libreville)..."
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                    <Zap className="size-3 text-amber-400" />
                    <span>GiyaX AI 2.5 Flash</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 hidden sm:inline">Français (Gabon)</span>
                </div>

                <div className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer">
                  <Mic className="size-3.5" />
                </div>
              </div>
            </div>

            {/* Preset Inspiration Tags */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-left">
                Ou choisissez un modèle inspirant en 1 clic :
              </p>

              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => {
                  const isSelected = prompt === preset.prompt;
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40 scale-105"
                          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <Icon className="size-3.5 text-amber-400" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2 : QUESTION 1 (UNIVERS & CIBLE) ================= */}
        {step === "QUESTION_VIBE" && (
          <div className="space-y-5 flex-1 flex flex-col justify-center py-2 animate-in fade-in duration-200">
            {/* User prompt preview */}
            <div className="flex items-center gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-200">
              <User className="size-3.5 shrink-0 text-amber-400" />
              <span className="truncate">&ldquo;{prompt}&rdquo;</span>
            </div>

            {/* Assistant Question Bubble */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Bot className="size-4" />
                <span>Question 1 sur 3 — Univers & Cible</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Quel univers souhaitez-vous valoriser ?
              </h3>
              <p className="text-xs text-zinc-400">
                Cliquez sur une option pour passer directement à l&apos;étape suivante :
              </p>
            </div>

            {/* 4 Interactive Choice Cards with instant auto-advance */}
            <div className="space-y-2.5">
              {VIBE_OPTIONS.map((opt) => {
                const isSelected = selectedVibeId === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectVibe(opt.id)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all duration-200 flex items-center justify-between gap-3 group active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 text-white ring-1 ring-amber-400/40 shadow-md shadow-amber-500/10"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                          isSelected
                            ? "bg-amber-400 text-black border-amber-300 font-bold"
                            : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-amber-400 group-hover:bg-white/10"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                          {opt.desc}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-400 text-black"
                          : "border-zinc-600 bg-black/40 group-hover:border-zinc-400"
                      }`}
                    >
                      {isSelected && <Check className="size-3 stroke-[3.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3 : QUESTION 2 (BILLETTERIE & FORMULES) ================= */}
        {step === "QUESTION_TICKETS" && (
          <div className="space-y-5 flex-1 flex flex-col justify-center py-2 animate-in fade-in duration-200">
            {/* Assistant Question Bubble */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Bot className="size-4" />
                <span>Question 2 sur 3 — Formules de Pass</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Quel système d&apos;accès & billetterie privilégier ?
              </h3>
              <p className="text-xs text-zinc-400">
                Cliquez sur une option pour passer directement à l&apos;étape suivante :
              </p>
            </div>

            {/* 4 Interactive Choice Cards with instant auto-advance */}
            <div className="space-y-2.5">
              {TICKET_OPTIONS.map((opt) => {
                const isSelected = selectedTicketId === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectTicket(opt.id)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all duration-200 flex items-center justify-between gap-3 group active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-400/15 text-white ring-1 ring-emerald-400/40 shadow-md shadow-emerald-500/10"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                          isSelected
                            ? "bg-emerald-400 text-black border-emerald-300 font-bold"
                            : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-white/10"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                          {opt.desc}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-400 text-black"
                          : "border-zinc-600 bg-black/40 group-hover:border-zinc-400"
                      }`}
                    >
                      {isSelected && <Check className="size-3 stroke-[3.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4 : QUESTION 3 (PALETTE VISUELLE) ================= */}
        {step === "QUESTION_PALETTE" && (
          <div className="space-y-4 flex-1 flex flex-col justify-center py-2 animate-in fade-in duration-200">
            {/* Assistant Question Bubble */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <Bot className="size-4" />
                <span>Question 3 sur 3 — Identité Visuelle</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Quelle identité visuelle adopter ?
              </h3>
              <p className="text-xs text-zinc-400">
                Sélectionnez la palette chromatique pour votre vitrine :
              </p>
            </div>

            {/* 6 Color Options in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PALETTE_OPTIONS.map((pal) => {
                const isSelected = selectedPalette === pal.id;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => handleSelectPalette(pal.id)}
                    className={`rounded-2xl border p-3 text-left transition-all duration-200 flex items-center justify-between gap-2.5 group active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? "border-white bg-white/15 text-white ring-1 ring-white/50 shadow-md"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-6 rounded-full bg-gradient-to-tr ${pal.gradientClass} shadow-md shrink-0 ring-2 ${
                          isSelected ? "ring-white" : "ring-white/20"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white leading-tight">
                          {pal.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {pal.desc}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-white bg-white text-black"
                          : "border-zinc-600 bg-black/40 group-hover:border-zinc-400"
                      }`}
                    >
                      {isSelected && <Check className="size-2.5 stroke-[3.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2 text-[11px] text-zinc-400">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>
                Tout sera modifiable en direct après génération dans l&apos;éditeur.
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 5 : GENERATING ANIMATION ================= */}
        {step === "GENERATING" && (
          <div className="space-y-6 flex-1 flex flex-col items-center justify-center text-center py-10 animate-in fade-in duration-300">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
              <Loader2 className="size-8 animate-spin" />
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="font-display text-xl font-extrabold text-white">
                GiyaX AI façonne votre site...
              </h3>
              <p className="text-xs text-amber-400 font-semibold">{generationProgress}</p>
              <p className="text-[11px] text-zinc-400">
                Génération des textes, affiches, formules de pass et intégration de la billetterie Mobile Money.
              </p>
            </div>
          </div>
        )}

        {/* ================= BOTTOM SINGLE ACTION BUTTON ================= */}
        {step !== "GENERATING" && (
          <div className="pt-3 border-t border-white/10">
            {step === "PROMPT" && (
              <Button
                size="default"
                onClick={handleNextFromPrompt}
                className="w-full rounded-2xl py-6 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Suivant : Cadrer mon projet</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {step === "QUESTION_VIBE" && (
              <Button
                size="default"
                onClick={() => setStep("QUESTION_TICKETS")}
                className="w-full rounded-2xl py-6 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Suivant : Formules de Pass</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {step === "QUESTION_TICKETS" && (
              <Button
                size="default"
                onClick={() => setStep("QUESTION_PALETTE")}
                className="w-full rounded-2xl py-6 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Suivant : Identité Visuelle</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {step === "QUESTION_PALETTE" && (
              <Button
                size="default"
                onClick={handleFinalizeGeneration}
                className="w-full rounded-2xl py-6 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="size-4" />
                <span>Valider mes choix & Générer le site</span>
                <ArrowRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
