"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, RotateCcw, X } from "lucide-react";
import { GiyaxAvatar, type GiyaxMood } from "@/components/ai/giyax-avatar";
import { TypewriterText } from "@/components/ai/typewriter";
import { useAssistant, type ChatMessage } from "@/hooks/useAi";
import { apiError } from "@/lib/api";
import { LEGAL } from "@/lib/legal";
import { cn } from "@/lib/utils";

// GiyaX AI : assistant de la page d'accueil (visiteurs) et du back-office
// (organisateurs et équipes). Conversation gardée le temps de la session du
// navigateur ; seule la dernière réponse s'écrit à l'écran.

type Mode = "public" | "admin";
type Msg = ChatMessage & { id: string; local?: boolean };

const GREETING: Record<Mode, string> = {
  public: "Bonjour, je suis GiyaX AI. Je peux vous présenter GiyaX, vous expliquer comment vendre vos billets ou gérer votre activité, et répondre à vos questions.",
  admin:
    "Bonjour, je suis GiyaX AI. Une question sur l'application, un souci, ou besoin d'un avis pour une décision (prix des billets, communication, organisation) ? Je suis là.",
};

const SUGGESTIONS: Record<Mode, string[]> = {
  public: ["Qu'est-ce que GiyaX ?", "Comment vendre des billets en ligne ?", "Combien ça coûte ?", "Comment contacter le support ?"],
  admin: ["Comment créer un événement ?", "Configurer mes versements Mobile Money", "Connecter mon Gmail", "Aide-moi à fixer le prix de mes billets"],
};

const STORE = (mode: Mode) => `giyax-ai:${mode}`;
const newId = () => Math.random().toString(36).slice(2, 10);

function load(mode: Mode): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORE(mode));
    const list = raw ? (JSON.parse(raw) as Msg[]) : [];
    return Array.isArray(list) ? list.slice(-30) : [];
  } catch {
    return [];
  }
}

function save(mode: Mode, list: Msg[]) {
  try {
    sessionStorage.setItem(STORE(mode), JSON.stringify(list.slice(-30)));
  } catch {
    // stockage indisponible (navigation privée) : conversation non gardée
  }
}

