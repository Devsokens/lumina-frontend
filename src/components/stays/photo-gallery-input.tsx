"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, prepareImage } from "@/lib/image";
import { cn } from "@/lib/utils";

type Props = { value: string[]; onChange: (photos: string[]) => void; max?: number };

// Galerie de photos : import multiple (ré-encodé dans le navigateur, EXIF
// retiré, vérifié par le serveur), suppression, choix de la couverture
// (1re photo).
export function PhotoGalleryInput({ value, onChange, max = 10 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    const room = max - value.length;
    if (room <= 0) {
      toast.error(`${max} photos maximum.`);
      return;
    }
    setBusy(true);
    const added: string[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        added.push(await prepareImage(file));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Image illisible.");
      }
    }
    onChange([...value, ...added]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, to: number) {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {value.map((src, i) => (
        <div key={i} className={cn("group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted", i === 0 && "col-span-2 row-span-2 aspect-auto")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-full object-cover" />
          {i === 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold">Couverture</span>
          )}
          <div className="absolute right-2 top-2 flex gap-1">
            {i > 0 && (
              <button type="button" onClick={() => move(i, 0)} aria-label="Mettre en couverture" className="rounded-full bg-background/90 p-1.5 hover:bg-background">
                <Star className="size-3.5" />
              </button>
            )}
            {i > 1 && (
              <button type="button" onClick={() => move(i, i - 1)} aria-label="Avancer" className="rounded-full bg-background/90 p-1.5 hover:bg-background">
                <ArrowLeft className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label="Supprimer la photo"
              className="rounded-full bg-background/90 p-1.5 text-destructive hover:bg-background"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
      {value.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          Ajouter des photos
          <span className="text-xs">{value.length}/{max}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => void add(e.target.files)}
      />
    </div>
  );
}
