"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Landmark, Loader2, RefreshCw, Scale, Search, Wallet } from "lucide-react";
import { StatCard } from "@/components/charts/stat-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager, PageTitle, Panel, Pill, Segmented } from "@/components/vision/vision-ui";
import { apiError } from "@/lib/api";
import { relative, visionApi, visionGet } from "@/lib/vision";

// Paiements : ce que l'API ne règle pas seule (remboursements incertains,
// clients débités deux fois), la trésorerie des comptes PVit et le journal.
// Tout envoi d'argent exige un code de l'application d'authentification.

type Tone = "muted" | "good" | "warn" | "bad" | "accent";
type Attempt = {
  id: string;
  kind: string;
  status: string;
  reference: string;
  transactionId: string | null;
  channel: string;
  msisdn: string;
  amount: number;
  fees: number | null;
  releaseSeats: boolean | null;
  createdAt: string;
  order: { orderNumber: string; paymentStatus: string; customerName: string | null; total: number };
  tenant: { name: string; slug: string };
};
type Duplicate = Attempt & { lastRefund: { status: string; reference: string; createdAt: string } | null };
type Issues = { uncertain: Attempt[]; duplicates: Duplicate[] };
type Account = { code: string; channels: string[]; owed: number; balance: number | null; error: string | null };
type Treasury = {
  test: boolean;
  balanceConfigured: boolean;
  checkedAt: string;
  accounts: Account[];
  owed: { airtel: number; moov: number; noAccount: number; total: number };
};
type Journal = { rows: Attempt[]; page: number; limit: number; total: number };
type Result = { status: string; message?: string };

const KIND: Record<string, string> = { PAYMENT: "Paiement", REFUND: "Remboursement", DUPLICATE_REFUND: "Doublon rendu" };
const STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "En attente", tone: "accent" },
  SUCCESS: { label: "Réussi", tone: "good" },
  FAILED: { label: "Échec", tone: "bad" },
  AMBIGUOUS: { label: "Incertain", tone: "warn" },
  ABANDONED: { label: "Abandonné", tone: "muted" },
};
const CHANNEL: Record<string, string> = {
  AIRTEL_MONEY: "Airtel Money",
  MOOV_MONEY: "Moov Money",
  VISA_MASTERCARD: "Carte",
  MANUAL: "Hors GiyaX",
};
const TABS = [
  { value: "issues", label: "À traiter" },
  { value: "treasury", label: "Trésorerie" },
  { value: "journal", label: "Journal" },
] as const;
type Tab = (typeof TABS)[number]["value"];
const KIND_FILTERS = [
  { value: "ALL", label: "Tout" },
  { value: "PAYMENT", label: "Paiements" },
  { value: "REFUND", label: "Remboursements" },
  { value: "DUPLICATE_REFUND", label: "Doublons rendus" },
];
const STATUS_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "SUCCESS", label: "Réussis" },
  { value: "FAILED", label: "Échecs" },
  { value: "AMBIGUOUS", label: "Incertains" },
  { value: "PENDING", label: "En attente" },
  { value: "ABANDONED", label: "Abandonnés" },
];
const LIMIT = 25;

const francs = (n: number) => `${n.toLocaleString("fr-FR")} F`;
const statusOf = (s: string) => STATUS[s] ?? { label: s, tone: "muted" as Tone };

function refresh(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["vision-payment-issues"] });
  void queryClient.invalidateQueries({ queryKey: ["vision-payment-journal"] });
}

export default function VisionPaymentsPage() {
  const [tab, setTab] = useState<Tab>("issues");
  return (
    <>
      <PageTitle title="Paiements" subtitle="Opérations à vérifier, trésorerie PVit et journal" />
      <div className="mb-4 overflow-x-auto">
        <Segmented value={tab} options={[...TABS]} onChange={setTab} />
      </div>
      {tab === "issues" ? <IssuesTab /> : tab === "treasury" ? <TreasuryTab /> : <JournalTab />}
    </>
  );
}

// ---------- À traiter ----------

