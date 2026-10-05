"use client";

import { TeamManager } from "@/components/dashboard/team-manager";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Équipe</h1>
        <p className="text-sm text-muted-foreground">Membres, rôles et accès. Les nouveaux membres reçoivent un mot de passe temporaire.</p>
      </div>
      <TeamManager />
    </div>
  );
}
