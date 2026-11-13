"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, ImagePlus, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { EvButton, EvCard, EvProgress, EvSegmented } from "@/components/events/ev-ui";
import { apiErrorMessage } from "@/lib/events";
import { ACCEPTED_IMAGE_TYPES, preparePhoto } from "@/lib/image";
import { cn } from "@/lib/utils";
import { uploadEventPhoto, useDeleteEventPhotos, useEventPhotos, useHideEventPhotos, useRefreshEventPhotos, type EventPhoto } from "@/hooks/useEventPhotos";
import type { ApiEvent } from "@/types/events";

// Onglet Album : les photos de l'événement, comme dans un dossier en ligne.
// Glisser-déposer ou bouton d'import, envoi par petits lots avec progression,
// sélection multiple (clic, Maj+clic), masquer / afficher sur le site,
// supprimer, visionneuse. Les photos visibles sont publiées dans « Souvenirs »
// une fois l'événement terminé.

// Photos envoyées en même temps : assez pour aller vite, sans saturer une
// connexion mobile.
const PARALLEL = 3;

type Filter = "all" | "visible" | "hidden";
type Upload = { total: number; done: number; failed: { name: string; reason: string }[] };

const megabytes = (bytes: number) => (bytes < 1_048_576 ? `${Math.max(1, Math.round(bytes / 1024))} ko` : `${(bytes / 1_048_576).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`);

