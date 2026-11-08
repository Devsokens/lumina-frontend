"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Maximize2, Minimize2, Search, X } from "lucide-react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { cn } from "@/lib/utils";

// Choix du lieu sur une carte (éditeur d'événement) : recherche d'adresse
// (OpenStreetMap Nominatim, à la demande — pas de saisie semi-automatique,
// conformément à ses règles d'usage), clic sur la carte ou déplacement du
// repère. Les coordonnées alimentent la carte de la page publique.

export type LatLng = { lat: number; lng: number };
type Place = { label: string; lat: number; lng: number; city: string | null };

// Libreville par défaut.
const DEFAULT_CENTER: LatLng = { lat: 0.4162, lng: 9.4673 };
const round = (n: number) => Math.round(n * 1e6) / 1e6;

async function searchPlaces(query: string): Promise<Place[]> {
  const params = new URLSearchParams({ q: query, format: "jsonv2", addressdetails: "1", limit: "5", "accept-language": "fr" });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("search");
  const rows = (await res.json()) as {
    display_name: string;
    lat: string;
    lon: string;
    address?: { city?: string; town?: string; village?: string; state?: string };
  }[];
  return rows.map((r) => ({
    label: r.display_name,
    lat: round(Number(r.lat)),
    lng: round(Number(r.lon)),
    city: r.address?.city ?? r.address?.town ?? r.address?.village ?? null,
  }));
}

// Repère aux couleurs de GiyaX (pas d'image : les icônes par défaut de
// Leaflet se perdent avec le bundler).
function pinIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "",
    html: '<span style="display:block;width:30px;height:30px;border-radius:999px 999px 999px 0;transform:rotate(-45deg);background:#0C4A3A;border:3px solid #fff;box-shadow:0 6px 16px rgba(11,59,46,.45)"></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

// Défilement sur la carte, comme dans les applications de cartes :
// - deux doigts sur le pavé tactile, ou molette : déplacer la carte ;
// - pincement (le navigateur l'envoie avec ctrlKey), Ctrl ou ⌘ + molette : zoomer
//   autour du pointeur.
// Les mouvements sont regroupés par image (requestAnimationFrame) ; la page
// ne défile pas tant que le pointeur est sur la carte.
function bindWheel(el: HTMLElement, m: LeafletMap): () => void {
  let panX = 0;
  let panY = 0;
  let zoomBy = 0;
  let at: Parameters<LeafletMap["setZoomAround"]>[0] | null = null;
  let frame = 0;

  const flush = () => {
    frame = 0;
    if (zoomBy && at) {
      const next = Math.min(m.getMaxZoom(), Math.max(m.getMinZoom(), m.getZoom() + zoomBy));
      m.setZoomAround(at, next, { animate: false });
    }
    if (panX || panY) m.panBy([panX, panY], { animate: false });
    panX = panY = zoomBy = 0;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Lignes (souris sous Firefox) ou pages → pixels.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
    if (e.ctrlKey || e.metaKey) {
      // Un cran de molette ≈ 1 niveau ; un pincement, quelques centièmes par événement.
      zoomBy += Math.max(-1, Math.min(1, (-e.deltaY * unit) / 100));
      at = m.mouseEventToContainerPoint(e);
    } else {
      panX += (e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX) * unit;
      panY += (e.shiftKey && !e.deltaX ? 0 : e.deltaY) * unit;
    }
    if (!frame) frame = requestAnimationFrame(flush);
  };

  el.addEventListener("wheel", onWheel, { passive: false });
  return () => {
    el.removeEventListener("wheel", onWheel);
    if (frame) cancelAnimationFrame(frame);
  };
}

