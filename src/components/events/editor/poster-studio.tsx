"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { EvButton, EvCheckbox } from "@/components/events/ev-ui";
import { GiyaxAvatar } from "@/components/ai/giyax-avatar";
import { TypewriterText } from "@/components/ai/typewriter";
import { aiError, generateVisual, useAiText } from "@/hooks/useAi";
import { amount, formatEventDay, typeOption } from "@/lib/event-meta";
import { FEATURES } from "@/lib/features";
import { cn } from "@/lib/utils";
import type { EditorForm } from "./editor-model";

// « Générer une affiche » (refonte 2026-11, écran 1b). Quatre propositions :
// pour chacune, l'IA du serveur crée une image (Cloudflare Workers AI) que la
// mise en page habille de vos textes, dessinés sur un canevas (l'aperçu est
// exactement l'image utilisée, 1080 × 1350, 4:5). L'accroche est écrite par
// l'IA. « Image seule » : les images sans texte ; « Typographique » : sans
// image.

type Style = "PHOTO" | "GRAPHIC" | "TYPO";
type Palette = { a: string; b: string; c: string; light: string; ink: string };

// Palettes : marque (vert / or), nuit, braise. « Variantes » fait tourner.
const PALETTES: Palette[] = [
  { a: "#0C4A3A", b: "#C79A3B", c: "#E39A1F", light: "#F4EEDF", ink: "#16211C" },
  { a: "#1F3A68", b: "#E3C34A", c: "#E39A1F", light: "#EEF1F7", ink: "#141B2B" },
  { a: "#6B1D2A", b: "#F2C14E", c: "#E8572A", light: "#F7EDE6", ink: "#2A1418" },
];
const FREE_PALETTES: Palette[] = [
  { a: "#2C5BA8", b: "#C2547A", c: "#E39A1F", light: "#F3EEF6", ink: "#1B1730" },
  { a: "#0F8A64", b: "#E3B7FF", c: "#3BE8FF", light: "#EDF6F2", ink: "#0E1A1B" },
  { a: "#B8326E", b: "#FFD23F", c: "#D9541E", light: "#FBEFF4", ink: "#2B0F1C" },
];

const NAMES = ["Institutionnel", "Éditorial", "Tech & digital", "Afro contemporain"];

const TAGLINE: Record<string, string> = {
  CONFERENCE: "SAVOIR · AMBITION · IMPACT",
  CONCERT: "MUSIQUE · ÉNERGIE · LIVE",
  NIGHTLIFE: "NUIT · STYLE · AMBIANCE",
  SPORTS: "DÉPASSEMENT · ÉQUIPE · VICTOIRE",
  SHOW: "SCÈNE · ÉMOTION · TALENT",
  EXHIBITION: "DÉCOUVERTE · RÉSEAU · INNOVATION",
};

type Texts = { title: boolean; date: boolean; place: boolean; logos: boolean; price: boolean };

type PosterData = {
  org: string;
  title: string;
  typeLine: string;
  year: string;
  dateLong: string; // « Sam. 28 nov. 2026 · 09:00 »
  dateShort: string; // « 28.11.2026 »
  dateMono: string; // « 28 NOV · 09:00 »
  dayMonth: string; // « Sam. 28 novembre »
  venue: string;
  city: string;
  price: string;
  tagline: string;
};

function fontFamilies() {
  const probe = document.createElement("span");
  probe.className = "font-ev";
  document.body.appendChild(probe);
  const sans = getComputedStyle(probe).fontFamily;
  probe.className = "font-ev-serif";
  const serif = getComputedStyle(probe).fontFamily;
  probe.className = "font-ev-mono";
  const mono = getComputedStyle(probe).fontFamily;
  probe.remove();
  return { sans, serif, mono };
}

// Texte sur plusieurs lignes, coupé aux mots.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "right" = "left") {
  const chars = [...text];
  const width = chars.reduce((n, ch) => n + ctx.measureText(ch).width + spacing, -spacing);
  let cx = align === "right" ? x - width : x;
  for (const ch of chars) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

// Image « cover » dans un rectangle (comme object-fit: cover).
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / r;
  const sh = h / r;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

