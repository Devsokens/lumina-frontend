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

// Commission de GiyaX sur les billets payants. Stockée en points de base
// (500 = 5 %) : voir PlatformSettingsService côté API.

type Settings = {
  ticketCommissionBps: number;
  isDefault: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

const QUERY_KEY = ["vision-settings"];
const MAX_PERCENT = 20;
const EXAMPLES = [2_000, 5_000, 10_000, 25_000];

const toText = (bps: number) => String(bps / 100).replace(".", ",");

function toBps(text: string): number | null {
  const value = Number(text.trim().replace(",", "."));
  if (!text.trim() || !Number.isFinite(value) || value < 0 || value > MAX_PERCENT) return null;
  return Math.round(value * 100);
}

export default function VisionCommissionPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => visionGet<Settings>("/settings"),
  });
  // null : le champ suit la valeur enregistrée.
  const [draft, setDraft] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (ticketCommissionBps: number) =>
      (await visionApi.patch<{ data: Settings }>("/settings", { ticketCommissionBps })).data.data,
    onSuccess: (settings) => {
      queryClient.setQueryData(QUERY_KEY, settings);
      setDraft(null);
      toast.success("Commission enregistrée.");
    },
    onError: (err) => toast.error(apiError(err, "Enregistrement impossible")),
  });

  const text = draft ?? (data ? toText(data.ticketCommissionBps) : "");
  const bps = toBps(text);
  const invalid = bps === null;
  const changed = !!data && !invalid && bps !== data.ticketCommissionBps;

  return (
    <>
      <PageTitle title="Commission" subtitle="Ce que GiyaX retient sur chaque billet payant" />
      {isLoading || !data ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          <Panel
            title="Commission sur les billets"
            aside={data.isDefault ? <Pill tone="warn">Valeur proposée, à confirmer</Pill> : <Pill tone="good">Enregistrée</Pill>}
          >
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (bps !== null) save.mutate(bps);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="commission">Taux, frais PVit compris</Label>
                <div className="relative w-36">
                  <Input
                    id="commission"
                    inputMode="decimal"
                    value={text}
                    onChange={(e) => setDraft(e.target.value)}
                    aria-invalid={invalid}
                    className="pr-8"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <Button type="submit" disabled={invalid || save.isPending || !(changed || data.isDefault)}>
                {save.isPending && <Loader2 className="size-4 animate-spin" />}
                Enregistrer
              </Button>
            </form>
            {invalid && <p className="mt-2 text-xs text-red-400">Entrez un taux entre 0 et {MAX_PERCENT} %.</p>}
            <p className="mt-3 text-xs text-muted-foreground">
              Les billets gratuits restent à 0 F.
              {data.updatedAt && ` Modifié ${relative(data.updatedAt)}${data.updatedBy ? ` par ${data.updatedBy}` : ""}.`}
            </p>
          </Panel>

          <Panel title="Exemples avec ce taux">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Billet</th>
                    <th className="py-2 pr-3 text-right font-medium">Commission</th>
                    <th className="py-2 text-right font-medium">L&apos;organisateur reçoit</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map((price) => {
                    const fee = Math.round((price * (bps ?? data.ticketCommissionBps)) / 10_000);
                    return (
                      <tr key={price} className="border-b border-border last:border-0">
                        <td className="whitespace-nowrap py-2 pr-3">{formatXAF(price * 100)}</td>
                        <td className="whitespace-nowrap py-2 pr-3 text-right">{formatXAF(fee * 100)}</td>
                        <td className="whitespace-nowrap py-2 text-right font-medium">{formatXAF((price - fee) * 100)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <p className="text-xs text-amber-400">
            Ce taux n&apos;est pas encore prélevé : il servira au calcul des versements aux organisateurs, quand ils seront en place.
          </p>
        </div>
      )}
    </>
  );
}
