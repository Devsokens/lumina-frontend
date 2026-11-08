import { AuthGuard } from "@/components/shared/auth-guard";
import { AdminAssistant } from "@/components/ai/admin-assistant";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
      <AdminAssistant />
    </AuthGuard>
  );
}
