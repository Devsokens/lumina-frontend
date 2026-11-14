"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, Bell, BellRing, HeartHandshake, Ticket } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, type ApiResponse } from "@/lib/api";
import { PUSH_MESSAGE, enablePush, fetchPushStatus, pushState, type PushState } from "@/lib/push";
import { cn } from "@/lib/utils";

// Cloche du tableau de bord : ouvre la liste des dernières notifications
// (ventes, cotisations, versements) et permet d'activer les notifications
// sur l'appareil. La liste vient du serveur (GET /admin/push/feed) : elle
// fonctionne même si les notifications push ne sont pas activées.
// « Non lues » = arrivées depuis la dernière ouverture sur cet appareil.

type FeedItem = { id: string; kind: "sale" | "contribution" | "payout"; title: string; body: string; url: string; date: string };

const SEEN_KEY = "giyax-notifications-seen";
const ICON = { sale: Ticket, contribution: HeartHandshake, payout: Banknote };

function readSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function ago(date: string, now: number): string {
  const minutes = Math.max(0, Math.round((now - new Date(date).getTime()) / 60_000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Libreville" });
}

export function NotificationBell({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [now, setNow] = useState(0);
  const [state, setState] = useState<PushState | null>(null);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: items, refetch } = useQuery({
    queryKey: ["notifications-feed"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FeedItem[]>>("/admin/push/feed");
      return (data.data ?? []) as FeedItem[];
    },
    refetchInterval: 60_000,
    retry: false,
  });

  useEffect(() => {
    let cancelled = false;
    void Promise.all([pushState(), fetchPushStatus().catch(() => null)]).then(([local, remote]) => {
      if (cancelled) return;
      setSeen(readSeen());
      setNow(Date.now());
      setState(local);
      setAvailable(!!remote?.enabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Une notification push reçue pendant que la page est ouverte : liste à jour.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      if ((event.data as { type?: string } | null)?.type === PUSH_MESSAGE) void refetch();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [refetch]);

  const list = items ?? [];
  const unread = list.filter((i) => new Date(i.date).getTime() > seen).length;

  function change(next: boolean) {
    setOpen(next);
    setNow(Date.now());
    if (next) return;
    // À la fermeture : tout ce qui était affiché est considéré comme lu.
    const stamp = Date.now();
    setSeen(stamp);
    try {
      localStorage.setItem(SEEN_KEY, String(stamp));
    } catch {
      // Stockage indisponible : la pastille reviendra au prochain chargement.
    }
  }

  async function activate() {
    setBusy(true);
    try {
      await enablePush();
      toast.success("Notifications activées sur cet appareil.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Activation impossible.");
    } finally {
      setState(await pushState());
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" aria-label={unread > 0 ? `Notifications : ${unread} nouvelle${unread > 1 ? "s" : ""}` : "Notifications"} onClick={() => change(true)} className={cn("relative", className)}>
        <Bell className={iconClassName ?? "size-[18px]"} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold leading-none text-white">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      <Dialog open={open} onOpenChange={change}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-[460px]">
          <DialogHeader className="border-b px-5 py-4 text-left">
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Vos dernières ventes, cotisations et versements.</DialogDescription>
          </DialogHeader>

          {available && state === "off" && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3">
              <span className="min-w-[180px] flex-1 text-[13px] text-muted-foreground">Soyez prévenu sur cet appareil à chaque vente, même GiyaX fermé.</span>
              <button type="button" disabled={busy} onClick={() => void activate()} className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground disabled:opacity-60">
                <BellRing className="size-4" />
                Activer
              </button>
            </div>
          )}
          {available && state === "blocked" && (
            <p className="m-0 border-b bg-muted/40 px-5 py-3 text-[13px] text-muted-foreground">Votre navigateur bloque les notifications de GiyaX : autorisez-les dans les réglages du site (icône à gauche de l&apos;adresse).</p>
          )}
          {available && state === "needs-install" && (
            <p className="m-0 border-b bg-muted/40 px-5 py-3 text-[13px] text-muted-foreground">Sur iPhone : ajoutez GiyaX à l&apos;écran d&apos;accueil (Partager › Sur l&apos;écran d&apos;accueil) pour recevoir les notifications.</p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {list.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bell className="size-5" />
                </span>
                <span className="text-sm font-semibold">Aucune notification pour le moment</span>
                <span className="max-w-[300px] text-[13px] text-muted-foreground">Chaque billet vendu, inscription ou cotisation apparaîtra ici.</span>
              </div>
            ) : (
              <ul className="m-0 list-none p-0">
                {list.map((item) => {
                  const Icon = ICON[item.kind] ?? Ticket;
                  const fresh = new Date(item.date).getTime() > seen;
                  return (
                    <li key={item.id} className="border-b last:border-b-0">
                      <button
                        type="button"
                        onClick={() => {
                          change(false);
                          // Lien interne uniquement.
                          if (item.url.startsWith("/") && !item.url.startsWith("//")) router.push(item.url);
                        }}
                        className={cn("flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/60", fresh && "bg-primary/5")}
                      >
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                          <Icon className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-sm font-semibold">{item.title}</span>
                          <span className="truncate text-[13px] text-muted-foreground">{item.body}</span>
                          <span className="text-xs text-muted-foreground">{ago(item.date, now)}</span>
                        </span>
                        {fresh && <span aria-label="Nouveau" className="mt-2 size-2 shrink-0 rounded-full bg-[#E5484D]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
