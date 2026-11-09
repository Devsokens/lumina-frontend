import type { Metadata } from "next";

// Fin du paiement par carte (redirection PVit, dans l'onglet ouvert pour la
// banque). Le résultat officiel s'affiche sur la page de réservation restée
// ouverte : cette page ne fait qu'inviter à y revenir.

export const metadata: Metadata = { title: "Paiement · GiyaX", robots: { index: false } };

export default async function PaymentReturnPage({ params }: { params: Promise<{ result: string }> }) {
  const { result } = await params;
  const success = result === "success";
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center text-foreground">
      <div className="flex max-w-md flex-col gap-3">
        <h1 className="font-display text-2xl font-bold">{success ? "Paiement transmis" : "Paiement non abouti"}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {success
            ? "Vous pouvez fermer cet onglet et revenir sur la page de l'événement : vos billets s'y affichent dès la confirmation, et ils arrivent aussi par e-mail."
            : "Aucun montant n'a été prélevé. Fermez cet onglet et revenez sur la page de l'événement pour réessayer."}
        </p>
      </div>
    </main>
  );
}
