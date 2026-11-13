"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { EvButton, EvInput, EvSectionTitle } from "@/components/events/ev-ui";
import { prepareImage } from "@/lib/image";
import { newId, type EditorForm } from "./editor-model";

// Page publique de l'événement (site vitrine) : programme et intervenants,
// enregistrés dans Event.settings. L'album photo a son propre onglet.


export function EventPageExtras({ form, set }: { form: EditorForm; set: (patch: Partial<EditorForm>) => void }) {
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoFor, setPhotoFor] = useState<string | null>(null);

  function speakerPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    const id = photoFor;
    if (!file || !id) return;
    prepareImage(file, 480)
      .then((url) => set({ speakers: form.speakers.map((s) => (s.id === id ? { ...s, photoUrl: url } : s)) }))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Image illisible."))
      .finally(() => {
        input.value = "";
        setPhotoFor(null);
      });
  }

  return (
    <>
      <section className="flex flex-col gap-3.5">
        <EvSectionTitle title="Programme" sub="Le déroulé affiché sur la page de l'événement. Facultatif." />
        {form.program.map((p, i) => (
          <div key={p.id} className="grid gap-2 rounded-[12px] border border-ev-border p-3 sm:grid-cols-[110px_minmax(0,1fr)_auto]">
            <EvInput h={40} value={p.time} maxLength={40} placeholder="09:00" aria-label={`Horaire ${i + 1}`} onChange={(e) => set({ program: form.program.map((x) => (x.id === p.id ? { ...x, time: e.target.value } : x)) })} />
            <div className="flex min-w-0 flex-col gap-2">
              <EvInput h={40} value={p.title} maxLength={160} placeholder="Accueil des participants" aria-label={`Titre ${i + 1}`} onChange={(e) => set({ program: form.program.map((x) => (x.id === p.id ? { ...x, title: e.target.value } : x)) })} />
              <EvInput h={36} value={p.detail ?? ""} maxLength={300} placeholder="Détail (intervenant, salle…)" aria-label={`Détail ${i + 1}`} className="text-[13px]" onChange={(e) => set({ program: form.program.map((x) => (x.id === p.id ? { ...x, detail: e.target.value } : x)) })} />
            </div>
            <button type="button" aria-label="Retirer ce moment" onClick={() => set({ program: form.program.filter((x) => x.id !== p.id) })} className="flex size-9 items-center justify-center self-start rounded-[8px] text-ev-muted hover:bg-ev-line hover:text-ev-danger">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {form.program.length < 30 && (
          <EvButton size="sm" className="self-start border-dashed" onClick={() => set({ program: [...form.program, { id: newId(), time: "", title: "", detail: "" }] })}>
            <Plus /> Ajouter un moment
          </EvButton>
        )}
      </section>

      <section className="flex flex-col gap-3.5">
        <EvSectionTitle title="Intervenants" sub="Artistes, conférenciers, formateurs : photo, nom et fonction. Facultatif." />
        <input ref={photoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={speakerPhoto} />
        <div className="grid gap-3 sm:grid-cols-2">
          {form.speakers.map((s) => (
            <div key={s.id} className="flex items-start gap-3 rounded-[12px] border border-ev-border p-3">
              <button
                type="button"
                aria-label={`Photo de ${s.name || "l'intervenant"}`}
                onClick={() => {
                  setPhotoFor(s.id);
                  photoInput.current?.click();
                }}
                className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-ev-dash text-ev-muted hover:border-ev-primary"
              >
                {s.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <ImagePlus className="size-5" />
                )}
              </button>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <EvInput h={36} value={s.name} maxLength={120} placeholder="Nom" onChange={(e) => set({ speakers: form.speakers.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)) })} />
                <EvInput h={36} value={s.role ?? ""} maxLength={160} placeholder="Fonction" className="text-[13px]" onChange={(e) => set({ speakers: form.speakers.map((x) => (x.id === s.id ? { ...x, role: e.target.value } : x)) })} />
              </div>
              <button type="button" aria-label="Retirer l'intervenant" onClick={() => set({ speakers: form.speakers.filter((x) => x.id !== s.id) })} className="flex size-8 items-center justify-center rounded-[8px] text-ev-muted hover:bg-ev-line hover:text-ev-danger">
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        {form.speakers.length < 16 && (
          <EvButton size="sm" className="self-start border-dashed" onClick={() => set({ speakers: [...form.speakers, { id: newId(), name: "", role: "", photoUrl: null }] })}>
            <Plus /> Ajouter un intervenant
          </EvButton>
        )}
      </section>

    </>
  );
}
