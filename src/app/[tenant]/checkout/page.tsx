import { Suspense } from "react";
import { CheckoutForm } from "@/components/vitrine/checkout-form";

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-semibold">Finaliser la commande</h1>
      <Suspense>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}
