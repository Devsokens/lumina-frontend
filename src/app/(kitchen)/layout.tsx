import { AuthGuard } from "@/components/shared/auth-guard";
import { SectorGuard } from "@/components/dashboard/sector-guard";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SectorGuard allow={["restaurant"]}>{children}</SectorGuard>
    </AuthGuard>
  );
}
