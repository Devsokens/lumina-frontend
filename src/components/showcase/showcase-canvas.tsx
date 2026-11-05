"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronDown,
  ImagePlus,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Star,
  Ticket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useShowcaseStore, type EventItem, type ShowcaseSections } from "@/stores/useShowcaseStore";
import { SHOWCASE_PRESETS, type ShowcaseSection } from "@/lib/showcase-layouts";
import { showcaseFontStack, showcaseSectionShown, showcaseThemeVars } from "@/lib/showcase-theme";
import { FEATURES } from "@/lib/features";
import { siteFontVariables } from "@/lib/site-fonts";
import { prepareImage } from "@/lib/image";
import { cn } from "@/lib/utils";

// Vitrine d'un organisateur d'événements. UN SEUL rendu pour l'éditeur et le
// site public : l'aperçu de l'éditeur est exactement le site en ligne.
// - Mise en page pilotée par la largeur de la vitrine (container queries
//   @sm…@5xl), pas par celle de la fenêtre : l'aperçu « Mobile » de l'éditeur
//   se comporte comme un vrai téléphone.
// - Mêmes événements des deux côtés : ceux réellement en vente.
// - Une section vide n'est pas affichée en ligne ; dans l'éditeur elle reste
//   visible, estompée, pour pouvoir la remplir.
// - Charte : le thème fixe le fond et une seule couleur d'accent (variables
//   --sc-*, lib/showcase-theme.ts) ; la police choisie s'applique partout.

interface ShowcaseCanvasProps {
  isEditorMode?: boolean;
  // Événements affichés (en vente). Sans cette prop (page de démonstration),
  // les événements d'exemple du store.
  liveEvents?: EventItem[];
  onReserve?: (event: EventItem) => void;
  // Page listant tous les événements du compte.
  allEventsHref?: string;
  // Éditeur : où créer un événement quand la liste est vide.
  manageEventsHref?: string;
}

const ACCENT_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sc-accent)] font-semibold text-[var(--sc-on-accent)] transition hover:brightness-110 active:scale-[0.98]";
const GHOST_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 font-semibold text-white transition hover:border-white/40 hover:bg-white/5";
const ACCENT_TEXT = "text-[var(--sc-accent-text)]";
const EDIT_FIELD =
  "w-full rounded-lg border border-dashed border-white/25 bg-transparent px-2 py-1 outline-none transition placeholder:text-white/35 hover:border-white/45 focus:border-solid focus:border-[var(--sc-accent)]";

const SECTION_IDS: Record<ShowcaseSection, string> = {
  events: "sc-evenements",
  about: "sc-a-propos",
  gallery: "sc-galerie",
  testimonials: "sc-avis",
  faq: "sc-faq",
};

