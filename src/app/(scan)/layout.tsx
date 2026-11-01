import { AuthGuard } from "@/components/shared/auth-guard";
import { SectorGuard } from "@/components/dashboard/sector-guard";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SectorGuard allow={["event"]}>{children}</SectorGuard>
    </AuthGuard>
  );
}
