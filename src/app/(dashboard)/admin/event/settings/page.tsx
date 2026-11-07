"use client";

import { Suspense } from "react";
import { EventSettings } from "@/components/events/settings/event-settings";

// Paramètres événementiels (refonte Claude Design 2026-11, écrans 23 à 25).
export default function EventSettingsPage() {
  return (
    <Suspense>
      <EventSettings />
    </Suspense>
  );
}