const NAV_LABELS: Record<ShowcaseSection, string> = {
  events: "Événements",
  about: "À propos",
  gallery: "Galerie",
  testimonials: "Avis",
  faq: "FAQ",
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatPrice(fcfa: number) {
  return fcfa > 0 ? `Dès ${fcfa.toLocaleString("fr-FR")} FCFA` : "Gratuit";
}

// « 14 nov. » (ou la date texte des événements d'exemple).
function shortDate(evt: EventItem) {
  if (!evt.startsAt) return evt.date;
  return new Date(evt.startsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function dayAndMonth(evt: EventItem) {
  if (!evt.startsAt) {
    const [day = "", month = ""] = evt.date.split(" ");
    return { day, month };
  }
  const d = new Date(evt.startsAt);
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
  };
}

// Texte modifiable : champ en pointillés dans l'éditeur, texte simple en ligne
// (rien du tout s'il est vide).
function EditableText({
  editor,
  value,
  onChange,
  placeholder,
  className,
  as: Tag = "p",
  multiline = false,
  maxLength,
}: {
  editor: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  multiline?: boolean;
  maxLength?: number;
}) {
  if (editor) {
    return multiline ? (
      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={cn(EDIT_FIELD, "resize-none [field-sizing:content]", className)}
      />
    ) : (
      <input
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={cn(EDIT_FIELD, className)}
      />
    );
  }
  if (!value.trim()) return null;
  return <Tag className={cn("whitespace-pre-line", className)}>{value}</Tag>;
}

function SectionHead({ eyebrow, title, action, center }: { eyebrow: string; title: string; action?: ReactNode; center?: boolean }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-3 @2xl:mb-10", center ? "items-center text-center" : "@2xl:flex-row @2xl:items-end @2xl:justify-between")}>
      <div>
        <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", ACCENT_TEXT)}>{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white @3xl:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Section ordonnée par la variante ; « ghost » = vide, visible seulement dans l'éditeur.
function Section({
  id,
  order,
  alt,
  ghost,
  children,
}: {
  id: string;
  order: number;
  alt?: boolean;
  ghost?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ order }}
      className={cn("relative scroll-mt-20 px-4 py-16 @3xl:px-8 @3xl:py-20", alt && "bg-[var(--sc-bg-alt)]")}
    >
      {ghost && (
        <p className="mx-auto mb-6 w-fit rounded-full border border-dashed border-white/25 px-3 py-1 text-[11px] text-white/60">
          Section vide : elle n&apos;apparaît pas sur le site en ligne
        </p>
      )}
      <div className={cn("mx-auto max-w-6xl", ghost && "opacity-80")}>{children}</div>
    </section>
  );
}

export function ShowcaseCanvas({
  isEditorMode = false,
  liveEvents,
  onReserve,
  allEventsHref,
  manageEventsHref,
}: ShowcaseCanvasProps) {
  const s = useShowcaseStore();
  const editor = isEditorMode;
  const events = liveEvents ?? s.events;
  const preset = SHOWCASE_PRESETS[s.layout];
  const set = s.updateField;

  // Une seule entrée fichier pour toutes les images (logo, couverture, galerie).
  const fileRef = useRef<HTMLInputElement>(null);
  const onPicked = useRef<((dataUrl: string) => void) | null>(null);
  function pickImage(done: (dataUrl: string) => void) {
    onPicked.current = done;
    fileRef.current?.click();
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file || !onPicked.current) return;
    const done = onPicked.current;
    // Ré-encodée et compressée (EXIF retiré) : acceptée par le serveur à la publication.
    prepareImage(file)
      .then((dataUrl) => done(dataUrl))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Image illisible."))
      .finally(() => {
        input.value = "";
      });
  }

  // Interrupteurs « masquer » : seulement s'ils sont enregistrés par le serveur.
  const toggledOn = (k: keyof ShowcaseSections) => !FEATURES.showcaseSections || s.visibleSections[k] !== false;
  // Affichée en ligne ? / affichée dans l'éditeur (estompée si vide) ?
  const live = (k: keyof ShowcaseSections) => showcaseSectionShown(s, k);
  const rendered = (k: keyof ShowcaseSections) => (editor ? toggledOn(k) : live(k));
  const ghost = (k: keyof ShowcaseSections) => editor && !live(k);
  const order = (k: ShowcaseSection) => preset.order.indexOf(k) + 1;

  function reserve(evt: EventItem) {
    if (onReserve) onReserve(evt);
    else toast.info("Aperçu : sur le site, ce bouton ouvre la page d'achat de l'événement.");
  }

  const navSections = preset.order.filter((k) => (k === "events" ? true : live(k)));
  const shownCount = preset.events === "posters" ? 8 : preset.events === "agenda" ? 6 : 6;
  const visibleEvents = events.slice(0, shownCount);
  const stickyBar = preset.sticky && events.length > 0;
  const whatsapp = s.whatsappNumber.replace(/[^0-9]/g, "");

  const frame = !editor
    ? "min-h-svh w-full"
    : s.deviceView === "mobile"
      ? "mx-auto my-4 w-full max-w-[400px] rounded-[2.25rem] border-[6px] border-zinc-800 shadow-2xl"
      : s.deviceView === "tablet"
        ? "mx-auto my-4 w-full max-w-[820px] rounded-3xl border-[6px] border-zinc-800 shadow-2xl"
        : "w-full rounded-2xl border border-white/10 shadow-2xl";

  const rootStyle: CSSProperties = { ...showcaseThemeVars(s.theme), fontFamily: showcaseFontStack(s.fontFamily) };

  // ---------------------------------------------------------------------------
  // Couverture
  // ---------------------------------------------------------------------------
  const heroText = (align: "center" | "left") => (
    <div className={cn("relative space-y-6", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left")}>
      <EditableText
        editor={editor}
        value={s.heroBadge}
        onChange={(v) => set("heroBadge", v)}
        placeholder="Accroche courte (facultatif)"
        maxLength={80}
        className={cn("stay-intro text-xs font-semibold uppercase tracking-[0.18em]", ACCENT_TEXT, align === "center" && "text-center")}
      />
      <EditableText
        editor={editor}
        as="h1"
        multiline
        value={s.heroHeadline}
        onChange={(v) => set("heroHeadline", v)}
        placeholder="Votre grand titre"
        maxLength={200}
        className={cn(
          "stay-intro font-bold leading-[1.05] tracking-tight text-white",
          preset.hero === "compact" ? "text-3xl @3xl:text-4xl" : "text-4xl @2xl:text-5xl @4xl:text-6xl",
          align === "center" && "text-center"
        )}
      />
      <EditableText
        editor={editor}
        multiline
        value={s.heroSubheadline}
        onChange={(v) => set("heroSubheadline", v)}
        placeholder="Une phrase pour présenter vos événements"
        maxLength={500}
        className={cn("stay-intro text-base leading-relaxed text-white/70 @3xl:text-lg", align === "center" && "mx-auto max-w-2xl text-center")}
      />
      <div className={cn("stay-intro flex flex-wrap gap-3 pt-1", align === "center" ? "justify-center" : "justify-start")} style={{ "--i": 2 } as CSSProperties}>
        <button type="button" onClick={() => scrollToId(SECTION_IDS.events)} className={cn(ACCENT_BTN, "h-12 px-6 text-sm")}>
          {editor ? (
            <input
              value={s.heroCtaText}
              onChange={(e) => set("heroCtaText", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Voir les événements"
              maxLength={60}
              className="w-44 bg-transparent text-center outline-none placeholder:text-[var(--sc-on-accent)]/60"
            />
          ) : (
            s.heroCtaText.trim() || "Voir les événements"
          )}
          <ArrowRight className="size-4" />
        </button>
        {live("about") && (
          <button type="button" onClick={() => scrollToId(SECTION_IDS.about)} className={cn(GHOST_BTN, "h-12 px-6 text-sm")}>
            En savoir plus
          </button>
        )}
      </div>
    </div>
  );

  const stats = [
    { key: "statParticipants" as const, label: "Participants", placeholder: "+5 000" },
    { key: "statEvents" as const, label: "Événements", placeholder: "25" },
    { key: "statSatisfaction" as const, label: "Satisfaction", placeholder: "4,8/5" },
    { key: "statSecurity" as const, label: "Billets sécurisés", placeholder: "100 %" },
  ].filter((st) => editor || s[st.key].trim());

  const statsStrip =
    preset.stats && rendered("stats") ? (
      <div className={cn("relative mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 @3xl:grid-cols-4", ghost("stats") && "opacity-80")}>
        {stats.map((st) => (
          <div key={st.key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
            {editor ? (
              <input
                value={s[st.key]}
                onChange={(e) => set(st.key, e.target.value)}
                placeholder={st.placeholder}
                maxLength={30}
                className={cn(EDIT_FIELD, "text-center text-2xl font-bold", ACCENT_TEXT)}
              />
            ) : (
              <p className={cn("text-2xl font-bold", ACCENT_TEXT)}>{s[st.key]}</p>
            )}
            <p className="mt-1 text-xs text-white/60">{st.label}</p>
          </div>
        ))}
      </div>
    ) : null;

  const coverButton = editor && (
    <button
      type="button"
      onClick={() => pickImage((url) => set("orgCoverUrl", url))}
      className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black"
    >
      <Camera className="size-3.5" /> Photo de couverture
    </button>
  );

  const nextEvent = events[0];

  const hero = rendered("hero") && (
    <section
      style={{ order: 0 }}
      className={cn(
        "relative overflow-hidden px-4 @3xl:px-8",
        preset.hero === "fullbleed" ? "flex min-h-[560px] items-end pb-14 pt-28 @3xl:min-h-[640px]" : preset.hero === "compact" ? "py-12 @3xl:py-16" : "py-16 @3xl:py-24"
      )}
    >
      {coverButton}
      {/* Fond : photo + voile du thème */}
      {s.orgCoverUrl && (preset.hero === "fullbleed" || preset.hero === "center" || preset.hero === "compact") && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.orgCoverUrl}
            alt=""
            className={cn("absolute inset-0 size-full object-cover", preset.hero === "fullbleed" ? "stay-kenburns" : "opacity-25")}
          />
          <div
            className={cn(
              "absolute inset-0",
              preset.hero === "fullbleed"
                ? "bg-gradient-to-t from-[var(--sc-bg)] via-[var(--sc-bg)]/55 to-black/30"
                : "bg-gradient-to-b from-[var(--sc-bg)]/40 via-[var(--sc-bg)]/80 to-[var(--sc-bg)]"
            )}
          />
        </>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "var(--sc-glow)" }}
      />

      <div className="relative mx-auto w-full max-w-6xl">
        {preset.hero === "left" || preset.hero === "poster" ? (
          <div className="grid items-center gap-10 @3xl:grid-cols-[1.1fr_0.9fr]">
            {heroText("left")}
            {preset.hero === "poster" && nextEvent ? (
              <button
                type="button"
                onClick={() => reserve(nextEvent)}
                className="stay-intro relative aspect-[3/4] w-full max-w-sm justify-self-center overflow-hidden rounded-3xl border border-white/10 text-left shadow-2xl"
              >
                {nextEvent.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={nextEvent.coverImageUrl} alt={nextEvent.title} className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center bg-white/5">
                    <Ticket className="size-10 text-white/30" />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                  <span className={cn("block text-xs font-semibold uppercase tracking-wider", ACCENT_TEXT)}>Prochain événement</span>
                  <span className="mt-1 block text-xl font-bold text-white">{nextEvent.title}</span>
                  <span className="mt-1 block text-sm text-white/75">
                    {nextEvent.date} · {nextEvent.location}
                  </span>
                </span>
              </button>
            ) : (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                {s.orgCoverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.orgCoverUrl} alt="" className="size-full object-cover" />
                ) : (
                  editor && (
                    <span className="flex size-full items-center justify-center text-sm text-white/50">Ajoutez une photo de couverture</span>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          heroText(preset.hero === "compact" ? "left" : "center")
        )}
        {statsStrip}
      </div>
    </section>
  );

  // ---------------------------------------------------------------------------
  // Événements
  // ---------------------------------------------------------------------------
  const cover = (evt: EventItem, className: string) =>
    evt.coverImageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={evt.coverImageUrl} alt={evt.title} className={cn("size-full object-cover transition duration-500 group-hover:scale-105", className)} />
    ) : (
      <span className={cn("flex size-full items-center justify-center bg-white/5", className)}>
        <Ticket className="size-8 text-white/25" />
      </span>
    );

  const dateChip = (evt: EventItem) => (
    <span className="absolute left-3 top-3 rounded-full bg-[var(--sc-accent)] px-2.5 py-1 text-xs font-bold text-[var(--sc-on-accent)]">
      {shortDate(evt)}
    </span>
  );

  const eventCard = (evt: EventItem, big = false) => (
    <article
      key={evt.id}
      className={cn(
        "stay-lift group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-white/20",
        big && "@3xl:col-span-2 @3xl:row-span-2"
      )}
    >
      <div className={cn("relative overflow-hidden", big ? "aspect-[16/10] @3xl:aspect-auto @3xl:flex-1" : "aspect-[16/10]")}>
        {cover(evt, "")}
        {dateChip(evt)}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className={cn("line-clamp-2 font-semibold text-white", big ? "text-xl @3xl:text-2xl" : "text-lg")}>{evt.title}</h3>
        <div className="space-y-1 text-sm text-white/60">
          <p className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            <span className="truncate">
              {evt.date}
              {evt.time && ` · ${evt.time}`}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{evt.location}</span>
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className={cn("text-sm font-semibold", ACCENT_TEXT)}>{formatPrice(evt.startingPrice)}</span>
          <button type="button" onClick={() => reserve(evt)} className={cn(ACCENT_BTN, "h-10 px-4 text-sm")}>
            Réserver
          </button>
        </div>
      </div>
    </article>
  );

  const eventPoster = (evt: EventItem) => (
    <button
      key={evt.id}
      type="button"
      onClick={() => reserve(evt)}
      className="stay-lift group relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 text-left"
    >
      {cover(evt, "absolute inset-0")}
      {dateChip(evt)}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
        <span className="line-clamp-2 block font-semibold text-white">{evt.title}</span>
        <span className={cn("mt-1 block text-sm font-semibold", ACCENT_TEXT)}>{formatPrice(evt.startingPrice)}</span>
      </span>
    </button>
  );

  const eventRow = (evt: EventItem) => {
    const { day, month } = dayAndMonth(evt);
    return (
      <li key={evt.id} className="flex flex-wrap items-center gap-4 p-4 @2xl:flex-nowrap @2xl:p-5">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--sc-accent)]/40 bg-white/[0.03]">
          <span className={cn("text-2xl font-bold leading-none", ACCENT_TEXT)}>{day}</span>
          <span className="mt-1 text-xs uppercase text-white/60">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-white">{evt.title}</h3>
          <p className="truncate text-sm text-white/60">
            {evt.time && `${evt.time} · `}
            {evt.location}
          </p>
        </div>
        <span className={cn("text-sm font-semibold", ACCENT_TEXT)}>{formatPrice(evt.startingPrice)}</span>
        <button type="button" onClick={() => reserve(evt)} className={cn(ACCENT_BTN, "h-10 px-4 text-sm")}>
          Réserver
        </button>
      </li>
    );
  };

  const moreLink =
    allEventsHref && events.length > visibleEvents.length ? (
      <a
        href={allEventsHref}
        target={editor ? "_blank" : undefined}
        rel={editor ? "noreferrer" : undefined}
        className={cn("inline-flex items-center gap-1.5 text-sm font-semibold hover:underline", ACCENT_TEXT)}
      >
        Tous les événements ({events.length}) <ArrowRight className="size-4" />
      </a>
    ) : null;

  const eventsList =
    events.length === 0 ? (
      <div className="rounded-3xl border border-dashed border-white/20 p-10 text-center">
        <Ticket className="mx-auto size-8 text-white/40" />
        {editor ? (
          <>
            <p className="mt-3 font-semibold text-white">Vos événements en vente apparaîtront ici</p>
            <p className="mt-1 text-sm text-white/60">Publiez un événement : il s&apos;affiche automatiquement sur votre site.</p>
            {manageEventsHref && (
              <a href={manageEventsHref} className={cn(ACCENT_BTN, "mt-5 h-10 px-5 text-sm")}>
                <Plus className="size-4" /> Créer un événement
              </a>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-white/70">Aucun événement en vente pour le moment. Revenez bientôt !</p>
        )}
      </div>
    ) : preset.events === "agenda" ? (
      <ol className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {visibleEvents.map(eventRow)}
      </ol>
    ) : preset.events === "posters" ? (
      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3 @5xl:grid-cols-4">{visibleEvents.map(eventPoster)}</div>
    ) : preset.events === "carousel" ? (
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] @3xl:-mx-8 @3xl:px-8 [&::-webkit-scrollbar]:hidden">
        {visibleEvents.map((evt) => (
          <div key={evt.id} className="w-[min(300px,82%)] shrink-0 snap-start">
            {eventCard(evt)}
          </div>
        ))}
      </div>
    ) : (
      <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {visibleEvents.map((evt, i) => eventCard(evt, preset.events === "featured" && i === 0 && visibleEvents.length > 2))}
      </div>
    );

  // ---------------------------------------------------------------------------
  // Contenu
  // ---------------------------------------------------------------------------
  const removeAt = <T,>(list: T[], i: number) => list.filter((_, j) => j !== i);

  return (
    <div
      className={cn("@container relative flex flex-col overflow-clip text-white antialiased", siteFontVariables, frame)}
      style={rootStyle}
      data-motion={preset.motion}
    >
      {editor && <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />}

      {/* Barre de navigation */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--sc-glass)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 @3xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              disabled={!editor}
              onClick={() => pickImage((url) => set("orgLogoUrl", url))}
              title={editor ? "Changer le logo" : undefined}
              className={cn(
                "group/logo relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10",
                editor && "cursor-pointer outline-1 outline-dashed outline-white/40"
              )}
            >
              {s.orgLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.orgLogoUrl} alt={s.orgName} className="size-full object-contain p-1" />
              ) : (
                <span className="text-sm font-bold">{s.orgName.charAt(0) || "G"}</span>
              )}
              {editor && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition group-hover/logo:opacity-100">
                  <Camera className="size-4" />
                </span>
              )}
            </button>
            <div className="min-w-0">
              {editor ? (
                <input
                  value={s.orgName}
                  onChange={(e) => set("orgName", e.target.value)}
                  maxLength={120}
                  placeholder="Nom de l'organisation"
                  className={cn(EDIT_FIELD, "py-0.5 font-bold")}
                />
              ) : (
                <p className="truncate font-bold">{s.orgName}</p>
              )}
              {!editor && s.orgTagline && <p className="hidden truncate text-xs text-white/55 @xl:block">{s.orgTagline}</p>}
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-white/70 @4xl:flex">
            {navSections.map((k) => (
              <button key={k} type="button" onClick={() => scrollToId(SECTION_IDS[k])} className="transition hover:text-white">
                {NAV_LABELS[k]}
              </button>
            ))}
          </nav>

          <button type="button" onClick={() => scrollToId(SECTION_IDS.events)} className={cn(ACCENT_BTN, "h-10 shrink-0 px-4 text-sm")}>
            <Ticket className="size-4" /> Billets
          </button>
        </div>
        {editor && (
          <div className="mx-auto max-w-6xl px-4 pb-3 @3xl:px-8">
            <input
              value={s.orgTagline}
              onChange={(e) => set("orgTagline", e.target.value)}
              maxLength={200}
              placeholder="Slogan (affiché sous le nom)"
              className={cn(EDIT_FIELD, "text-xs text-white/70")}
            />
          </div>
        )}
      </header>

      <main className="flex flex-col">
        {hero}

        {rendered("events") && (
          <Section id={SECTION_IDS.events} order={order("events")} alt>
            <SectionHead eyebrow="Billetterie" title="Prochains événements" action={moreLink} />
            {eventsList}
          </Section>
        )}

        {rendered("about") && (
          <Section id={SECTION_IDS.about} order={order("about")} ghost={ghost("about")}>
            <div className="grid items-center gap-10 @3xl:grid-cols-2">
              <div className="space-y-4">
                <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", ACCENT_TEXT)}>À propos</p>
                <EditableText
                  editor={editor}
                  as="h2"
                  value={s.aboutTitle}
                  onChange={(v) => set("aboutTitle", v)}
                  placeholder="Qui sommes-nous ?"
                  maxLength={160}
                  className="text-3xl font-bold tracking-tight @3xl:text-4xl"
                />
                <EditableText
                  editor={editor}
                  multiline
                  value={s.aboutText}
                  onChange={(v) => set("aboutText", v)}
                  placeholder="Présentez votre organisation, votre histoire, ce qui rend vos événements uniques…"
                  maxLength={3000}
                  className="text-base leading-relaxed text-white/70"
                />
              </div>
              {(s.orgCoverUrl || editor) && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  {s.orgCoverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.orgCoverUrl} alt={s.orgName} className="size-full object-cover" />
                  )}
                  {editor && (
                    <button
                      type="button"
                      onClick={() => pickImage((url) => set("orgCoverUrl", url))}
                      className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-sm font-semibold opacity-0 transition hover:opacity-100"
                    >
                      <Camera className="size-4" /> Changer la photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </Section>
        )}

        {rendered("gallery") && (
          <Section id={SECTION_IDS.gallery} order={order("gallery")} alt ghost={ghost("gallery")}>
            <SectionHead eyebrow="Galerie" title="En images" />
            <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3">
              {s.galleryImages.map((img, i) => (
                <div key={`${i}-${img.slice(-12)}`} className="group/img relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Photo ${i + 1}`} className="size-full object-cover transition duration-500 group-hover/img:scale-105" />
                  {editor && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition group-hover/img:opacity-100">
                      <button
                        type="button"
                        onClick={() => pickImage((url) => s.updateGalleryImage(i, url))}
                        className="rounded-full bg-white/90 p-2 text-black"
                        aria-label="Remplacer la photo"
                      >
                        <Camera className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => set("galleryImages", removeAt(s.galleryImages, i))}
                        className="rounded-full bg-white/90 p-2 text-black"
                        aria-label="Retirer la photo"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {editor && s.galleryImages.length < 12 && (
                <button
                  type="button"
                  onClick={() => pickImage((url) => set("galleryImages", [...useShowcaseStore.getState().galleryImages, url]))}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 text-sm text-white/60 transition hover:border-white/50 hover:text-white"
                >
                  <ImagePlus className="size-6" /> Ajouter une photo
                </button>
              )}
            </div>
          </Section>
        )}

        {rendered("testimonials") && (
          <Section id={SECTION_IDS.testimonials} order={order("testimonials")} ghost={ghost("testimonials")}>
            <SectionHead eyebrow="Avis" title="Ils étaient là" />
            <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
              {s.testimonials.map((t, i) => (
                <figure key={t.id} className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="flex gap-0.5" aria-label={`${t.rating} sur 5`}>
                    {Array.from({ length: 5 }, (_, n) => (
                      <button
                        key={n}
                        type="button"
                        disabled={!editor}
                        onClick={() => set("testimonials", s.testimonials.map((x, j) => (j === i ? { ...x, rating: n + 1 } : x)))}
                        aria-label={editor ? `${n + 1} étoile(s)` : undefined}
                      >
                        <Star className={cn("size-4", n < t.rating ? "fill-[var(--sc-accent)] text-[var(--sc-accent)]" : "text-white/20")} />
                      </button>
                    ))}
                  </div>
                  {editor ? (
                    <>
                      <textarea
                        value={t.comment}
                        onChange={(e) => set("testimonials", s.testimonials.map((x, j) => (j === i ? { ...x, comment: e.target.value } : x)))}
                        placeholder="Le témoignage"
                        maxLength={600}
                        rows={3}
                        className={cn(EDIT_FIELD, "resize-none text-sm [field-sizing:content]")}
                      />
                      <input
                        value={t.name}
                        onChange={(e) => set("testimonials", s.testimonials.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                        placeholder="Nom"
                        maxLength={80}
                        className={cn(EDIT_FIELD, "text-sm font-semibold")}
                      />
                      <input
                        value={t.role}
                        onChange={(e) => set("testimonials", s.testimonials.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
                        placeholder="Qualité (ex. participante, édition 2025)"
                        maxLength={80}
                        className={cn(EDIT_FIELD, "text-xs text-white/60")}
                      />
                      <button
                        type="button"
                        onClick={() => set("testimonials", removeAt(s.testimonials, i))}
                        className="absolute right-3 top-3 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                        aria-label="Supprimer l'avis"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <blockquote className="text-sm leading-relaxed text-white/80">« {t.comment} »</blockquote>
                      <figcaption className="mt-auto">
                        <p className="text-sm font-semibold">{t.name}</p>
                        {t.role && <p className="text-xs text-white/55">{t.role}</p>}
                      </figcaption>
                    </>
                  )}
                </figure>
              ))}
              {editor && s.testimonials.length < 20 && (
                <button
                  type="button"
                  onClick={() =>
                    set("testimonials", [
                      ...s.testimonials,
                      { id: `t-${Date.now()}`, name: "", role: "", comment: "", rating: 5, eventName: "" },
                    ])
                  }
                  className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 text-sm text-white/60 transition hover:border-white/50 hover:text-white"
                >
                  <Plus className="size-5" /> Ajouter un avis
                </button>
              )}
            </div>
          </Section>
        )}

        {rendered("faq") && (
          <Section id={SECTION_IDS.faq} order={order("faq")} alt ghost={ghost("faq")}>
            <div className="mx-auto max-w-3xl">
              <SectionHead eyebrow="Questions fréquentes" title="Bon à savoir" center />
              <div className="space-y-3">
                {s.faqs.map((f, i) =>
                  editor ? (
                    <div key={f.id} className="relative space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 pr-12">
                      <input
                        value={f.question}
                        onChange={(e) => set("faqs", s.faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))}
                        placeholder="La question"
                        maxLength={200}
                        className={cn(EDIT_FIELD, "font-semibold")}
                      />
                      <textarea
                        value={f.answer}
                        onChange={(e) => set("faqs", s.faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))}
                        placeholder="La réponse"
                        maxLength={1500}
                        rows={2}
                        className={cn(EDIT_FIELD, "resize-none text-sm text-white/70 [field-sizing:content]")}
                      />
                      <button
                        type="button"
                        onClick={() => set("faqs", removeAt(s.faqs, i))}
                        className="absolute right-3 top-3 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                        aria-label="Supprimer la question"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <FaqItem key={f.id} question={f.question} answer={f.answer} />
                  )
                )}
                {editor && s.faqs.length < 30 && (
                  <button
                    type="button"
                    onClick={() => set("faqs", [...s.faqs, { id: `faq-${Date.now()}`, question: "", answer: "" }])}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 p-4 text-sm text-white/60 transition hover:border-white/50 hover:text-white"
                  >
                    <Plus className="size-4" /> Ajouter une question
                  </button>
                )}
              </div>
            </div>
          </Section>
        )}
      </main>

      {/* Pied de page */}
      {rendered("footer") && (
        <footer className="border-t border-white/10 bg-black/30 px-4 py-12 text-sm @3xl:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 @3xl:grid-cols-[1.4fr_1fr_1fr]">
            <div className="space-y-3">
              <p className="text-lg font-bold">{s.orgName}</p>
              {s.orgTagline && <p className="max-w-sm text-white/60">{s.orgTagline}</p>}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Contact</p>
              {editor ? (
                <div className="space-y-2">
                  {(
                    [
                      ["address", "Adresse", 300],
                      ["supportPhone", "Téléphone", 30],
                      ["whatsappNumber", "WhatsApp (ex. +241 77 12 34 56)", 30],
                      ["contactEmail", "E-mail", 120],
                      ["instagramHandle", "Instagram (ex. @monorganisation)", 60],
                      ["facebookUrl", "Page Facebook (https://…)", 300],
                    ] as const
                  ).map(([key, label, max]) => (
                    <input
                      key={key}
                      value={s[key]}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={label}
                      maxLength={max}
                      className={cn(EDIT_FIELD, "text-sm")}
                    />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2 text-white/70">
                  {s.address && (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0" /> {s.address}
                    </li>
                  )}
                  {s.supportPhone && (
                    <li>
                      <a href={`tel:${s.supportPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white">
                        <Phone className="size-4 shrink-0" /> {s.supportPhone}
                      </a>
                    </li>
                  )}
                  {whatsapp && (
                    <li>
                      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
                        <MessageCircle className="size-4 shrink-0" /> WhatsApp {s.whatsappNumber}
                      </a>
                    </li>
                  )}
                  {s.contactEmail && (
                    <li>
                      <a href={`mailto:${s.contactEmail}`} className="flex items-center gap-2 hover:text-white">
                        <Mail className="size-4 shrink-0" /> {s.contactEmail}
                      </a>
                    </li>
                  )}
                  {(s.instagramHandle || s.facebookUrl) && (
                    <li className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                      {s.instagramHandle && (
                        <a
                          href={`https://instagram.com/${s.instagramHandle.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white"
                        >
                          Instagram
                        </a>
                      )}
                      {/^https:\/\//.test(s.facebookUrl) && (
                        <a href={s.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                          Facebook
                        </a>
                      )}
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Paiement</p>
              <p className="text-white/70">Airtel Money · Moov Money</p>
              <p className="text-xs text-white/50">Billet avec QR code envoyé dès le paiement.</p>
            </div>
          </div>

          <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <p>
              © {new Date().getFullYear()} {s.orgName}
              {!editor && (s.nif || s.rccm) && ` · ${[s.nif && `NIF ${s.nif}`, s.rccm && `RCCM ${s.rccm}`].filter(Boolean).join(" · ")}`}
            </p>
            {editor && (
              <div className="flex gap-2">
                <input value={s.nif} onChange={(e) => set("nif", e.target.value)} placeholder="NIF" maxLength={60} className={cn(EDIT_FIELD, "text-xs")} />
                <input value={s.rccm} onChange={(e) => set("rccm", e.target.value)} placeholder="RCCM" maxLength={60} className={cn(EDIT_FIELD, "text-xs")} />
              </div>
            )}
            <p>
              Billetterie propulsée par <span className="font-semibold text-white/70">GiyaX</span>
            </p>
          </div>
        </footer>
      )}

      {/* Bouton billets (mobile, variantes « sticky ») et WhatsApp, toujours
          visibles en bas de la vitrine (fenêtre ou zone d'aperçu). */}
      {(stickyBar || whatsapp) && (
        <div className="pointer-events-none sticky bottom-0 z-30 h-0">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Nous écrire sur WhatsApp"
              className={cn(
                "pointer-events-auto absolute right-4 flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105",
                stickyBar ? "bottom-20 @3xl:bottom-5" : "bottom-5"
              )}
            >
              <MessageCircle className="size-6" />
            </a>
          )}
          {stickyBar && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 border-t border-white/10 bg-[var(--sc-glass)] p-3 backdrop-blur @3xl:hidden">
              <button type="button" onClick={() => scrollToId(SECTION_IDS.events)} className={cn(ACCENT_BTN, "h-12 w-full text-sm")}>
                <Ticket className="size-4" /> Acheter des billets
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  if (!question.trim()) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold transition hover:bg-white/[0.03]"
      >
        {question}
        <ChevronDown className={cn("size-4 shrink-0 transition", open && "rotate-180 text-[var(--sc-accent-text)]")} />
      </button>
      {open && <p className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-white/70">{answer}</p>}
    </div>
  );
}
