"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import slugify from "slugify";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homePathFor, useAuth } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import { SECTOR_LABELS, SECTORS, type Sector } from "@/lib/constants";

// Inscription Google, 2e étape : l'e-mail est déjà vérifié par Google et
// porté par le `token` (usage unique, 10 min) — on ne le redemande pas.
function CompleteSignup() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const { completeGoogleSignup } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [sector, setSector] = useState<Sector>("RESTAURANT");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Lien d&apos;inscription invalide ou expiré.</p>
        <Link href="/signup" className="text-sm text-primary underline">
          Recommencer l&apos;inscription
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (businessName.trim().length < 2 || !/^[a-z0-9-]{3,50}$/.test(slug) || !accepted) {
      toast.error("Complétez le nom, l'adresse (3 à 50 caractères a-z, 0-9, -) et acceptez les CGU.");
      return;
    }
    setBusy(true);
    try {
      const user = await completeGoogleSignup({
        token: token as string,
        businessName: businessName.trim(),
        slug,
        sector,
        acceptedTerms: true,
      });
      toast.success("Compte créé avec succès");
      router.replace(await homePathFor(user));
    } catch (err) {
      toast.error(apiError(err, "Inscription impossible (lien expiré ou adresse déjà prise)."));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Finaliser votre compte</h1>
      <p className="text-sm text-muted-foreground">Votre e-mail Google est vérifié. Présentez votre activité.</p>
      <div className="space-y-1.5">
        <Label htmlFor="businessName">Nom de l&apos;activité</Label>
        <Input
          id="businessName"
          className="h-11 rounded-xl"
          value={businessName}
          maxLength={120}
          onChange={(e) => {
            setBusinessName(e.target.value);
            setSlug(slugify(e.target.value, { lower: true, strict: true }).slice(0, 50));
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Adresse de votre vitrine</Label>
        <Input
          id="slug"
          className="h-11 rounded-xl font-mono"
          value={slug}
          maxLength={50}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sector">Secteur</Label>
        <select
          id="sector"
          value={sector}
          onChange={(e) => setSector(e.target.value as Sector)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
        >
          {SECTORS.map((s) => (
            <option key={s} value={s}>
              {SECTOR_LABELS[s].label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
        J&apos;accepte les conditions générales d&apos;utilisation.
      </label>
      <Button type="submit" className="h-11 w-full rounded-xl" disabled={busy}>
        {busy ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}

export default function CompleteSignupPage() {
  return (
    <Suspense>
      <CompleteSignup />
    </Suspense>
  );
}
