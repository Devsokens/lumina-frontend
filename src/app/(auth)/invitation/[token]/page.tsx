"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, apiError, type ApiResponse } from "@/lib/api";
import { homePathFor, useAuth } from "@/hooks/useAuth";

// Invitation d'un membre (lien reçu par WhatsApp ou e-mail) : il choisit son
// mot de passe et arrive directement dans son espace, déjà connecté. Routes :
// GET / POST /auth/invitations/:token (docs/API_CONTRACT.md §11).

const STRONG = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

type Invite = { fullName: string | null; businessName: string; login: string | null };

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { acceptInvitation } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Invite>>(`/auth/invitations/${encodeURIComponent(token)}`);
      return data.data as Invite;
    },
    retry: false,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!STRONG.test(password)) return void toast.error("8 caractères minimum, dont une majuscule et un chiffre.");
    if (password !== confirm) return void toast.error("Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    let user;
    try {
      user = await acceptInvitation(token, password);
    } catch (err) {
      toast.error(apiError(err, "Activation impossible : le lien a peut-être expiré."));
      setBusy(false);
      return;
    }
    if (!user) {
      toast.success("Accès activé : connectez-vous avec votre nouveau mot de passe.");
      router.replace(`/login${data?.login ? `?login=${encodeURIComponent(data.login)}` : ""}`);
      return;
    }
    toast.success(`Bienvenue dans l'équipe de ${data?.businessName ?? "votre organisation"} !`);
    router.replace(await homePathFor(user));
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Vérification de l&apos;invitation…</p>;

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">Invitation expirée</h1>
        <p className="text-sm text-muted-foreground">
          Ce lien n&apos;est plus valable (il sert une seule fois et expire après 7 jours). Demandez un nouveau lien à la personne qui vous a invité.
        </p>
        <Link href="/login" className="text-sm font-semibold text-primary underline underline-offset-4">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-bold">Rejoindre {data.businessName}</h1>
        <p className="text-sm text-muted-foreground">
          Bonjour {data.fullName ?? ""}, choisissez votre mot de passe : vous arriverez directement dans votre espace. Pour vos prochaines
          connexions, votre identifiant est <strong className="text-foreground">{data.login}</strong>.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" autoComplete="new-password" className="h-11 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-muted-foreground">8 caractères minimum, dont une majuscule et un chiffre.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirmer le mot de passe</Label>
        <Input id="confirm" type="password" autoComplete="new-password" className="h-11 rounded-xl" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <Button type="submit" className="h-11 w-full rounded-xl" disabled={busy}>
        {busy ? "Ouverture de votre espace…" : "Activer mon accès"}
      </Button>
    </form>
  );
}
