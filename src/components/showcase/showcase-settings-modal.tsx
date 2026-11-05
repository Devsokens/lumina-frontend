"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURES } from "@/lib/features";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Type,
  LayoutList,
  Sparkles,
  Lock,
  Check,
  ArrowRight,
  Shield,
  Flame,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Phone,
  Gift,
  Clock,
  Building,
  Tv,
  ShoppingBag,
} from "lucide-react";
import {
  useShowcaseStore,
  type ShowcaseTheme,
  type ShowcaseSections,
} from "@/stores/useShowcaseStore";
import { SHOWCASE_LAYOUTS, SHOWCASE_PRESETS } from "@/lib/showcase-layouts";
import { ShowcaseAIGeneratorModal } from "./showcase-ai-generator-modal";
import { toast } from "sonner";

interface ShowcaseSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const THEMES: {
  id: ShowcaseTheme;
  name: string;
  badge: string;
  gradient: string;
  accentHex: string;
  desc: string;
}[] = [
  {
    id: "emerald",
    name: "Émeraude Royal (GiyaX)",
    badge: "Signature",
    gradient: "from-emerald-500 to-teal-700",
    accentHex: "#10b981",
    desc: "Harmonie végétale prestigieuse, contrastes sombres et finitions dorées subtiles.",
  },
  {
    id: "amber",
    name: "Ambre Solaire (Afro Vibes)",
    badge: "Festivals & Concerts",
    gradient: "from-amber-500 to-orange-600",
    accentHex: "#f59e0b",
    desc: "Énergie chaleureuse, tons dorés et cuivre éclatant inspirés des grands festivals.",
  },
  {
    id: "electric",
    name: "Nuit Électrique (Cyber DJ)",
    badge: "Clubbing & Show",
    gradient: "from-cyan-500 to-blue-600",
    accentHex: "#06b6d4",
    desc: "Néons cyan et bleu profond avec reflets cybernétiques pour soirées branchées.",
  },
  {
    id: "ruby",
    name: "Rubis Prestige (VIP Gala)",
    badge: "Gala & Célébration",
    gradient: "from-rose-500 to-purple-600",
    accentHex: "#f43f5e",
    desc: "Tons carmin et pourpre velouté pour galas de bienfaisance et mariages haut de gamme.",
  },
  {
    id: "indigo",
    name: "Bleu Nuit & Indigo",
    badge: "Corporate & Conférence",
    gradient: "from-blue-600 to-indigo-900",
    accentHex: "#6366f1",
    desc: "Bleu profond institutionnel et saphir pour sommets économiques et salons d'affaires.",
  },
  {
    id: "dark",
    name: "Noir Onyx Minimaliste",
    badge: "Épuré & Tech",
    gradient: "from-zinc-700 to-zinc-950",
    accentHex: "#a1a1aa",
    desc: "Monochrome pur ultra-moderne, accents argentés et lisibilité maximale.",
  },
];

const FONTS = [
  {
    id: "Outfit" as const,
    name: "Outfit",
    tag: "Moderne & Dynamique",
    desc: "Typographie géométrique moderne, idéale pour les festivals et événements branchés.",
    sample: "Expérience Événementielle Inoubliable",
  },
  {
    id: "Syne" as const,
    name: "Syne",
    tag: "Artistique & Bold",
    desc: "Caractère expressif et affirmé, parfait pour la mode, la culture et l'art contemporain.",
    sample: "Créateur d'Émotions & de Grands Moments",
  },
  {
    id: "Plus Jakarta Sans" as const,
    name: "Plus Jakarta Sans",
    tag: "Élégant & Raffiné",
    desc: "Courbes douces et finitions haut de gamme, prisé pour les mariages et galas VIP.",
    sample: "Célébrations & Soirées d'Exception",
  },
  {
    id: "Inter" as const,
    name: "Inter",
    tag: "Épuré & Standard International",
    desc: "Précision chirurgicale et lisibilité optimale pour conférences et masterclasses.",
    sample: "Billetterie Officielle & Conférences 2026",
  },
];

