// Frais de service payés par l'acheteur en plus du prix des billets
// (réglés par GiyaX dans /vision, transmis avec l'événement : buyerFeeBps,
// en points de base). Même calcul que le serveur, qui seul fait foi :
// montants en centimes, frais arrondis au franc.

export function serviceFeeOf(amount: number, bps: number): number {
  if (amount <= 0 || bps <= 0) return 0;
  return Math.round((amount * bps) / 10_000 / 100) * 100;
}

// 500 → « 5 % », 250 → « 2,5 % ».
export function feePercent(bps: number): string {
  return `${(bps / 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;
}
