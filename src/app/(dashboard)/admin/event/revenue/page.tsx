"use client";

import { Suspense } from "react";
import { RevenuePage } from "@/components/events/revenue/revenue-page";

// Module « Revenus » : recettes, reversements, relevé (propriétaire).
export default function EventRevenuePage() {
  return (
    <Suspense>
      <RevenuePage />
    </Suspense>
  );
}
