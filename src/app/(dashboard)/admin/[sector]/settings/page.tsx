"use client";

import { AccountSummary } from "@/components/dashboard/account-summary";
import { TenantSettingsForm } from "@/components/dashboard/tenant-settings-form";
import { DataExportCard } from "@/components/dashboard/data-export-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Paramètres</h1>
      <AccountSummary />
      <TenantSettingsForm />
      <DataExportCard />
    </div>
  );
}
