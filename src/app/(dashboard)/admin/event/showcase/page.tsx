"use client";

import { ShowcaseEditorToolbar } from "@/components/showcase/showcase-editor-toolbar";
import { ShowcaseSidebarInspector } from "@/components/showcase/showcase-sidebar-inspector";
import { ShowcaseCanvas } from "@/components/showcase/showcase-canvas";

export default function ShowcaseEditorPage() {
  return (
    <div className="space-y-4 pb-12">
      {/* Top Editor Toolbar */}
      <ShowcaseEditorToolbar />

      {/* Editor Main Layout (Left: Inspector, Right: Visual Canvas) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <ShowcaseSidebarInspector />
        <div className="flex-1 w-full overflow-hidden">
          <ShowcaseCanvas />
        </div>
      </div>
    </div>
  );
}
