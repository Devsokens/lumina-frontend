"use client";

import { TenantSettingsForm } from "@/components/dashboard/tenant-settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Paramètres</h1>
      <TenantSettingsForm />
    </div>
  );
}