type Action =
  | { kind: "resolve"; item: Attempt; outcome: "SUCCESS" | "FAILED" }
  | { kind: "refund"; item: Duplicate }
  | { kind: "settle"; item: Duplicate };

const COPY = {
  resolve: { title: "Constater le résultat", confirm: "Confirmer" },
  refund: { title: "Rembourser le doublon", confirm: "Rembourser" },
  settle: { title: "Doublon réglé hors GiyaX", confirm: "Marquer comme réglé" },
};

function IssuesTab() {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<Action | null>(null);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["vision-payment-issues"],
    queryFn: () => visionGet<Issues>("/payments/issues"),
  });

  const check = useMutation({
    mutationFn: async (id: string) => (await visionApi.post<{ data: Result }>(`/payments/${id}/check`)).data.data,
    onSuccess: (res) => {
      if (res.status === "SUCCESS" || res.status === "FAILED") toast.success(res.message);
      else toast.info(res.message);
      refresh(queryClient);
    },
    onError: (err) => toast.error(apiError(err, "Vérification impossible")),
  });

  const run = useMutation({
    mutationFn: async (a: Action) => {
      if (a.kind === "resolve") {
        await visionApi.post(`/payments/${a.item.id}/resolve`, { outcome: a.outcome, code });
        return { status: "SUCCESS", message: "Résultat enregistré." };
      }
      const path = a.kind === "refund" ? "refund-duplicate" : "settle-duplicate";
      const body = a.kind === "refund" ? { code } : { code, note: note.trim() };
      return (await visionApi.post<{ data: Result }>(`/payments/${a.item.id}/${path}`, body)).data.data;
    },
    onSuccess: (res) => {
      if (res.status === "SUCCESS") toast.success(res.message);
      else toast.error(res.message ?? "Opération non aboutie.");
      setAction(null);
      refresh(queryClient);
    },
    onError: (err) => {
      toast.error(apiError(err, "Action impossible"));
      refresh(queryClient);
    },
  });

  function open(a: Action) {
    setCode("");
    setNote("");
    setAction(a);
  }

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />;
  if (isError || !data) return <Panel><p className="py-8 text-center text-sm text-muted-foreground">Chargement impossible.</p></Panel>;

  const valid = /^[0-9]{6}$/.test(code) && (action?.kind !== "settle" || note.trim().length >= 3);

  return (
    <div className="space-y-4">
      <Panel title={`Remboursements incertains (${data.uncertain.length})`}>
        {data.uncertain.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Aucun remboursement en attente de vérification.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.uncertain.map((a) => (
              <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                <AttemptSummary attempt={a} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.kind === "REFUND"
                    ? `Billets encore valides tant que le résultat n'est pas connu. Places : ${a.releaseSeats === false ? "gardées bloquées" : a.releaseSeats ? "remises en vente" : "gardées bloquées (choix inconnu)"}.`
                    : "Remboursement d'un paiement en double."}
                </p>
                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  <Button size="sm" variant="outline" disabled={check.isPending} onClick={() => check.mutate(a.id)}>
                    {check.isPending && check.variables === a.id ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                    Vérifier chez PVit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => open({ kind: "resolve", item: a, outcome: "SUCCESS" })}>
                    Parti
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => open({ kind: "resolve", item: a, outcome: "FAILED" })}>
                    Pas parti
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`Clients débités deux fois (${data.duplicates.length})`}>
        {data.duplicates.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Aucun paiement en double à rendre.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.duplicates.map((d) => {
              const pending = d.lastRefund && ["PENDING", "AMBIGUOUS"].includes(d.lastRefund.status);
              const card = d.channel === "VISA_MASTERCARD";
              return (
                <li key={d.id} className="py-3 first:pt-0 last:pb-0">
                  <AttemptSummary attempt={d} />
                  {card && <p className="mt-1 text-xs text-amber-400">Payé par carte : PVit ne rembourse pas une carte. Remboursez le client autrement, puis marquez-le comme réglé.</p>}
                  {pending && <p className="mt-1 text-xs text-amber-400">Un remboursement de ce doublon est incertain : vérifiez-le dans la liste du dessus.</p>}
                  {d.lastRefund?.status === "FAILED" && <p className="mt-1 text-xs text-red-400">Dernier essai refusé {relative(d.lastRefund.createdAt)}.</p>}
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" disabled={!!pending} onClick={() => open({ kind: "settle", item: d })}>
                      Réglé autrement
                    </Button>
                    <Button size="sm" disabled={card || !!pending} onClick={() => open({ kind: "refund", item: d })}>
                      Rembourser {francs(d.amount)}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

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
                  {action.kind === "resolve" &&
                    (action.outcome === "SUCCESS"
                      ? `À confirmer seulement si l'opération ${action.item.reference} apparaît comme réussie dans l'espace MyPVIT.${action.item.kind === "REFUND" ? " La commande passe en remboursée et ses billets sont annulés." : ""}`
                      : `À confirmer seulement si l'opération ${action.item.reference} a bien échoué dans l'espace MyPVIT.${action.item.kind === "REFUND" ? " L'organisateur pourra relancer le remboursement." : " Le doublon pourra être remboursé à nouveau."}`)}
                  {action.kind === "refund" && `${francs(action.item.amount)} seront renvoyés au ${action.item.msisdn} (${CHANNEL[action.item.channel] ?? action.item.channel}), depuis le compte qui a encaissé ce paiement. Cette opération ne peut pas être annulée.`}
                  {action.kind === "settle" && "Le client a été remboursé en dehors de GiyaX (espace MyPVIT, virement, espèces). Indiquez comment : le motif est gardé dans le journal de la console."}
                </DialogDescription>
              </DialogHeader>
              {action.kind === "settle" && (
                <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Ex. remboursé par virement le 12/11" aria-label="Comment le client a été remboursé" />
              )}
              <Input
                autoFocus={action.kind !== "settle"}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                placeholder="Code à 6 chiffres"
                aria-label="Code de l'application d'authentification"
              />
              <DialogFooter>
                <Button type="button" variant="outline" disabled={run.isPending} onClick={() => setAction(null)}>
                  Fermer
                </Button>
                <Button type="submit" disabled={!valid || run.isPending}>
                  {run.isPending && <Loader2 className="size-4 animate-spin" />}
                  {COPY[action.kind].confirm}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function AttemptSummary({ attempt: a }: { attempt: Attempt }) {
  const s = statusOf(a.status);
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {a.tenant.name} · {a.order.orderNumber}
        </p>
        <p className="text-xs text-muted-foreground">
          {a.order.customerName ?? "Client"} · {CHANNEL[a.channel] ?? a.channel} {a.msisdn} · {a.reference} · {relative(a.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-display font-bold tabular-nums">{francs(a.amount)}</span>
        <Pill tone={s.tone}>{s.label}</Pill>
      </div>
    </div>
  );
}

// ---------- Trésorerie ----------

function accountLabel(channels: string[]) {
  if (channels.length > 1) return "Compte unique";
  return { AIRTEL_MONEY: "Compte Airtel Money", MOOV_MONEY: "Compte Moov Money", VISA_MASTERCARD: "Compte carte" }[channels[0]] ?? channels[0];
}

function TreasuryTab() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["vision-payment-treasury"],
    queryFn: () => visionGet<Treasury>("/payments/treasury"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />;
  if (isError || !data) return <Panel><p className="py-8 text-center text-sm text-muted-foreground">Chargement impossible.</p></Panel>;

  const known = data.accounts.every((a) => a.balance !== null);
  const balance = data.accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0);

  return (
    <div className="space-y-4">
      {data.test && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400">
          Mode test PVit : soldes et montants de la sandbox.
        </p>
      )}
      {!data.balanceConfigured && (
        <p className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground">
          Lecture des soldes non configurée : ajoutez la variable PVIT_CODE_URL_BALANCE dans Render (code de l&apos;API « Solde » de l&apos;espace MyPVIT).
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard index={0} label="Dû aux organisateurs" value={data.owed.total} format={francs} icon={Wallet} hint="Recettes à verser et versements en cours" />
        <StatCard index={1} label="Solde des comptes" value={balance} format={francs} icon={Landmark} hint={known ? "Tous comptes PVit" : "Incomplet : un solde est illisible"} />
        {known && <StatCard index={2} label="Reste après versements" value={balance - data.owed.total} format={francs} icon={Scale} hint="Commissions, moins les frais PVit" />}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.accounts.map((a) => {
          const card = a.channels.length === 1 && a.channels[0] === "VISA_MASTERCARD";
          const short = a.balance !== null ? a.owed - a.balance : 0;
          return (
            <Panel key={a.code} title={accountLabel(a.channels)} aside={<span className="text-xs text-muted-foreground">{a.code}</span>}>
              <p className="font-display text-2xl font-bold tabular-nums">{a.balance === null ? "—" : francs(a.balance)}</p>
              {a.error && a.error !== "NOT_CONFIGURED" && <p className="mt-1 text-xs text-red-400">Solde illisible ({a.error}).</p>}
              <div className="mt-3 space-y-1.5 text-sm">
                {!card && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">À verser depuis ce compte</span>
                    <span className="font-medium tabular-nums">{francs(a.owed)}</span>
                  </div>
                )}
              </div>
              {card ? (
                <p className="mt-3 text-xs text-muted-foreground">Les versements partent des comptes Airtel et Moov : l&apos;argent payé par carte doit y être transféré pour être versé.</p>
              ) : a.balance === null ? null : short > 0 ? (
                <p className="mt-3"><Pill tone="bad">Il manque {francs(short)}</Pill></p>
              ) : (
                <p className="mt-3"><Pill tone="good">Couvert</Pill></p>
              )}
            </Panel>
          );
        })}
      </div>

      {data.owed.noAccount > 0 && (
        <p className="text-sm text-muted-foreground">{francs(data.owed.noAccount)} reviennent à des organisations qui n&apos;ont pas encore de compte de versement.</p>
      )}
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Relevé {relative(data.checkedAt)}</span>
        <Button size="sm" variant="outline" disabled={isFetching} onClick={() => void refetch()}>
          {isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Actualiser
        </Button>
      </div>
    </div>
  );
}

// ---------- Journal ----------

function JournalTab() {
  const [kind, setKind] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (kind !== "ALL") params.set("kind", kind);
  if (status !== "ALL") params.set("status", status);
  if (search) params.set("q", search);
  const query = params.toString();

  const { data, isLoading } = useQuery({
    queryKey: ["vision-payment-journal", query],
    queryFn: () => visionGet<Journal>(`/payments?${query}`),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(input.trim());
          setPage(1);
        }}
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} maxLength={40} placeholder="Référence, n° de commande ou téléphone" aria-label="Rechercher une opération" />
        <Button type="submit" variant="outline" aria-label="Rechercher">
          <Search className="size-4" />
        </Button>
      </form>
      <div className="overflow-x-auto">
        <Segmented
          value={kind}
          options={KIND_FILTERS}
          onChange={(v) => {
            setKind(v);
            setPage(1);
          }}
        />
      </div>
      <div className="overflow-x-auto">
        <Segmented
          value={status}
          options={STATUS_FILTERS}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : data.rows.length === 0 ? (
        <Panel>
          <p className="py-8 text-center text-sm text-muted-foreground">Aucune opération.</p>
        </Panel>
      ) : (
        <Panel>
          <ul className="divide-y divide-border">
            {data.rows.map((a) => {
              const s = statusOf(a.status);
              return (
                <li key={a.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      <span className="font-semibold">{KIND[a.kind] ?? a.kind}</span> · {a.tenant.name} · {a.order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CHANNEL[a.channel] ?? a.channel} {a.msisdn} · {a.reference}
                      {a.transactionId ? ` · ${a.transactionId}` : ""} · {relative(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-right">
                      <span className="block font-semibold tabular-nums">{francs(a.amount)}</span>
                      {a.fees != null && <span className="block text-[10px] text-muted-foreground">frais {francs(a.fees)}</span>}
                    </span>
                    <Pill tone={s.tone}>{s.label}</Pill>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
      {data && <Pager page={page} total={data.total} limit={LIMIT} onPage={setPage} />}
    </div>
  );
}
