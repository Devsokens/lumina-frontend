"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { toast } from "sonner";
import { Headset, Loader2, SendHorizontal, X } from "lucide-react";
import { EV_PORTAL } from "@/components/events/ev-ui";
import { SUPPORT_MESSAGE_MAX, useMarkSupportRead, useSendSupportMessage, useSupport, type SupportMessage } from "@/hooks/useSupport";
import { apiErrorMessage } from "@/lib/events";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";

// Panneau « Support » : conversation avec l'équipe GiyaX, qui glisse depuis
// la droite. L'organisateur parle au « Support GiyaX » ; qui lui répond côté
// plateforme (et les passages de main entre admins) ne lui est jamais montré.

const SUGGESTIONS = ["J'ai une question sur un versement", "Un participant n'a pas reçu son billet", "Je n'arrive pas à publier mon événement", "J'ai besoin d'aide pour mon site"];

const TZ = "Africa/Libreville";
const time = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const dayKey = (d: string) => new Date(d).toLocaleDateString("fr-CA", { timeZone: TZ });

function dayLabel(d: string) {
  const today = dayKey(new Date().toISOString());
  const yesterday = dayKey(new Date(Date.now() - 86_400_000).toISOString());
  const key = dayKey(d);
  if (key === today) return "Aujourd'hui";
  if (key === yesterday) return "Hier";
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}

export function SupportDrawer() {
  const open = useShellStore((s) => s.supportOpen);
  const setOpen = useShellStore((s) => s.setSupportOpen);
  const { data, isLoading, isError } = useSupport(open);
  const send = useSendSupportMessage();
  const markRead = useMarkSupportRead();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  const messages = data?.messages ?? [];
  const count = messages.length;
  const unread = data?.unread ?? 0;

  // Toujours sur le dernier message, à l'ouverture et à chaque nouveau.
  useLayoutEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "end" });
  }, [open, count]);

  // Ouvert : ce qui est affiché est lu.
  const { mutate: read } = markRead;
  useEffect(() => {
    if (open && unread > 0) read();
  }, [open, unread, read]);

  function submit(body = text) {
    const value = body.trim();
    if (!value || send.isPending) return;
    setText("");
    send.mutate(value, {
      onError: (err) => {
        setText(value);
        toast.error(apiErrorMessage(err, "Message non envoyé. Réessayez."));
      },
    });
    field.current?.focus();
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(12,22,18,.4)] backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            EV_PORTAL,
            "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-ev-surface text-ev-ink shadow-[-24px_0_60px_rgba(12,22,18,.18)] outline-none duration-300 sm:w-[440px] sm:rounded-l-[20px]",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          )}
        >
          <header className="flex items-center gap-3 border-b border-ev-line px-5 py-4">
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-ev-primary text-white">
              <Headset className="size-5" />
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-ev-surface bg-[#3DD68C]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <DialogPrimitive.Title className="m-0 text-base font-semibold">Support GiyaX</DialogPrimitive.Title>
              <span className="truncate text-[13px] text-ev-muted">Notre équipe vous répond ici, en général en quelques minutes.</span>
            </div>
            <DialogPrimitive.Close aria-label="Fermer" className="flex size-9 items-center justify-center rounded-[10px] text-ev-ink2 hover:bg-ev-soft">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-ev-soft px-4 py-5" aria-live="polite">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-ev-muted">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : isError ? (
              <p className="m-0 text-center text-sm text-ev-danger">Conversation indisponible pour le moment. Réessayez dans un instant.</p>
            ) : count === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-ev-mint text-ev-primary">
                  <Headset className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[17px] font-semibold">Comment pouvons-nous vous aider ?</span>
                  <span className="text-[13px] leading-relaxed text-ev-muted">Écrivez votre question : une personne de l&apos;équipe GiyaX vous répond dans cette conversation.</span>
                </div>
                <div className="flex flex-col gap-2 self-stretch">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => submit(s)} className="rounded-[12px] border border-ev-border bg-ev-surface px-3.5 py-2.5 text-left text-[13px] font-medium hover:border-ev-primary hover:bg-ev-selected">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
                {messages.map((m, i) => (
                  <Bubble key={m.id} message={m} previous={messages[i - 1]} next={messages[i + 1]} />
                ))}
              </ol>
            )}
            {data?.waiting && count > 0 && <p className="m-0 mt-4 text-center text-xs text-ev-muted">Message bien reçu. Vous serez prévenu dès qu&apos;une réponse arrive.</p>}
            <div ref={end} />
          </div>

          <form
            className="flex items-end gap-2 border-t border-ev-line bg-ev-surface px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="sr-only" htmlFor="support-message">
              Votre message
            </label>
            <textarea
              id="support-message"
              ref={field}
              rows={1}
              value={text}
              maxLength={SUPPORT_MESSAGE_MAX}
              placeholder="Écrivez votre message…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                // Entrée envoie, Maj+Entrée va à la ligne.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              className="max-h-36 min-h-11 flex-1 resize-none rounded-[14px] border border-ev-border bg-ev-soft px-3.5 py-2.5 text-[15px] leading-snug outline-none [field-sizing:content] placeholder:text-ev-muted focus:border-ev-primary"
            />
            <button type="submit" aria-label="Envoyer" disabled={!text.trim() || send.isPending} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ev-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40">
              <SendHorizontal className="size-[18px]" />
            </button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Bubble({ message, previous, next }: { message: SupportMessage; previous?: SupportMessage; next?: SupportMessage }) {
  const mine = message.from === "me";
  const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
  // Heure affichée sous le dernier message d'une série du même auteur.
  const lastOfGroup = !next || next.from !== message.from || dayKey(next.createdAt) !== dayKey(message.createdAt);
  return (
    <>
      {newDay && (
        <li className="my-2 text-center text-xs font-medium text-ev-muted">
          <span className="first-letter:uppercase">{dayLabel(message.createdAt)}</span>
        </li>
      )}
      <li className={cn("flex flex-col", mine ? "items-end" : "items-start", lastOfGroup && "mb-1.5")}>
        <span
          className={cn(
            "max-w-[82%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-[15px] leading-snug",
            mine ? "rounded-[18px] rounded-br-[6px] bg-ev-primary text-white" : "rounded-[18px] rounded-bl-[6px] border border-ev-border bg-ev-surface"
          )}
        >
          {message.body}
        </span>
        {lastOfGroup && (
          <span className="mt-1 px-1 text-[11px] text-ev-muted">
            {mine ? "" : "Support · "}
            {time(message.createdAt)}
          </span>
        )}
      </li>
    </>
  );
}