export function LocationPicker({
  value,
  defaultQuery,
  onChange,
  onCity,
}: {
  value: LatLng | null;
  defaultQuery: string;
  onChange: (v: LatLng | null) => void;
  // Ville trouvée par la recherche (pour compléter le champ Ville s'il est vide).
  onCity?: (city: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  // Dernier onChange, lu par les écouteurs Leaflet créés une seule fois.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Place (ou déplace) le repère.
  function place(p: LatLng, pan = true) {
    const L = leaflet.current;
    const m = map.current;
    if (!L || !m) return;
    if (marker.current) marker.current.setLatLng(p);
    else {
      marker.current = L.marker(p, { icon: pinIcon(L), draggable: true, keyboard: true, title: "Lieu de l'événement" }).addTo(m);
      marker.current.on("dragend", () => {
        const at = marker.current!.getLatLng();
        onChangeRef.current({ lat: round(at.lat), lng: round(at.lng) });
      });
    }
    if (pan) m.setView(p, Math.max(m.getZoom(), 17));
  }

  // Carte créée une fois (Leaflet chargé à la demande : il a besoin de window).
  useEffect(() => {
    let cancelled = false;
    let detachWheel: (() => void) | null = null;
    void import("leaflet").then((L) => {
      if (cancelled || !box.current || map.current) return;
      leaflet.current = L;
      const start = value ?? DEFAULT_CENTER;
      // zoomSnap 0 : zoom continu (pincement fluide sur pavé tactile).
      const m = L.map(box.current, {
        center: start,
        zoom: value ? 17 : 13,
        scrollWheelZoom: false,
        zoomSnap: 0,
        zoomDelta: 1,
        attributionControl: true,
      });
      detachWheel = bindWheel(box.current, m);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(m);
      m.on("click", (e) => {
        const p = { lat: round(e.latlng.lat), lng: round(e.latlng.lng) };
        place(p, false);
        onChangeRef.current(p);
      });
      map.current = m;
      if (value) place(value, false);
    });
    return () => {
      cancelled = true;
      detachWheel?.();
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valeur changée de l'extérieur (événement chargé, point retiré).
  useEffect(() => {
    if (!map.current) return;
    if (value) place(value, false);
    else if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  // Carte agrandie ou réduite : Leaflet doit recalculer sa taille, en gardant
  // le repère (ou le centre) en vue.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const t = setTimeout(() => {
      m.invalidateSize();
      if (marker.current) m.panTo(marker.current.getLatLng());
    }, 220);
    return () => clearTimeout(t);
  }, [expanded]);

  async function search() {
    const q = (query.trim() || defaultQuery.trim()).slice(0, 200);
    if (!q) return setError("Saisissez une adresse ou le nom du lieu.");
    setSearching(true);
    setError(null);
    try {
      const list = await searchPlaces(q);
      setResults(list);
      if (!list.length) setError("Aucun lieu trouvé : précisez l'adresse, ou cliquez directement sur la carte.");
    } catch {
      setError("Recherche indisponible pour l'instant : cliquez directement sur la carte.");
    } finally {
      setSearching(false);
    }
  }

  function choose(p: Place) {
    setResults(null);
    setQuery("");
    place(p);
    onChange({ lat: p.lat, lng: p.lng });
    if (p.city) onCity?.(p.city);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <div className="flex gap-2">
          <span className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-ev-muted focus-within:border-ev-primary focus-within:shadow-[0_0_0_3px_var(--ev-mint)]">
            <Search className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void search();
                }
              }}
              maxLength={200}
              placeholder={defaultQuery ? `Rechercher « ${defaultQuery} »…` : "Rechercher une adresse ou un lieu…"}
              aria-label="Rechercher le lieu sur la carte"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ev-ink outline-none placeholder:text-ev-muted"
            />
          </span>
          <button type="button" onClick={() => void search()} disabled={searching} className="flex h-10 items-center gap-1.5 rounded-[10px] bg-ev-primary px-3.5 text-[13px] font-semibold text-white disabled:opacity-60">
            {searching ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
            Trouver
          </button>
        </div>
        {results && results.length > 0 && (
          <ul className="absolute inset-x-0 top-12 z-[500] m-0 list-none overflow-hidden rounded-[12px] border border-ev-border bg-ev-surface p-1 shadow-[0_16px_40px_rgba(22,33,28,.18)]">
            {results.map((r) => (
              <li key={`${r.lat},${r.lng}`}>
                <button type="button" onClick={() => choose(r)} className="flex w-full items-start gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] hover:bg-ev-soft">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ev-primary" />
                  <span className="line-clamp-2">{r.label}</span>
                </button>
              </li>
            ))}
            <li className="flex justify-end px-1 pt-1">
              <button type="button" onClick={() => setResults(null)} className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-xs text-ev-muted hover:bg-ev-soft">
                <X className="size-3" /> Fermer
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* isolate : les calques de Leaflet (z-index jusqu'à 1000) restent sous la liste des résultats. */}
      <div className="relative isolate overflow-hidden rounded-[12px] border border-ev-border">
        {/* La hauteur change sur ce conteneur, jamais sur le nœud de Leaflet :
            React y écraserait les classes posées par Leaflet. */}
        <div className={cn("w-full transition-[height] duration-200", expanded ? "h-[min(560px,65vh)]" : "h-[320px]")}>
          <div ref={box} className="size-full bg-ev-soft" role="application" aria-label="Carte : cliquez pour placer le lieu de l'événement" />
        </div>
        {!value && (
          <span className="pointer-events-none absolute left-1/2 top-3 z-[400] -translate-x-1/2 rounded-full bg-ev-surface/95 px-3 py-1 text-xs font-medium text-ev-ink2 shadow">
            Cliquez sur la carte pour placer le lieu
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-pressed={expanded}
          className="absolute right-2.5 top-2.5 z-[1000] flex h-[34px] items-center gap-1.5 rounded-[8px] border-2 border-black/20 bg-white px-2.5 text-xs font-semibold text-[#16211C] shadow-sm hover:bg-[#F4F4F4]"
        >
          {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          {expanded ? "Réduire" : "Agrandir"}
        </button>
      </div>

      <div className={cn("flex flex-wrap items-center justify-between gap-2 text-xs", error ? "text-ev-danger" : "text-ev-muted")}>
        <span>
          {error ??
            (value
              ? `Position enregistrée · ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)} · déplacez le repère pour ajuster`
              : "Glissez ou faites défiler pour vous déplacer ; pincez, Ctrl + molette ou + / − pour zoomer. Cliquez ensuite sur l'entrée du lieu.")}
        </span>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="font-semibold text-ev-ink2 underline-offset-2 hover:underline">
            Retirer le repère
          </button>
        )}
      </div>
    </div>
  );
}
