import { AuthGuard } from "@/components/shared/auth-guard";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