export function TabAlbum({ event }: { event: ApiEvent }) {
  const { data: album, isLoading, isError } = useEventPhotos(event.id);
  const refresh = useRefreshEventPhotos(event.id);
  const hide = useHideEventPhotos(event.id);
  const remove = useDeleteEventPhotos(event.id);

  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewer, setViewer] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const dragDepth = useRef(0);

  const photos = useMemo(() => album?.photos ?? [], [album]);
  const shown = useMemo(() => (filter === "all" ? photos : photos.filter((p) => (filter === "hidden" ? p.hidden : !p.hidden))), [photos, filter]);
  const hiddenCount = photos.filter((p) => p.hidden).length;
  // Heure d'ouverture de l'onglet (rendu pur).
  const [now] = useState(() => Date.now());
  const ended = new Date(event.endDate ?? event.startDate).getTime() < now;
  const busy = !!upload && upload.done + upload.failed.length < upload.total;
  const room = album ? Math.max(0, album.limit - album.count) : 0;

  // Sélection : ne garde que les photos encore présentes.
  const picked = useMemo(() => photos.filter((p) => selected.has(p.id)), [photos, selected]);

  const send = useCallback(
    async (list: File[]) => {
      if (!album) return;
      if (!album.storage) return void toast.error("Le stockage des photos n'est pas encore activé sur ce compte.");
      const images = list.filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type));
      const skipped = list.length - images.length;
      if (images.length === 0) return void toast.error("Aucune photo utilisable : PNG, JPG ou WEBP.");
      const files = images.slice(0, room);
      if (files.length === 0) return void toast.error(`Album complet : ${album.limit} photos au plus.`);
      if (files.length < images.length) toast.message(`${images.length - files.length} photo(s) non envoyée(s) : limite de ${album.limit} photos atteinte.`);
      if (skipped > 0) toast.message(`${skipped} fichier(s) ignoré(s) : seules les photos PNG, JPG ou WEBP sont acceptées.`);

      const controller = new AbortController();
      abort.current = controller;
      const state: Upload = { total: files.length, done: 0, failed: [] };
      setUpload({ ...state });
      let next = 0;
      const worker = async () => {
        while (next < files.length && !controller.signal.aborted) {
          const file = files[next++];
          try {
            const image = await preparePhoto(file);
            await uploadEventPhoto(event.id, image, controller.signal);
            state.done += 1;
          } catch (err) {
            if (controller.signal.aborted) return;
            state.failed.push({ name: file.name, reason: err instanceof Error && !("isAxiosError" in err) ? err.message : apiErrorMessage(err, "Envoi impossible.") });
          }
          setUpload({ ...state, failed: [...state.failed] });
          // Les photos apparaissent au fur et à mesure.
          if (state.done % 6 === 0) void refresh();
        }
      };
      await Promise.all(Array.from({ length: Math.min(PARALLEL, files.length) }, worker));
      await refresh();
      if (controller.signal.aborted) {
        setUpload(null);
        return void toast.message(`Envoi arrêté : ${state.done} photo(s) ajoutée(s).`);
      }
      if (state.failed.length === 0) {
        setUpload(null);
        toast.success(`${state.done} photo${state.done > 1 ? "s" : ""} ajoutée${state.done > 1 ? "s" : ""} à l'album.`);
      }
    },
    [album, event.id, refresh, room]
  );

  // Fermer l'onglet pendant un envoi : avertissement du navigateur.
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);
  useEffect(() => () => abort.current?.abort(), []);

  function toggle(id: string, range: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (range && anchor) {
        const a = shown.findIndex((p) => p.id === anchor);
        const b = shown.findIndex((p) => p.id === id);
        if (a >= 0 && b >= 0) {
          for (const p of shown.slice(Math.min(a, b), Math.max(a, b) + 1)) next.add(p.id);
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAnchor(id);
  }

  function clearSelection() {
    setSelected(new Set());
    setAnchor(null);
    setConfirm(false);
  }

  function setHidden(ids: string[], hidden: boolean) {
    hide.mutate(
      { ids, hidden },
      {
        onSuccess: () => toast.success(hidden ? `${ids.length} photo(s) masquée(s) sur le site.` : `${ids.length} photo(s) de nouveau visible(s).`),
        onError: (err) => toast.error(apiErrorMessage(err, "Modification impossible.")),
      }
    );
  }

  function removePhotos(ids: string[]) {
    remove.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} photo(s) supprimée(s).`);
        clearSelection();
        setViewer(null);
      },
      onError: (err) => toast.error(apiErrorMessage(err, "Suppression impossible.")),
    });
  }

  if (isLoading) return <p className="text-sm text-ev-muted">Chargement de l&apos;album…</p>;
  if (isError || !album) return <p className="text-sm text-ev-danger">L&apos;album n&apos;a pas pu être chargé. Rechargez la page.</p>;

  const allHidden = picked.length > 0 && picked.every((p) => p.hidden);
  const viewerIndex = viewer ? shown.findIndex((p) => p.id === viewer) : -1;

  return (
    <div
      className="relative flex flex-col gap-5"
      onDragEnter={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        if (!busy) void send([...e.dataTransfer.files]);
      }}
    >
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) void send(files);
        }}
      />

      <EvCard className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="m-0 text-[17px] font-semibold">Album de l&apos;événement</h2>
          <p className="m-0 max-w-[620px] text-[13px] leading-relaxed text-ev-muted">
            {ended
              ? "Les photos visibles sont en ligne dans la rubrique « Souvenirs » de votre site."
              : "Préparez l'album dès maintenant : il sera publié dans la rubrique « Souvenirs » de votre site une fois l'événement terminé."}{" "}
            Vous pouvez masquer une photo à tout moment sans la supprimer.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ev-muted">
            <span>
              <b className="text-ev-ink">{album.count}</b> / {album.limit} photos
            </span>
            <span>{megabytes(album.bytes)} utilisés</span>
            {hiddenCount > 0 && <span>{hiddenCount} masquée{hiddenCount > 1 ? "s" : ""}</span>}
          </div>
          <EvProgress value={(album.count / album.limit) * 100} className="mt-1 max-w-[280px]" />
        </div>
        <EvButton variant="primary" size="lg" disabled={busy || room === 0 || !album.storage} onClick={() => input.current?.click()}>
          <ImagePlus className="size-4" />
          Importer des photos
        </EvButton>
      </EvCard>

      {!album.storage && (
        <p className="m-0 rounded-[12px] border border-ev-border bg-ev-soft px-4 py-3 text-[13px] text-ev-ink2">Le stockage des photos n&apos;est pas encore activé : l&apos;import est indisponible pour le moment.</p>
      )}

      {upload && (
        <EvCard as="div" className="flex flex-col gap-3 p-4" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              {busy ? <Loader2 className="size-4 animate-spin text-ev-primary" /> : <Check className="size-4 text-ev-primary" />}
              {busy ? `Envoi en cours : ${upload.done + upload.failed.length} sur ${upload.total}` : `${upload.done} photo(s) envoyée(s), ${upload.failed.length} en échec`}
            </span>
            {busy ? (
              <EvButton size="sm" variant="ghost" onClick={() => abort.current?.abort()}>
                Arrêter
              </EvButton>
            ) : (
              <EvButton size="sm" variant="ghost" onClick={() => setUpload(null)}>
                Fermer
              </EvButton>
            )}
          </div>
          <EvProgress value={((upload.done + upload.failed.length) / upload.total) * 100} />
          {busy && <span className="text-xs text-ev-muted">Chaque photo est allégée avant l&apos;envoi. Gardez cette page ouverte.</span>}
          {upload.failed.length > 0 && (
            <ul className="m-0 flex max-h-32 list-none flex-col gap-1 overflow-y-auto p-0 text-xs text-ev-danger">
              {upload.failed.map((f, i) => (
                <li key={`${f.name}-${i}`} className="truncate">
                  {f.name} : {f.reason}
                </li>
              ))}
            </ul>
          )}
        </EvCard>
      )}

      {photos.length === 0 ? (
        <button
          type="button"
          disabled={busy || !album.storage}
          onClick={() => input.current?.click()}
          className="flex flex-col items-center gap-3 rounded-[16px] border-2 border-dashed border-ev-dash bg-ev-surface px-6 py-16 text-center transition-colors hover:bg-ev-soft disabled:pointer-events-none disabled:opacity-60"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-ev-mint text-ev-primary">
            <UploadCloud className="size-7" />
          </span>
          <span className="text-base font-semibold">Glissez vos photos ici</span>
          <span className="max-w-[420px] text-[13px] leading-relaxed text-ev-muted">
            ou cliquez pour les choisir. Vous pouvez en sélectionner plusieurs à la fois, jusqu&apos;à {album.limit} photos. PNG, JPG ou WEBP.
          </span>
        </button>
      ) : (
        <>
          <div className="sticky top-0 z-10 flex min-h-[52px] flex-wrap items-center justify-between gap-3 rounded-[12px] border border-ev-border bg-ev-surface px-3 py-2">
            {picked.length > 0 ? (
              <>
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <button type="button" aria-label="Annuler la sélection" onClick={clearSelection} className="flex size-8 items-center justify-center rounded-[8px] text-ev-ink2 hover:bg-ev-line">
                    <X className="size-4" />
                  </button>
                  {picked.length} sélectionnée{picked.length > 1 ? "s" : ""}
                  <button type="button" onClick={() => setSelected(new Set(shown.map((p) => p.id)))} className="text-ev-link hover:underline">
                    Tout sélectionner
                  </button>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  {confirm ? (
                    <>
                      <span className="text-[13px] text-ev-danger">Supprimer définitivement {picked.length} photo{picked.length > 1 ? "s" : ""} ?</span>
                      <EvButton size="sm" onClick={() => setConfirm(false)}>
                        Annuler
                      </EvButton>
                      <EvButton size="sm" variant="danger" disabled={remove.isPending} onClick={() => removePhotos(picked.map((p) => p.id))}>
                        Supprimer
                      </EvButton>
                    </>
                  ) : (
                    <>
                      <EvButton size="sm" disabled={hide.isPending} onClick={() => setHidden(picked.map((p) => p.id), !allHidden)}>
                        {allHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        {allHidden ? "Afficher sur le site" : "Masquer sur le site"}
                      </EvButton>
                      <EvButton size="sm" variant="danger" onClick={() => setConfirm(true)}>
                        <Trash2 className="size-4" />
                        Supprimer
                      </EvButton>
                    </>
                  )}
                </span>
              </>
            ) : (
              <>
                <EvSegmented<Filter>
                  ariaLabel="Photos affichées"
                  value={filter}
                  onChange={setFilter}
                  size="sm"
                  items={[
                    { value: "all", label: "Toutes", count: photos.length },
                    { value: "visible", label: "Visibles", count: photos.length - hiddenCount },
                    { value: "hidden", label: "Masquées", count: hiddenCount },
                  ]}
                />
                <span className="hidden text-xs text-ev-muted sm:block">Cochez des photos pour les masquer ou les supprimer · Maj+clic pour une série</span>
              </>
            )}
          </div>

          {shown.length === 0 ? (
            <p className="m-0 rounded-[12px] border border-dashed border-ev-dash p-8 text-center text-[13px] text-ev-muted">Aucune photo dans cette vue.</p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {shown.map((p) => {
                const on = selected.has(p.id);
                return (
                  <li key={p.id} className={cn("group relative aspect-square overflow-hidden rounded-[12px] bg-ev-line", on && "ring-[3px] ring-ev-primary")}>
                    <button type="button" aria-label="Agrandir la photo" onClick={(e) => (selected.size > 0 ? toggle(p.id, e.shiftKey) : setViewer(p.id))} className="block size-full">
                      {p.thumbUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- vignette déjà optimisée par le serveur (WebP 480 px)
                        <img src={p.thumbUrl} alt="" loading="lazy" decoding="async" className={cn("size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]", p.hidden && "opacity-45 grayscale", on && "scale-[0.94] rounded-[8px]")} />
                      )}
                    </button>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={on ? "Retirer de la sélection" : "Sélectionner la photo"}
                      onClick={(e) => toggle(p.id, e.shiftKey)}
                      className={cn(
                        "absolute left-2 top-2 flex size-7 items-center justify-center rounded-full border-2 transition-opacity",
                        on ? "border-ev-primary bg-ev-primary text-white opacity-100" : "border-white bg-black/35 text-transparent opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
                        selected.size > 0 && "opacity-100"
                      )}
                    >
                      <Check className="size-4" strokeWidth={3} />
                    </button>
                    {p.hidden && (
                      <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                        <EyeOff className="size-3" /> Masquée
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {dragging && !busy && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-ev-primary bg-ev-selected/95 text-ev-primary">
          <UploadCloud className="size-10" />
          <span className="text-base font-semibold">Déposez vos photos pour les ajouter à l&apos;album</span>
        </div>
      )}

      {viewerIndex >= 0 && (
        <PhotoViewer
          photos={shown}
          index={viewerIndex}
          onIndex={(i) => setViewer(shown[i].id)}
          onClose={() => setViewer(null)}
          onHide={(p) => setHidden([p.id], !p.hidden)}
          onDelete={(p) => removePhotos([p.id])}
          pending={hide.isPending || remove.isPending}
        />
      )}
    </div>
  );
}

// Visionneuse plein écran : flèches du clavier, Échap, masquer / supprimer.
function PhotoViewer({
  photos,
  index,
  onIndex,
  onClose,
  onHide,
  onDelete,
  pending,
}: {
  photos: EventPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  onHide: (p: EventPhoto) => void;
  onDelete: (p: EventPhoto) => void;
  pending: boolean;
}) {
  const photo = photos[index];
  const [confirm, setConfirm] = useState(false);
  const go = useCallback((d: number) => onIndex((index + d + photos.length) % photos.length), [index, onIndex, photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  const tool = "flex h-10 items-center gap-2 rounded-full bg-white/12 px-4 text-[13px] font-medium text-white hover:bg-white/20 disabled:opacity-50";
  return (
    <div role="dialog" aria-modal="true" aria-label="Photo de l'album" className="fixed inset-0 z-50 flex flex-col bg-black/92">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <span className="text-[13px] text-white/75">
          {index + 1} / {photos.length} · {photo.width} × {photo.height} · {megabytes(photo.size)}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {confirm ? (
            <>
              <span className="text-[13px]">Supprimer définitivement ?</span>
              <button type="button" className={tool} onClick={() => setConfirm(false)}>
                Annuler
              </button>
              <button type="button" disabled={pending} className={cn(tool, "bg-[#E5484D] hover:bg-[#E5484D]/85")} onClick={() => onDelete(photo)}>
                Supprimer
              </button>
            </>
          ) : (
            <>
              <button type="button" disabled={pending} className={tool} onClick={() => onHide(photo)}>
                {photo.hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {photo.hidden ? "Afficher sur le site" : "Masquer sur le site"}
              </button>
              <button type="button" className={tool} onClick={() => setConfirm(true)}>
                <Trash2 className="size-4" /> Supprimer
              </button>
            </>
          )}
          <button type="button" aria-label="Fermer" className={cn(tool, "w-10 justify-center px-0")} onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {photo.url && (
          // eslint-disable-next-line @next/next/no-img-element -- image déjà optimisée par le serveur (WebP 2000 px)
          <img key={photo.id} src={photo.url} alt="" className={cn("max-h-full max-w-full rounded-[8px] object-contain", photo.hidden && "opacity-60")} />
        )}
        {photos.length > 1 && (
          <>
            <button type="button" aria-label="Photo précédente" onClick={() => go(-1)} className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/20">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" aria-label="Photo suivante" onClick={() => go(1)} className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/20">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
