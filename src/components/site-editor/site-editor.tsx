"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  Monitor,
  Palette,
  Pencil,
  Redo2,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { EV_PORTAL } from "@/components/events/ev-ui";
import { SiteEventPage, SiteFrame, SiteHome } from "@/components/event-site/event-site";
import { buildSite, toSiteEvent } from "@/components/event-site/site-data";
import { FIELDS, SECTION_LABEL, countChanges, initialContent, isTextField, type SectionKey, type TextField } from "@/components/site-editor/editor-model";
import { MediaPanel, PagesPanel, SectionsPanel, ThemePanel } from "@/components/site-editor/editor-panels";
import { Inspector, type AiProposal, type Selection } from "@/components/site-editor/editor-inspector";
import { useSaveShowcase } from "@/hooks/useAdmin";
import { aiError, useAiText } from "@/hooks/useAi";
import { usePastEvents, usePublicEvents } from "@/hooks/usePublicEvents";
import { lookOf } from "@/lib/event-site-theme";
import { eventSiteFontVariables } from "@/lib/event-site-fonts";
import { toShowcasePayload } from "@/lib/showcase-payload";
import { apiError } from "@/lib/api";
import { publicSiteLabel, publicSiteUrl } from "@/lib/tenant-url";
import type { ShowcaseContent } from "@/stores/useShowcaseStore";
import type { Tenant } from "@/types/api";
import { cn } from "@/lib/utils";

// Éditeur du site vitrine (refonte Claude Design 2026-11, écrans 19 et 20) :
// plein écran, aperçu exact du site public (mêmes modèles, mêmes données),
// sélection au clic, IA, annuler / rétablir, publication explicite.

type Tool = "sections" | "theme" | "pages" | "media";
type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTH: Record<Device, number> = { desktop: 1440, tablet: 820, mobile: 390 };

type Rect = { top: number; left: number; width: number; height: number };

type History = { past: ShowcaseContent[]; present: ShowcaseContent; future: ShowcaseContent[] };

function useHistory(initial: ShowcaseContent) {
  const [h, setH] = useState<History>({ past: [], present: initial, future: [] });
  const last = useRef<{ key: string; at: number } | null>(null);

  // Une saisie continue dans le même champ = une seule étape d'annulation.
  const update = useCallback((patch: Partial<ShowcaseContent>, key = Object.keys(patch).join(",")) => {
    const now = Date.now();
    const merge = !!last.current && last.current.key === key && now - last.current.at < 900;
    last.current = { key, at: now };
    setH((s) => ({ past: merge ? s.past : [...s.past.slice(-60), s.present], present: { ...s.present, ...patch }, future: [] }));
  }, []);
  const undo = () => {
    last.current = null;
    setH((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s));
  };
  const redo = () => {
    last.current = null;
    setH((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s));
  };
  return { content: h.present, update, undo, redo, canUndo: h.past.length > 0, canRedo: h.future.length > 0 };
}

const RAIL: { key: Tool; label: string; icon: typeof Layers }[] = [
  { key: "sections", label: "Sections", icon: Layers },
  { key: "theme", label: "Thème", icon: Palette },
  { key: "pages", label: "Pages", icon: FileText },
  { key: "media", label: "Médias", icon: ImageIcon },
];

