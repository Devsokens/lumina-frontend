"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EvButton, EvSelect } from "@/components/events/ev-ui";
import { SettingsGeneral, formFromTenant, tenantLogo } from "@/components/events/settings/settings-general";
import { PLAN_LABELS, SettingsLegal, SettingsMessages, SettingsPayments, SettingsPlan, SettingsData, SettingsProfile, SettingsSecurity, payoutsOf } from "@/components/events/settings/settings-sections";
import { SettingsNotifications } from "@/components/events/settings/settings-notifications";
import { useAdminTenantInfo } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/features";
import type { Tenant } from "@/types/api";

// Paramètres du back-office événementiel (refonte Claude Design 2026-11,
// écrans 23 à 25) : rubriques groupées à gauche, contenu à droite.
// Rubrique choisie dans l'URL (?rubrique=paiements) pour pouvoir y renvoyer.

type SectionKey = "general" | "legal" | "paiements" | "messages" | "securite" | "profil" | "notifications" | "abonnement" | "donnees";
type Item = { key: SectionKey | "equipe"; label: string; badge?: string; tone?: "warn" | "neutral" };

function groups(tenant: Tenant | undefined): { title: string; items: Item[] }[] {
  return [
    {
      title: "ORGANISATION",
      items: [
        { key: "general", label: "Général" },
        { key: "legal", label: "Identité légale", badge: "Facultatif" },
      ],
    },
    {
      title: "BILLETTERIE",
      items: [
        { key: "paiements", label: "Paiements", ...(tenant && !payoutsOf(tenant).accounts.some((a) => a.verifiedAt || !FEATURES.sms) ? { badge: "À configurer", tone: "warn" as const } : {}) },
        { key: "messages", label: "E-mails et messages" },
        { key: "securite", label: "Sécurité des billets" },
      ],
    },
    {
      title: "COMPTE",
      items: [
        { key: "profil", label: "Mon profil" },
        { key: "notifications", label: "Notifications" },
        { key: "equipe", label: "Mon équipe" },
        { key: "donnees", label: "Mes données" },
        { key: "abonnement", label: "Abonnement", badge: PLAN_LABELS[tenant?.plan ?? "FREE"]?.label },
      ],
    },
  ];
}

const KEYS: SectionKey[] = ["general", "legal", "paiements", "messages", "securite", "profil", "notifications", "abonnement", "donnees"];

// Bandeau « Encore N étapes » : ce qui rend la vitrine, les billets et les
// certificats complets (seuls réglages enregistrés par le serveur).
function setupSteps(tenant: Tenant) {
  const f = formFromTenant(tenant);
  return [
    { done: Boolean(tenantLogo(tenant)), action: "Ajouter un logo", target: null },
    { done: f.description.trim().length > 0, action: "Ajouter une description", target: "set-description" },
    { done: f.phone.trim().length > 0, action: "Ajouter un téléphone", target: "set-phone" },
    { done: f.address.trim().length > 0, action: "Ajouter une adresse", target: "set-address" },
    { done: f.name.trim().length > 1, action: "Nommer l'organisation", target: "set-name" },
  ];
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-[52px] shrink-0">
      <svg viewBox="0 0 52 52" className="size-full -rotate-90" aria-hidden>
        <circle cx="26" cy="26" r={r} fill="none" strokeWidth={5} className="stroke-ev-line" />
        <circle cx="26" cy="26" r={r} fill="none" strokeWidth={5} strokeLinecap="round" className="stroke-ev-bar" strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold">
        {done}/{total}
      </span>
    </div>
  );
}

function SetupBanner({ tenant, onGo }: { tenant: Tenant; onGo: (target: string | null) => void }) {
  const steps = setupSteps(tenant);
  const todo = steps.filter((s) => !s.done);
  if (todo.length === 0) return null;
  return (
    <section aria-label="Configuration de l'organisation" className="flex flex-wrap items-center gap-4 rounded-[16px] border border-ev-border bg-ev-surface px-4 py-[18px] sm:gap-6 sm:px-[22px]">
      <Ring done={steps.length - todo.length} total={steps.length} />
      <div className="flex min-w-[200px] flex-1 flex-col gap-1">
        <span className="text-[15px] font-semibold">
          Encore {todo.length} étape{todo.length > 1 ? "s" : ""} pour une organisation complète
        </span>
        <span className="text-[13px] text-ev-muted">Ces informations apparaissent sur votre vitrine, vos billets et vos certificats.</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {todo.slice(0, 2).map((s, i) => (
          <EvButton key={s.action} variant={i === 0 ? "primary" : "secondary"} className={cn("h-[38px]", i === 0 && "px-3.5")} onClick={() => onGo(s.target)}>
            {s.action}
          </EvButton>
        ))}
      </div>
    </section>
  );
}

