// Prix stockés en centimes (Int) — jamais de float. Voir docs backend.
export function formatXAF(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-FR")} FCFA`;
}
