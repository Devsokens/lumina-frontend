"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import slugify from "slugify";
import { toast } from "sonner";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { homePathFor, useAuth } from "@/hooks/useAuth";
import { api, apiError, type ApiResponse } from "@/lib/api";
import { APP_URL, ROOT_DOMAIN, SECTOR_LABELS, type Sector } from "@/lib/constants";
import { publicSiteLabel, subdomainActive } from "@/lib/tenant-url";
import { slugSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

type Pending = { email: string; fullName: string; avatarUrl: string | null };

// Secteurs proposés à l'inscription (l'e-commerce n'est plus commercialisé).
const PUBLIC_SECTORS: Sector[] = ["EVENT", "RESTAURANT", "ACCOMMODATION"];
const APP_HOST = APP_URL.replace(/^https?:\/\//, "");
const hasSubdomain = subdomainActive();

// Inscription Google, 2e étape : l'identité vient de Google (e-mail vérifié,
// nom, photo) et est affichée telle quelle ; on ne demande que ce qui
// manque — activité, adresse du site, secteur, téléphone facultatif. Le lien
// reste valable (10 min) tant que le compte n'est pas créé.
function CompleteSignup() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const { completeGoogleSignup } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [sector, setSector] = useState<Sector>("RESTAURANT");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: pending, isLoading, isError } = useQuery({
    queryKey: ["google-pending", token],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Pending>>(`/auth/google/pending?token=${encodeURIComponent(token ?? "")}`);
      return data.data as Pending;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });

  if (!token || isError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Lien d&apos;inscription Google invalide ou expiré (10 minutes).</p>
        <Link href="/signup" className="text-sm text-primary underline">
          Recommencer avec Google
        </Link>
      </div>
    );
  }
  if (isLoading || !pending) return <Skeleton className="h-96 rounded-2xl" />;

  const cleanPhone = phone.replace(/[\s.()-]/g, "");
  const phoneOk = !cleanPhone || /^\+?[0-9]{8,15}$/.test(cleanPhone);

  const slugCheck = slugSchema.safeParse(slug);
  const slugError = slug && !slugCheck.success ? slugCheck.error.issues[0]?.message : undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slugCheck.success) {
      toast.error(slugCheck.error.issues[0]?.message ?? "Adresse du site invalide.");
      return;
    }
    if (businessName.trim().length < 2 || !accepted || !phoneOk) {
      toast.error("Complétez le nom de l'activité, un téléphone valide et acceptez les CGU.");
      return;
    }
    setBusy(true);
    try {
      const user = await completeGoogleSignup({
        token: token as string,
        businessName: businessName.trim(),
        slug,
        sector,
        ...(cleanPhone ? { phone: cleanPhone } : {}),
        acceptedTerms: true,
      });
      toast.success("Compte créé avec succès");
      router.replace(await homePathFor(user));
    } catch (err) {
      // Le lien reste valide : on corrige et on renvoie sans repasser par Google.
      toast.error(apiError(err, "Inscription impossible (adresse du site déjà prise ?)."));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Finaliser votre compte</h1>
        <p className="text-sm text-muted-foreground">Encore quelques informations sur votre activité.</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3">
        {pending.avatarUrl ? (
          // Photo Google (https vérifié côté serveur).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pending.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-11 rounded-full object-cover" />
        ) : (
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
            {(pending.fullName || pending.email).charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{pending.fullName || "Compte Google"}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <BadgeCheck className="size-3.5 text-success" /> {pending.email} · vérifié par Google
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Secteur d&apos;activité</Label>
        <div className="grid grid-cols-2 gap-2">
          {PUBLIC_SECTORS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              aria-pressed={sector === s}
              className={cn(
                "rounded-xl border p-3 text-left text-sm transition-colors",
                sector === s ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-foreground/30"
              )}
            >
              <span className="block font-semibold">{SECTOR_LABELS[s].label}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{SECTOR_LABELS[s].description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="businessName">Nom de l&apos;activité</Label>
        <Input
          id="businessName"
          className="h-11 rounded-xl"
          value={businessName}
          maxLength={120}
          onChange={(e) => {
            setBusinessName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value, { lower: true, strict: true }).slice(0, 50).replace(/-+$/, ""));
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Adresse de votre site</Label>
        <div className="flex items-center overflow-hidden rounded-xl border border-input focus-within:ring-2 focus-within:ring-ring/40">
          {!hasSubdomain && <span className="bg-muted px-3 py-2.5 text-sm text-muted-foreground">{APP_HOST}/</span>}
          <input
            id="slug"
            className="h-11 min-w-0 flex-1 bg-transparent px-2 font-mono text-sm outline-none"
            value={slug}
            maxLength={50}
            aria-invalid={slugError ? true : undefined}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
          />
          {hasSubdomain && <span className="bg-muted px-3 py-2.5 text-sm text-muted-foreground">.{ROOT_DOMAIN}</span>}
        </div>
        <p className={cn("text-xs", slugError ? "text-destructive" : "text-muted-foreground")}>
          {slugError ?? <>Votre site : <strong>{publicSiteLabel(slug || "votre-activite")}</strong></>}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Téléphone (facultatif)</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          className="h-11 rounded-xl"
          placeholder="+241 77 12 34 56"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className={cn("text-xs", phoneOk ? "text-muted-foreground" : "text-destructive")}>
          {phoneOk ? "Permet aussi la connexion par code SMS." : "Numéro invalide (ex. +24177123456)."}
        </p>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
        J&apos;accepte les conditions générales d&apos;utilisation.
      </label>
      <Button type="submit" className="h-11 w-full rounded-xl" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
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
