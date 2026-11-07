import { AuthGuard } from "@/components/shared/auth-guard";
import { SectorGuard } from "@/components/dashboard/sector-guard";
import { ScanShell } from "@/components/scan/scan-shell";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SectorGuard allow={["event"]}>
        <ScanShell>{children}</ScanShell>
      </SectorGuard>
    </AuthGuard>
  );
}