export function EventSettings() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const { data: tenant, isLoading, isError } = useAdminTenantInfo();
  const raw = params.get("rubrique") as SectionKey | null;
  const active: SectionKey = raw && KEYS.includes(raw) ? raw : "general";
  const isOwner = role === "OWNER";
  const nav = groups(tenant);

  function go(key: SectionKey) {
    router.replace(key === "general" ? pathname : `${pathname}?rubrique=${key}`, { scroll: false });
  }

  // Bandeau : focus sur le champ manquant (ou ouvre le choix du logo).
  function goToField(target: string | null) {
    if (active !== "general") go("general");
    requestAnimationFrame(() => {
      if (target) {
        const el = document.getElementById(target);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      } else {
        document.querySelector<HTMLInputElement>('input[type="file"][accept^="image"]')?.click();
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-32 pt-6 sm:px-8 sm:pt-8">
      <h1 className="m-0 text-[24px] font-semibold tracking-[-0.02em] sm:text-[28px]">Paramètres</h1>

      {active === "general" && tenant && isOwner && <SetupBanner tenant={tenant} onGo={goToField} />}

      {/* Téléphone et tablette : liste déroulante des rubriques. */}
      <label className="flex flex-col gap-1.5 text-[13px] font-medium lg:hidden">
        Rubrique
        <EvSelect
          h={42}
          value={active}
          onChange={(e) => (e.target.value === "equipe" ? router.push("/admin/event/users") : go(e.target.value as SectionKey))}
          className="font-normal"
        >
          {nav.map((g) => (
            <optgroup key={g.title} label={g.title.charAt(0) + g.title.slice(1).toLowerCase()}>
              {g.items.map((i) => (
                <option key={i.key} value={i.key}>
                  {i.label}
                  {i.badge ? ` · ${i.badge}` : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </EvSelect>
      </label>

      <div className="flex items-start gap-7">
        <nav aria-label="Rubriques des paramètres" className="sticky top-24 hidden w-[220px] shrink-0 flex-col gap-[18px] lg:flex">
          {nav.map((g) => (
            <div key={g.title} className="flex flex-col gap-0.5">
              <span className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#8A8F8B]">{g.title}</span>
              {g.items.map((i) => {
                const cur = i.key === active;
                const cls = cn(
                  "flex h-9 items-center justify-between gap-2 rounded-[8px] px-2.5 text-left text-sm text-ev-ink transition-colors",
                  cur ? "bg-ev-surface font-semibold shadow-[0_1px_2px_rgba(22,33,28,.06)]" : "hover:bg-ev-surface/60"
                );
                const badge = i.badge && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                      i.tone === "warn" ? "bg-ev-warn-bg text-ev-gold-text" : "bg-[#F1EFE9] text-ev-muted dark:bg-ev-line"
                    )}
                  >
                    {i.badge}
                  </span>
                );
                return i.key === "equipe" ? (
                  <Link key={i.key} href="/admin/event/users" className={cls}>
                    <span className="truncate">{i.label}</span>
                  </Link>
                ) : (
                  <button key={i.key} type="button" aria-current={cur ? "page" : undefined} onClick={() => go(i.key as SectionKey)} className={cls}>
                    <span className="truncate whitespace-nowrap">{i.label}</span>
                    {badge}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <div className="h-12 w-2/3 animate-pulse rounded-[10px] bg-ev-line" />
              <div className="h-96 animate-pulse rounded-[16px] bg-ev-line" />
            </div>
          ) : isError || !tenant ? (
            <p className="text-sm text-ev-danger">Impossible de charger les paramètres. Rechargez la page.</p>
          ) : active === "general" ? (
            <SettingsGeneral tenant={tenant} canEdit={isOwner} />
          ) : active === "legal" ? (
            <SettingsLegal tenant={tenant} canEdit={isOwner} />
          ) : active === "paiements" ? (
            <SettingsPayments tenant={tenant} canEdit={isOwner} />
          ) : active === "messages" ? (
            <SettingsMessages tenant={tenant} canEdit={isOwner} />
          ) : active === "securite" ? (
            <SettingsSecurity />
          ) : active === "profil" ? (
            <SettingsProfile />
          ) : active === "notifications" ? (
            <SettingsNotifications />
          ) : active === "donnees" ? (
            <SettingsData canEdit={isOwner} />
          ) : (
            <SettingsPlan tenant={tenant} />
          )}
        </main>
      </div>
    </div>
  );
}
