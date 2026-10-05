"use client";

import { AuditLogList } from "@/components/dashboard/audit-log-list";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Journal d&apos;audit</h1>
        <p className="text-sm text-muted-foreground">Historique des actions sensibles (paiements, remboursements, équipe, menu).</p>
      </div>
      <AuditLogList />
    </div>
  );
}
