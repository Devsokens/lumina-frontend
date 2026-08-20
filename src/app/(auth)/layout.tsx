import { AuthLayout } from "@/components/shared/auth-layout";

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
