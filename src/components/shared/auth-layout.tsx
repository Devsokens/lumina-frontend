import Link from "next/link";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import { Logo } from "./logo";
import { BrandVideo } from "./brand-video";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full bg-background lg:h-svh lg:overflow-hidden">
      {/* Panneau vidéo (grand écran) : film motion design GiyaX */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-[#0a4f3c] lg:block xl:w-[54%]">
        <BrandVideo className="absolute inset-0" fit="cover" controlPosition="bottom-left" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-8 top-8 xl:left-10 xl:top-10">
          <Logo inverted />
        </div>
        <div className="pointer-events-none absolute inset-x-8 bottom-16 text-white xl:inset-x-10">
          <p className="font-display text-2xl font-semibold leading-snug xl:text-3xl">
            La digitalisation <span className="text-secondary">qui éclaire</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-white/75">
            Vendez, accueillez et encaissez depuis une seule plateforme.
          </p>
        </div>
      </aside>

      {/* Panneau formulaire */}
      <main className="flex w-full flex-1 flex-col lg:overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 sm:px-10 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:px-3.5"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Retour à l&apos;accueil</span>
          </Link>
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <Link
            href="mailto:supportsokensdigital@gmail.com"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:px-3.5"
          >
            <LifeBuoy className="size-3.5" />
            <span className="hidden sm:inline">Assistance</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-4 sm:px-10 sm:pb-6">
          <div className="w-full max-w-[460px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
