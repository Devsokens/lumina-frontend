"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle, Panel, Pill } from "@/components/vision/vision-ui";
import { relative, visionApi, visionGet } from "@/lib/vision";
import { apiError } from "@/lib/api";
import { formatXAF } from "@/lib/format";

// Règles d'argent de la plateforme : frais de l'acheteur, commission de
// l'organisateur, délai de reversement, retrait des cotisations. Taux
// stockés en points de base (500 = 5 %) : voir PlatformSettingsService côté
// API. Seuls les champs modifiés sont envoyés.

type RuleKey = "buyerFeeBps" | "ticketCommissionBps" | "payoutHoldDays" | "contributionOpenHours" | "contributionCloseHours" | "contributionMinPayout";
type Rules = Record<RuleKey, number>;
type Settings = Rules & {
  isDefault: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
  limits: Record<RuleKey, [number, number]>;
};

const QUERY_KEY = ["vision-settings"];
const EXAMPLES = [2_000, 5_000, 10_000, 25_000];
const PERCENT: RuleKey[] = ["buyerFeeBps", "ticketCommissionBps"];

type Field = { key: RuleKey; label: string; unit: string; help: string };
const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "Frais sur les achats",
    fields: [
      { key: "buyerFeeBps", label: "Frais de service payés par l'acheteur", unit: "%", help: "Ajoutés au prix et affichés sur le formulaire de paiement. Ils couvrent les frais de PVit et des opérateurs." },
      { key: "ticketCommissionBps", label: "Commission retirée à l'organisateur", unit: "%", help: "À 0 %, l'organisateur reçoit le prix de ses billets en entier." },
    ],
  },
  {
    title: "Reversement des billets",
    fields: [{ key: "payoutHoldDays", label: "Délai après la fin de l'événement", unit: "jours", help: "Les recettes d'un événement ne sont versées qu'une fois ce délai passé, pour toutes les organisations." }],
  },
  {
    title: "Retrait des cotisations",
    fields: [
      { key: "contributionOpenHours", label: "Ouverture, avant le début de l'événement", unit: "heures", help: "L'organisateur peut retirer ses cotisations à partir de ce moment." },
      { key: "contributionCloseHours", label: "Fermeture, avant le début de l'événement", unit: "heures", help: "Après, les cotisations sont versées avec les billets, après l'événement." },
      { key: "contributionMinPayout", label: "Montant minimal d'un retrait", unit: "F", help: "En dessous, le retrait est refusé." },
    ],
  },
];

const isPercent = (key: RuleKey) => PERCENT.includes(key);
const toText = (key: RuleKey, value: number) => (isPercent(key) ? String(value / 100).replace(".", ",") : String(value));

