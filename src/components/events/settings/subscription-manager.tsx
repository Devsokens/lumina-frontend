"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Clock,
  ChevronUp,
  CreditCard,
  HelpCircle,
  Smartphone,
  Zap,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { toast } from "sonner";
import { EV_PORTAL } from "@/components/events/ev-ui";
import { useAdminEvents } from "@/hooks/useEvents";
import { useMembers } from "@/hooks/useAdmin";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/types/api";
import { OperatorLogo } from "@/components/shared/operator-logo";

type BillingPeriod = "monthly" | "yearly";

// Formules payantes (Pro, Business) : affichées « Bientôt disponible » tant
// que le paiement des abonnements n'est pas ouvert. Passer à true à l'ouverture.
const PAID_OPEN = false;

type PlanId = "FREE" | "PRO" | "BUSINESS";

interface PlanDef {
  id: PlanId;
  name: string;
  badge?: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  periodLabel: string;
  features: string[];
  limits: {
    events: string;
    certificates: string;
    team: string;
  };
  highlight?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "FREE",
    name: "Gratuite",
    description: "L'essentiel pour lancer vos premiers événements et tester la billetterie.",
    priceMonthly: "0 FCFA",
    priceYearly: "0 FCFA",
    periodLabel: "pour toujours",
    features: [
      "Jusqu'à 2 événements simultanés",
      "15 attestations / certificats par mois",
      "2 membres d'équipe (Organisateur + Scanner)",
      "Billetterie Mobile Money & Carte",
      "Application de scan à l'entrée",
      "Site vitrine standard",
    ],
    limits: {
      events: "2 max",
      certificates: "15 / mois",
      team: "2 membres",
    },
  },
  {
    id: "PRO",
    name: "Pro",
    badge: "Populaire",
    description: "Pour les organisateurs réguliers qui souhaitent développer leur marque.",
    priceMonthly: "Tarif bientôt fixé",
    priceYearly: "Tarif bientôt fixé",
    periodLabel: "bientôt disponible",
    features: [
      "Événements illimités",
      "200 attestations / certificats par mois",
      "Jusqu'à 10 collaborateurs avec rôles",
      "Modèles d'emails personnalisés",
      "Personnalisation graphique des billets",
      "Export avancé Excel / CSV et rapports",
      "Support prioritaire par WhatsApp & Email",
    ],
    limits: {
      events: "Illimités",
      certificates: "200 / mois",
      team: "10 membres",
    },
    highlight: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    badge: "Entreprise",
    description: "Pour les festivals, agences événementielles et structures multi-marques.",
    priceMonthly: "Sur mesure",
    priceYearly: "Sur mesure",
    periodLabel: "devis personnalisé",
    features: [
      "Multi-organisations (plusieurs marques en 1 compte)",
      "Certificats & attestations illimités",
      "Membres et scanners illimités",
      "Gestionnaire de compte dédié",
      "Formation personnalisée pour vos équipes",
      "SLA garanti 99.9% et support téléphonique 24/7",
    ],
    limits: {
      events: "Illimités",
      certificates: "Illimités",
      team: "Illimité",
    },
  },
];

const FAQS = [
  {
    q: "Quand les formules Pro et Business seront-elles disponibles ?",
    a: "Très prochainement. D'ici là, la formule Gratuite vous donne accès à la billetterie, au contrôle d'accès, aux attestations, à votre site web et à GiyaX AI. Vous pourrez ensuite passer à une formule supérieure à tout moment.",
  },
  {
    q: "Comment fonctionnent les quotas de certificats ?",
    a: "Chaque formule inclut un nombre d'attestations ou de certificats générés pour vos participants chaque mois. Le compteur se réinitialise le 1er de chaque mois.",
  },
  {
    q: "Quels sont les moyens de paiement acceptés ?",
    a: "Nous acceptons les paiements via Airtel Money Gabon, Moov Money Gabon, et par carte bancaire internationale (Visa, Mastercard) via notre partenaire sécurisé PVit.",
  },
  {
    q: "Que se passe-t-il si j'atteins la limite de mon forfait ?",
    a: "Vos événements en cours continuent de fonctionner normalement. Vous serez simplement invité à passer à la formule supérieure pour créer un nouvel événement ou émettre davantage de certificats.",
  },
];

