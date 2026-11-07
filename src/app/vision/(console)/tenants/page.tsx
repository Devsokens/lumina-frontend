"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DoubleConfirmDialog } from "@/components/shared/double-confirm-dialog";
import { PageTitle, Pager, Panel, Pill } from "@/components/vision/vision-ui";
import { PLAN_LABELS, SECTOR_LABELS, STATUS_LABELS, fcfaCents, relative, visionApi, visionGet, visionPage } from "@/lib/vision";
import { publicSiteLabel, publicSiteUrl } from "@/lib/tenant-url";
import { cn } from "@/lib/utils";

type TenantRow = {
  id: string;
  slug: string;
  name: string;
  sector: string;
  plan: string;
  status: string;
  customDomain: string | null;
  createdAt: string;
  users: number;
  revenue30d: number;
  orders30d: number;
  lastLoginAt: string | null;
};

type TenantDetail = Omit<TenantRow, "users" | "revenue30d" | "orders30d" | "lastLoginAt"> & {
  users: { id: string; email: string | null; phone: string | null; fullName: string | null; role: string; isActive: boolean; lastLoginAt: string | null }[];
  stats: { orders: number; settledOrders: number; revenue: number; customers: number; listings: number; events: number; products: number };
};

const statusTone = (s: string) => (s === "ACTIVE" ? "good" : s === "SUSPENDED" ? "warn" : "bad");

export default function VisionTenantsPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const qs = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) qs.set("search", search);
  if (sector) qs.set("sector", sector);
  if (status) qs.set("status", status);
  const { data, isLoading } = useQuery({
    queryKey: ["vision-tenants", qs.toString()],
    queryFn: () => visionPage<TenantRow>(`/tenants?${qs}`),
    placeholderData: keepPreviousData,
  });

  const select = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <>
      <PageTitle title="Comptes clients" subtitle="Établissements inscrits sur GiyaX, activité et gestion" />
      <div className="mb-4 flex flex-wrap gap-2">
        <form
          className="relative min-w-60 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(query.trim());
            setPage(1);
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, adresse du site, domaine…" maxLength={80} className="rounded-xl pl-9" />
        </form>
        <select value={sector} onChange={select(setSector)} className="rounded-xl border border-input bg-card px-3 text-sm" aria-label="Secteur">
          <option value="">Tous secteurs</option>
          {Object.entries(SECTOR_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select value={status} onChange={select(setStatus)} className="rounded-xl border border-input bg-card px-3 text-sm" aria-label="Statut">
          <option value="">Tous statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="SUSPENDED">Suspendus</option>
        </select>
      </div>

      <Panel className="p-0 sm:p-0">
        {isLoading || !data ? (
          <Skeleton className="m-4 h-64" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Compte</th>
                  <th className="px-4 py-3 font-medium">Secteur</th>
                  <th className="px-4 py-3 font-medium">Offre</th>
                  <th className="px-4 py-3 text-right font-medium">Volume 30 j</th>
                  <th className="px-4 py-3 text-right font-medium">Utilisateurs</th>
                  <th className="px-4 py-3 font-medium">Dernière connexion</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((t) => (
                  <tr key={t.id} onClick={() => setSelected(t.id)} className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">/{t.slug}</p>
                    </td>
                    <td className="px-4 py-3">{SECTOR_LABELS[t.sector] ?? t.sector}</td>
                    <td className="px-4 py-3">{PLAN_LABELS[t.plan] ?? t.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {fcfaCents(t.revenue30d)}
                      <p className="text-xs text-muted-foreground">{t.orders30d} commande(s)</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{t.users}</td>
                    <td className="px-4 py-3 text-muted-foreground">{relative(t.lastLoginAt)}</td>
                    <td className="px-4 py-3">
                      <Pill tone={statusTone(t.status)}>{STATUS_LABELS[t.status] ?? t.status}</Pill>
                    </td>
                  </tr>
                ))}
                {!data.data.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      Aucun compte ne correspond.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {data && <Pager page={page} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
      {selected && <TenantSheet id={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function TenantSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: t } = useQuery({ queryKey: ["vision-tenant", id], queryFn: () => visionGet<TenantDetail>(`/tenants/${id}`) });
  const [confirm, setConfirm] = useState<null | { status?: string; plan?: string }>(null);
  const update = useMutation({
    mutationFn: (body: { status?: string; plan?: string }) => visionApi.patch(`/tenants/${id}`, body),
    onSuccess: () => {
      toast.success("Compte mis à jour");
      setConfirm(null);
      void qc.invalidateQueries({ queryKey: ["vision-tenants"] });
      void qc.invalidateQueries({ queryKey: ["vision-tenant", id] });
    },
    onError: () => toast.error("Modification refusée."),
  });

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto border-l border-border bg-card p-6">
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 text-muted-foreground">
          <X className="size-5" />
        </button>
        {!t ? (
          <Skeleton className="h-96" />
        ) : (
          <div className="space-y-6">
            <div>
              <Pill tone={statusTone(t.status)}>{STATUS_LABELS[t.status]}</Pill>
              <h2 className="mt-2 font-display text-2xl font-bold">{t.name}</h2>
              <p className="text-sm text-muted-foreground">
                {SECTOR_LABELS[t.sector]} · inscrit le {new Date(t.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <a href={publicSiteUrl(t.slug)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
                {publicSiteLabel(t.slug)} <ExternalLink className="size-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Encaissé", fcfaCents(t.stats.revenue)],
                ["Commandes", t.stats.settledOrders],
                ["Clients", t.stats.customers],
                ["Produits", t.stats.products],
                ["Événements", t.stats.events],
                ["Logements", t.stats.listings],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-xl bg-muted p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
                  <p className="truncate text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Offre</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PLAN_LABELS).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    disabled={t.plan === k}
                    onClick={() => setConfirm({ plan: k })}
                    className={cn("rounded-full border px-3 py-1.5 text-sm", t.plan === k ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50")}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Utilisateurs ({t.users.length})</h3>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {t.users.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">{u.fullName || u.email || u.phone}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.role} · {relative(u.lastLoginAt)}
                      </span>
                    </span>
                    {!u.isActive && <Pill tone="bad">Désactivé</Pill>}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant={t.status === "ACTIVE" ? "destructive" : "default"}
              className="w-full rounded-xl"
              onClick={() => setConfirm({ status: t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
            >
              {t.status === "ACTIVE" ? "Suspendre le compte" : "Réactiver le compte"}
            </Button>
          </div>
        )}
      </aside>
      {t && (
        <DoubleConfirmDialog
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          pending={update.isPending}
          destructive={confirm?.status === "SUSPENDED"}
          first={{
            title: confirm?.plan
              ? `Passer « ${t.name} » en offre ${PLAN_LABELS[confirm.plan]} ?`
              : confirm?.status === "SUSPENDED"
                ? `Suspendre « ${t.name} » ?`
                : `Réactiver « ${t.name} » ?`,
            description: confirm?.status === "SUSPENDED" ? "Son site public et son back-office deviendront inaccessibles." : "Le changement est immédiat.",
            confirmLabel: "Continuer",
          }}
          second={{
            title: "Confirmer",
            description: "Cette action est enregistrée dans le journal de la console avec votre nom.",
            confirmLabel: "Oui, appliquer",
          }}
          onConfirm={() => confirm && update.mutate(confirm)}
        />
      )}
    </div>
  );
}
