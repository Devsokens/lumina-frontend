"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTenant } from "@/hooks/useTenant";
import { usePastEvents, usePublicEvent, usePublicEvents } from "@/hooks/usePublicEvents";
import { showcaseFromConfig, type ShowcaseContent } from "@/stores/useShowcaseStore";
import { lookOf, siteStyle, type SiteLook } from "@/lib/event-site-theme";
import { eventSiteFontVariables } from "@/lib/event-site-fonts";
import { buildSite, toSiteEvent, type SiteData, type SiteEvent } from "@/components/event-site/site-data";
import { NuitEvent, NuitHome } from "@/components/event-site/nuit";
import { LumiereEvent, LumiereHome } from "@/components/event-site/lumiere";
import { cn } from "@/lib/utils";

// Site vitrine public d'un organisateur (refonte 2026-11) : modèle Nuit ou
// Lumière, palette et typographie choisies dans l'éditeur du site.

export const DEFAULT_LOOK: SiteLook = { model: "nuit", palette: "amber", typo: "expressive", radius: "arrondis" };

// Cadre commun : polices, jetons de couleur, conteneur de référence des
// requêtes @container (largeur du site, ou de l'aperçu dans l'éditeur).
export function SiteFrame({ look, children, className }: { look: SiteLook; children: ReactNode; className?: string }) {
  return (
    <div style={siteStyle(look)} data-radius={look.radius} className={cn(eventSiteFontVariables, "@container min-h-dvh bg-(--s-bg) font-(family-name:--s-font-body) text-(--s-text) antialiased", className)}>
      {children}
    </div>
  );
}

export function SiteHome({ site, look, preview }: { site: SiteData; look: SiteLook; preview?: boolean }) {
  return look.model === "lumiere" ? <LumiereHome site={site} preview={preview} /> : <NuitHome site={site} preview={preview} />;
}

export function SiteEventPage({ site, event, look, preview }: { site: SiteData; event: SiteEvent; look: SiteLook; preview?: boolean }) {
  return look.model === "lumiere" ? <LumiereEvent site={site} event={event} preview={preview} /> : <NuitEvent site={site} event={event} preview={preview} />;
}

function usePublishedSite(): { site: SiteData; look: SiteLook; content: ShowcaseContent; loading: boolean } {
  const tenant = useTenant();
  const { data, isLoading } = usePublicEvents(tenant.slug);
  const { data: past } = usePastEvents(tenant.slug);
  const config = (tenant.config ?? {}) as Record<string, unknown>;
  const saved = !!config.showcase;
  const content = showcaseFromConfig(tenant.config, tenant.name);
  return {
    site: buildSite(tenant, content, data ?? [], saved, past ?? []),
    look: saved ? lookOf(content) : DEFAULT_LOOK,
    content,
    loading: isLoading,
  };
}

export function PublicEventSiteHome() {
  const { site, look } = usePublishedSite();
  return (
    <SiteFrame look={look}>
      <SiteHome site={site} look={look} />
    </SiteFrame>
  );
}

export function PublicEventSiteEvent({ id }: { id: string }) {
  const tenant = useTenant();
  const { site, look } = usePublishedSite();
  const { data: event, isLoading, isError } = usePublicEvent(tenant.slug, id);

  if (isLoading) {
    return (
      <SiteFrame look={look}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-24">
          <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-(--s-surface2)" />
          <div className="h-80 animate-pulse rounded-[28px] bg-(--s-surface)" />
        </div>
      </SiteFrame>
    );
  }
  if (isError || !event) {
    return (
      <SiteFrame look={look}>
        <div className="mx-auto flex max-w-[640px] flex-col items-start gap-5 px-5 py-28">
          <h1 className="m-0 font-(family-name:--s-font-display) text-4xl font-extrabold tracking-[-0.03em]">Événement introuvable</h1>
          <p className="m-0 text-(--s-body)">Cet événement n&apos;est pas (ou plus) en vente.</p>
          <Link href={`/${site.slug}#evenements`} className="flex h-12 items-center rounded-full bg-(--s-accent) px-6 font-semibold text-(--s-accent-ink)">
            Voir les autres événements
          </Link>
        </div>
      </SiteFrame>
    );
  }
  return (
    <SiteFrame look={look}>
      <SiteEventPage site={site} event={toSiteEvent(event)} look={look} />
    </SiteFrame>
  );
}
