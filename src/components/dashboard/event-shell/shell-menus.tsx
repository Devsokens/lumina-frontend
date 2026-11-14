"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Check, CircleHelp, Compass, CreditCard, Headset, Languages, LockKeyhole, LogOut, MessageSquareHeart, Plus, Star, User, UserPlus } from "lucide-react";
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { initialsOf } from "@/components/events/ev-ui";
import { BASE, PLAN_NAME, logoOf, type SetupStep } from "@/components/dashboard/event-shell/shell-model";
import { useOrganizations, useSwitchOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/hooks/useAuth";
import { useShellStore } from "@/stores/useShellStore";
import { publicSiteLabel } from "@/lib/tenant-url";
import { apiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/types/api";

// Menus du cadre (refonte 2026-11) : organisation, compte, configuration.

export function OrgAvatar({ tenant, name, className }: { tenant?: Tenant; name: string; className?: string }) {
  const logo = logoOf(tenant);
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white text-[13px] font-bold text-[#0B3B2E]", className)}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="size-full object-contain p-0.5" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

// Menu de l'organisation : formule, abonnement, paramètres, invitation,
// organisations du compte (Business : plusieurs, voir useOrganizations).
export function OrgMenuContent({ tenant, isOwner }: { tenant: Tenant | undefined; isOwner: boolean }) {
  const plan = tenant?.plan ?? "FREE";
  const { data: orgs } = useOrganizations();
  const switchOrg = useSwitchOrganization();
  const setBusinessOpen = useShellStore((s) => s.setBusinessOpen);
  const setNewOrgOpen = useShellStore((s) => s.setNewOrgOpen);
  const name = tenant?.name ?? "Mon organisation";
  const list = orgs && orgs.length ? orgs : tenant ? [{ tenantId: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan, logoUrl: logoOf(tenant), role: "OWNER", current: true }] : [];

  async function go(tenantId: string) {
    try {
      await switchOrg.mutateAsync(tenantId);
      // Données de l'ancienne organisation : rechargement complet.
      window.location.assign(BASE);
    } catch (err) {
      toast.error(apiError(err, "Changement d'organisation impossible"));
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3.5 p-3.5">
        <div className="flex items-center gap-3">
          <OrgAvatar tenant={tenant} name={name} className="size-11 bg-ev-primary text-white" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px] font-semibold">{name}</span>
            <span className="truncate text-xs text-ev-muted">{tenant ? publicSiteLabel(tenant.slug) : ""}</span>
          </div>
          <span className="rounded-full bg-[#F1EFE9] px-2.5 py-0.5 text-[11px] font-semibold text-ev-ink2 dark:bg-ev-line">{PLAN_NAME[plan] ?? plan}</span>
        </div>
        {/* Formules payantes pas encore ouvertes : annonce, sans appel à payer. */}
        {isOwner && (plan === "FREE" || plan === "STANDARD") && (
          <Link
            href={`${BASE}/settings?rubrique=abonnement`}
            className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-dashed border-ev-border bg-ev-soft text-sm font-semibold text-ev-ink2 hover:bg-ev-line/60"
          >
            <Star className="size-4" /> Formule Pro : bientôt disponible
          </Link>
        )}
      </div>
      <DropdownMenuSeparator className="my-0" />
      <div className="p-1.5">
        {isOwner && (
          <DropdownMenuItem asChild>
            <Link href={`${BASE}/settings?rubrique=abonnement`} className="gap-2.5">
              <CreditCard className="size-4" /> Abonnement et factures
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`${BASE}/settings`} className="gap-2.5">
            <Building2 className="size-4" /> Paramètres de l&apos;organisation
          </Link>
        </DropdownMenuItem>
        {isOwner && (
          <DropdownMenuItem asChild>
            <Link href={`${BASE}/users?inviter=1`} className="gap-2.5">
              <UserPlus className="size-4" /> Inviter un membre
            </Link>
          </DropdownMenuItem>
        )}
      </div>
      <DropdownMenuSeparator className="my-0" />
      <div className="p-1.5">
        <DropdownMenuLabel className="px-2 pb-1 pt-1.5 text-[11px] font-semibold tracking-[0.08em] text-ev-muted">VOS ORGANISATIONS</DropdownMenuLabel>
        {list.map((o) => (
          <DropdownMenuItem key={o.tenantId} disabled={switchOrg.isPending} onClick={() => (o.current ? undefined : void go(o.tenantId))} className={cn("gap-2.5", o.current && "bg-ev-soft")}>
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-ev-primary text-[10px] font-bold text-white">
              {o.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.logoUrl} alt="" className="size-full bg-white object-contain" />
              ) : (
                initialsOf(o.name)
              )}
            </span>
            <span className="flex-1 truncate">{o.name}</span>
            {o.current && <Check className="size-4 text-ev-primary" />}
          </DropdownMenuItem>
        ))}
        {isOwner && (
          <DropdownMenuItem onClick={() => (plan === "ENTERPRISE" ? setNewOrgOpen(true) : setBusinessOpen(true))} className="gap-2.5 text-ev-ink2">
            <span className="flex size-6 items-center justify-center rounded-[6px] border border-dashed border-ev-dash">
              <Plus className="size-3.5" />
            </span>
            <span className="flex-1">Créer une organisation</span>
            {plan !== "ENTERPRISE" && <span className="rounded-full bg-ev-warn-bg px-2 py-0.5 text-[11px] font-semibold text-ev-gold-text">Business</span>}
          </DropdownMenuItem>
        )}
      </div>
    </>
  );
}

// Menu du compte : profil, sécurité, langue, visite guidée, avis, déconnexion.
export function UserMenuContent({ name, contact }: { name: string; contact: string }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const setTourOpen = useShellStore((s) => s.setTourOpen);
  const setFeedbackOpen = useShellStore((s) => s.setFeedbackOpen);
  const setSupportOpen = useShellStore((s) => s.setSupportOpen);

  async function logout() {
    await signOut();
    toast.success("Vous avez été déconnecté.");
    router.push("/login");
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#12A06F] text-sm font-semibold text-white">{initialsOf(name)}</span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold">{name}</span>
          <span className="truncate text-xs text-ev-muted">{contact}</span>
        </span>
      </div>
      <DropdownMenuSeparator className="my-0" />
      <div className="p-1.5">
        <DropdownMenuItem asChild>
          <Link href={`${BASE}/settings?rubrique=profil`} className="gap-2.5">
            <User className="size-4" /> Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/change-password" className="gap-2.5">
            <LockKeyhole className="size-4" /> Sécurité et mot de passe
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="gap-2.5" title="Seule langue disponible pour l'instant">
          <Languages className="size-4" /> Langue : Français
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${BASE}/help`} className="gap-2.5">
            <CircleHelp className="size-4" /> Aide et documentation
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2.5" onClick={() => setSupportOpen(true)}>
          <Headset className="size-4" /> Contacter le support
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2.5" onClick={() => setTourOpen(true)}>
          <Compass className="size-4" /> Revoir la visite guidée
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2.5" onClick={() => setFeedbackOpen(true)}>
          <MessageSquareHeart className="size-4" /> Donner mon avis
        </DropdownMenuItem>
      </div>
      <DropdownMenuSeparator className="my-0" />
      <div className="p-1.5">
        <DropdownMenuItem className="gap-2.5 text-ev-danger focus:text-ev-danger" onClick={() => void logout()}>
          <LogOut className="size-4" /> Se déconnecter
        </DropdownMenuItem>
      </div>
    </>
  );
}

// « Configuration n / 5 » : étapes et liens.
export function SetupMenuContent({ steps }: { steps: SetupStep[] }) {
  return (
    <div className="p-1.5">
      <DropdownMenuLabel className="px-2 pb-1.5 pt-1.5 text-xs font-semibold text-ev-muted">Pour une organisation prête à vendre</DropdownMenuLabel>
      {steps.map((s) => (
        <DropdownMenuItem key={s.key} asChild>
          <Link href={s.href} className="gap-2.5">
            <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", s.done ? "border-ev-primary bg-ev-primary text-white" : "border-ev-dash")}>
              {s.done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={cn("flex-1", s.done && "text-ev-muted line-through")}>{s.label}</span>
          </Link>
        </DropdownMenuItem>
      ))}
    </div>
  );
}
