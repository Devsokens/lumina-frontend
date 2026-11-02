"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Layers } from "lucide-react";
import { homePathFor, useAuth, type AccountOption } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import { SECTOR_LABELS } from "@/lib/constants";

// Même email / téléphone, un compte par secteur d'activité : l'identité est
// déjà prouvée (mot de passe, code SMS ou Google), le `token` (5 min, usage
// unique) ne donne accès qu'à ces comptes. Voir POST /auth/account-choice.
function SelectAccount() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const { accountChoices, selectAccount } = useAuth();
  const [accounts, setAccounts] = useState<AccountOption[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    accountChoices(token).then(setAccounts, () => setFailed(true));
  }, [token, accountChoices]);

  async function choose(account: AccountOption) {
    if (!token) return;
    setBusy(account.sector);
    try {
      const user = await selectAccount(token, account.sector);
      router.replace(await homePathFor(user));
    } catch (err) {
      toast.error(apiError(err, "Choix expiré, reconnectez-vous."));
      setBusy(null);
    }
  }

  if (!token || failed) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Choix du compte expiré.</p>
        <Link href="/login" className="text-sm text-primary underline">
          Se reconnecter
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
        <Layers className="size-6" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Quel espace ouvrir ?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Vous avez un compte GiyaX dans plusieurs secteurs d&apos;activité.
      </p>

      <ul className="mt-6 space-y-3">
        {accounts === null
          ? [0, 1].map((i) => <li key={i} className="h-[72px] animate-pulse rounded-2xl bg-muted" />)
          : accounts.map((account) => (
              <li key={account.sector}>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void choose(account)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/40 disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-primary">
                      {SECTOR_LABELS[account.sector]?.label ?? account.sector}
                    </span>
                    <span className="block truncate font-semibold text-foreground">{account.businessName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{account.slug}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
      </ul>
    </div>
  );
}

export default function SelectAccountPage() {
  return (
    <Suspense>
      <SelectAccount />
    </Suspense>
  );
}
