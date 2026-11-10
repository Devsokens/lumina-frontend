"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, Clock, Coins, Loader2, RefreshCw, Wallet } from "lucide-react";
import { StatCard } from "@/components/charts/stat-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager, PageTitle, Panel, Pill, Segmented } from "@/components/vision/vision-ui";
import { apiError } from "@/lib/api";
import { relative, visionApi, visionGet } from "@/lib/vision";

// Versements aux organisateurs : rien ne part sans validation ici, et chaque
// mouvement d'argent exige un code de l'application d'authentification.

type Part = {
  id: string;
  position: number;
  amount: number;
  status: string;
  reference: string;
  lastError: string | null;
};
type Payout = {
  id: string;
  status: string;
  amount: number;
  gross: number;
  commission: number;
  refunds: number;
  operator: string;
  phone: string;
  holderName: string;
  accountChangedAt: string | null;
  kycStatus: string;
  kycName: string | null;
  firstToNumber: boolean;
  note: string | null;
  approvedBy: string | null;
  createdAt: string;
  paidAt: string | null;
  tenant: { name: string; slug: string };
  parts: Part[];
};
type Response = {
  rows: Payout[];
  page: number;
  limit: number;
  total: number;
  summary: { test: boolean; toApproveCount: number; toApproveAmount: number; owed: number; commission: number; paid: number };
};

type Tone = "muted" | "good" | "warn" | "bad" | "accent";
const STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING_APPROVAL: { label: "À valider", tone: "warn" },
  PROCESSING: { label: "Envoi en cours", tone: "accent" },
  PAID: { label: "Versé", tone: "good" },
  FAILED: { label: "Échec", tone: "bad" },
  REVIEW: { label: "À vérifier", tone: "bad" },
  REJECTED: { label: "Refusé", tone: "muted" },
  CANCELLED: { label: "Annulé", tone: "muted" },
};
const PART_STATUS: Record<string, { label: string; tone: Tone }> = {
  PLANNED: { label: "Prévue", tone: "muted" },
  SENDING: { label: "Incertaine", tone: "bad" },
  AMBIGUOUS: { label: "Incertaine", tone: "bad" },
  SUCCESS: { label: "Partie", tone: "good" },
  FAILED: { label: "Échec", tone: "bad" },
};
const FILTERS = [
  { value: "PENDING_APPROVAL", label: "À valider" },
  { value: "REVIEW", label: "À vérifier" },
  { value: "FAILED", label: "Échecs" },
  { value: "PAID", label: "Versés" },
  { value: "ALL", label: "Tous" },
];
const COOLING_MS = 48 * 60 * 60 * 1000;
const LIMIT = 20;

const francs = (n: number) => `${n.toLocaleString("fr-FR")} F`;
const operatorName = (o: string) => (o === "MOOV" ? "Moov Money" : "Airtel Money");

type Action =
  | { kind: "approve" | "retry"; payout: Payout }
  | { kind: "resolve"; payout: Payout; part: Part; outcome: "SUCCESS" | "FAILED" }
  | { kind: "reject"; payout: Payout };

const COPY = {
  approve: { title: "Valider ce versement", confirm: "Envoyer l'argent" },
  retry: { title: "Reprendre ce versement", confirm: "Reprendre" },
  resolve: { title: "Constater le résultat", confirm: "Confirmer" },
  reject: { title: "Refuser ce versement", confirm: "Refuser" },
};

