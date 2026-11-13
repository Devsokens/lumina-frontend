import type { Metadata } from "next";
import { PaymentSignal } from "./payment-signal";

// Fin du paiement par carte (retour de PVit, dans la fenêtre ouverte pour la
// banque). Prévient la fenêtre d'achat restée ouverte, qui affiche le
// résultat officiel, puis se ferme si le navigateur l'autorise.

export const metadata: Metadata = { title: "Paiement · GiyaX", robots: { index: false } };

export default async function PaymentReturnPage({ params }: { params: Promise<{ result: string }> }) {
  const { result } = await params;
  const success = result === "success";
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center text-foreground">
      <div className="flex max-w-md flex-col gap-3">
        <PaymentSignal result={result} />
        <h1 className="font-display text-2xl font-bold">{success ? "Paiement transmis" : "Paiement non abouti"}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {success
            ? "Cette fenêtre va se fermer. Si ce n'est pas le cas, fermez-la : vos billets s'affichent sur la page de l'événement dès la confirmation, et arrivent aussi par e-mail."
            : "Aucun montant n'a été prélevé. Fermez cette fenêtre et revenez sur la page de l'événement pour réessayer."}
        </p>
      </div>
    </main>
  );
}
