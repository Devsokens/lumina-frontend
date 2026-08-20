"use client";

import { useState } from "react";
import { QrScanner } from "@/components/scan/qr-scanner";
import { ScanResult, type ScanResultKind } from "@/components/scan/scan-result";
import { api } from "@/lib/api";

type ScanEntry = { code: string; kind: ScanResultKind; at: Date };

export default function ScanPage() {
  const [result, setResult] = useState<{ kind: ScanResultKind; detail?: string } | null>(null);
  const [history, setHistory] = useState<ScanEntry[]>([]);

  async function handleResult(code: string) {
    try {
      const { data } = await api.post<{ data: { status: ScanResultKind; detail?: string } }>(
        "/admin/scan/validate",
        { code }
      );
      setResult({ kind: data.data.status, detail: data.data.detail });
      setHistory((prev) => [{ code, kind: data.data.status, at: new Date() }, ...prev]);
    } catch {
      setResult({ kind: "invalid" });
      setHistory((prev) => [{ code, kind: "invalid", at: new Date() }, ...prev]);
    }
  }

  return (
    <div className="relative">
      <QrScanner onResult={handleResult} />
      {result && <ScanResult kind={result.kind} detail={result.detail} onDismiss={() => setResult(null)} />}

      {history.length > 0 && (
        <div className="absolute top-4 right-4 max-w-[200px] rounded-xl bg-black/60 p-3 text-xs text-white">
          <p className="mb-1 font-semibold">Session : {history.length} scan(s)</p>
          <ul className="space-y-0.5">
            {history.slice(0, 5).map((entry, i) => (
              <li key={i} className="truncate opacity-80">
                {entry.kind === "valid" ? "✓" : entry.kind === "used" ? "⚠" : "✗"} {entry.code}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