export function SiteEditor({ tenant }: { tenant: Tenant }) {
  const [start] = useState(() => initialContent(tenant));
  const { content, update, undo, redo, canUndo, canRedo } = useHistory(start.content);
  const [published, setPublished] = useState<ShowcaseContent | null>(start.saved ? start.content : null);
  const save = useSaveShowcase();
  const { data: publicEvents } = usePublicEvents(tenant.slug);
  const { data: pastEvents } = usePastEvents(tenant.slug);

  const [tool, setTool] = useState<Tool>("sections");
  // null = automatique (mobile si l'aperçu est étroit), sinon choix de l'utilisateur.
  const [device, setDevice] = useState<Device | null>(null);
  const [page, setPage] = useState("home");
  const [selection, setSelection] = useState<Selection>({ section: null, field: null });
  const [proposal, setProposal] = useState<AiProposal>(null);
  const [sheet, setSheet] = useState<"panel" | "inspector" | null>(null);

  const look = lookOf(content);
  const site = useMemo(() => buildSite(tenant, content, publicEvents ?? [], true, pastEvents ?? []), [tenant, content, publicEvents, pastEvents]);
  const pageEvent = page === "home" ? null : (site.events.find((e) => e.id === page) ?? (publicEvents ?? []).map(toSiteEvent).find((e) => e.id === page) ?? null);
  const changes = published ? countChanges(content, published) : null;

  useEffect(() => {
    if (!changes && published) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changes, published]);

  async function publish() {
    try {
      await save.mutateAsync(toShowcasePayload(content));
      setPublished(content);
      toast.success("Site publié : vos visiteurs voient la nouvelle version.");
    } catch (err) {
      toast.error(apiError(err, "Publication impossible, réessayez."));
    }
  }

  function select(s: Selection) {
    setSelection(s);
    if (typeof window !== "undefined" && window.innerWidth < 1024 && (s.field || s.section)) setSheet("inspector");
  }

  const panel =
    tool === "sections" ? (
      <SectionsPanel
        content={content}
        update={update}
        selected={selection.section}
        page={page}
        onSelect={(s) => {
          select({ section: s, field: null });
          scrollToSection.current?.(s);
        }}
      />
    ) : tool === "theme" ? (
      <ThemePanel content={content} update={update} look={look} />
    ) : tool === "pages" ? (
      <PagesPanel
        events={site.events}
        page={page}
        onPage={(p) => {
          setPage(p);
          setSelection({ section: null, field: null });
        }}
      />
    ) : (
      <MediaPanel content={content} update={update} />
    );

  const inspector = (
    <Inspector
      selection={selection}
      setSelection={select}
      content={content}
      update={update}
      events={site.events}
      pageEvent={pageEvent}
      proposal={proposal}
      setProposal={setProposal}
    />
  );

  const scrollToSection = useRef<((s: SectionKey) => void) | null>(null);

  return (
    <div className={cn(eventSiteFontVariables, "fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#EFEDE7] text-ev-ink dark:bg-ev-bg")}>
      {/* Barre du haut */}
      <header className="flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-ev-border bg-ev-surface px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/event" aria-label="Retour au tableau de bord" className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-ev-border text-ev-ink2 hover:bg-ev-soft">
            <ChevronLeft className="size-4" />
          </Link>
          <div className="flex min-w-0 flex-col leading-[1.2]">
            <span className="truncate text-sm font-semibold">Site vitrine · {content.orgName || tenant.name}</span>
            <span className="flex items-center gap-1.5 truncate text-xs text-ev-muted">
              <span className="size-1.5 shrink-0 rounded-full bg-ev-dot" />
              En ligne · {publicSiteLabel(tenant.slug)}
            </span>
          </div>
          <span className="mx-1 hidden h-7 w-px bg-ev-border md:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="hidden h-9 items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium md:flex">
                <FileText className="size-4" />
                <span className="max-w-[180px] truncate">Page : {pageEvent ? pageEvent.title : "Accueil"}</span>
                <ChevronDown className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={cn(EV_PORTAL, "z-[70] w-72 rounded-xl")}>
              <DropdownMenuItem onClick={() => setPage("home")}>Accueil</DropdownMenuItem>
              {site.events.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-ev-muted">Pages d&apos;événement</DropdownMenuLabel>
                  {site.events.map((e) => (
                    <DropdownMenuItem key={e.id} onClick={() => setPage(e.id)}>
                      <span className="truncate">{e.title}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div role="radiogroup" aria-label="Appareil" className="hidden rounded-[10px] bg-[#F1EFE9] p-[3px] lg:flex dark:bg-ev-line">
          {(
            [
              ["desktop", "Bureau", Monitor],
              ["tablet", "Tablette", Tablet],
              ["mobile", "Mobile", Smartphone],
            ] as const
          ).map(([d, label, Icon]) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={(device ?? "desktop") === d}
              aria-label={label}
              onClick={() => setDevice(d)}
              className={cn("flex h-[30px] w-10 items-center justify-center rounded-[8px]", (device ?? "desktop") === d ? "bg-ev-surface shadow-[0_1px_2px_rgba(0,0,0,.08)]" : "text-ev-muted")}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button type="button" aria-label="Annuler" onClick={undo} disabled={!canUndo} className="hidden size-9 items-center justify-center rounded-[10px] text-ev-ink2 hover:bg-ev-soft disabled:text-[#A8A497] sm:flex">
            <Undo2 className="size-4" />
          </button>
          <button type="button" aria-label="Rétablir" onClick={redo} disabled={!canRedo} className="hidden size-9 items-center justify-center rounded-[10px] text-ev-ink2 hover:bg-ev-soft disabled:text-[#A8A497] sm:flex">
            <Redo2 className="size-4" />
          </button>
          <span className="mx-1.5 hidden text-xs text-ev-muted xl:inline">
            {changes === null ? "Jamais publié" : changes === 0 ? "Tout est publié" : `${changes} modification${changes > 1 ? "s" : ""} non publiée${changes > 1 ? "s" : ""}`}
          </span>
          <a
            href={publicSiteUrl(tenant.slug, pageEvent ? `/events/${pageEvent.id}` : "")}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center rounded-[10px] border border-ev-border bg-ev-surface px-3.5 text-[13px] font-medium hover:bg-ev-soft sm:flex"
          >
            Aperçu
          </a>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={save.isPending || changes === 0}
            className="flex h-9 items-center gap-2 rounded-[10px] bg-ev-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-ev-primary-hover disabled:opacity-50"
          >
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Publier
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Outils */}
        <nav aria-label="Outils" className="hidden w-14 shrink-0 flex-col items-center gap-1.5 border-r border-ev-border bg-ev-surface py-3 lg:flex">
          {RAIL.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              title={label}
              aria-current={tool === key ? "page" : undefined}
              onClick={() => setTool(key)}
              className={cn("flex size-10 items-center justify-center rounded-[10px]", tool === key ? "bg-ev-mint text-ev-primary" : "text-ev-muted hover:bg-ev-soft")}
            >
              <Icon className="size-[18px]" />
            </button>
          ))}
          <span className="flex-1" />
          <Link href="/admin/event/settings" aria-label="Réglages du site" title="Paramètres" className="flex size-10 items-center justify-center rounded-[10px] text-ev-muted hover:bg-ev-soft">
            <Settings className="size-[18px]" />
          </Link>
        </nav>

        <aside aria-label="Panneau" className="hidden w-[264px] shrink-0 overflow-y-auto border-r border-ev-border bg-ev-surface lg:block">
          {panel}
        </aside>

        <Canvas
          tenant={tenant}
          device={device}
          selection={selection}
          onSelect={select}
          content={content}
          proposal={setProposal}
          registerScroll={(fn) => (scrollToSection.current = fn)}
        >
          <SiteFrame look={look} className="min-h-full">
            {pageEvent ? <SiteEventPage site={site} event={pageEvent} look={look} preview /> : <SiteHome site={site} look={look} preview />}
          </SiteFrame>
        </Canvas>

        <aside aria-label="Propriétés de l'élément" className="hidden w-[320px] shrink-0 flex-col overflow-hidden border-l border-ev-border bg-ev-surface lg:flex">
          {inspector}
        </aside>
      </div>

      {/* Téléphone / tablette : outils en bas, panneaux en tiroir */}
      <nav aria-label="Outils" className="flex shrink-0 items-center justify-around border-t border-ev-border bg-ev-surface px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 lg:hidden">
        {RAIL.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTool(key);
              setSheet("panel");
            }}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] text-ev-muted"
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
        <button type="button" onClick={() => setSheet("inspector")} className="flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] text-ev-primary">
          <Pencil className="size-5" />
          Modifier
        </button>
      </nav>
      <Sheet open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side={sheet === "inspector" ? "right" : "left"} className={cn(EV_PORTAL, "z-[70] w-[88vw] max-w-[360px] gap-0 overflow-y-auto bg-ev-surface p-0 text-ev-ink")}>
          <SheetTitle className="sr-only">{sheet === "inspector" ? "Propriétés" : RAIL.find((r) => r.key === tool)?.label}</SheetTitle>
          <div className="flex h-full flex-col pt-8">{sheet === "inspector" ? inspector : panel}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------- Aperçu ----------

function Canvas({
  tenant,
  device,
  selection,
  onSelect,
  content,
  proposal,
  registerScroll,
  children,
}: {
  tenant: Tenant;
  device: Device | null;
  selection: Selection;
  onSelect: (s: Selection) => void;
  content: ShowcaseContent;
  proposal: (p: AiProposal) => void;
  registerScroll: (fn: (s: SectionKey) => void) => void;
  children: React.ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const siteEl = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(800);
  const [rects, setRects] = useState<{ section: Rect | null; field: Rect | null; hover: Rect | null }>({ section: null, field: null, hover: null });
  const width = DEVICE_WIDTH[device ?? (avail < 640 ? "mobile" : "desktop")];
  const scale = Math.min(1, avail / width);

  // Largeur disponible pour l'aperçu (référence de rappel : mesurée dès que
  // l'élément existe, observée tant qu'il est affiché).
  const areaRef = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const read = () => setAvail(Math.max(280, el.clientWidth - 40));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    window.addEventListener("resize", read);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", read);
    };
  }, []);

  // Position d'un élément du site dans le cadre défilant (pixels visibles).
  const rectOf = useCallback((el: Element | null): Rect | null => {
    const f = frame.current;
    if (!el || !f) return null;
    const a = el.getBoundingClientRect();
    const b = f.getBoundingClientRect();
    return { top: a.top - b.top + f.scrollTop, left: a.left - b.left + f.scrollLeft, width: a.width, height: a.height };
  }, []);

  const measure = useCallback(() => {
    const root = siteEl.current;
    if (!root) return;
    const sec = selection.section ? root.querySelector(`[data-section="${selection.section}"]`) : null;
    const fld = selection.field ? root.querySelector(`[data-edit="${selection.field}"]`) : null;
    setRects((r) => ({ ...r, section: rectOf(sec), field: rectOf(fld) }));
  }, [selection, rectOf]);

  useLayoutEffect(() => {
    measure();
  }, [measure, content, device, scale]);

  useEffect(() => {
    const root = siteEl.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    registerScroll((s) => {
      const el = siteEl.current?.querySelector(`[data-section="${s}"]`);
      const f = frame.current;
      const r = rectOf(el ?? null);
      if (f && r) f.scrollTo({ top: Math.max(0, r.top - 24), behavior: "smooth" });
    });
  }, [registerScroll, rectOf]);

  function pick(ev: React.MouseEvent) {
    const t = ev.target as HTMLElement;
    if (t.closest("a,button,input,label,select,textarea")) ev.preventDefault();
    const f = t.closest<HTMLElement>("[data-edit]")?.dataset.edit;
    const s = t.closest<HTMLElement>("[data-section]")?.dataset.section as SectionKey | undefined;
    onSelect({ section: s ?? (isTextField(f) ? FIELDS[f].section : null), field: isTextField(f) ? f : null });
  }

  function hover(ev: React.MouseEvent) {
    const t = ev.target as HTMLElement;
    const el = t.closest("[data-edit]") ?? t.closest("[data-section]");
    setRects((r) => ({ ...r, hover: rectOf(el) }));
  }

  return (
    <main ref={areaRef} className="relative flex min-w-0 flex-1 justify-center overflow-hidden px-3 pt-3 sm:px-5 sm:pt-5">
      <div
        ref={frame}
        style={{ width: width * scale }}
        className="relative h-full overflow-y-auto overflow-x-hidden rounded-t-[12px] bg-white shadow-[0_10px_40px_rgba(22,33,28,.16)] [scrollbar-width:thin]"
      >
        <div ref={siteEl} style={{ width, zoom: scale }} onClickCapture={pick} onMouseMove={hover} onMouseLeave={() => setRects((r) => ({ ...r, hover: null }))} className="cursor-default pb-28">
          {children}
        </div>

        {rects.hover && <div aria-hidden className="pointer-events-none absolute rounded-[4px] outline outline-1 outline-[#3DB3FF]/60" style={rects.hover} />}
        {rects.section && (
          <>
            <div aria-hidden className="pointer-events-none absolute outline-[1.5px] outline-offset-[-4px] outline-dashed outline-[#F5B83D]/70" style={rects.section} />
            <span className="pointer-events-none absolute flex h-5 items-center rounded-[4px] bg-[#F5B83D] px-2 text-[11px] font-semibold text-[#0E0C0A]" style={{ top: rects.section.top + 6, left: rects.section.left + 8 }}>
              Section · {selection.section ? SECTION_LABEL[selection.section] : ""}
            </span>
          </>
        )}
        {rects.field && selection.field && (
          <>
            <div aria-hidden className="pointer-events-none absolute rounded-[4px] border-2 border-[#3DB3FF]" style={rects.field} />
            <FieldToolbar
              style={{ top: Math.max(4, rects.field.top - 44), left: Math.max(4, Math.min(rects.field.left, width * scale - 330)) }}
              field={selection.field}
              content={content}
              proposal={proposal}
              onParent={() => onSelect({ section: selection.section, field: null })}
            />
          </>
        )}
      </div>
      <AiBar tenant={tenant} content={content} selection={selection} proposal={proposal} onSelect={onSelect} />
    </main>
  );
}

// Barre flottante au-dessus du texte choisi.
function FieldToolbar({
  style,
  field,
  content,
  proposal,
  onParent,
}: {
  style: React.CSSProperties;
  field: TextField;
  content: ShowcaseContent;
  proposal: (p: AiProposal) => void;
  onParent: () => void;
}) {
  const ai = useAiText();
  async function rewrite() {
    const text = ((content[field] as string) ?? "").slice(0, 300);
    try {
      const out = await ai.mutateAsync({
        prompt: `Réécris « ${FIELDS[field].label} » du site d'un organisateur d'événements, en plus engageant et naturel. Texte : « ${text} ». Maximum ${Math.min(FIELDS[field].max, 400)} caractères. Réponds uniquement par le nouveau texte.`,
      });
      proposal({ field, text: out.replace(/^["«“]\s*|\s*["»”]$/g, "") });
    } catch (err) {
      toast.error(aiError(err));
    }
  }
  return (
    <div className="absolute z-10 flex items-center gap-0.5 rounded-[10px] bg-white p-1 text-[#16211C] shadow-[0_8px_24px_rgba(0,0,0,.3)]" style={style}>
      <button type="button" onClick={() => void rewrite()} disabled={ai.isPending} className="flex h-7 items-center gap-1.5 rounded-[7px] bg-[#0C4A3A] px-2.5 text-xs font-semibold text-white disabled:opacity-70">
        {ai.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
        Réécrire avec l&apos;IA
      </button>
      {[
        ["B", "Gras", "font-bold"],
        ["I", "Italique", "italic"],
      ].map(([t, l, c]) => (
        <span key={t} title={`${l} : bientôt`} className={cn("flex size-7 items-center justify-center rounded-[7px] text-[#A8A497]", c)}>
          {t}
        </span>
      ))}
      <span className="mx-0.5 h-[18px] w-px bg-[#E7E5DE]" />
      <button type="button" onClick={onParent} className="h-7 rounded-[7px] px-2 text-xs text-[#3F4A45] hover:bg-[#F1EFE9]">
        Section
      </button>
    </div>
  );
}

// Assistant IA en bas de l'aperçu (écran 19).
function AiBar({ tenant, content, selection, proposal, onSelect }: { tenant: Tenant; content: ShowcaseContent; selection: Selection; proposal: (p: AiProposal) => void; onSelect: (s: Selection) => void }) {
  const ai = useAiText();
  const [prompt, setPrompt] = useState("");
  const target: TextField = selection.field ?? (selection.section === "about" ? "aboutText" : "heroHeadline");
  const name = content.orgName || tenant.name;

  async function run(kind: "about" | "faq" | "english" | "free") {
    try {
      if (kind === "about") {
        const text = await ai.mutateAsync({
          prompt: `Rédige la présentation (3 à 4 phrases) de la section « À propos » du site de ${name}, organisateur d'événements au Gabon. Ton chaleureux et professionnel, sans emoji. Réponds uniquement par le texte.`,
        });
        onSelect({ section: "about", field: "aboutText" });
        proposal({ field: "aboutText", text });
      } else if (kind === "faq") {
        const text = await ai.mutateAsync({
          prompt: `Propose une question fréquente utile pour le site d'un organisateur d'événements (billets en ligne avec QR code, paiement Mobile Money), avec sa réponse en 2 phrases. Format exact : « Q: … » puis à la ligne « R: … ».`,
        });
        const q = text.match(/Q\s*:\s*(.+)/i)?.[1]?.trim();
        const r = text.match(/R\s*:\s*([\s\S]+)/i)?.[1]?.trim();
        if (!q || !r) return void toast.error("L'IA n'a pas proposé de question exploitable, réessayez.");
        onSelect({ section: "faq", field: null });
        proposal({ field: "faq", question: q, text: r });
      } else {
        const current = ((content[target] as string) ?? "").slice(0, 300);
        const instruction = kind === "english" ? "Traduis-le en anglais" : prompt.trim().slice(0, 140);
        if (!instruction) return;
        const text = await ai.mutateAsync({
          prompt: `${instruction}. Texte (« ${FIELDS[target].label} » du site d'un organisateur d'événements) : « ${current} ». Maximum ${Math.min(FIELDS[target].max, 400)} caractères. Réponds uniquement par le nouveau texte.`,
          language: kind === "english" ? "en" : "fr",
        });
        onSelect({ section: FIELDS[target].section, field: target });
        proposal({ field: target, text: text.replace(/^["«“]\s*|\s*["»”]$/g, "") });
        setPrompt("");
      }
    } catch (err) {
      toast.error(aiError(err));
    }
  }

  return (
    <form
      aria-label="Assistant IA"
      onSubmit={(e) => {
        e.preventDefault();
        void run("free");
      }}
      className="absolute bottom-3 left-1/2 flex w-[min(640px,calc(100%-24px))] -translate-x-1/2 flex-col gap-2 sm:bottom-5"
    >
      <div className="hidden flex-wrap justify-center gap-1.5 sm:flex">
        {(
          [
            ["about", "Rédiger la section « À propos »"],
            ["faq", "Ajouter une FAQ"],
            ["english", "Traduire en anglais"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" disabled={ai.isPending} onClick={() => void run(k)} className="h-7 rounded-full border border-ev-border bg-ev-surface px-2.5 text-xs shadow-sm disabled:opacity-60">
            {l}
          </button>
        ))}
      </div>
      <label className="flex h-[52px] items-center gap-2.5 rounded-[16px] bg-ev-surface pl-4 pr-2 shadow-[0_12px_40px_rgba(22,33,28,.2),0_0_0_1px_var(--ev-border)]">
        {ai.isPending ? <Loader2 className="size-4 shrink-0 animate-spin text-ev-primary" /> : <Sparkles className="size-4 shrink-0 text-ev-primary" />}
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={140}
          placeholder={`Demandez à GiyaX AI (${FIELDS[target].label.toLowerCase()}) : « rends le ton plus chaleureux »…`}
          aria-label="Demande à l'IA"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-ev-muted"
        />
        <button type="submit" aria-label="Envoyer" disabled={ai.isPending || !prompt.trim()} className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-ev-primary text-white disabled:opacity-50">
          <ArrowUp className="size-4" />
        </button>
      </label>
    </form>
  );
}
