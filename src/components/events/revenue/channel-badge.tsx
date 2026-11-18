import { CreditCard } from "lucide-react";
import { OperatorLogo } from "@/components/shared/operator-logo";
import type { PayoutChannel } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

// Circuits de versement : Airtel Money, Moov Money, carte (virement).
export const CHANNELS: PayoutChannel[] = ["AIRTEL", "MOOV", "CARD"];

export const CHANNEL_LABEL: Record<PayoutChannel, string> = {
  AIRTEL: "Airtel Money",
  MOOV: "Moov Money",
  CARD: "Carte bancaire",
};

// Où arrive l'argent de ce circuit.
export const CHANNEL_DESTINATION: Record<PayoutChannel, string> = {
  AIRTEL: "sur votre numéro Airtel Money",
  MOOV: "sur votre numéro Moov Money",
  CARD: "par virement sur votre compte bancaire",
};

export function ChannelIcon({ channel, className }: { channel: PayoutChannel; className?: string }) {
  if (channel === "CARD") {
    return (
      <span className={cn("flex shrink-0 items-center justify-center rounded-[8px] bg-ev-soft text-ev-ink2", className)}>
        <CreditCard className="size-[55%]" />
      </span>
    );
  }
  return <OperatorLogo operator={channel} decorative className={cn("rounded-[8px]", className)} />;
}

// Ce qu'il faut ajouter pour recevoir la part d'un circuit.
export const missingLabel = (c: PayoutChannel) => (c === "CARD" ? "votre compte bancaire" : `un numéro ${CHANNEL_LABEL[c]}`);
