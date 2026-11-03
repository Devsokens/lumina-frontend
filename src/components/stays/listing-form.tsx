"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiError } from "@/lib/api";
import { AMENITIES, LISTING_STATUS_LABELS, LISTING_TYPE_LABELS } from "@/lib/stays";
import { useSaveListing } from "@/hooks/useStays";
import { PhotoGalleryInput } from "@/components/stays/photo-gallery-input";
import { Counter } from "@/components/stays/counter";
import type { Listing, ListingInput, ListingStatus, ListingType } from "@/types/stays";
import { cn } from "@/lib/utils";

const EMPTY: ListingInput = {
  title: "",
  description: "",
  type: "APARTMENT",
  status: "DRAFT",
  city: "",
  address: "",
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  nightlyPrice: 0,
  cleaningFee: 0,
  minNights: 1,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  amenities: [],
  photos: [],
  houseRules: "",
};

function fromListing(l: Listing): ListingInput {
  return {
    ...EMPTY,
    ...l,
    description: l.description ?? "",
    address: l.address ?? "",
    houseRules: l.houseRules ?? "",
  };
}

// Création / édition d'un logement. Les montants sont saisis en FCFA et
// envoyés en centimes ; le serveur valide tout (DTO exhaustif).
export function ListingForm({ listing, onSaved }: { listing?: Listing; onSaved: (l: Listing) => void }) {
  const [form, setForm] = useState<ListingInput>(() => (listing ? fromListing(listing) : EMPTY));
  const save = useSaveListing();
  const set = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.title.trim().length < 3 || form.city.trim().length < 2 || form.nightlyPrice < 100) {
      toast.error("Titre, ville et prix par nuit sont requis.");
      return;
    }
    const { description, address, houseRules, ...rest } = form;
    save.mutate(
      {
        id: listing?.id,
        input: {
          ...rest,
          ...(description?.trim() ? { description: description.trim() } : {}),
          ...(address?.trim() ? { address: address.trim() } : {}),
          ...(houseRules?.trim() ? { houseRules: houseRules.trim() } : {}),
        },
      },
      {
        onSuccess: (saved) => {
          toast.success(listing ? "Logement mis à jour" : "Logement créé");
          onSaved(saved);
        },
        onError: (err) => toast.error(apiError(err, "Enregistrement impossible.")),
      }
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <Section title="Photos" hint="La première photo sert de couverture. 10 photos maximum.">
        <PhotoGalleryInput value={form.photos} onChange={(p) => set("photos", p)} />
      </Section>

      <Section title="Le logement">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titre" className="sm:col-span-2">
            <Input value={form.title} maxLength={120} placeholder="Appartement lumineux vue mer" onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Type">
            <NativeSelect value={form.type} onChange={(v) => set("type", v as ListingType)} options={LISTING_TYPE_LABELS} />
          </Field>
          {/* Archiver / remettre en ligne : bouton à double confirmation de la
              fiche (ListingArchiveButton), pas ce menu. */}
          <Field label="Visibilité">
            {form.status === "ARCHIVED" ? (
              <NativeSelect value="ARCHIVED" onChange={() => undefined} options={{ ARCHIVED: LISTING_STATUS_LABELS.ARCHIVED }} disabled />
            ) : (
              <NativeSelect
                value={form.status}
                onChange={(v) => set("status", v as ListingStatus)}
                options={{ DRAFT: LISTING_STATUS_LABELS.DRAFT, PUBLISHED: LISTING_STATUS_LABELS.PUBLISHED }}
              />
            )}
          </Field>
          <Field label="Ville">
            <Input value={form.city} maxLength={80} placeholder="Libreville" onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Adresse / quartier">
            <Input value={form.address} maxLength={200} placeholder="Quartier Louis, près de…" onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea rows={5} maxLength={5000} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Capacité">
        <div className="divide-y divide-border rounded-2xl border border-border">
          <Counter label="Voyageurs" value={form.maxGuests} min={1} max={30} onChange={(v) => set("maxGuests", v)} />
          <Counter label="Chambres" value={form.bedrooms} min={0} max={30} onChange={(v) => set("bedrooms", v)} />
          <Counter label="Lits" value={form.beds} min={1} max={50} onChange={(v) => set("beds", v)} />
          <Counter label="Salles de bain" value={form.bathrooms} min={0} max={20} onChange={(v) => set("bathrooms", v)} />
        </div>
      </Section>

      <Section title="Équipements">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map(({ key, label, icon: Icon }) => {
            const on = form.amenities.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => set("amenities", on ? form.amenities.filter((a) => a !== key) : [...form.amenities, key])}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                  on ? "border-foreground bg-muted font-medium" : "border-border hover:border-foreground/40"
                )}
              >
                <Icon className="size-4 shrink-0" /> {label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Tarifs et séjour">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix par nuit (FCFA)">
            <Input type="number" min={1} inputMode="numeric" value={form.nightlyPrice / 100 || ""} onChange={(e) => set("nightlyPrice", Math.round(Number(e.target.value) * 100))} />
          </Field>
          <Field label="Frais de ménage (FCFA, par séjour)">
            <Input type="number" min={0} inputMode="numeric" value={form.cleaningFee / 100 || ""} onChange={(e) => set("cleaningFee", Math.round(Number(e.target.value) * 100))} />
          </Field>
          <Field label="Nuits minimum">
            <Input type="number" min={1} max={30} value={form.minNights} onChange={(e) => set("minNights", Number(e.target.value) || 1)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Arrivée dès">
              <Input type="time" value={form.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} />
            </Field>
            <Field label="Départ avant">
              <Input type="time" value={form.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} />
            </Field>
          </div>
          <Field label="Règlement intérieur" className="sm:col-span-2">
            <Textarea rows={3} maxLength={3000} placeholder="Pas de fête, non-fumeur…" value={form.houseRules} onChange={(e) => set("houseRules", e.target.value)} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <Button type="submit" className="h-11 w-full rounded-xl sm:w-auto" disabled={save.isPending}>
          {save.isPending ? "Enregistrement…" : listing ? "Enregistrer" : "Créer le logement"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Record<string, string>;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
    >
      {Object.entries(options).map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}