export default function VisionPayoutsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("PENDING_APPROVAL");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<Action | null>(null);
  const [value, setValue] = useState("");
  const [now] = useState(() => Date.now());

  const query = `?page=${page}&limit=${LIMIT}${filter === "ALL" ? "" : `&status=${filter}`}`;
  const { data, isLoading } = useQuery({
    queryKey: ["vision-payouts", query],
    queryFn: () => visionGet<Response>(`/payouts${query}`),
    placeholderData: keepPreviousData,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["vision-payouts"] });

  const prepare = useMutation({
    mutationFn: async () => (await visionApi.post<{ data: { created: number } }>("/payouts/prepare")).data.data.created,
    onSuccess: (created) => {
      toast.success(created > 0 ? `${created} versement(s) à valider.` : "Aucun nouveau versement dû.");
      void refresh();
    },
    onError: (err) => toast.error(apiError(err, "Préparation impossible")),
  });

  const run = useMutation({
    mutationFn: async (a: Action) => {
      const id = a.payout.id;
      if (a.kind === "reject") {
        await visionApi.post(`/payouts/${id}/reject`, { reason: value.trim() });
        return "Versement refusé : les recettes sont rendues au solde.";
      }
      if (a.kind === "resolve") {
        await visionApi.post(`/payouts/${id}/parts/${a.part.id}/resolve`, { outcome: a.outcome, code: value });
        return "Résultat enregistré.";
      }
      const { data: res } = await visionApi.post<{ data: { status: string } }>(`/payouts/${id}/${a.kind}`, { code: value });
      return res.data.status === "PAID" ? "Versement effectué." : "Versement non terminé : voir le détail.";
    },
    onSuccess: (message) => {
      toast.success(message);
      setAction(null);
      void refresh();
    },
    onError: (err) => {
      toast.error(apiError(err, "Action impossible"));
      void refresh();
    },
  });

  function open(a: Action) {
    setValue("");
    setAction(a);
  }

  const summary = data?.summary;
  const isReject = action?.kind === "reject";
  const valid = isReject ? value.trim().length >= 3 : /^[0-9]{6}$/.test(value);

  return (
    <>
      <PageTitle
        title="Versements"
        subtitle="Reversement des recettes aux organisateurs"
        actions={
          <Button variant="outline" size="sm" disabled={prepare.isPending} onClick={() => prepare.mutate()}>
            {prepare.isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Préparer maintenant
          </Button>
        }
      />
      {isLoading || !data || !summary ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {summary.test && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400">
              Mode test PVit : ces montants viennent de la sandbox et ne seront jamais comptés en production.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard index={0} label="À valider" value={summary.toApproveAmount} format={francs} icon={Clock} hint={`${summary.toApproveCount} versement(s)`} />
            <StatCard index={1} label="Dû aux organisateurs" value={summary.owed} format={francs} icon={Wallet} />
            <StatCard index={2} label="Commissions" value={summary.commission} format={francs} icon={Coins} />
            <StatCard index={3} label="Déjà versé" value={summary.paid} format={francs} icon={Banknote} />
          </div>

          <div className="overflow-x-auto">
            <Segmented
              value={filter}
              options={FILTERS}
              onChange={(v) => {
                setFilter(v);
                setPage(1);
              }}
            />
          </div>

          {data.rows.length === 0 ? (
            <Panel>
              <p className="py-8 text-center text-sm text-muted-foreground">Aucun versement ici.</p>
            </Panel>
          ) : (
            data.rows.map((p) => (
              <PayoutCard
                key={p.id}
                payout={p}
                now={now}
                onApprove={() => open({ kind: "approve", payout: p })}
                onReject={() => open({ kind: "reject", payout: p })}
                onRetry={() => open({ kind: "retry", payout: p })}
                onResolve={(part, outcome) => open({ kind: "resolve", payout: p, part, outcome })}
              />
            ))
          )}
          <Pager page={page} total={data.total} limit={LIMIT} onPage={setPage} />
        </div>
      )}

      <Dialog open={!!action} onOpenChange={(next) => !next && !run.isPending && setAction(null)}>
        {action && (
          <DialogContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (valid) run.mutate(action);
              }}
            >
              <DialogHeader>
                <DialogTitle>{COPY[action.kind].title}</DialogTitle>
                <DialogDescription>
                  {action.kind === "approve" && `${francs(action.payout.amount)} seront envoyés à ${action.payout.holderName} (${operatorName(action.payout.operator)} ${action.payout.phone}). Cette opération ne peut pas être annulée.`}
                  {action.kind === "retry" && "Les envois incertains sont d'abord vérifiés chez PVit. Seul ce qui a échoué à coup sûr est renvoyé."}
                  {action.kind === "resolve" && (action.outcome === "SUCCESS" ? "À confirmer seulement si l'opération apparaît comme réussie dans votre espace MyPVIT." : "À confirmer seulement si l'opération a bien échoué dans votre espace MyPVIT : cette part pourra être renvoyée.")}
                  {action.kind === "reject" && "Les recettes reviennent au solde de l'organisation."}
                </DialogDescription>
              </DialogHeader>
              <Input
                autoFocus
                value={value}
                onChange={(e) => setValue(isReject ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode={isReject ? "text" : "numeric"}
                maxLength={isReject ? 300 : 6}
                placeholder={isReject ? "Motif du refus" : "Code à 6 chiffres"}
                aria-label={isReject ? "Motif du refus" : "Code de l'application d'authentification"}
              />
              <DialogFooter>
                <Button type="button" variant="outline" disabled={run.isPending} onClick={() => setAction(null)}>
                  Fermer
                </Button>
                <Button type="submit" disabled={!valid || run.isPending} variant={isReject ? "destructive" : "default"}>
                  {run.isPending && <Loader2 className="size-4 animate-spin" />}
                  {COPY[action.kind].confirm}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}

function PayoutCard({
  payout: p,
  now,
  onApprove,
  onReject,
  onRetry,
  onResolve,
}: {
  payout: Payout;
  now: number;
  onApprove: () => void;
  onReject: () => void;
  onRetry: () => void;
  onResolve: (part: Part, outcome: "SUCCESS" | "FAILED") => void;
}) {
  const status = STATUS[p.status] ?? { label: p.status, tone: "muted" as Tone };
  const recentChange = p.accountChangedAt && now - new Date(p.accountChangedAt).getTime() < COOLING_MS;
  const unknownNumber = p.kycStatus === "UNKNOWN_NUMBER";
  const blocked = unknownNumber || !!recentChange;
  const noneSent = p.parts.every((x) => x.status === "PLANNED" || x.status === "FAILED");

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display font-semibold">{p.tenant.name}</p>
          <p className="text-xs text-muted-foreground">
            {p.tenant.slug} · préparé {relative(p.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold">{francs(p.amount)}</span>
          <Pill tone={status.tone}>{status.label}</Pill>
        </div>
      </div>

      <div className="mt-4 grid gap-x-8 gap-y-1.5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Fact label="Ventes">{francs(p.gross)}</Fact>
          <Fact label="Commission">− {francs(p.commission)}</Fact>
          {p.refunds > 0 && <Fact label="Remboursements">− {francs(p.refunds)}</Fact>}
        </div>
        <div className="space-y-1.5">
          <Fact label={operatorName(p.operator)}>{p.phone}</Fact>
          <Fact label="Titulaire déclaré">{p.holderName}</Fact>
          <Fact label="Nom chez l'opérateur">
            {p.kycName ?? (unknownNumber ? <span className="text-red-400">Numéro inconnu</span> : <span className="text-amber-400">Non vérifié</span>)}
          </Fact>
        </div>
      </div>

      {(p.firstToNumber || recentChange) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.firstToNumber && <Pill tone="warn">Premier versement vers ce numéro</Pill>}
          {recentChange && <Pill tone="bad">Numéro modifié {relative(p.accountChangedAt)} : bloqué 48 h</Pill>}
        </div>
      )}

      {p.parts.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-border pt-3">
          {p.parts.map((part) => {
            const s = PART_STATUS[part.status] ?? { label: part.status, tone: "muted" as Tone };
            const uncertain = part.status === "AMBIGUOUS" || part.status === "SENDING";
            return (
              <li key={part.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="min-w-0">
                  {francs(part.amount)} <span className="text-xs text-muted-foreground">{part.reference}</span>
                  {part.lastError && <span className="block text-xs text-red-400">{part.lastError}</span>}
                </span>
                <span className="flex items-center gap-2">
                  <Pill tone={s.tone}>{s.label}</Pill>
                  {uncertain && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onResolve(part, "SUCCESS")}>
                        Partie
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onResolve(part, "FAILED")}>
                        Non partie
                      </Button>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {p.note && <p className="mt-3 text-xs text-muted-foreground">{p.note}</p>}
      {p.approvedBy === "Automatique" && <p className="mt-1 text-xs text-muted-foreground">Envoyé automatiquement (réglage de l&apos;organisation).</p>}

      {["PENDING_APPROVAL", "FAILED", "REVIEW", "PROCESSING"].includes(p.status) && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {(p.status === "PENDING_APPROVAL" || (p.status === "FAILED" && noneSent)) && (
            <Button variant="outline" size="sm" onClick={onReject}>
              Refuser
            </Button>
          )}
          {p.status === "PENDING_APPROVAL" ? (
            <Button size="sm" disabled={blocked} onClick={onApprove}>
              Valider et envoyer
            </Button>
          ) : (
            <Button size="sm" disabled={blocked} onClick={onRetry}>
              Reprendre
            </Button>
          )}
        </div>
      )}
    </Panel>
  );
}
