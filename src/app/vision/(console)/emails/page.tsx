"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Mail, Send, Unplug, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/charts/stat-card";
import { PageTitle, Panel, Pill } from "@/components/vision/vision-ui";
import { relative, visionApi, visionGet } from "@/lib/vision";
import { apiError } from "@/lib/api";

// Adresse d'envoi GiyaX (API Gmail, OAuth2) : connexion du compte Google,
// essai, état des Gmail connectés par les organisateurs.

type MailState = {
  platform: { connected: boolean; email: string | null; status: "ACTIVE" | "ERROR" | null; lastError: string | null; connectedAt: string | null };
  available: boolean;
  redirectUri: string;
  sentToday: number;
  tenantAccounts: { active: number; error: number };
};

const RETURN: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Adresse d'envoi GiyaX connectée." },
  denied: { ok: false, text: "Connexion annulée." },
  scope: { ok: false, text: "Cochez « Envoyer des e-mails en votre nom » sur l'écran Google." },
  error: { ok: false, text: "La connexion à Gmail a échoué : voir les journaux du serveur." },
};

// useSearchParams (retour de l'écran Google) : sous Suspense.
export default function VisionEmailsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <EmailsConsole />
    </Suspense>
  );
}

function EmailsConsole() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["vision-mail"], queryFn: () => visionGet<MailState>("/mail") });
  const [to, setTo] = useState("");

  const back = params.get("gmail");
  useEffect(() => {
    if (!back) return;
    const r = RETURN[back] ?? RETURN.error;
    if (r.ok) toast.success(r.text);
    else toast.error(r.text);
    router.replace(pathname, { scroll: false });
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [back]);

  const connect = useMutation({
    mutationFn: async () => (await visionApi.post<{ data: { url: string } }>("/mail/connect")).data.data.url,
    onSuccess: (url) => window.location.assign(url),
    onError: (err) => toast.error(apiError(err, "Connexion impossible")),
  });
  const disconnect = useMutation({
    mutationFn: () => visionApi.delete("/mail"),
    onSuccess: () => {
      toast.success("Adresse d'envoi déconnectée.");
      void qc.invalidateQueries({ queryKey: ["vision-mail"] });
    },
    onError: (err) => toast.error(apiError(err, "Échec de la déconnexion")),
  });
  const test = useMutation({
    mutationFn: async () => (await visionApi.post<{ data: { sentTo: string } }>("/mail/test", { to: to.trim() })).data.data.sentTo,
    onSuccess: (sentTo) => toast.success(`E-mail d'essai envoyé à ${sentTo}`),
    onError: (err) => toast.error(apiError(err, "Envoi impossible")),
  });

  const p = data?.platform;
  const active = p?.connected && p.status === "ACTIVE";

  return (
    <>
      <PageTitle title="E-mails" subtitle="Adresse d'envoi GiyaX (API Gmail) et comptes Gmail des organisateurs" />
      {isLoading || !data ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard index={0} label="Envoyés aujourd'hui (GiyaX)" value={data.sentToday} icon={Send} />
            <StatCard index={1} label="Gmail d'organisateurs actifs" value={data.tenantAccounts.active} icon={Users} />
            <StatCard index={2} label="À reconnecter" value={data.tenantAccounts.error} icon={Unplug} />
          </div>

          <Panel title="Adresse d'envoi GiyaX" aside={active ? <Pill tone="good">Active</Pill> : p?.connected ? <Pill tone="bad">À reconnecter</Pill> : <Pill tone="warn">Non connectée</Pill>}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Mail className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p?.email ?? "Aucun compte connecté"}</p>
                <p className="text-xs text-muted-foreground">
                  {p?.connected && p.connectedAt ? `Connectée ${relative(p.connectedAt)}` : "Billets, rappels et invitations partent de cette adresse quand l'organisateur n'a pas connecté son Gmail."}
                </p>
                {p?.lastError && <p className="mt-1 text-xs text-red-400">{p.lastError}</p>}
              </div>
              <div className="flex gap-2">
                {p?.connected && (
                  <Button variant="outline" size="sm" disabled={disconnect.isPending} onClick={() => window.confirm("Déconnecter l'adresse d'envoi GiyaX ?") && disconnect.mutate()}>
                    Déconnecter
                  </Button>
                )}
                {!active && (
                  <Button size="sm" disabled={!data.available || connect.isPending} onClick={() => connect.mutate()}>
                    {connect.isPending && <Loader2 className="size-4 animate-spin" />}
                    {p?.connected ? "Reconnecter" : "Connecter Gmail"}
                  </Button>
                )}
              </div>
            </div>
            {!data.available && (
              <p className="mt-3 text-xs text-amber-400">GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET absents sur le serveur : connexion impossible.</p>
            )}
          </Panel>

          {active && (
            <Panel title="Envoyer un essai">
              <form
                className="flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (to.trim()) test.mutate();
                }}
              >
                <Input type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="vous@exemple.com" maxLength={254} className="min-w-[220px] flex-1 rounded-xl" />
                <Button type="submit" disabled={test.isPending || !to.trim()}>
                  {test.isPending && <Loader2 className="size-4 animate-spin" />}
                  Envoyer
                </Button>
              </form>
            </Panel>
          )}

          <Panel title="Configuration Google Cloud">
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>Bibliothèque d&apos;API : activer « Gmail API » dans le projet du client OAuth.</li>
              <li>Écran de consentement : ajouter le scope « …/auth/gmail.send » (et les comptes test tant que l&apos;application n&apos;est pas validée).</li>
              <li>
                Identifiants › client OAuth › URI de redirection autorisés : <code className="break-all font-mono text-xs text-foreground/80">{data.redirectUri}</code>
              </li>
              <li>Ici : « Connecter Gmail » avec le compte d&apos;envoi GiyaX, puis « Envoyer un essai ».</li>
            </ol>
          </Panel>
        </div>
      )}
    </>
  );
}