const STANDARD_SECTIONS: {
  key: keyof ShowcaseSections;
  label: string;
  icon: any;
  desc: string;
}[] = [
  {
    key: "hero",
    label: "En-tête & Bannière Hero",
    icon: Flame,
    desc: "Titre principal, accroche visuelle, badge animé et boutons d'action rapide.",
  },
  {
    key: "stats",
    label: "Chiffres & Statistiques Clés",
    icon: Shield,
    desc: "Indicateurs de confiance : participants accueillis, satisfaction et sécurité.",
  },
  {
    key: "events",
    label: "Grands Événements à la Une",
    icon: Calendar,
    desc: "Grille des affiches et accès direct à la billetterie officielle.",
  },
  {
    key: "about",
    label: "À Propos & Vision",
    icon: Building,
    desc: "Présentation de votre organisation, engagements et partenariats.",
  },
  {
    key: "gallery",
    label: "Galerie Photos HD",
    icon: ImageIcon,
    desc: "Immersion visuelle avec vos photos de scènes, ambiances et coulisses.",
  },
  {
    key: "testimonials",
    label: "Avis & Témoignages Vérifiés",
    icon: MessageSquare,
    desc: "Retours d'expérience et notes certifiées de participants.",
  },
  {
    key: "faq",
    label: "Foire Aux Questions (FAQ)",
    icon: HelpCircle,
    desc: "Réponses immédiates sur les réservations, le Mobile Money et l'accès.",
  },
  {
    key: "footer",
    label: "Pied de page & Coordonnées",
    icon: Phone,
    desc: "Numéros de contact, support WhatsApp, adresse physique et mentions légales.",
  },
];

const PRO_MODULES = [
  {
    id: "wedding_gift",
    title: "Module Mariage & Liste de Cadeaux",
    icon: Gift,
    badge: "Nouveau • Mariage",
    desc: "Cagnotte en direct par Airtel / Moov Money, confirmation RSVP des convives et plan de table interactif.",
  },
  {
    id: "countdown_3d",
    title: "Compte à Rebours 3D & Teaser Vidéo",
    icon: Clock,
    badge: "Haute Conversion",
    desc: "Minuteur immersif synchronisé avec lancement de trailer YouTube/Instagram pour maximiser l'effet d'urgence.",
  },
  {
    id: "sponsors_wall",
    title: "Mur des Sponsors & Partenaires VIP",
    icon: Building,
    badge: "Institutionnel",
    desc: "Carrousel premium des logos officiels avec catégorisation (Platine, Or, Argent) et liens traçables.",
  },
  {
    id: "live_schedule",
    title: "Planning Multiscène & Programme Interactif",
    icon: Tv,
    badge: "Festivals & Salons",
    desc: "Programme dynamique heure par heure avec filtres par scène/salle et favoris pour les festivaliers.",
  },
  {
    id: "merch_shop",
    title: "Boutique Merchandising Officielle",
    icon: ShoppingBag,
    badge: "E-Commerce",
    desc: "Vente en ligne de goodies, t-shirts et casquettes avec retrait express sur place via QR Code.",
  },
];

