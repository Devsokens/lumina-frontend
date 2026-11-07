"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { EvButton, EvInput, EvSelect, EvTextarea, initialsOf } from "@/components/events/ev-ui";
import { ADDON_FIELD, AddonInput, Field, MiniSwitch, SettingsCard, SettingsHeading, SettingsRow, StatePill } from "@/components/events/settings/settings-ui";
import { useUpdateTenant } from "@/hooks/useAdmin";
import { prepareImage } from "@/lib/image";
import { apiError } from "@/lib/api";
import { APP_URL, ROOT_DOMAIN } from "@/lib/constants";
import { publicSiteUrl, subdomainActive } from "@/lib/tenant-url";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/types/api";

// Paramètres · Général (écran 23) : PATCH /admin/tenant (OWNER).
// Logo enregistré tout de suite ; les autres champs via la barre flottante
// « N modifications non enregistrées ».

export type GeneralForm = {
  name: string;
  description: string;
  phone: string;
  contactEmail: string;
  address: string;
  taxPercent: string;
  taxIncluded: boolean;
};

const SECTOR_LABELS: Record<string, string> = {
  EVENT: "Événementiel",
  RESTAURANT: "Restauration",
  SHOP: "Commerce",
  ACCOMMODATION: "Hébergement",
};

const DESCRIPTION_MAX = 160;

export function formFromTenant(tenant: Tenant): GeneralForm {
  const config = (tenant.config ?? {}) as Record<string, unknown>;
  const settings = (tenant.settings ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    name: tenant.name,
    description: str(config.description),
    phone: str(config.phone),
    contactEmail: str(config.contactEmail),
    address: str(config.address),
    taxPercent: typeof settings.taxRate === "number" ? String(settings.taxRate / 100).replace(".", ",") : "0",
    taxIncluded: settings.taxIncluded !== false,
  };
}

export function tenantLogo(tenant: Tenant | undefined) {
  const v = (tenant?.config as { logoUrl?: unknown } | undefined)?.logoUrl;
  return typeof v === "string" && v ? v : null;
}

