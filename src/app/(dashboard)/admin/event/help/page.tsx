"use client";

import { Suspense } from "react";
import { HelpCenter } from "@/components/support/help-center";

// Centre d'aide : documentation des modules et accès au support.
export default function EventHelpPage() {
  return (
    <Suspense>
      <HelpCenter />
    </Suspense>
  );
}
