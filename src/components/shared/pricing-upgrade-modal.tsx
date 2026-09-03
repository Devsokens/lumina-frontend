"use client";

import { useState } from "react";
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Users,
  GraduationCap,
  Image as ImageIcon,
  X,
  ArrowRight,
  Smartphone,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type UpgradeFeatureType =
  | "AI_POSTER"
  | "CERTIFICATES_LIMIT"
  | "TEAM_LIMIT"
  | "GENERAL";

interface PricingUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: UpgradeFeatureType;
}

const FEATURE_CONFIGS: Record<
  UpgradeFeatureType,
  {
    badge: string;
    icon: typeof Sparkles;
    title: string;
    subtitle: string;
    benefitHighlight: string;
  }
> = {
  AI_POSTER: {
    badge: "Giya AI Studio",
    icon: Sparkles,
    title: "Générez vos Affiches & Visuels avec Giya AI",
    subtitle:
      "Créez instantanément des visuels ultra-professionnels 4K adaptés à vos événements en Afrique sans passer par un graphiste.",
    benefitHighlight: "Génération illimitée d'affiches 4K & déclinaisons réseaux sociaux",
  },
  CERTIFICATES_LIMIT: {
    badge: "Certifications Illimitées",
    icon: GraduationCap,
    title: "Délivrez des Diplômes & Certificats sans Limite",
    subtitle:
      "La version gratuite inclut 15 certificats par événement. Passez au Plan PRO pour délivrer des attestations certifiées à l'ensemble de vos participants scannés.",
    benefitHighlight: "Certifications PDF illimitées avec QR code cryptographique vérifiable à vie",
  },
  TEAM_LIMIT: {
    badge: "Gestion d'Équipe Évolutive",
    icon: Users,
    title: "Débloquez des Comptes Collaborateurs Illimités",
    subtitle:
      "La version gratuite est limitée à 2 comptes administrateurs. Passez au Plan PRO pour inviter toute votre équipe, vos contrôleurs d'accès et vos caissiers avec des permissions sur mesure.",
    benefitHighlight: "Collaborateurs illimités, rôles personnalisés & journal d'audit complet",
  },
  GENERAL: {
    badge: "Passez à la Vitesse Supérieure",
    icon: Crown,
    title: "Débloquez Toute la Puissance de Giya PRO",
    subtitle:
      "Bénéficiez de toutes les fonctionnalités avancées pour propulser vos événements, restaurants et boutiques.",
    benefitHighlight: "Accès à toutes les fonctionnalités IA, encaissements prioritaires & support 24/7",
  },
};

const PRO_PERKS = [
  "Génération de visuels et affiches par IA générative (Giya AI Poster)",
  "Certifications & diplômes PDF haute définition illimités avec QR code anti-fraude",
  "Gestion d'équipe illimitée avec rôles et permissions modulaires précises",
  "Encaissements Mobile Money instantanés (Airtel Money & Moov Money Gabon)",
  "Nom de domaine personnalisé & vitrine événementielle sur-mesure",
  "Support prioritaire WhatsApp & accompagnement dédié 7j/7",
];

export function PricingUpgradeModal({
  isOpen,
  onClose,
  feature = "GENERAL",
}: PricingUpgradeModalProps) {
  const [subscribing, setSubscribing] = useState(false);
  const config = FEATURE_CONFIGS[feature];
  const Icon = config.icon;

  if (!isOpen) return null;

  function handleSubscribe() {
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      toast.success(
        "Demande d'activation du Plan PRO enregistrée ! Vous serez contacté sur WhatsApp pour finaliser le paiement Mobile Money."
      );
      onClose();
    }, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-primary/40 bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
              <Icon className="size-3.5 text-primary" />
              {config.badge}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Fonctionnalité Premium
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-snug">
            {config.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* Pricing Offer Card */}
        <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Plan Giya PRO Événementiel
              </span>
              <p className="font-display text-2xl font-extrabold text-foreground mt-0.5">
                19 000 <span className="text-sm font-normal text-muted-foreground">FCFA / mois</span>
              </p>
            </div>
            <span className="rounded-xl bg-primary text-white text-[11px] font-bold px-3 py-1 shadow-sm">
              Sans engagement
            </span>
          </div>

          <div className="rounded-xl bg-card/80 border border-primary/20 p-2.5 flex items-center gap-2 text-xs font-semibold text-foreground">
            <Zap className="size-4 text-amber-500 shrink-0" />
            <span>{config.benefitHighlight}</span>
          </div>
        </div>

        {/* Pro Benefits Checklist */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-foreground">Inclus dans le Plan PRO :</span>
          <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
            {PRO_PERKS.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Check className="size-2.5 stroke-[3]" />
                </div>
                <span className="leading-tight text-foreground/90 text-[11px]">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Button */}
        <div className="space-y-2 pt-2 border-t border-border">
          <Button
            type="button"
            disabled={subscribing}
            onClick={handleSubscribe}
            className="w-full h-11 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            <Sparkles className="size-4" />
            <span>{subscribing ? "Activation en cours..." : "Passer au Plan PRO (Paiement Mobile Money)"}</span>
            <ArrowRight className="size-4 ml-auto" />
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            Paiement sécurisé par Airtel Money & Moov Money • Facture et reçu fiscal téléchargeables.
          </p>
        </div>
      </div>
    </div>
  );
}
