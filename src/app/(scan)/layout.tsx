import { AuthGuard } from "@/components/shared/auth-guard";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
