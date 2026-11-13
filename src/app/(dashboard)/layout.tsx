import { AuthGuard } from "@/components/shared/auth-guard";
import { AdminAssistant } from "@/components/ai/admin-assistant";
import { PushListener } from "@/components/shared/push-listener";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
      <AdminAssistant />
      <PushListener />
    </AuthGuard>
  );
}
