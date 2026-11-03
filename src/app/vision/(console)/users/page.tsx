"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DoubleConfirmDialog } from "@/components/shared/double-confirm-dialog";
import { PageTitle, Pager, Panel, Pill, Segmented } from "@/components/vision/vision-ui";
import { SECTOR_LABELS, relative, visionApi, visionPage } from "@/lib/vision";

type UserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  tenant: { id: string; name: string; slug: string; sector: string };
};

type Activity = "" | "active" | "passive" | "disabled";

export default function VisionUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [activity, setActivity] = useState<Activity>("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<UserRow | null>(null);
  const [now] = useState(() => Date.now());

  const qs = new URLSearchParams({ page: String(page), limit: "25" });
  if (activity) qs.set("activity", activity);
  if (search) qs.set("search", search);
  const { data, isLoading } = useQuery({
    queryKey: ["vision-users", qs.toString()],
    queryFn: () => visionPage<UserRow>(`/users?${qs}`),
    placeholderData: keepPreviousData,
  });
  const toggle = useMutation({
    mutationFn: (u: UserRow) => visionApi.patch(`/users/${u.id}`, { isActive: !u.isActive }),
    onSuccess: () => {
      toast.success("Utilisateur mis à jour");
      setTarget(null);
      void qc.invalidateQueries({ queryKey: ["vision-users"] });
    },
    onError: () => toast.error("Modification refusée."),
  });

  return (
    <>
      <PageTitle
        title="Utilisateurs"
        subtitle="Tous les comptes de connexion des clients · actif = connecté depuis moins de 30 jours"
        actions={
          <Segmented<Activity>
            value={activity}
            onChange={(v) => {
              setActivity(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tous" },
              { value: "active", label: "Actifs" },
              { value: "passive", label: "Passifs" },
              { value: "disabled", label: "Désactivés" },
            ]}
          />
        }
      />
      <form
        className="relative mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(query.trim());
          setPage(1);
        }}
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, e-mail, téléphone, établissement…" maxLength={80} className="rounded-xl pl-9" />
      </form>

      <Panel className="p-0 sm:p-0">
        {isLoading || !data ? (
          <Skeleton className="m-4 h-64" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Utilisateur</th>
                  <th className="px-4 py-3 font-medium">Établissement</th>
                  <th className="px-4 py-3 font-medium">Rôle</th>
                  <th className="px-4 py-3 font-medium">Dernière connexion</th>
                  <th className="px-4 py-3 font-medium">État</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => {
                  const active = u.isActive && !!u.lastLoginAt && now - new Date(u.lastLoginAt).getTime() < 30 * 86_400_000;
                  return (
                    <tr key={u.id} className="border-b border-border/60">
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.fullName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email || u.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        {u.tenant.name}
                        <p className="text-xs text-muted-foreground">{SECTOR_LABELS[u.tenant.sector]}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">{relative(u.lastLoginAt)}</td>
                      <td className="px-4 py-3">
                        {!u.isActive ? <Pill tone="bad">Désactivé</Pill> : active ? <Pill tone="good">Actif</Pill> : <Pill>Passif</Pill>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setTarget(u)} className="text-xs text-muted-foreground hover:text-foreground">
                          {u.isActive ? "Désactiver" : "Réactiver"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!data.data.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Aucun utilisateur.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {data && <Pager page={page} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}

      <DoubleConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        pending={toggle.isPending}
        destructive={!!target?.isActive}
        first={{
          title: target?.isActive ? "Désactiver cet utilisateur ?" : "Réactiver cet utilisateur ?",
          description: target?.isActive ? "Il ne pourra plus se connecter ; ses sessions en cours sont refusées." : "Il pourra de nouveau se connecter.",
          confirmLabel: "Continuer",
        }}
        second={{ title: "Confirmer", description: "Action enregistrée dans le journal de la console.", confirmLabel: "Oui, appliquer" }}
        onConfirm={() => target && toggle.mutate(target)}
      />
    </>
  );
}
