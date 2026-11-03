"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/charts/stat-card";
import { PageTitle, Panel, Pill } from "@/components/vision/vision-ui";
import { SECTOR_LABELS, STATUS_LABELS, visionGet } from "@/lib/vision";

type Domains = {
  rootDomain: string;
  customDomains: number;
  items: { id: string; slug: string; name: string; sector: string; status: string; customDomain: string | null; subdomain: string; createdAt: string }[];
};

export default function VisionDomainsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["vision-domains"], queryFn: () => visionGet<Domains>("/domains") });
  const [filter, setFilter] = useState("");
  const items = (data?.items ?? []).filter((d) => {
    const q = filter.trim().toLowerCase();
    return !q || [d.name, d.slug, d.customDomain ?? ""].some((v) => v.toLowerCase().includes(q));
  });

  return (
    <>
      <PageTitle title="Domaines" subtitle={data ? `Sous-domaines de ${data.rootDomain} et domaines personnalisés` : undefined} />
      {isLoading || !data ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard index={0} label="Sites publiés" value={data.items.length} icon={Globe} />
            <StatCard index={1} label="Domaines personnalisés" value={data.customDomains} icon={Link2} />
          </div>
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrer…" className="rounded-xl" maxLength={80} />
          <Panel className="p-0 sm:p-0">
            <ul className="divide-y divide-border">
              {items.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{SECTOR_LABELS[d.sector]}</p>
                  </div>
                  <code className="font-mono text-xs text-foreground/80">{d.subdomain}</code>
                  {d.customDomain ? <Pill tone="accent">{d.customDomain}</Pill> : <span className="text-xs text-muted-foreground">—</span>}
                  <Pill tone={d.status === "ACTIVE" ? "good" : "warn"}>{STATUS_LABELS[d.status]}</Pill>
                </li>
              ))}
              {!items.length && <li className="px-4 py-10 text-center text-sm text-muted-foreground">Aucun domaine.</li>}
            </ul>
          </Panel>
        </div>
      )}
    </>
  );
}
