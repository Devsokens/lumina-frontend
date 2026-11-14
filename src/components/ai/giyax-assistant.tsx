"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, History, Loader2, SquarePen, Trash2, X } from "lucide-react";
import { GiyaxAvatar, type GiyaxMood } from "@/components/ai/giyax-avatar";
import { TypewriterText } from "@/components/ai/typewriter";
import { fetchConversation, useAssistant, useAssistantConversations, useDeleteConversation, type ChatMessage, type ConversationSummary } from "@/hooks/useAi";
import { apiError } from "@/lib/api";
import { LEGAL } from "@/lib/legal";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";

// GiyaX AI : assistant de la page d'accueil (visiteurs) et du back-office
// (organisateurs et équipes). Historique des conversations : sur le serveur
// pour les membres connectés (retrouvé sur tous leurs appareils), dans ce
// navigateur pour les visiteurs. Seule la dernière réponse s'écrit à l'écran.

type Mode = "public" | "admin";
type Msg = ChatMessage & { id: string; local?: boolean };
type Session = { conversationId: string | null; messages: Msg[] };
type LocalConversation = { id: string; title: string; updatedAt: string; messages: ChatMessage[] };

const HISTORY_KEY = "giyax-ai:public:history";

function loadHistory(): LocalConversation[] {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as LocalConversation[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveHistory(list: LocalConversation[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    // stockage indisponible : historique non gardé
  }
}

function when(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 1) return "à l'instant";
  if (diff < 60) return `il y a ${Math.round(diff)} min`;
  if (diff < 24 * 60) return `il y a ${Math.round(diff / 60)} h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

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

// Conversation en cours (garde la page entre deux écrans).
function load(mode: Mode): Session {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORE(mode)) ?? "null") as Session | Msg[] | null;
    if (Array.isArray(raw)) return { conversationId: null, messages: raw.slice(-30) };
    return raw && Array.isArray(raw.messages) ? { conversationId: raw.conversationId ?? null, messages: raw.messages.slice(-30) } : { conversationId: null, messages: [] };
  } catch {
    return { conversationId: null, messages: [] };
  }
}

function save(mode: Mode, session: Session) {
  try {
    sessionStorage.setItem(STORE(mode), JSON.stringify({ ...session, messages: session.messages.slice(-30) }));
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

// --- L'assistante s'écarte toute seule ---
// Quand une fenêtre s'ouvre sur sa zone (création d'un événement, panneau du
// support, formulaire…), le bouton glisse de l'autre côté de l'écran, ou se
// range contre le bord si tout l'écran est pris, avec un petit mot. Il
// revient à sa place à la fermeture. Aucune fenêtre n'est jamais masquée.

const DODGE_LINES = [
  "Oups, je m'écarte pour ne pas vous gêner. Je suis juste à côté !",
  "Je vous laisse la place, je reste dans le coin.",
  "Hop, je me pousse ! Faites-moi signe si besoin.",
  "Je me fais toute petite, travaillez tranquille.",
  "Pardon, j'étais dans le passage. Je me range ici.",
];
const BACK_LINES = ["Me revoilà !", "C'est bon, je reprends ma place.", "Voilà, la voie est libre."];
const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

type Box = { left: number; top: number; right: number; bottom: number };
const hits = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

function useDodge(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  const [shift, setShift] = useState<{ x: number; y: number; tucked: boolean } | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const away = shift !== null;

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      // Position d'origine : offsetLeft/Top d'un élément fixe ignorent le déplacement en cours.
      const size = 60;
      const home: Box = { left: el.offsetLeft + el.offsetWidth - size, top: el.offsetTop + el.offsetHeight - size, right: el.offsetLeft + el.offsetWidth, bottom: el.offsetTop + el.offsetHeight };
      const gutter = window.innerWidth - home.right;
      const leftSpot: Box = { left: gutter, top: home.top, right: gutter + size, bottom: home.bottom };
      const boxes = [...document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]')]
        .filter((d) => !el.contains(d) && d.dataset.state !== "closed")
        .map((d) => d.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);
      const blocked = (spot: Box) => boxes.some((r) => hits(spot, r));
      // Même position qu'avant : pas de nouveau rendu.
      const move = (next: { x: number; y: number; tucked: boolean } | null) =>
        setShift((prev) => (prev?.x === next?.x && prev?.y === next?.y && prev?.tucked === next?.tucked ? prev : next));
      if (!blocked(home)) return move(null);
      const x = Math.round(leftSpot.left - home.left);
      if (!blocked(leftSpot)) return move({ x, y: 0, tucked: false });
      // Tout l'écran est pris : rangée contre le bord gauche, à mi-hauteur.
      move({ x: Math.round(x - gutter + 6), y: Math.round(window.innerHeight * 0.45 - home.top), tucked: true });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state", "role", "open"] });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, active]);

  // Un mot à chaque déplacement, effacé après quelques secondes.
  const wasAway = useRef(false);
  useEffect(() => {
    if (away === wasAway.current) return;
    wasAway.current = away;
    const show = setTimeout(() => setLine(pick(away ? DODGE_LINES : BACK_LINES)), 250);
    const hide = setTimeout(() => setLine(null), away ? 4200 : 2400);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [away]);

  return {
    away,
    line,
    style: shift ? { transform: `translate(${shift.x}px, ${shift.y}px) scale(${shift.tucked ? 0.82 : 1})` } : undefined,
  };
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [opening, setOpening] = useState<string | null>(null);
  const [local, setLocal] = useState<LocalConversation[]>([]);
  const remote = useAssistantConversations(mode === "admin" && open && view === "history");
  const remove = useDeleteConversation();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // La liste suit-elle le bas (nouveaux messages, texte qui s'écrit) ?
  const stick = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  // Conversation de la session (après l'hydratation).
  useEffect(() => {
    const saved = load(mode);
    if (!saved.messages.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(saved.messages);
    setConversationId(saved.conversationId);
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
    if (!messages.length) greet();
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

  // Nouveau message (envoyé, reçu, conversation rouverte) : on va en bas.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !open || view !== "chat") return;
    stick.current = true;
    el.scrollTo({ top: el.scrollHeight });
  }, [open, view, messages.length]);

  // Pendant que l'IA réfléchit ou écrit, on suit le texte, sauf si la
  // personne est remontée lire le début de la conversation.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !open || (!typing && !ask.isPending)) return;
    const id = window.setInterval(() => {
      if (stick.current) el.scrollTo({ top: el.scrollHeight });
    }, 120);
    return () => window.clearInterval(id);
  }, [open, typing, ask.isPending]);

  function onListScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    stick.current = bottom;
    if (bottom !== atBottom) setAtBottom(bottom);
  }

  function toBottom() {
    const el = listRef.current;
    stick.current = true;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  async function send(text: string) {
    const content = text.trim().slice(0, 1000);
    if (!content || ask.isPending) return;
    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { id: newId(), role: "user", content }];
    setMessages(next);
    save(mode, { conversationId, messages: next });
    try {
      const plain = next.filter((m) => !m.local).map(({ role, content: c }) => ({ role, content: c }));
      const res = await ask.mutateAsync({
        messages: plain,
        page: mode === "admin" ? pathname : undefined,
        ...(mode === "admin" && conversationId ? { conversationId } : {}),
      });
      const answer: Msg = { id: newId(), role: "assistant", content: res.reply };
      const withAnswer = [...next, answer];
      // Visiteurs : l'historique reste dans ce navigateur.
      const id = mode === "admin" ? res.conversationId : (conversationId ?? `l-${newId()}`);
      if (mode === "public" && id) {
        const entry: LocalConversation = {
          id,
          title: plain.find((m) => m.role === "user")?.content.slice(0, 80) ?? "Conversation",
          updatedAt: new Date().toISOString(),
          messages: [...plain, { role: "assistant" as const, content: res.reply }].slice(-40),
        };
        saveHistory([entry, ...loadHistory().filter((c) => c.id !== id)]);
      }
      setConversationId(id);
      setMessages(withAnswer);
      setTyping(answer.id);
      save(mode, { conversationId: id, messages: withAnswer });
    } catch (err) {
      setError(apiError(err, "Je n'arrive pas à répondre pour l'instant. Réessayez dans un instant."));
    }
  }

  function greet() {
    const g: Msg = { id: newId(), role: "assistant", content: GREETING[mode], local: true };
    setMessages([g]);
    setTyping(g.id);
  }

  function reset() {
    setTyping(null);
    setError(null);
    setConversationId(null);
    setView("chat");
    save(mode, { conversationId: null, messages: [] });
    greet();
  }

  function showHistory() {
    if (mode === "public") setLocal(loadHistory());
    setView((v) => (v === "history" ? "chat" : "history"));
  }

  // Rouvrir une conversation passée (sans animation d'écriture).
  async function reopen(id: string) {
    setError(null);
    try {
      let list: ChatMessage[] = [];
      if (mode === "admin") {
        setOpening(id);
        list = (await fetchConversation(id))?.messages ?? [];
      } else {
        list = loadHistory().find((c) => c.id === id)?.messages ?? [];
      }
      const msgs: Msg[] = list.map((m) => ({ id: newId(), role: m.role, content: m.content }));
      setMessages(msgs);
      setConversationId(id);
      setTyping(null);
      setView("chat");
      save(mode, { conversationId: id, messages: msgs });
    } catch (err) {
      setError(apiError(err, "Conversation introuvable."));
    } finally {
      setOpening(null);
    }
  }

  async function forget(id: string) {
    if (mode === "admin") await remove.mutateAsync(id).catch(() => undefined);
    else {
      const rest = loadHistory().filter((c) => c.id !== id);
      saveHistory(rest);
      setLocal(rest);
    }
    if (id === conversationId) reset();
  }

  const history: (ConversationSummary | (LocalConversation & { preview: string }))[] =
    mode === "admin"
      ? (remote.data ?? [])
      : local.map((c) => ({ ...c, preview: [...c.messages].reverse().find((m) => m.role === "assistant")?.content.replace(/\s+/g, " ").slice(0, 120) ?? "" }));

  const mood: GiyaxMood = ask.isPending ? "thinking" : typing ? "talking" : "idle";
  const onlyGreeting = messages.length <= 1;
  const lift = mode === "admin" ? "bottom-[92px] sm:bottom-6" : "bottom-5 sm:bottom-8";
  const launcher = useRef<HTMLDivElement>(null);
  const dodge = useDodge(launcher, !open);

  return (
    <>
      {/* Lanceur */}
      {!open && (
        <div
          ref={launcher}
          style={dodge.style}
          className={cn("fixed right-4 z-[55] flex items-end gap-2 transition-transform duration-500 ease-[cubic-bezier(.34,1.4,.64,1)] motion-reduce:transition-none sm:right-6", lift)}
        >
          {/* Petit mot quand elle se pousse, ou quand elle revient à sa place. */}
          {dodge.line && (
            <div
              role="status"
              className={cn(
                "giyax-pop absolute bottom-full mb-2 w-max max-w-[220px] rounded-2xl border border-border bg-background px-3.5 py-2.5 text-[13px] leading-snug text-foreground shadow-xl",
                dodge.away ? "left-0 rounded-bl-md" : "right-0 rounded-br-md"
              )}
            >
              {dodge.line}
            </div>
          )}
          {teaser && !dodge.away && !dodge.line && (
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
            data-tour="assistant"
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
                {view === "history" ? "Vos conversations" : ask.isPending ? "réfléchit…" : typing ? "écrit…" : "En ligne"}
              </span>
            </span>
            <button
              type="button"
              aria-label="Historique des conversations"
              aria-pressed={view === "history"}
              title="Historique"
              onClick={showHistory}
              className={cn("flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white", view === "history" && "bg-white/15 text-white")}
            >
              <History className="size-4" />
            </button>
            <button type="button" aria-label="Nouvelle conversation" title="Nouvelle conversation" onClick={reset} className="flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
              <SquarePen className="size-4" />
            </button>
            <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
              <X className="size-5" />
            </button>
          </header>

          {view === "history" && (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/30 [scrollbar-width:thin]">
              <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
                <button type="button" onClick={() => setView("chat")} className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4" /> Retour
                </button>
                <button type="button" onClick={reset} className="flex h-8 items-center gap-1.5 rounded-full bg-[#0C4A3A] px-3 text-[13px] font-semibold text-white">
                  <SquarePen className="size-3.5" /> Nouvelle conversation
                </button>
              </div>
              <h3 className="m-0 px-4 pb-2 pt-1 text-[15px] font-semibold">Vos conversations</h3>
              {mode === "admin" && remote.isLoading ? (
                <div className="flex flex-col gap-2 px-4">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-[62px] animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-[13px] text-muted-foreground">
                  <GiyaxAvatar size={52} />
                  Aucune conversation pour l&apos;instant. Posez votre première question !
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 px-4 pb-4">
                  {history.map((c) => (
                    <li key={c.id} className={cn("group relative rounded-xl border bg-background transition-colors hover:border-[#0C4A3A]/40", c.id === conversationId ? "border-[#0C4A3A]/50" : "border-border")}>
                      <button type="button" onClick={() => void reopen(c.id)} className="flex w-full flex-col gap-0.5 px-3.5 py-2.5 pr-11 text-left">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-semibold">{c.title}</span>
                          {opening === c.id && <Loader2 className="size-3.5 shrink-0 animate-spin" />}
                        </span>
                        {c.preview && <span className="line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">{c.preview}</span>}
                        <span className="text-[11px] text-muted-foreground/80">{when(c.updatedAt)}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Supprimer « ${c.title} »`}
                        onClick={() => void forget(c.id)}
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg text-muted-foreground opacity-70 hover:bg-muted hover:text-red-500 hover:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="m-0 mt-auto px-4 pb-3 text-center text-[11px] text-muted-foreground">
                {mode === "admin" ? "Vos conversations sont retrouvées sur tous vos appareils." : "Vos conversations restent sur ce navigateur."}
              </p>
            </div>
          )}

          {view === "chat" && !atBottom && (
            // Remonté lire : bouton pour revenir aux derniers messages.
            <div className="pointer-events-none relative z-10 h-0">
              <button
                type="button"
                onClick={toBottom}
                aria-label="Aller aux derniers messages"
                className="giyax-pop pointer-events-auto absolute left-1/2 top-2 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground shadow-lg"
              >
                <ArrowDown className="size-3.5" /> Aller en bas
              </button>
            </div>
          )}
          <div ref={listRef} onScroll={onListScroll} aria-live="polite" className={cn("min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-muted/30 px-4 py-4 [scrollbar-width:thin]", view === "history" ? "hidden" : "flex")}>
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
            {/* Visiteurs uniquement : la route publique est protégée contre les robots. */}
            {mode === "public" && <TurnstileWidget className="pb-2" />}
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