function vertical(ctx: CanvasRenderingContext2D, y0: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

// Dessin d'une proposition dans le repère du design (250 × 312,5) à l'échelle k.
// bg : image générée par l'IA pour cette proposition (sinon aplats et formes).
function drawPoster(ctx: CanvasRenderingContext2D, k: number, n: number, p: Palette, d: PosterData, t: Texts, style: Style, F: ReturnType<typeof fontFamilies>, bg: HTMLImageElement | null) {
  const W = 250;
  const H = 312.5;
  const P = 20;
  ctx.save();
  ctx.scale(k, k);
  ctx.textBaseline = "alphabetic";
  const shapes = style !== "TYPO";
  const info = [t.date ? d.dateLong : null, t.place ? [d.venue, d.city].filter(Boolean).join(", ") : null, t.price && d.price ? d.price : null].filter(Boolean) as string[];

  if (n === 0) {
    if (bg) {
      cover(ctx, bg, 0, 0, W, H);
      ctx.fillStyle = vertical(ctx, H * 0.2, H, [
        [0, `${p.a}00`],
        [0.5, `${p.a}B8`],
        [1, `${p.a}F5`],
      ]);
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = vertical(ctx, 0, 64, [
        [0, "rgba(0,0,0,.5)"],
        [1, "rgba(0,0,0,0)"],
      ]);
      ctx.fillRect(0, 0, W, 64);
    } else {
      ctx.fillStyle = p.a;
      ctx.fillRect(0, 0, W, H);
      if (shapes) {
        ctx.strokeStyle = p.b + "99";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(200, 50, 110, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = p.b;
        ctx.beginPath();
        ctx.arc(200, 50, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    ctx.fillStyle = "#FFFFFF";
    if (t.logos) {
      ctx.font = `700 9px ${F.sans}`;
      spaced(ctx, d.org.toUpperCase(), P, P + 9, 2.2);
    }
    ctx.font = `600 10px ${F.sans}`;
    const infoLines = info.flatMap((s) => wrap(ctx, s, W - 2 * P));
    let y = H - P - (infoLines.length - 1) * 14;
    ctx.fillStyle = "#CFE3DA";
    infoLines.forEach((l, i) => ctx.fillText(l, P, y + i * 14));
    y -= 14;
    ctx.fillStyle = p.b;
    ctx.fillRect(P, y - 3, 40, 3);
    if (t.title) {
      const size = style === "TYPO" ? 36 : 30;
      ctx.font = `800 ${size}px ${F.sans}`;
      ctx.fillStyle = "#FFFFFF";
      const lines = wrap(ctx, d.title, W - 2 * P);
      const lh = size * 0.98;
      lines.reverse().forEach((l, i) => ctx.fillText(l, P, y - 12 - i * lh));
    }
  } else if (n === 1) {
    ctx.fillStyle = p.light;
    ctx.fillRect(0, 0, W, H);
    if (bg) {
      cover(ctx, bg, 0, 0, W, H * 0.54);
      ctx.fillStyle = vertical(ctx, 0, 50, [
        [0, "rgba(0,0,0,.55)"],
        [1, "rgba(0,0,0,0)"],
      ]);
      ctx.fillRect(0, 0, W, 50);
    }
    ctx.fillStyle = p.a;
    ctx.fillRect(0, H * 0.54, W, H * 0.46);
    if (shapes && !bg) {
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(P + 55, H * 0.7 - 55, 55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = bg ? "#FFFFFF" : p.ink;
    ctx.font = `700 9px ${F.sans}`;
    spaced(ctx, d.typeLine.toUpperCase(), P, P + 9, 1.8);
    spaced(ctx, d.year, W - P, P + 9, 1.8, "right");
    ctx.textAlign = "right";
    let y = H - P;
    ctx.fillStyle = "#CFE3DA";
    ctx.font = `500 10px ${F.sans}`;
    const meta = [t.date ? d.dateShort : null, t.place ? d.city || d.venue : null, t.price && d.price ? d.price : null].filter(Boolean).join(" · ");
    if (meta) ctx.fillText(meta, W - P, y);
    y -= 18;
    if (t.title) {
      const size = style === "TYPO" ? 38 : 32;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `600 ${size}px ${F.serif}`;
      const lines = wrap(ctx, d.title, W - 2 * P - 20);
      lines.reverse().forEach((l, i) => {
        ctx.font = `${i === Math.floor(lines.length / 2) && lines.length > 2 ? "italic 500" : "600"} ${size}px ${F.serif}`;
        ctx.fillText(l, W - P, y - i * size);
      });
    }
    ctx.textAlign = "left";
  } else if (n === 2) {
    ctx.fillStyle = "#0E1A1B";
    ctx.fillRect(0, 0, W, H);
    if (bg) {
      cover(ctx, bg, 0, 0, W, H);
      ctx.fillStyle = "rgba(14,26,27,.42)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = vertical(ctx, H * 0.45, H, [
        [0, "rgba(14,26,27,0)"],
        [1, "rgba(14,26,27,.95)"],
      ]);
      ctx.fillRect(0, 0, W, H);
    }
    if (shapes) {
      ctx.strokeStyle = bg ? "rgba(63,184,165,.12)" : "rgba(63,184,165,.18)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, H);
        ctx.stroke();
      }
      for (let yy = 0; yy <= H; yy += 22) {
        ctx.beginPath();
        ctx.moveTo(0, yy + 0.5);
        ctx.lineTo(W, yy + 0.5);
        ctx.stroke();
      }
      if (!bg) {
        ctx.save();
        ctx.translate(W / 2, 34 + 60);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = "#3FB8A5";
        ctx.lineWidth = 2;
        ctx.strokeRect(-60, -60, 120, 120);
        ctx.restore();
      }
    }
    let y = H - P;
    ctx.fillStyle = "#9ED8CC";
    ctx.font = `500 9px ${F.mono}`;
    const meta = [t.date ? d.dateMono : null, t.place ? (d.city || d.venue).toUpperCase() : null, t.price && d.price ? d.price.toUpperCase() : null].filter(Boolean).join(" · ");
    if (meta) ctx.fillText(meta, P, y);
    y -= 16;
    if (t.title) {
      const size = style === "TYPO" ? 32 : 26;
      ctx.font = `800 ${size}px ${F.sans}`;
      const lines = wrap(ctx, `${d.title}.`, W - 2 * P);
      lines.reverse().forEach((l, i) => {
        ctx.fillStyle = i === 0 ? "#3FB8A5" : "#FFFFFF";
        ctx.fillText(l, P, y - i * size);
      });
    }
    if (t.logos) {
      ctx.fillStyle = "#9ED8CC";
      ctx.font = `700 9px ${F.sans}`;
      spaced(ctx, d.org.toUpperCase(), P, P + 9, 2);
    }
  } else {
    ctx.fillStyle = p.c;
    ctx.fillRect(0, 0, W, H);
    if (shapes) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.clip();
      ctx.strokeStyle = "rgba(12,74,58,.16)";
      ctx.lineWidth = 10;
      for (let x = -H; x < W + H; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, H);
        ctx.lineTo(x + H, 0);
        ctx.stroke();
      }
      ctx.restore();
      const top = 46;
      const bottom = H - 96;
      const r = (W - 40) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(P, bottom);
      ctx.lineTo(P, top + r);
      ctx.arc(W / 2, top + r, r, Math.PI, 0);
      ctx.lineTo(W - P, bottom);
      ctx.closePath();
      if (bg) {
        // L'image de l'IA dans l'arche.
        ctx.clip();
        cover(ctx, bg, P, top, W - 2 * P, bottom - top);
      } else {
        ctx.fillStyle = p.a;
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.fillStyle = p.ink;
    ctx.font = `700 9px ${F.sans}`;
    spaced(ctx, d.tagline, P, P + 9, 2);
    let y = H - P;
    ctx.font = `600 10px ${F.sans}`;
    const meta = [t.date ? d.dayMonth : null, t.place ? d.city || d.venue : null, t.price && d.price ? d.price : null].filter(Boolean).join(" · ");
    if (meta) ctx.fillText(meta, P, y);
    y -= 16;
    if (t.title) {
      const size = style === "TYPO" ? 30 : 24;
      ctx.font = `800 ${size}px ${F.sans}`;
      const lines = wrap(ctx, d.title, W - 2 * P);
      lines.reverse().forEach((l, i) => ctx.fillText(l, P, y - i * size));
    }
  }
  ctx.restore();
}

function PosterCanvas({ draw, version }: { draw: (ctx: CanvasRenderingContext2D, k: number) => void; version: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      const k = (canvas.clientWidth * (window.devicePixelRatio || 1)) / 250;
      canvas.width = Math.round(250 * k);
      canvas.height = Math.round(312.5 * k);
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx, k);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  return <canvas ref={ref} className="block aspect-[4/5] w-full rounded-[10px]" />;
}

// Image générée par l'IA pour chaque proposition (même ordre que NAMES).
const LAYOUT_STYLE = ["elegant", "photo", "neon", "afro-moderne"] as const;
const LAYOUT_HINT = ["Ambiance gala, vert et or", "Photographie éditoriale", "Lumières néon", "Motifs afro contemporains"];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((ok, ko) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ko(new Error("Image illisible."));
    img.src = src;
  });
}

// Carte en attente : GiyaX AI « imagine » l'image de la proposition.
function AiPending({ hint }: { hint: string }) {
  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[10px] bg-[#0B3B2E]/85 px-3 text-center text-white">
      <span aria-hidden className="animate-ai-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <GiyaxAvatar size={46} mood="thinking" />
      <span className="text-xs font-semibold">GiyaX AI imagine l&apos;image…</span>
      <span className="text-[11px] text-white/70">{hint}</span>
    </span>
  );
}

export function PosterStudio({ form, orgName, onBack, onUse }: { form: EditorForm; orgName: string; onBack: () => void; onUse: (dataUrl: string) => void }) {
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState<Style>("GRAPHIC");
  const [brand, setBrand] = useState(true);
  const [texts, setTexts] = useState<Texts>({ title: true, date: true, place: true, logos: true, price: false });
  const [selected, setSelected] = useState(0);
  const [variants, setVariants] = useState([0, 0, 0, 0]);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  // Images générées par l'IA (une par proposition) et accroche écrite par l'IA.
  const [bgs, setBgs] = useState<(string | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState([false, false, false, false]);
  const [tagline, setTagline] = useState<string | null>(null);
  const images = useRef<(HTMLImageElement | null)[]>([null, null, null, null]);
  const started = useRef(false);
  const aiText = useAiText();
  const busy = loading.some(Boolean);
  const withImages = FEATURES.aiPoster && style !== "TYPO";

  const startIso = `${form.startDay || new Date().toISOString().slice(0, 10)}T${form.startTime || "09:00"}`;
  const start = new Date(startIso);
  const minPrice = form.formulas.length ? Math.min(...form.formulas.map((f) => f.price)) : null;
  const data: PosterData = {
    org: orgName,
    title: (customTitle ?? form.title) || "Votre événement",
    typeLine: typeOption(form.eventType).card,
    year: String(start.getFullYear()),
    dateLong: `${formatEventDay(startIso)} · ${form.startTime}`,
    dateShort: start.toLocaleDateString("fr-FR").replace(/\//g, "."),
    dateMono: `${start.getDate()} ${start.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase()} · ${form.startTime}`,
    dayMonth: formatEventDay(startIso).replace(/ \d{4}$/, "").replace(/(\d+) (\S+)$/, (_, dd: string) => `${dd} ${start.toLocaleDateString("fr-FR", { month: "long" })}`),
    venue: form.venueName,
    city: form.city,
    price: minPrice === null ? "" : minPrice === 0 ? "Entrée gratuite" : `Dès ${amount(minPrice)} F`,
    tagline: tagline ?? TAGLINE[form.eventType ?? ""] ?? "RENCONTRE · PARTAGE · ÉMOTION",
  };

  const paletteOf = (n: number) => (brand ? PALETTES : FREE_PALETTES)[(variants[n] + (brand ? 0 : n)) % 3];
  const bgOf = (n: number) => (withImages ? images.current[n] : null);
  const version = (n: number) => JSON.stringify([n, data, texts, style, brand, variants[n], withImages ? (bgs[n]?.length ?? 0) : 0]);

  // L'IA travaille : 4 images en parallèle (chaque carte se remplit à
  // l'arrivée de la sienne) et l'accroche de l'affiche.
  async function generateWithAi() {
    if (!FEATURES.aiPoster) return;
    setLoading([true, true, true, true]);
    const title = (form.title || "Événement").slice(0, 200);
    aiText
      .mutateAsync({
        prompt: `Écris l'accroche d'une affiche d'événement : 3 ou 4 mots-clés en majuscules séparés par « · » (exemple : MUSIQUE · ÉNERGIE · LIVE). Événement : « ${title.slice(0, 120)} »${form.eventType ? `, ${typeOption(form.eventType).card}` : ""}.${mood.trim() ? ` Ambiance : ${mood.trim().slice(0, 150)}.` : ""} Réponds uniquement par l'accroche.`,
      })
      .then((t) => {
        const clean = t.replace(/["«»“”.*]/g, "").split("\n")[0].trim().toUpperCase().slice(0, 48);
        if (clean) setTagline(clean);
      })
      .catch(() => undefined);
    let warned = false;
    await Promise.all(
      LAYOUT_STYLE.map(async (s, n) => {
        try {
          const url = await generateVisual({ title, eventType: form.eventType ?? undefined, style: s, prompt: mood.trim() || undefined });
          images.current[n] = await loadImage(url);
          setBgs((b) => b.map((x, i) => (i === n ? url : x)));
        } catch (err) {
          if (!warned) {
            warned = true;
            toast.error(aiError(err));
          }
        } finally {
          setLoading((l) => l.map((x, i) => (i === n ? false : x)));
        }
      })
    );
  }

  // Ouvert depuis « Générer avec l'IA » : la génération démarre aussitôt.
  useEffect(() => {
    if (!FEATURES.aiPoster) return;
    const t = window.setTimeout(() => {
      if (started.current) return;
      started.current = true;
      void generateWithAi();
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function exportPng(n: number) {
    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canevas indisponible.");
    drawPoster(ctx, 1080 / 250, n, paletteOf(n), data, texts, style, fontFamilies(), bgOf(n));
    // Le serveur accepte 450 000 caractères au plus par image importée.
    for (const q of [0.86, 0.78, 0.7, 0.6, 0.5]) {
      const url = canvas.toDataURL("image/jpeg", q);
      if (url.length <= 440_000) return url;
    }
    throw new Error("Affiche trop lourde : retirez un élément et réessayez.");
  }

  async function result(): Promise<string | null> {
    if (style === "PHOTO") return bgs[selected];
    return exportPng(selected);
  }

  async function use() {
    try {
      const url = await result();
      if (url) onUse(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export impossible.");
    }
  }

  async function download() {
    const url = await result();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiche-${(form.title || "evenement").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;
    a.click();
  }

  function regenerate() {
    if (withImages) void generateWithAi();
    else setVariants((v) => v.map((x) => (x + 1) % 3));
  }

  const hasImages = bgs.some(Boolean);
  const ready = style !== "PHOTO" || !!bgs[selected];

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-[2] flex items-center justify-between gap-4 border-b border-ev-border bg-ev-surface px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3.5">
          <button type="button" aria-label="Retour aux informations" onClick={onBack} className="flex size-9 items-center justify-center rounded-[10px] border border-ev-border text-ev-ink2 hover:bg-ev-soft">
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ev-muted">Étape 1 · Informations › Affiche</span>
            <h1 className="m-0 flex items-center gap-2 text-[19px] font-semibold tracking-[-0.01em]">
              <Sparkles className="size-[18px] text-ev-link" />
              Générer une affiche avec l&apos;IA
            </h1>
          </div>
        </div>
        {FEATURES.aiPoster && (
          <span className="hidden items-center gap-2 text-[13px] text-ev-muted sm:flex">
            <GiyaxAvatar size={30} mood={busy ? "thinking" : "idle"} />
            {busy ? "GiyaX AI crée vos images…" : hasImages ? "Images créées par GiyaX AI" : "GiyaX AI est prêt"}
          </span>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row">
        <form onSubmit={(e) => e.preventDefault()} aria-label="Brief de l'affiche" className="flex w-full shrink-0 flex-col gap-[22px] border-ev-line px-5 pb-8 pt-6 sm:px-8 lg:w-[340px] lg:border-r lg:pl-8 lg:pr-6">
          <div className="flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold">Repris de votre événement</span>
            <div className="flex flex-col gap-2 rounded-[10px] bg-ev-bg p-3 text-xs text-ev-ink2">
              {(
                [
                  ["Titre", form.title || "—"],
                  ["Date", `${formatEventDay(startIso)} · ${form.startTime}`],
                  ["Lieu", form.venueName || "—"],
                  ["Logos", orgName],
                ] as const
              ).map(([k, v]) => (
                <span key={k} className="flex justify-between gap-2">
                  <span className="text-ev-muted">{k}</span>
                  <span className="text-right">{v}</span>
                </span>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Décrivez l&apos;ambiance souhaitée</span>
            <textarea
              rows={4}
              maxLength={400}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Institutionnel mais inspirant, touches de vert et d'or…"
              className="resize-y rounded-[10px] border border-ev-border bg-ev-surface px-3 py-2.5 text-[13px] leading-[1.55] outline-none focus:border-ev-primary focus:shadow-[0_0_0_3px_var(--ev-mint)]"
            />
            <span className="flex flex-wrap gap-1.5">
              {["Élégant", "Jeune & dynamique", "Afro contemporain", "Tech"].map((c) => (
                <button key={c} type="button" onClick={() => setMood((m) => (m ? `${m}, ${c.toLowerCase()}` : c))} className="h-7 rounded-full border border-ev-border bg-ev-surface px-2.5 text-xs hover:bg-ev-soft">
                  + {c}
                </button>
              ))}
            </span>
          </label>
          {tagline && (
            <div className="flex flex-col gap-1.5 rounded-[10px] border border-[#D5E6DE] bg-ev-selected px-3 py-2.5 dark:border-ev-border">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ev-primary">
                <Sparkles className="size-3.5" /> Accroche écrite par l&apos;IA
              </span>
              <TypewriterText text={tagline} className="font-ev-mono text-xs tracking-[0.08em]" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Style</span>
            <div role="radiogroup" aria-label="Style" className={cn("grid gap-1.5", FEATURES.aiPoster ? "grid-cols-3" : "grid-cols-2")}>
              {(
                [
                  ["PHOTO", "Image seule"],
                  ["GRAPHIC", "Graphique"],
                  ["TYPO", "Typographique"],
                ] as const
              )
                // « Image seule » : les images de l'IA sans texte (drapeau ai-poster).
                .filter(([v]) => v !== "PHOTO" || FEATURES.aiPoster)
                .map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={style === v}
                    onClick={() => setStyle(v)}
                    className={cn("h-[38px] rounded-[10px] text-xs", style === v ? "border-[1.5px] border-ev-primary bg-ev-selected font-semibold" : "border border-ev-border bg-ev-surface font-medium")}
                  >
                    {l}
                  </button>
                ))}
            </div>
            {style === "TYPO" && <span className="text-xs text-ev-muted">Typographique : sans image, uniquement vos textes.</span>}
          </div>
          {style !== "PHOTO" && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold">Couleurs</span>
              <div role="radiogroup" aria-label="Couleurs" className="flex flex-col gap-1.5 text-[13px]">
                <button type="button" role="radio" aria-checked={brand} onClick={() => setBrand(true)} className={cn("flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left", brand ? "border-[1.5px] border-ev-primary bg-ev-selected" : "border border-ev-border")}>
                  <span className="flex">
                    <span className="size-4 rounded-full bg-[#0C4A3A]" />
                    <span className="-ml-[5px] size-4 rounded-full bg-[#C79A3B] shadow-[0_0_0_2px_var(--ev-selected)]" />
                  </span>
                  Couleurs de mes logos
                </button>
                <button type="button" role="radio" aria-checked={!brand} onClick={() => setBrand(false)} className={cn("flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left", !brand ? "border-[1.5px] border-ev-primary bg-ev-selected" : "border border-ev-border")}>
                  <span className="h-4 w-[27px] rounded-full" style={{ background: "conic-gradient(#C2547A, #E39A1F, #0F8A64, #2C5BA8, #C2547A)" }} />
                  Libre
                </button>
              </div>
            </div>
          )}
          {style !== "PHOTO" && (
            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className="mb-2 p-0 text-[13px] font-semibold">Textes sur l&apos;affiche</legend>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <EvCheckbox checked={texts.title} onChange={(v) => setTexts({ ...texts, title: v })} label="Titre" />
                <EvCheckbox checked={texts.date} onChange={(v) => setTexts({ ...texts, date: v })} label="Date et heure" />
                <EvCheckbox checked={texts.place} onChange={(v) => setTexts({ ...texts, place: v })} label="Lieu" />
                <EvCheckbox checked={texts.logos} onChange={(v) => setTexts({ ...texts, logos: v })} label="Logos" />
                <EvCheckbox checked={texts.price} onChange={(v) => setTexts({ ...texts, price: v })} label="Prix" disabled={form.formulas.length === 0} />
                <EvCheckbox checked={false} label="Intervenants" disabled />
              </div>
            </fieldset>
          )}
          <EvButton variant="primary" size="lg" className="h-11 w-full" onClick={regenerate} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : withImages ? <Sparkles /> : <RefreshCw />}
            {busy ? "GiyaX AI crée vos images…" : withImages ? (hasImages ? "Nouvelles images avec l'IA" : "Générer avec l'IA") : "Régénérer 4 propositions"}
          </EvButton>
        </form>

        <section aria-label="Propositions" className="flex min-w-0 flex-1 flex-col gap-4 px-5 pb-8 pt-6 sm:px-8 lg:pl-6">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 text-[15px] font-semibold">4 propositions</h2>
            <span className="text-xs text-ev-muted">Format 4:5 · cliquez pour choisir</span>
          </div>
          <div role="radiogroup" aria-label="Propositions d'affiche" className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2">
            {NAMES.map((name, n) => {
              const sel = selected === n;
              return (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setSelected(n)}
                  className={cn("flex flex-col gap-2 rounded-[14px] p-1.5 text-left", sel ? "border-2 border-ev-primary bg-ev-selected" : "border border-ev-border bg-ev-surface")}
                >
                  <span className="relative block">
                    {style === "PHOTO" ? (
                      <span className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[10px] bg-ev-line text-center text-xs text-ev-muted">
                        {bgs[n] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bgs[n]!} alt={`Image ${n + 1} créée par l'IA`} className="size-full object-cover" />
                        ) : (
                          !loading[n] && <span className="px-4">Lancez la génération pour obtenir l&apos;image.</span>
                        )}
                      </span>
                    ) : (
                      <PosterCanvas version={version(n)} draw={(ctx, k) => drawPoster(ctx, k, n, paletteOf(n), data, texts, style, fontFamilies(), bgOf(n))} />
                    )}
                    {withImages && loading[n] && <AiPending hint={LAYOUT_HINT[n]} />}
                  </span>
                  <span className="flex items-center justify-between px-1 pb-0.5">
                    <span className={cn("flex items-center gap-1.5 text-xs", sel ? "font-semibold text-ev-ink" : "text-ev-muted")}>
                      Proposition {n + 1} · {name}
                      {withImages && bgs[n] && <Sparkles className="size-3 text-ev-link" aria-label="Image créée par l'IA" />}
                    </span>
                    {sel && <Check className="size-4 text-ev-link" />}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {style !== "PHOTO" && (
              <EvButton size="sm" onClick={() => setVariants((v) => v.map((x, i) => (i === selected ? (x + 1) % 3 : x)))}>
                Couleurs de la proposition {selected + 1}
              </EvButton>
            )}
            {style !== "PHOTO" && (
              <EvButton
                size="sm"
                onClick={() => {
                  const next = window.prompt("Texte du titre sur l'affiche", customTitle ?? form.title);
                  if (next !== null) setCustomTitle(next.trim() || null);
                }}
              >
                Modifier le texte
              </EvButton>
            )}
            <EvButton size="sm" onClick={() => void download()} disabled={!ready}>
              Télécharger
            </EvButton>
          </div>
          <p className="m-0 text-xs leading-normal text-ev-muted">
            Images créées par l&apos;IA pour votre événement : vérifiez-les, ainsi que les informations, avant de publier.
          </p>
        </section>
      </div>

      <footer className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-ev-border bg-ev-surface px-4 py-3 sm:gap-3 sm:px-8 sm:py-3.5">
        <EvButton size="lg" className="h-[40px] px-3.5 text-[13px] sm:h-11 sm:px-[18px] sm:text-sm" onClick={onBack}>
          Annuler
        </EvButton>
        <EvButton variant="primary" size="lg" className="h-[40px] px-3.5 text-[13px] sm:h-11 sm:px-[18px] sm:text-sm" onClick={() => void use()} disabled={!ready}>
          <Check />
          {`Utiliser la proposition ${selected + 1}`}
        </EvButton>
      </footer>
    </div>
  );
}
