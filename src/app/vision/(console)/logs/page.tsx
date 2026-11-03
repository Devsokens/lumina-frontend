"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle, Pager, Panel, Pill } from "@/components/vision/vision-ui";
import { relative, visionGet, visionPage } from "@/lib/vision";

type Log = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { name: string; email: string } | null;
};

type Admin = { id: string; email: string; name: string; isActive: boolean; lastLoginAt: string | null; lockedUntil: string | null };

const ACTION_LABELS: Record<string, { label: string; tone: "good" | "bad" | "warn" | "accent" | "muted" }> = {
  VISION_LOGIN: { label: "Connexion", tone: "good" },
  VISION_LOGIN_FAILED: { label: "Connexion refusée", tone: "bad" },
  VISION_LOGIN_LOCKED: { label: "Compte verrouillé", tone: "bad" },
  VISION_LOGOUT: { label: "Déconnexion", tone: "muted" },
  UPDATE_TENANT: { label: "Compte client modifié", tone: "warn" },
  DISABLE_USER: { label: "Utilisateur désactivé", tone: "warn" },
  ENABLE_USER: { label: "Utilisateur réactivé", tone: "accent" },
  ADMIN_CREATED_CLI: { label: "Admin créé (CLI)", tone: "accent" },
  ADMIN_RESET_CLI: { label: "Admin réinitialisé (CLI)", tone: "accent" },
  ADMIN_CREATED_MIGRATION: { label: "Admin créé (migration)", tone: "accent" },
  ADMIN_EMAIL_CHANGED_MIGRATION: { label: "E-mail admin modifié", tone: "accent" },
  VISION_PASSWORD_CHANGED: { label: "Mot de passe changé", tone: "good" },
  VISION_PASSWORD_CHANGE_FAILED: { label: "Changement de mot de passe refusé", tone: "bad" },
};

export default function VisionLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["vision-logs", page],
    queryFn: () => visionPage<Log>(`/logs?page=${page}&limit=30`),
    placeholderData: keepPreviousData,
  });
  const { data: admins } = useQuery({ queryKey: ["vision-admins"], queryFn: () => visionGet<Admin[]>("/admins") });

  return (
    <>
      <PageTitle title="Journal & administrateurs" subtitle="Toute connexion et toute action de la console est tracée" />
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Journal" className="p-0 sm:p-0 lg:col-span-8">
          {isLoading || !data ? (
            <Skeleton className="m-4 h-64" />
          ) : (
            <ul className="divide-y divide-border">
              {data.data.map((l) => {
                const a = ACTION_LABELS[l.action] ?? { label: l.action, tone: "muted" as const };
                return (
                  <li key={l.id} className="space-y-1 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Pill tone={a.tone}>{a.label}</Pill>
                      <span className="text-xs text-muted-foreground" title={new Date(l.createdAt).toLocaleString("fr-FR")}>
                        {relative(l.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {l.admin ? `${l.admin.name} (${l.admin.email})` : "—"}
                      {l.ipAddress ? ` · IP ${l.ipAddress}` : ""}
                      {l.targetType ? ` · ${l.targetType} ${l.targetId?.slice(0, 8)}` : ""}
                    </p>
                    {l.details && Object.keys(l.details).length > 0 && (
                      <code className="block truncate font-mono text-[11px] text-foreground/70">{JSON.stringify(l.details)}</code>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="px-4 pb-4">{data && <Pager page={page} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}</div>
        </Panel>
        <Panel title="Administrateurs" className="lg:col-span-4">
          <ul className="space-y-3">
            {(admins ?? []).map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{a.name}</p>
                  {!a.isActive ? (
                    <Pill tone="bad">Désactivé</Pill>
                  ) : a.lockedUntil && new Date(a.lockedUntil) > new Date() ? (
                    <Pill tone="warn">Verrouillé</Pill>
                  ) : (
                    <Pill tone="good">Actif</Pill>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{a.email}</p>
                <p className="text-xs text-muted-foreground">Dernière connexion : {relative(a.lastLoginAt)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Les administrateurs se créent uniquement sur le serveur : <code>npm run vision:admin</code>.
          </p>
        </Panel>
      </div>
    </>
  );
}