export function ShowcaseSettingsModal({ open, onOpenChange }: ShowcaseSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<string>("theme");
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

  const {
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    visibleSections,
    toggleSectionVisibility,
    setSectionVisibility,
    layout,
    updateField,
  } = useShowcaseStore();

  function handleTriggerAI() {
    // Ferme le panneau latéral de paramétrage pour laisser tout l'espace à l'assistant IA
    onOpenChange(false);
    setTimeout(() => {
      setIsAIGeneratorOpen(true);
    }, 150);
  }

  function handleUpgradePro(moduleTitle: string) {
    toast.info(`La formule GiyaX PRO est requise pour débloquer le "${moduleTitle}". Contactez notre équipe commerciale.`);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl border-l border-white/15 bg-[#0a0d14] text-white p-0 shadow-2xl flex flex-col h-full overflow-hidden"
        >
          {/* Header with Title & Quick AI Trigger */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/10 flex flex-row items-center justify-between gap-4 text-left">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Palette className="size-4" />
                </span>
                <SheetTitle className="font-display text-lg sm:text-xl font-extrabold text-white">
                  Paramétrage de la Vitrine
                </SheetTitle>
              </div>
              <SheetDescription className="text-xs text-zinc-400 mt-0.5">
                Personnalisez les couleurs, la typographie, l&apos;agencement des sections et les modules avancés.
              </SheetDescription>
            </div>

            {/* Quick AI Trigger Button (Taille compacte & Shimmer net) */}
            <Button
              type="button"
              size="sm"
              onClick={handleTriggerAI}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-[11px] px-2.5 h-7.5 sm:h-8 gap-1 transition-all hover:scale-[1.02] active:scale-95 shadow-none shrink-0 mr-6"
            >
              {/* Rayon de lumière glissant net */}
              <span
                aria-hidden="true"
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-ai-shimmer"
              />
              <Sparkles className="size-3 fill-black text-black group-hover:rotate-45 transition-transform duration-300 relative z-10" />
              <span className="hidden sm:inline relative z-10 tracking-tight">Générer avec GiyaX AI</span>
              <span className="sm:hidden relative z-10 tracking-tight">GiyaX AI</span>
            </Button>
          </SheetHeader>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b border-white/10 bg-white/[0.02]">
              <TabsList className="bg-transparent p-0 gap-2 h-auto flex flex-wrap">
                <TabsTrigger
                  value="theme"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-300 gap-2 transition-all border border-transparent data-[state=active]:border-white/15 hover:text-white hover:bg-white/10 group"
                >
                  <Palette className="size-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Couleurs & Thème</span>
                </TabsTrigger>

                <TabsTrigger
                  value="typography"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-300 gap-2 transition-all border border-transparent data-[state=active]:border-white/15 hover:text-white hover:bg-white/10 group"
                >
                  <Type className="size-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Typographie</span>
                </TabsTrigger>

                <TabsTrigger
                  value="sections"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-300 gap-2 transition-all border border-transparent data-[state=active]:border-white/15 hover:text-white hover:bg-white/10 group"
                >
                  <LayoutList className="size-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Sections Actives</span>
                </TabsTrigger>

                <TabsTrigger
                  value="pro"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-300 gap-2 transition-all border border-transparent data-[state=active]:border-white/15 hover:text-white hover:bg-white/10 group"
                >
                  <Sparkles className="size-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span>Modules PRO</span>
                  <span className="rounded-full bg-amber-500/20 text-amber-400 px-1.5 py-0.2 text-[9px] font-extrabold border border-amber-500/30">
                    PRO
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: THEME & COLORS */}
              <TabsContent value="theme" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Palettes Chromatiques Soignées
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Thème actif : <strong className="text-amber-400">{THEMES.find(t => t.id === theme)?.name}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEMES.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTheme(t.id);
                          toast.success(`Thème « ${t.name} » appliqué !`);
                        }}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-amber-400 bg-amber-400/[0.08] shadow-lg shadow-amber-500/15 ring-1 ring-amber-400"
                            : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`size-9 rounded-xl bg-gradient-to-br ${t.gradient} shadow-inner flex items-center justify-center border border-white/30 shrink-0`}>
                              {isSelected && <Check className="size-5 text-white stroke-[3]" />}
                            </div>
                            <div>
                              <h4 className="font-display text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                {t.name}
                              </h4>
                              <span className="text-[10px] font-semibold text-zinc-300">
                                {t.badge}
                              </span>
                            </div>
                          </div>

                          <div
                            className="size-4 rounded-full border border-white/30 shadow-xs"
                            style={{ backgroundColor: t.accentHex }}
                          />
                        </div>

                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 2: TYPOGRAPHY (DISPOSÉ EN LONGUEUR SUR LA MÊME LIGNE) */}
              <TabsContent value="typography" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Police de Caractères
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Police active : <strong className="text-cyan-400">{fontFamily}</strong>
                  </span>
                </div>

                {/* 4 Cards In Row / Lengthwise (Grid 4 colonnes côte à côte) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {FONTS.map((font) => {
                    const isSelected = fontFamily === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => {
                          setFontFamily(font.id);
                          toast.success(`Typographie « ${font.name} » appliquée !`);
                        }}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-400/[0.1] shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400"
                            : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="inline-block rounded-full bg-cyan-400/15 border border-cyan-400/30 px-2 py-0.5 text-[9px] font-extrabold text-cyan-300 truncate">
                              {font.tag}
                            </span>

                            {isSelected && (
                              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-black shadow-xs">
                                <Check className="size-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <h4 className="font-display text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                            {font.name}
                          </h4>

                          <p className="text-[10px] text-zinc-300 leading-tight">
                            {font.desc}
                          </p>
                        </div>

                        <div className="mt-3 rounded-xl border border-white/15 bg-black/60 p-2.5 text-center">
                          <p
                            className="text-[11px] font-bold text-white leading-tight"
                            style={{ fontFamily: font.id }}
                          >
                            {font.sample}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 3: SECTIONS VISIBILITY */}
              <TabsContent value="sections" className="mt-0 space-y-3">
                {/* Variante de mise en page (publiée : tenant.config.showcase.layout) */}
                <div className="space-y-2 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Disposition de la Page
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      Active : <strong className="text-emerald-400">{SHOWCASE_PRESETS[layout].label}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SHOWCASE_LAYOUTS.map((l) => {
                      const isSelected = layout === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => updateField("layout", l)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-400/[0.08] ring-1 ring-emerald-400"
                              : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.08]"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                            {isSelected && <Check className="size-3.5 text-emerald-400 stroke-[3]" />}
                            {SHOWCASE_PRESETS[l].label}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-zinc-400">
                            {SHOWCASE_PRESETS[l].hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Sections de la Page d&apos;Accueil
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {FEATURES.showcaseSections
                        ? "Activez ou masquez les blocs selon les besoins de votre événement ou organisation."
                        : "Une section vide (avis, galerie, FAQ, présentation) n’apparaît pas en ligne. Le masquage manuel arrive bientôt."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!FEATURES.showcaseSections}
                      onClick={() => {
                        STANDARD_SECTIONS.forEach((s) => setSectionVisibility(s.key, true));
                        toast.success("Toutes les sections sont affichées.");
                      }}
                      className="text-[11px] h-7 text-zinc-300 hover:text-white hover:bg-white/10"
                    >
                      Tout afficher
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  {STANDARD_SECTIONS.map((sec) => {
                    const isVisible = !FEATURES.showcaseSections || visibleSections[sec.key];
                    const Icon = sec.icon;

                    return (
                      <div
                        key={sec.key}
                        className={`group flex items-center justify-between p-3.5 transition-colors ${
                          isVisible ? "hover:bg-white/[0.06]" : "opacity-70 bg-black/25 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-4">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                              isVisible
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-xs"
                                : "bg-white/10 border-white/20 text-zinc-300 group-hover:text-white group-hover:border-white/40"
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                {sec.label}
                              </h4>
                              {!isVisible && (
                                <span className="rounded-full bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[9px] font-semibold text-zinc-300">
                                  Masqué
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-tight">
                              {sec.desc}
                            </p>
                          </div>
                        </div>

                        <Switch
                          checked={isVisible}
                          disabled={!FEATURES.showcaseSections}
                          onCheckedChange={() => {
                            toggleSectionVisibility(sec.key);
                            toast.info(
                              !isVisible
                                ? `Section « ${sec.label} » affichée.`
                                : `Section « ${sec.label} » masquée.`
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 4: PRE-CONFIGURED PRO MODULES */}
              <TabsContent value="pro" className="mt-0 space-y-4">
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-black font-extrabold text-[10px]">
                        ★
                      </span>
                      <h4 className="text-xs font-bold text-amber-300">
                        Sections Avancées & Modules Prédéfinis PRO
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Les blocs ci-dessous sont disponibles avec la formule <strong>GiyaX PRO (25 000 FCFA/mois)</strong>.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleUpgradePro("Modules Spécialisés")}
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs gap-1 shadow-md shadow-amber-500/20 shrink-0"
                  >
                    <span>Passer à GiyaX PRO</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {PRO_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.id}
                        className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75 hover:opacity-100 hover:border-amber-500/40 transition-all"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Icon className="size-5" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">
                                {mod.title}
                              </h4>
                              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.2 text-[9px] font-extrabold text-amber-300">
                                {mod.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 max-w-xl">
                              {mod.desc}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpgradePro(mod.title)}
                          className="rounded-xl border-amber-500/30 bg-amber-500/5 text-amber-300 hover:bg-amber-500/20 text-xs font-bold gap-1.5 shrink-0 self-start sm:self-center"
                        >
                          <Lock className="size-3" />
                          <span>Débloquer</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-500">
                Modifications appliquées en temps réel sur la vitrine.
              </span>

              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs px-5"
              >
                Fermer
              </Button>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* MODAL GENERATEUR GiyaX AI */}
      <ShowcaseAIGeneratorModal
        open={isAIGeneratorOpen}
        onOpenChange={setIsAIGeneratorOpen}
      />
    </>
  );
}