export function SettingsGeneral({ tenant, canEdit }: { tenant: Tenant; canEdit: boolean }) {
  const update = useUpdateTenant();
  const logoInput = useRef<HTMLInputElement>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  // Valeurs du serveur → formulaire, à chaque nouvelle version du tenant
  // (chargement, enregistrement). React Query garde la même référence tant
  // que les données ne changent pas : une saisie en cours n'est pas écrasée.
  const [form, setForm] = useState<GeneralForm>(() => formFromTenant(tenant));
  const [source, setSource] = useState(tenant);
  if (source !== tenant) {
    setSource(tenant);
    setForm(formFromTenant(tenant));
  }
  const initial = formFromTenant(tenant);
  const dirty = (Object.keys(initial) as (keyof GeneralForm)[]).filter((k) => form[k] !== initial[k]).length;
  const logo = tenantLogo(tenant);
  const set = <K extends keyof GeneralForm>(k: K, v: GeneralForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const siteUrl = publicSiteUrl(tenant.slug);
  const sub = subdomainActive();
  const appHost = APP_URL.replace(/^https?:\/\//, "");

  async function save() {
    const name = form.name.trim();
    if (name.length < 2) return void toast.error("Le nom de l'organisation est requis.");
    const percent = Number(form.taxPercent.replace(",", ".").trim() || "0");
    if (!Number.isFinite(percent) || percent < 0 || percent > 50) return void toast.error("TVA : un taux entre 0 et 50 %.");
    const contactEmail = form.contactEmail.trim();
    if (contactEmail && !/^[^s@]+@[^s@]+.[^s@]+$/.test(contactEmail)) return void toast.error("E-mail de contact invalide.");
    try {
      await update.mutateAsync({
        name,
        description: form.description.trim(),
        phone: form.phone.trim(),
        contactEmail,
        address: form.address.trim(),
        taxRate: Math.round(percent * 100),
        taxIncluded: form.taxIncluded,
      });
      toast.success("Paramètres enregistrés");
    } catch (err) {
      toast.error(apiError(err, "Échec de l'enregistrement"));
    }
  }

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setLogoBusy(true);
    // Logo réduit (512 px), EXIF retiré, puis enregistré sur le serveur.
    prepareImage(file, 512)
      .then((url) => update.mutateAsync({ logoUrl: url }))
      .then(() => toast.success("Logo mis à jour"))
      .catch((err: unknown) => toast.error(apiError(err, err instanceof Error ? err.message : "Image illisible.")))
      .finally(() => {
        input.value = "";
        setLogoBusy(false);
      });
  }

  function removeLogo() {
    setLogoBusy(true);
    update
      .mutateAsync({ logoUrl: "" })
      .then(() => toast.success("Logo retiré"))
      .catch((err: unknown) => toast.error(apiError(err, "Logo non retiré : réessayez.")))
      .finally(() => setLogoBusy(false));
  }

  function copyLink() {
    navigator.clipboard?.writeText(siteUrl).then(
      () => toast.success("Lien copié"),
      () => toast.error("Copie impossible")
    );
  }

  return (
    <>
      <SettingsHeading title="Général" sub="Les informations publiques de votre organisation, affichées sur la vitrine, les billets et les certificats." />
      {!canEdit && <p className="m-0 text-[13px] text-ev-muted">Seul l&apos;organisateur peut modifier ces informations.</p>}
      <SettingsCard>
        <fieldset disabled={!canEdit} className="m-0 min-w-0 border-0 p-0">
          <SettingsRow title="Logo" desc="Carré, PNG ou JPG. Utilisé dans le menu, sur les billets et les certificats.">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-ev-border bg-ev-soft text-lg font-bold text-ev-primary">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="Logo de l'organisation" className="size-full object-contain p-1.5" />
                ) : (
                  initialsOf(tenant.name)
                )}
              </span>
              <div className="flex gap-2">
                <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onLogo} />
                <EvButton size="sm" disabled={logoBusy} onClick={() => logoInput.current?.click()}>
                  {logoBusy ? "Envoi…" : logo ? "Remplacer" : "Ajouter un logo"}
                </EvButton>
                {logo && (
                  <EvButton size="sm" variant="ghost" className="text-ev-muted" disabled={logoBusy} onClick={removeLogo}>
                    Retirer
                  </EvButton>
                )}
              </div>
            </div>
          </SettingsRow>

          <SettingsRow title="Identité" desc="Nom et présentation courte de l'organisation.">
            <div className="flex flex-col gap-3.5">
              <Field label="Nom de l'organisation">
                <EvInput id="set-name" h={42} maxLength={120} value={form.name} onChange={(e) => set("name", e.target.value)} className="font-normal" />
              </Field>
              <Field label="Description courte" hint={`${form.description.length} / ${DESCRIPTION_MAX}`}>
                <EvTextarea
                  id="set-description"
                  rows={2}
                  maxLength={DESCRIPTION_MAX}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Ex. : Concerts, conférences et soirées à Libreville."
                  className="resize-y py-2.5 font-normal"
                />
              </Field>
              <Field label="Secteur d'activité">
                <EvSelect h={42} disabled value={tenant.sector} className="font-normal" title="Le secteur est choisi à l'inscription.">
                  <option value={tenant.sector}>{SECTOR_LABELS[tenant.sector] ?? tenant.sector}</option>
                </EvSelect>
              </Field>
            </div>
          </SettingsRow>

          <SettingsRow title="Coordonnées" desc="Affichées dans le pied de page de la vitrine.">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Téléphone">
                <EvInput id="set-phone" h={42} type="tel" maxLength={30} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+241 77 12 34 56" className="font-normal" />
              </Field>
              <Field label="E-mail de contact">
                <EvInput h={42} type="email" maxLength={120} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="contact@votre-organisation.ga" className="font-normal" />
              </Field>
              <Field label="Adresse" className="sm:col-span-2">
                <EvInput id="set-address" h={42} maxLength={300} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Quartier, ville" className="font-normal" />
              </Field>
            </div>
          </SettingsRow>

          <SettingsRow title="Taxes" desc="Appliquées au prix des billets.">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <Field label="TVA">
                <AddonInput suffix="%" className="w-[140px]">
                  <input inputMode="decimal" value={form.taxPercent} onChange={(e) => set("taxPercent", e.target.value)} aria-label="TVA en pourcentage" className={ADDON_FIELD} />
                </AddonInput>
              </Field>
              <span className="flex h-[42px] items-center gap-2.5 text-sm">
                <MiniSwitch checked={form.taxIncluded} disabled={!canEdit} ariaLabel="Prix affichés TTC" onChange={(v) => set("taxIncluded", v)} />
                Prix affichés toutes taxes comprises
              </span>
            </div>
          </SettingsRow>
        </fieldset>

        {/* Hors du fieldset : le lien reste copiable pour un manager. */}
        <SettingsRow title="Adresse du site" desc="Le lien public de votre vitrine." last>
            <div className="flex flex-col gap-3.5">
              <Field label="Lien de la vitrine">
                <AddonInput mono prefix={sub ? undefined : `${appHost}/`} suffix={sub ? `.${ROOT_DOMAIN}` : undefined} className="pr-0">
                  <input readOnly value={tenant.slug} aria-label="Identifiant du site" className={cn(ADDON_FIELD, "font-ev-mono text-[13px]")} title="L'adresse est choisie à l'inscription." />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="shrink-0 border-0 border-l border-ev-border bg-ev-surface px-3.5 text-[13px] font-medium text-ev-ink transition-colors hover:bg-ev-soft"
                  >
                    Copier
                  </button>
                </AddonInput>
              </Field>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-ev-line bg-ev-soft px-3.5 py-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px] font-semibold">Domaine personnalisé</span>
                  <span className="truncate text-xs text-ev-muted">Ex. : billetterie.{tenant.slug}.ga</span>
                </span>
                <StatePill tone="warn">Formule Pro</StatePill>
              </div>
            </div>
          </SettingsRow>
      </SettingsCard>

      {canEdit && dirty > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+max(env(safe-area-inset-bottom),0.875rem))] z-40 flex justify-center px-4 sm:bottom-5 sm:left-[248px] sm:px-8">
          <div role="status" className="pointer-events-auto flex items-center gap-3 rounded-[14px] bg-[#16211C] py-2.5 pl-[18px] pr-2.5 text-white shadow-[0_12px_30px_rgba(22,33,28,.25)] sm:gap-4 dark:bg-ev-ink dark:text-ev-bg">
            <span className="text-[13px] sm:text-sm">
              {dirty} modification{dirty > 1 ? "s" : ""} non enregistrée{dirty > 1 ? "s" : ""}
            </span>
            <button type="button" onClick={() => setForm(initial)} className="h-9 rounded-[9px] px-3 text-[13px] text-[#DCE8E1] transition-colors hover:bg-white/10 dark:text-ev-ink2">
              Annuler
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={update.isPending}
              className="h-9 rounded-[9px] bg-white px-4 text-[13px] font-semibold text-[#16211C] transition-opacity disabled:opacity-60"
            >
              {update.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