// Valeur saisie → valeur stockée ; null si elle sort des limites.
function parse(key: RuleKey, text: string, limits: Settings["limits"]): number | null {
  const raw = Number(text.trim().replace(",", ".").replace(/\s/g, ""));
  if (!text.trim() || !Number.isFinite(raw)) return null;
  const value = isPercent(key) ? Math.round(raw * 100) : raw;
  const [min, max] = limits[key];
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

const bound = (key: RuleKey, value: number) => (isPercent(key) ? `${value / 100} %` : value.toLocaleString("fr-FR"));

export default function VisionPaymentRulesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => visionGet<Settings>("/settings"),
  });
  // Champs en cours de modification ; absent : le champ suit la valeur enregistrée.
  const [draft, setDraft] = useState<Partial<Record<RuleKey, string>>>({});

  const save = useMutation({
    mutationFn: async (changes: Partial<Rules>) => (await visionApi.patch<{ data: Settings }>("/settings", changes)).data.data,
    onSuccess: (settings) => {
      queryClient.setQueryData(QUERY_KEY, settings);
      setDraft({});
      toast.success("Règles enregistrées.");
    },
    onError: (err) => toast.error(apiError(err, "Enregistrement impossible")),
  });

  if (isLoading || !data) {
    return (
      <>
        <PageTitle title="Frais et reversements" subtitle="Les règles d'argent appliquées à toutes les organisations" />
        <Skeleton className="h-96 rounded-2xl" />
      </>
    );
  }

  const text = (key: RuleKey) => draft[key] ?? toText(key, data[key]);
  const value = (key: RuleKey) => parse(key, text(key), data.limits);
  const keys = GROUPS.flatMap((g) => g.fields.map((f) => f.key));
  const invalid = keys.filter((k) => value(k) === null);
  const changes = Object.fromEntries(keys.filter((k) => value(k) !== null && value(k) !== data[k]).map((k) => [k, value(k)])) as Partial<Rules>;
  const open = value("contributionOpenHours");
  const close = value("contributionCloseHours");
  const windowError = open !== null && close !== null && open <= close;
  const buyerBps = value("buyerFeeBps") ?? data.buyerFeeBps;
  const organizerBps = value("ticketCommissionBps") ?? data.ticketCommissionBps;

  return (
    <>
      <PageTitle title="Frais et reversements" subtitle="Les règles d'argent appliquées à toutes les organisations" />
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (invalid.length === 0 && !windowError && Object.keys(changes).length > 0) save.mutate(changes);
        }}
      >
        {GROUPS.map((group, i) => (
          <Panel key={group.title} title={group.title} aside={i === 0 ? data.isDefault ? <Pill tone="warn">Valeurs de départ</Pill> : <Pill tone="good">Enregistrées</Pill> : undefined}>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.fields.map((f) => {
                const bad = value(f.key) === null;
                const [min, max] = data.limits[f.key];
                return (
                  <div key={f.key} className="space-y-1.5">
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <div className="relative w-44">
                      <Input id={f.key} inputMode="decimal" value={text(f.key)} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} aria-invalid={bad} className="pr-16" />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">{f.unit}</span>
                    </div>
                    <p className={bad ? "text-xs text-red-400" : "text-xs text-muted-foreground"}>{bad ? `Valeur attendue entre ${bound(f.key, min)} et ${bound(f.key, max)}.` : f.help}</p>
                  </div>
                );
              })}
            </div>
            {group.title === "Retrait des cotisations" && windowError && <p className="mt-3 text-xs text-red-400">L&apos;ouverture doit se situer plus tôt que la fermeture (plus d&apos;heures avant l&apos;événement).</p>}
          </Panel>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={invalid.length > 0 || windowError || save.isPending || Object.keys(changes).length === 0}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </Button>
          <p className="text-xs text-muted-foreground">
            {data.updatedAt ? `Modifié ${relative(data.updatedAt)}${data.updatedBy ? ` par ${data.updatedBy}` : ""}. ` : ""}
            Chaque changement est inscrit au journal.
          </p>
        </div>

        <Panel title="Exemples avec ces taux">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Billet</th>
                  <th className="py-2 pr-3 text-right font-medium">L&apos;acheteur paie</th>
                  <th className="py-2 pr-3 text-right font-medium">L&apos;organisateur reçoit</th>
                  <th className="py-2 text-right font-medium">GiyaX garde, avant frais PVit</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((price) => {
                  const fee = Math.round((price * buyerBps) / 10_000);
                  const commission = Math.round((price * organizerBps) / 10_000);
                  return (
                    <tr key={price} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap py-2 pr-3">{formatXAF(price * 100)}</td>
                      <td className="whitespace-nowrap py-2 pr-3 text-right">{formatXAF((price + fee) * 100)}</td>
                      <td className="whitespace-nowrap py-2 pr-3 text-right font-medium">{formatXAF((price - commission) * 100)}</td>
                      <td className="whitespace-nowrap py-2 text-right">{formatXAF((fee + commission) * 100)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <p className="text-xs text-muted-foreground">Les taux sont figés à chaque vente : les modifier ne change rien aux billets déjà vendus. Les billets gratuits restent à 0 F.</p>
      </form>
    </>
  );
}