// Mise en forme légère et sûre : paragraphes, listes, **gras**, e-mails et
// pages de GiyaX cliquables (aucun HTML injecté).
const LINK = /(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\/(?:signup|confidentialite|conditions|pricing)\b)/g;

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(part))
          return (
            <a key={i} href={`mailto:${part}`} className="font-medium underline underline-offset-2">
              {part}
            </a>
          );
        if (/^\/(signup|confidentialite|conditions|pricing)$/.test(part))
          return (
            <a key={i} href={part} className="font-medium underline underline-offset-2">
              {part}
            </a>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function Rich({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, b) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const item = /^\s*(?:[-•*]|\d+[.)])\s+/;
        if (lines.length && lines.every((l) => item.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]);
          const List = ordered ? "ol" : "ul";
          return (
            <List key={b} className={cn("my-1.5 space-y-1 pl-5", ordered ? "list-decimal" : "list-disc")}>
              {lines.map((l, i) => (
                <li key={i}>
                  <Inline text={l.replace(item, "")} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={b} className="my-1.5 first:mt-0 last:mb-0">
            {lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                <Inline text={l} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

export function GiyaxAssistant({ mode }: { mode: Mode }) {
  const pathname = usePathname();
  const ask = useAssistant(mode);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [teaser, setTeaser] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Conversation de la session (après l'hydratation).
  useEffect(() => {
    const saved = load(mode);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved.length) setMessages(saved);
  }, [mode]);

  // Bulle d'accueil une fois par session, quelques secondes après l'arrivée.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(`${STORE(mode)}:teaser`) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    const t = window.setTimeout(() => setTeaser(true), 4500);
    return () => window.clearTimeout(t);
  }, [mode]);

  function hideTeaser() {
    setTeaser(false);
    try {
      sessionStorage.setItem(`${STORE(mode)}:teaser`, "1");
    } catch {
      // ignoré
    }
  }

  function openPanel() {
    hideTeaser();
    setOpen(true);
    if (!messages.length) {
      const greet: Msg = { id: newId(), role: "assistant", content: GREETING[mode], local: true };
      setMessages([greet]);
      setTyping(greet.id);
    }
  }

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Défilement vers le bas pendant que l'IA écrit.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !open) return;
    const id = window.setInterval(() => el.scrollTo({ top: el.scrollHeight }), 120);
    el.scrollTo({ top: el.scrollHeight });
    return () => window.clearInterval(id);
  }, [open, messages.length, ask.isPending, typing]);

  async function send(text: string) {
    const content = text.trim().slice(0, 1000);
    if (!content || ask.isPending) return;
    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { id: newId(), role: "user", content }];
    setMessages(next);
    save(mode, next);
    try {
      const reply = await ask.mutateAsync({
        messages: next.filter((m) => !m.local).map(({ role, content: c }) => ({ role, content: c })),
        page: mode === "admin" ? pathname : undefined,
      });
      const answer: Msg = { id: newId(), role: "assistant", content: reply };
      const withAnswer = [...next, answer];
      setMessages(withAnswer);
      setTyping(answer.id);
      save(mode, withAnswer);
    } catch (err) {
      setError(apiError(err, "Je n'arrive pas à répondre pour l'instant. Réessayez dans un instant."));
    }
  }

  function reset() {
    setMessages([]);
    setTyping(null);
    setError(null);
    save(mode, []);
    const greet: Msg = { id: newId(), role: "assistant", content: GREETING[mode], local: true };
    setMessages([greet]);
    setTyping(greet.id);
  }

  const mood: GiyaxMood = ask.isPending ? "thinking" : typing ? "talking" : "idle";
  const onlyGreeting = messages.length <= 1;
  const lift = mode === "admin" ? "bottom-[92px] sm:bottom-6" : "bottom-5 sm:bottom-8";

  return (
    <>
      {/* Lanceur */}
      {!open && (
        <div className={cn("fixed right-4 z-[55] flex items-end gap-2 sm:right-6", lift)}>
          {teaser && (
            <div className="giyax-pop relative mb-2 max-w-[230px] rounded-2xl rounded-br-md border border-border bg-background px-3.5 py-2.5 text-[13px] leading-snug text-foreground shadow-xl">
              <button type="button" aria-label="Masquer" onClick={hideTeaser} className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow">
                <X className="size-3.5" />
              </button>
              <strong className="font-semibold">GiyaX AI</strong> : une question ? Je vous réponds tout de suite.
            </div>
          )}
          <button
            type="button"
            onClick={openPanel}
            aria-label="Ouvrir GiyaX AI, l'assistant"
            className="group relative flex size-[60px] items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(11,59,46,.28)] ring-1 ring-black/5 transition-transform hover:scale-105 dark:bg-[#10221B]"
          >
            <GiyaxAvatar size={50} halo />
            <span className="absolute right-0.5 top-0.5 size-3 rounded-full border-2 border-white bg-[#3DD68C] dark:border-[#10221B]" />
          </button>
        </div>
      )}

      {/* Fenêtre */}
      {open && (
        <section
          role="dialog"
          aria-label="GiyaX AI, l'assistant"
          className="giyax-pop fixed inset-0 z-[70] flex flex-col overflow-hidden bg-background text-foreground sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100dvh-48px))] sm:w-[400px] sm:rounded-3xl sm:border sm:border-border sm:shadow-[0_24px_70px_rgba(11,59,46,.28)]"
        >
          <header className="flex items-center gap-3 bg-gradient-to-br from-[#0F5E46] to-[#0B3B2E] px-4 pb-3.5 pt-[max(env(safe-area-inset-top),14px)] text-white">
            <span className="rounded-full bg-white/95 p-1">
              <GiyaxAvatar size={40} mood={mood} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="text-[15px] font-semibold">GiyaX AI</span>
              <span className="flex items-center gap-1.5 text-xs text-white/75">
                <span className={cn("size-1.5 rounded-full", ask.isPending || typing ? "bg-[#F5B83D]" : "bg-[#3DD68C]")} />
                {ask.isPending ? "réfléchit…" : typing ? "écrit…" : "En ligne"}
              </span>
            </span>
            <button type="button" aria-label="Nouvelle conversation" title="Nouvelle conversation" onClick={reset} className="flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
              <RotateCcw className="size-4" />
            </button>
            <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
              <X className="size-5" />
            </button>
          </header>

          <div ref={listRef} aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-muted/30 px-4 py-4 [scrollbar-width:thin]">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="giyax-pop ml-auto max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-[#0C4A3A] px-3.5 py-2.5 text-[14px] leading-relaxed text-white">
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="giyax-pop flex max-w-[92%] items-end gap-2">
                  <GiyaxAvatar size={26} mood={typing === m.id ? "talking" : "idle"} className="mb-0.5" />
                  <div className="min-w-0 rounded-2xl rounded-bl-md border border-border bg-background px-3.5 py-2.5 text-[14px] leading-relaxed">
                    {typing === m.id ? (
                      <TypewriterText text={m.content} render={(s) => <Rich text={s} />} onDone={() => setTyping((t) => (t === m.id ? null : t))} />
                    ) : (
                      <Rich text={m.content} />
                    )}
                  </div>
                </div>
              )
            )}

            {ask.isPending && (
              <div className="flex items-end gap-2">
                <GiyaxAvatar size={26} mood="thinking" />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-background px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="giyax-dot size-1.5 rounded-full bg-[#0C4A3A]" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-[13px] leading-relaxed">
                {error}{" "}
                <button type="button" className="font-semibold underline underline-offset-2" onClick={() => void send(messages.filter((m) => m.role === "user").at(-1)?.content ?? "")}>
                  Réessayer
                </button>
              </div>
            )}

            {onlyGreeting && !ask.isPending && !typing && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS[mode].map((s) => (
                  <button key={s} type="button" onClick={() => void send(s)} className="rounded-full border border-[#0C4A3A]/25 bg-background px-3 py-1.5 text-[13px] text-[#0C4A3A] transition-colors hover:bg-[#0C4A3A] hover:text-white dark:text-[#9FD9C2]">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-border bg-background px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-muted/40 py-1.5 pl-3.5 pr-1.5 focus-within:border-[#0C4A3A]/60">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={1000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Écrivez votre question…"
                aria-label="Votre question à GiyaX AI"
                className="max-h-32 min-h-[36px] flex-1 resize-none border-0 bg-transparent py-2 text-[14px] outline-none placeholder:text-muted-foreground [field-sizing:content]"
              />
              <button type="submit" aria-label="Envoyer" disabled={!input.trim() || ask.isPending} className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0C4A3A] text-white transition-opacity disabled:opacity-40">
                <ArrowUp className="size-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-center text-[11px] text-muted-foreground">
              GiyaX AI peut se tromper. Support : <Mail />
            </p>
          </form>
        </section>
      )}
    </>
  );
}

function Mail(): ReactNode {
  return (
    <a href={`mailto:${LEGAL.email}`} className="underline underline-offset-2">
      {LEGAL.email}
    </a>
  );
}
