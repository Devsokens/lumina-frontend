"use client";

import { ScanLine, ShieldCheck, Wallet } from "lucide-react";
import { TeamManager } from "@/components/dashboard/team-manager";

const ROLES = [
  {
    icon: ShieldCheck,
    title: "Organisateur",
    detail: "Création, modification et suppression des événements, finances, équipe.",
  },
  { icon: Wallet, title: "Manager", detail: "Événements, réservations et remboursements." },
  { icon: ScanLine, title: "Scanner", detail: "Contrôle d'accès uniquement : écran de scan simplifié." },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Équipe</h1>
        <p className="text-sm text-muted-foreground">Membres, rôles et accès. Les nouveaux membres reçoivent un mot de passe temporaire.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-4">
            <Icon className="size-5 text-primary" />
            <p className="mt-2 text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
      <TeamManager />
    </div>
  );
}
