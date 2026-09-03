"use client";

import { ShowcaseCanvas } from "@/components/showcase/showcase-canvas";

export default function PublicShowcasePage() {
  return (
    <main className="min-h-screen bg-[#090b0e]">
      <ShowcaseCanvas isEditorMode={false} />
    </main>
  );
}
