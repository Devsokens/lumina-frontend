"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRightLeft, CheckCheck, Clock, Hand, Headset, Loader2, SendHorizontal, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageTitle, Pill, Segmented } from "@/components/vision/vision-ui";
import { visionApi, visionGet } from "@/lib/vision";
import { SUPPORT_LIST_KEY, useSupportList, type SupportDetail, type SupportThread } from "@/lib/vision-support";
import { apiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// Support : les conversations des organisateurs. Un seul admin écrit à la
// fois. « Prendre en charge » réserve la conversation ; « Rendre la main » la
// libère pour l'équipe, « Passer la main » la confie à un collègue. Sans
// réponse 15 minutes après un message, elle passe « en retard » et n'importe
// quel admin peut la reprendre. L'organisateur, lui, parle au « Support ».

type Filter = "todo" | "mine" | "all";

const TZ = "Africa/Libreville";
const time = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const dayKey = (d: string) => new Date(d).toLocaleDateString("fr-CA", { timeZone: TZ });
const dayLabel = (d: string) => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });

function since(d: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(d).getTime()) / 60_000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h` : `${Math.floor(hours / 24)} j`;
}

const ROLE: Record<string, string> = { OWNER: "Propriétaire", MANAGER: "Manager", STAFF: "Scanner" };

function StatePill({ t }: { t: SupportThread }) {
  if (t.status === "CLOSED") return <Pill>Clôturée</Pill>;
  if (t.overdue) return <Pill tone="bad">En retard · à reprendre</Pill>;
  if (!t.assignedTo) return <Pill tone="warn">À prendre</Pill>;
  if (t.assignedTo.me) return <Pill tone="accent">{t.waitingSince ? "À vous de répondre" : "Vous"}</Pill>;
  return <Pill>{t.assignedTo.name}</Pill>;
}

export default function VisionSupportPage() {
  const { data, isLoading } = useSupportList();
  const [filter, setFilter] = useState<Filter>("todo");
  const [selected, setSelected] = useState<string | null>(null);
  // Horloge des durées d'attente, rafraîchie avec la liste.
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  const threads = data?.threads ?? [];
  const shown = threads.filter((t) => (filter === "all" ? true : filter === "mine" ? t.assignedTo?.me && t.status === "OPEN" : t.status === "OPEN" && (t.canClaim || (t.assignedTo?.me && !!t.waitingSince))));
  const current = threads.find((t) => t.id === selected) ?? null;

  return (
    <div>
      <PageTitle title="Support" subtitle="Les conversations des organisateurs. Un seul admin répond à la fois ; au-delà de 15 minutes sans réponse, toute l'équipe peut reprendre." />
      <div className="flex min-h-[560px] overflow-hidden rounded-2xl border border-border bg-card lg:h-[calc(100dvh-13rem)]">
        <div className={cn("flex w-full shrink-0 flex-col border-border lg:w-[360px] lg:border-r", selected && "hidden lg:flex")}>
          <div className="border-b border-border p-3">
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: "todo", label: `À traiter${data ? ` (${data.counts.toTake + threads.filter((t) => t.assignedTo?.me && !!t.waitingSince && !t.overdue).length})` : ""}` },
                { value: "mine", label: `Les miennes${data ? ` (${data.counts.mine})` : ""}` },
                { value: "all", label: "Toutes" },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Chargement…</p>
            ) : shown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                <CheckCheck className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">{filter === "todo" ? "Rien à traiter" : "Aucune conversation"}</p>
                <p className="text-xs text-muted-foreground">{filter === "todo" ? "Toutes les demandes ont une réponse." : "Les conversations apparaîtront ici."}</p>
              </div>
            ) : (
              <ul>
                {shown.map((t) => (
                  <li key={t.id} className="border-b border-border last:border-b-0">
                    <button type="button" onClick={() => setSelected(t.id)} className={cn("flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-muted/60", selected === t.id && "bg-primary/8")}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          {t.unread && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                          <span className={cn("truncate text-sm", t.unread ? "font-bold" : "font-semibold")}>{t.organization}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{now ? since(t.lastMessageAt, now) : ""}</span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {t.person} · {t.lastPreview}
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <StatePill t={t} />
                        {t.waitingSince && t.status === "OPEN" && now > 0 && (
                          <span className={cn("flex items-center gap-1 text-[11px]", t.overdue ? "font-semibold text-red-400" : "text-muted-foreground")}>
                            <Clock className="size-3" /> attend depuis {since(t.waitingSince, now)}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={cn("min-w-0 flex-1 flex-col", selected ? "flex" : "hidden lg:flex")}>
          {current ? (
            <Conversation key={current.id} id={current.id} onBack={() => setSelected(null)} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <Headset className="size-10 text-muted-foreground" />
              <p className="text-sm font-medium">Choisissez une conversation</p>
              <p className="max-w-[320px] text-xs text-muted-foreground">Prenez-la en charge pour répondre. Tant que vous l&apos;avez, vos collègues ne peuvent pas écrire dedans.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Conversation({ id, onBack }: { id: string; onBack: () => void }) {
  const qc = useQueryClient();
  const key = ["vision-support", id];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => visionGet<SupportDetail>(`/support/${id}`), refetchInterval: 4_000 });
  const { data: admins } = useQuery({ queryKey: ["vision-support-admins"], queryFn: () => visionGet<{ id: string; name: string }[]>("/support/admins"), staleTime: 300_000 });
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const count = data?.messages.length ?? 0;

  useLayoutEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [count]);

  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: key }), qc.invalidateQueries({ queryKey: SUPPORT_LIST_KEY, exact: true })]);

  const action = useMutation({
    mutationFn: ({ path, body }: { path: string; body?: object; done?: string }) => visionApi.post(`/support/${id}/${path}`, body ?? {}),
    onSuccess: (_r, v) => {
      if (v.done) toast.success(v.done);
    },
    onError: (err) => toast.error(apiError(err, "Action impossible.")),
    onSettled: refresh,
  });

  function send() {
    const body = text.trim();
    if (!body || action.isPending) return;
    setText("");
    action.mutate({ path: "messages", body: { body } }, { onError: () => setText(body) });
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const t = data.thread;
  const others = (admins ?? []).filter((a) => a.id !== t.assignedTo?.id);

  return (
    <>
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <button type="button" aria-label="Retour à la liste" onClick={onBack} className="flex size-9 items-center justify-center rounded-lg hover:bg-muted lg:hidden">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">{t.organization}</span>
          <span className="truncate text-xs text-muted-foreground">
            {t.person}
            {t.role ? ` · ${ROLE[t.role] ?? t.role}` : ""}
          </span>
        </div>
        <StatePill t={t} />
        {t.canWrite && (
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={action.isPending}>
                  <ArrowRightLeft className="size-4" /> Passer la main
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Confier la conversation à un collègue, ou la remettre à toute l&apos;équipe.</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => action.mutate({ path: "release", done: "Conversation remise à l'équipe." })}>
                  <Undo2 className="size-4" /> Rendre à toute l&apos;équipe
                </DropdownMenuItem>
                {others.map((a) => (
                  <DropdownMenuItem key={a.id} onClick={() => action.mutate({ path: "transfer", body: { adminId: a.id }, done: `Conversation confiée à ${a.name}.` })}>
                    <ArrowRightLeft className="size-4" /> {a.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" disabled={action.isPending} onClick={() => action.mutate({ path: "close", done: "Conversation clôturée." })}>
              <CheckCheck className="size-4" /> Clôturer
            </Button>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 py-4">
        <ol className="flex flex-col gap-1.5">
          {data.messages.map((m, i) => {
            const previous = data.messages[i - 1];
            const newDay = !previous || dayKey(previous.createdAt) !== dayKey(m.createdAt);
            return (
              <li key={m.id} className="flex flex-col">
                {newDay && <span className="my-2 self-center text-[11px] font-medium text-muted-foreground first-letter:uppercase">{dayLabel(m.createdAt)}</span>}
                {m.author === "SYSTEM" ? (
                  <span className="my-1 self-center rounded-full bg-muted px-3 py-1 text-center text-[11px] text-muted-foreground">
                    {m.body} · {time(m.createdAt)}
                  </span>
                ) : (
                  <span className={cn("flex max-w-[78%] flex-col gap-1", m.author === "ADMIN" ? "items-end self-end" : "items-start self-start")}>
                    <span className={cn("whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-snug", m.author === "ADMIN" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card")}>{m.body}</span>
                    <span className="px-1 text-[10px] text-muted-foreground">
                      {m.author === "ADMIN" ? `${m.mine ? "Vous" : (m.adminName ?? "Admin")} · ` : ""}
                      {time(m.createdAt)}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <div ref={end} />
      </div>

      {t.canWrite ? (
        <form
          className="flex items-end gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            aria-label="Votre réponse"
            rows={1}
            value={text}
            maxLength={2000}
            placeholder="Répondre en tant que Support GiyaX…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            className="max-h-36 min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none [field-sizing:content] focus:border-primary"
          />
          <Button type="submit" size="icon" aria-label="Envoyer" disabled={!text.trim() || action.isPending}>
            <SendHorizontal className="size-4" />
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
          <p className="min-w-[200px] flex-1 text-xs text-muted-foreground">
            {t.status === "CLOSED"
              ? "Conversation clôturée. Elle se rouvrira si l'organisateur réécrit."
              : t.overdue
                ? `Sans réponse depuis plus de 15 minutes${t.assignedTo ? ` (${t.assignedTo.name} l'avait en charge)` : ""} : vous pouvez la reprendre.`
                : t.assignedTo
                  ? `${t.assignedTo.name} s'occupe de cette conversation. Vous pourrez la reprendre s'il rend la main, ou après 15 minutes sans réponse.`
                  : "Personne ne s'en occupe encore. Prenez-la en charge pour répondre."}
          </p>
          {t.canClaim && (
            <Button size="sm" disabled={action.isPending} onClick={() => action.mutate({ path: "claim", done: "Conversation prise en charge." })}>
              <Hand className="size-4" /> {t.assignedTo ? "Reprendre la main" : "Prendre en charge"}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
