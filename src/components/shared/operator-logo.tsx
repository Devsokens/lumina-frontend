import { cn } from "@/lib/utils";

// Logos officiels des opérateurs Mobile Money (public/brand).

export type MobileMoneyOperator = "AIRTEL" | "MOOV";

const LOGO: Record<MobileMoneyOperator, { src: string; name: string }> = {
  AIRTEL: { src: "/brand/airtel-money.png", name: "Airtel Money" },
  MOOV: { src: "/brand/moov-money.png", name: "Moov Money" },
};

// decorative : le nom de l'opérateur est déjà écrit à côté du logo.
export function OperatorLogo({ operator, decorative, className }: { operator: MobileMoneyOperator; decorative?: boolean; className?: string }) {
  const logo = LOGO[operator];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo.src} alt={decorative ? "" : logo.name} width={48} height={48} className={cn("size-8 shrink-0 rounded-[8px] object-cover", className)} />
  );
}