export function SubscriptionManager({ tenant }: { tenant: Tenant }) {
  const currentPlan = (tenant.plan as PlanId) || "FREE";
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"method" | "waiting" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<"airtel" | "moov" | "card">("airtel");
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: events = [] } = useAdminEvents();
  const { data: members = [] } = useMembers();
  const setBusinessOpen = useShellStore((s) => s.setBusinessOpen);

  // Consommation réelle
  const activeEventsCount = events.filter((e) => e.status === "PUBLISHED" || e.status === "DRAFT").length;
  const maxEvents = currentPlan === "FREE" ? 2 : 999;
  const eventPercent = Math.min(100, Math.round((activeEventsCount / maxEvents) * 100));

  const teamCount = Math.max(1, members.length);
  const maxTeam = currentPlan === "FREE" ? 2 : currentPlan === "PRO" ? 10 : 999;
  const teamPercent = Math.min(100, Math.round((teamCount / maxTeam) * 100));

  const certCount = 0; // Quota de démarrage
  const maxCert = currentPlan === "FREE" ? 15 : currentPlan === "PRO" ? 200 : 999;
  const certPercent = Math.min(100, Math.round((certCount / maxCert) * 100));

  const handleLaunchCheckout = () => {
    setCheckoutStep("method");
    setCheckoutModalOpen(true);
  };

  const handleSimulatePayment = () => {
    if ((paymentMethod === "airtel" || paymentMethod === "moov") && !phoneNumber.trim()) {
      toast.error("Veuillez saisir votre numéro de téléphone");
      return;
    }
    setCheckoutStep("waiting");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2400);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ev-ink">Abonnement & Consommation</h2>
        <p className="mt-1 text-sm text-ev-ink2">
          Consultez votre formule en cours, le suivi de vos quotas et comparez les forfaits disponibles.
        </p>
      </div>

      {/* Current plan & usage bars */}
      <div className="overflow-hidden rounded-2xl border border-ev-border bg-white shadow-sm">
        <div className="border-b border-ev-border bg-ev-soft/50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">Formule active</span>
              <div className="mt-0.5 flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-ev-ink">
                  {PLANS.find((p) => p.id === currentPlan)?.name ?? "Gratuite"}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Actif
                </span>
              </div>
            </div>

            {currentPlan === "FREE" && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-dashed border-ev-border bg-ev-soft px-3.5 py-2 text-xs font-semibold text-ev-ink2">
                <Clock className="size-4" />
                Pro et Business : très bientôt
              </span>
            )}
          </div>
        </div>

        {/* Quotas / Progress bars */}
        <div className="p-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ev-ink2">Consommation du mois</h4>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {/* Certificats */}
            <div className="flex flex-col gap-2 rounded-xl border border-ev-border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ev-ink">Attestations & Certificats</span>
                <span className="font-bold text-ev-ink">
                  {certCount} / {currentPlan === "FREE" ? "15" : "200"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ev-soft">
                <div
                  className="h-full bg-ev-primary transition-all duration-500"
                  style={{ width: `${certPercent}%` }}
                />
              </div>
              <span className="text-[11px] text-ev-ink2">Renouvelé le 1er du mois prochain</span>
            </div>

            {/* Événements */}
            <div className="flex flex-col gap-2 rounded-xl border border-ev-border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ev-ink">Événements simultanés</span>
                <span className="font-bold text-ev-ink">
                  {activeEventsCount} / {currentPlan === "FREE" ? "2" : "Illimité"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ev-soft">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    eventPercent >= 100 ? "bg-amber-500" : "bg-ev-primary",
                  )}
                  style={{ width: `${currentPlan === "FREE" ? eventPercent : 15}%` }}
                />
              </div>
              <span className="text-[11px] text-ev-ink2">
                {currentPlan === "FREE" && activeEventsCount >= 2
                  ? "Limite atteinte pour la formule gratuite"
                  : "Événements actifs ou brouillons"}
              </span>
            </div>

            {/* Membres */}
            <div className="flex flex-col gap-2 rounded-xl border border-ev-border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ev-ink">Membres de l&apos;équipe</span>
                <span className="font-bold text-ev-ink">
                  {teamCount} / {currentPlan === "FREE" ? "2" : currentPlan === "PRO" ? "10" : "Illimité"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ev-soft">
                <div
                  className="h-full bg-ev-primary transition-all duration-500"
                  style={{ width: `${currentPlan === "FREE" ? teamPercent : 20}%` }}
                />
              </div>
              <span className="text-[11px] text-ev-ink2">Organisateur et scanners inclus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan selection header & Billing switch */}
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div>
          <h3 className="text-lg font-bold text-ev-ink">Les formules</h3>
          <p className="text-xs text-ev-ink2">La formule Gratuite est disponible dès aujourd&apos;hui. Les formules Pro et Business arrivent très prochainement.</p>
        </div>

        {/* Toggle Mensuel / Annuel : masqué tant que les formules payantes ne sont pas ouvertes. */}
        <div className={cn("inline-flex items-center rounded-xl border border-ev-border bg-ev-soft p-1", !PAID_OPEN && "hidden")}>
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              period === "monthly" ? "bg-white text-ev-ink shadow-sm" : "text-ev-ink2 hover:text-ev-ink",
            )}
          >
            Facturation mensuelle
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              period === "yearly" ? "bg-white text-ev-ink shadow-sm" : "text-ev-ink2 hover:text-ev-ink",
            )}
          >
            <span>Facturation annuelle</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          // Formules payantes : affichées grisées tant qu'elles ne sont pas ouvertes.
          const soon = plan.id !== "FREE" && !PAID_OPEN;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200",
                soon
                  ? "border-dashed border-ev-border bg-ev-soft/60 grayscale"
                  : plan.highlight || plan.id === "FREE"
                    ? "border-ev-primary bg-white shadow-md ring-2 ring-ev-primary/20"
                    : "border-ev-border bg-white shadow-sm hover:border-ev-ink2/30",
              )}
            >
              {soon ? (
                <span className="absolute -top-3 right-6 rounded-full border border-ev-border bg-white px-3 py-0.5 text-[11px] font-bold text-ev-ink2 shadow-sm">Bientôt disponible</span>
              ) : plan.badge && (
                <span className="absolute -top-3 right-6 rounded-full bg-ev-primary px-3 py-0.5 text-[11px] font-bold text-white shadow-sm">
                  {plan.badge}
                </span>
              )}

              <div className={cn(soon && "opacity-60")}>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-ev-ink">{plan.name}</h4>
                </div>
                <p className="mt-1 text-xs text-ev-ink2 min-h-[32px]">{plan.description}</p>

                {/* Price display */}
                <div className="mt-4 border-t border-b border-ev-border/60 py-3">
                  <div className="text-2xl font-extrabold text-ev-ink">{soon ? "Bientôt" : period === "monthly" ? plan.priceMonthly : plan.priceYearly}</div>
                  <div className="text-[11px] font-medium text-ev-ink2">{soon ? "Disponible très prochainement" : plan.periodLabel}</div>
                </div>

                {/* Feature list */}
                <ul className="mt-5 flex flex-col gap-2.5 text-xs">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-ev-ink">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action button */}
              <div className="mt-6 pt-4 border-t border-ev-border">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-ev-border bg-ev-soft py-2.5 text-xs font-semibold text-ev-ink2"
                  >
                    Formule actuelle
                  </button>
                ) : soon ? (
                  <button type="button" disabled className="w-full cursor-not-allowed rounded-xl border border-dashed border-ev-border bg-white/60 py-2.5 text-xs font-semibold text-ev-ink2">
                    Bientôt disponible
                  </button>
                ) : plan.id === "PRO" ? (
                  <button
                    type="button"
                    onClick={handleLaunchCheckout}
                    className="w-full rounded-xl bg-ev-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-ev-primary-hover transition-colors"
                  >
                    Passer à Pro (Bientôt)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBusinessOpen(true)}
                    className="w-full rounded-xl border border-ev-border bg-white py-2.5 text-xs font-semibold text-ev-ink hover:bg-ev-soft transition-colors"
                  >
                    Découvrir Business
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-4 rounded-2xl border border-ev-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-ev-primary" />
          <h3 className="text-base font-bold text-ev-ink">Questions fréquentes</h3>
        </div>

        <div className="mt-4 divide-y divide-ev-border">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={faq.q} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between text-left text-xs font-semibold text-ev-ink hover:text-ev-primary"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="size-4 shrink-0 text-ev-ink2" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0 text-ev-ink2" />
                  )}
                </button>
                {isOpen && <p className="mt-2 text-xs text-ev-ink2 leading-relaxed">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout modal (Passer à Pro) */}
      <DialogPrimitive.Root open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(12,22,18,.45)] backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className={cn(
              EV_PORTAL,
              "fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white text-ev-ink shadow-2xl outline-none duration-200 data-[state=open]:animate-in data-[state=open]:zoom-in-95",
            )}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ev-border px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-ev-primary/10 text-ev-primary">
                  <Zap className="size-4" />
                </div>
                <div>
                  <DialogPrimitive.Title className="text-sm font-bold">
                    Passer à la formule Pro
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-[11px] text-ev-ink2">
                    Activez les événements et certificats illimités
                  </DialogPrimitive.Description>
                </div>
              </div>
              <DialogPrimitive.Close className="rounded-lg p-1 text-ev-ink2 hover:bg-ev-soft hover:text-ev-ink">
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {checkoutStep === "method" && (
                <div className="flex flex-col gap-4">
                  {/* Warning tarif bientôt */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2.5">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Les tarifs des forfaits Pro &amp; Business sont en cours d&apos;ajustement. Vous pouvez tester le parcours
                      de paiement ci-dessous.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">
                      Moyen de paiement
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("airtel")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                          paymentMethod === "airtel"
                            ? "border-ev-primary bg-ev-primary/5 text-ev-primary font-bold"
                            : "border-ev-border bg-white text-ev-ink2 hover:border-ev-ink2/40",
                        )}
                      >
                        <OperatorLogo operator="AIRTEL" decorative className="size-8" />
                        <span className="text-[11px]">Airtel Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("moov")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                          paymentMethod === "moov"
                            ? "border-ev-primary bg-ev-primary/5 text-ev-primary font-bold"
                            : "border-ev-border bg-white text-ev-ink2 hover:border-ev-ink2/40",
                        )}
                      >
                        <OperatorLogo operator="MOOV" decorative className="size-8" />
                        <span className="text-[11px]">Moov Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                          paymentMethod === "card"
                            ? "border-ev-primary bg-ev-primary/5 text-ev-primary font-bold"
                            : "border-ev-border bg-white text-ev-ink2 hover:border-ev-ink2/40",
                        )}
                      >
                        <CreditCard className="size-5" />
                        <span className="text-[11px]">Carte bancaire</span>
                      </button>
                    </div>
                  </div>

                  {(paymentMethod === "airtel" || paymentMethod === "moov") && (
                    <div>
                      <label htmlFor="sub-phone" className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">
                        Numéro {paymentMethod === "airtel" ? "Airtel" : "Moov"}
                      </label>
                      <input
                        id="sub-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={paymentMethod === "airtel" ? "074 XX XX XX" : "065 XX XX XX"}
                        className="mt-1.5 h-10 w-full rounded-xl border border-ev-border bg-white px-3 text-xs font-medium outline-none focus:border-ev-primary focus:ring-2 focus:ring-ev-primary/20"
                      />
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="rounded-xl border border-ev-border bg-ev-soft p-3 text-xs text-ev-ink2">
                      Vous serez redirigé vers l&apos;interface sécurisée PVit pour renseigner votre carte Visa ou
                      Mastercard.
                    </div>
                  )}

                  {/* Summary */}
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-ev-soft px-4 py-3 text-xs">
                    <span className="text-ev-ink2">Formule Pro (Mensuel)</span>
                    <span className="font-bold text-ev-ink">Simulation active</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="mt-2 h-11 w-full rounded-xl bg-ev-primary text-xs font-semibold text-white hover:bg-ev-primary-hover"
                  >
                    Confirmer et passer à Pro
                  </button>
                </div>
              )}

              {checkoutStep === "waiting" && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="relative mb-4 flex size-14 items-center justify-center rounded-full bg-ev-soft">
                    <Smartphone className="size-7 text-ev-primary animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-ev-ink">Validation en cours...</h4>
                  <p className="mt-2 max-w-xs text-xs text-ev-ink2 leading-relaxed">
                    Un message de confirmation a été envoyé sur votre téléphone. Veuillez saisir votre code secret pour
                    autoriser le débit.
                  </p>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h4 className="text-base font-bold text-ev-ink">Félicitations !</h4>
                  <p className="mt-1.5 text-xs text-ev-ink2 max-w-xs">
                    Votre compte bénéficie à présent des avantages de la formule <strong>Pro</strong>.
                  </p>

                  <button
                    type="button"
                    onClick={() => setCheckoutModalOpen(false)}
                    className="mt-6 h-10 w-full rounded-xl bg-ev-primary text-xs font-semibold text-white hover:bg-ev-primary-hover"
                  >
                    Retour aux paramètres
                  </button>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
