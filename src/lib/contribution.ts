// Formule « Cotisation » (mariage, fête privée) : chacun donne ce qu'il veut
// à partir d'un minimum. Le serveur contrôle le montant (contribution.ts du
// backend) ; ces aides ne servent qu'à l'affichage. Montants en centimes.

type Priced = { kind?: string | null; price: number; minPrice?: number | null };

/** 150 F : minimum d'un paiement Mobile Money. */
export const MIN_CONTRIBUTION = 15_000;

export const isContribution = (t: Pick<Priced, "kind">) => t.kind === "CONTRIBUTION";

/** Minimum accepté pour une cotisation (à défaut, le montant suggéré). */
export const contributionFloor = (t: Priced) => t.minPrice ?? t.price;

/** Prix « à partir de » d'une formule. */
export const startingPrice = (t: Priced) => (isContribution(t) ? contributionFloor(t) : t.price);

/** Montants proposés en un clic : minimum, suggéré, puis plus généreux. */
export function quickAmounts(t: Priced): number[] {
  const floor = contributionFloor(t);
  const base = Math.max(t.price, floor);
  const set = new Set([floor, base, base * 2, base * 5]);
  if (set.size < 4) set.add(base * 3);
  return [...set].filter((a) => a >= floor).sort((a, b) => a - b).slice(0, 4);
}
