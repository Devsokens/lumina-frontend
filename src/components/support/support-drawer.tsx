"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { toast } from "sonner";
import { Check, CheckCheck, Loader2, SendHorizontal, X } from "lucide-react";
import { EV_PORTAL } from "@/components/events/ev-ui";
import { SUPPORT_MESSAGE_MAX, useMarkSupportRead, useSendSupportMessage, useSupport, type SupportMessage } from "@/hooks/useSupport";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/lib/events";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";

// Panneau « Support » : une conversation avec des personnes de l'équipe
// GiyaX, qui glisse depuis la droite. Pensé comme une messagerie entre
// humains (accueil par le prénom, « Envoyé / Vu », un conseiller qui suit la
// demande), pas comme un robot : aucune réponse automatique, aucune
// suggestion toute faite. L'organisateur parle à « l'équipe GiyaX » ; qui lui
// répond côté plateforme ne lui est jamais montré.

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

function TeamAvatar({ size }: { size: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-ev-border" style={{ width: size, height: size }}>
      <Image src="/brand/giyax-favicon-192.png" alt="" width={size} height={size} className="size-[70%] object-contain" />
    </span>
  );
}

export function SupportDrawer() {
  const open = useShellStore((s) => s.supportOpen);
  const setOpen = useShellStore((s) => s.setSupportOpen);
  const { user } = useAuth();
  const { data, isLoading, isError } = useSupport(open);
  const send = useSendSupportMessage();
  const markRead = useMarkSupportRead();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  const messages = data?.messages ?? [];
  const count = messages.length;
  const unread = data?.unread ?? 0;
  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? "";
  // Dernier message envoyé par l'organisateur : il porte « Envoyé » ou « Vu ».
  const lastMine = [...messages].reverse().find((m) => m.from === "me");
  const lastIsMine = count > 0 && messages[count - 1].from === "me";
  const seen = !!lastMine && !!data?.seenAt && new Date(data.seenAt).getTime() >= new Date(lastMine.createdAt).getTime();

  const status = data?.handled
    ? data.waiting
      ? "Un conseiller s'occupe de votre demande"
      : "Un conseiller suit cette conversation"
    : data?.waiting
      ? "Message reçu, un conseiller arrive"
      : "Des personnes de l'équipe vous répondent ici";

  // Toujours sur le dernier message, à l'ouverture et à chaque nouveau.
  useLayoutEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "end" });
  }, [open, count]);

  // Ouvert : ce qui est affiché est lu.
  const { mutate: read } = markRead;
  useEffect(() => {
    if (open && unread > 0) read();
  }, [open, unread, read]);

  function submit() {
    const value = text.trim();
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
            <span className="relative">
              <TeamAvatar size={44} />
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-ev-surface bg-[#3DD68C]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <DialogPrimitive.Title className="m-0 text-base font-semibold">L&apos;équipe GiyaX</DialogPrimitive.Title>
              <span className="truncate text-[13px] text-ev-muted" aria-live="polite">
                {status}
              </span>
            </div>
            <DialogPrimitive.Close aria-label="Fermer" className="flex size-9 items-center justify-center rounded-[10px] text-ev-ink2 hover:bg-ev-soft">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#F3F1EA] px-4 py-5 dark:bg-ev-soft">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-ev-muted">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : isError ? (
              <p className="m-0 text-center text-sm text-ev-danger">Conversation indisponible pour le moment. Réessayez dans un instant.</p>
            ) : (
              <ol className="m-0 flex list-none flex-col gap-1 p-0">
                {/* Mot d'accueil de l'équipe : toujours en tête de conversation. */}
                <li className="mb-3 flex items-end gap-2">
                  <TeamAvatar size={28} />
                  <span className="max-w-[82%] rounded-[18px] rounded-bl-[6px] bg-ev-surface px-3.5 py-2.5 text-[15px] leading-snug shadow-[0_1px_1px_rgba(22,33,28,.06)]">
                    Bonjour{firstName ? ` ${firstName}` : ""}, ici l&apos;équipe GiyaX. Dites-nous ce qui vous bloque, même en deux mots : une vraie personne vous lit et vous répond ici.
                  </span>
                </li>
                {messages.map((m, i) => (
                  <Bubble key={m.id} message={m} previous={messages[i - 1]} next={messages[i + 1]} receipt={m.id === lastMine?.id && lastIsMine ? (m.id.startsWith("local-") ? "sending" : seen ? "seen" : "sent") : null} />
                ))}
              </ol>
            )}
            {lastIsMine && !isLoading && (
              <p className="m-0 mt-5 text-center text-xs leading-relaxed text-ev-muted">
                Vous pouvez fermer cette fenêtre et continuer à travailler :
                <br />
                nous vous prévenons dès qu&apos;on vous répond.
              </p>
            )}
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
              placeholder="Votre message…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                // Entrée envoie, Maj+Entrée va à la ligne.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              className="max-h-36 min-h-11 flex-1 resize-none rounded-[22px] border border-ev-border bg-ev-soft px-4 py-2.5 text-[15px] leading-snug outline-none [field-sizing:content] placeholder:text-ev-muted focus:border-ev-primary"
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

function Bubble({ message, previous, next, receipt }: { message: SupportMessage; previous?: SupportMessage; next?: SupportMessage; receipt: "sending" | "sent" | "seen" | null }) {
  const mine = message.from === "me";
  const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
  // Avatar et heure sur le dernier message d'une série du même auteur.
  const lastOfGroup = !next || next.from !== message.from || dayKey(next.createdAt) !== dayKey(message.createdAt);
  const firstOfGroup = newDay || previous?.from !== message.from;
  return (
    <>
      {newDay && (
        <li className="my-2 self-center rounded-full bg-ev-surface/80 px-3 py-1 text-[11px] font-medium text-ev-muted first-letter:uppercase">{dayLabel(message.createdAt)}</li>
      )}
      <li className={cn("flex flex-col", mine ? "items-end" : "items-start", lastOfGroup && "mb-2.5")}>
        {!mine && firstOfGroup && <span className="mb-1 ml-9 text-[11px] font-medium text-ev-muted">Conseiller GiyaX</span>}
        <span className={cn("flex max-w-[86%] items-end gap-2", mine && "flex-row-reverse")}>
          {!mine && (lastOfGroup ? <TeamAvatar size={28} /> : <span className="w-7 shrink-0" />)}
          <span
            className={cn(
              "whitespace-pre-wrap break-words px-3.5 py-2.5 text-[15px] leading-snug shadow-[0_1px_1px_rgba(22,33,28,.06)]",
              mine ? "rounded-[18px] bg-[#DCF3E7] text-[#12241C] dark:bg-ev-primary dark:text-white" : "rounded-[18px] bg-ev-surface",
              lastOfGroup && (mine ? "rounded-br-[6px]" : "rounded-bl-[6px]")
            )}
          >
            {message.body}
          </span>
        </span>
        {lastOfGroup && (
          <span className={cn("mt-1 flex items-center gap-1 text-[11px] text-ev-muted", mine ? "pr-1" : "pl-10")}>
            {time(message.createdAt)}
            {receipt === "sending" && <span>· Envoi…</span>}
            {receipt === "sent" && (
              <>
                <Check className="size-3.5" /> Envoyé
              </>
            )}
            {receipt === "seen" && (
              <span className="flex items-center gap-1 font-medium text-ev-link">
                <CheckCheck className="size-3.5" /> Vu
              </span>
            )}
          </span>
        )}
      </li>
    </>
  );
}
