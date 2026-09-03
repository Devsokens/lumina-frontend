"use client";

import { ShowcaseEditorToolbar } from "@/components/showcase/showcase-editor-toolbar";
import { ShowcaseCanvas } from "@/components/showcase/showcase-canvas";

export default function ShowcaseEditorPage() {
  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto">
      {/* Top Floating Editor Toolbar */}
      <ShowcaseEditorToolbar />

      {/* Direct In-Context Visual Canvas */}
      <div className="w-full">
        <ShowcaseCanvas isEditorMode={true} />
      </div>
    </div>
  );
}
