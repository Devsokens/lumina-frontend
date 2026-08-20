import Link from "next/link";
import { ArrowLeft, LifeBuoy, MessageCircle, Mic, ArrowUp, Monitor, TrendingUp } from "lucide-react";
import { Logo } from "./logo";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      {/* Showcase panel */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#eaf1fb] via-[#eef4fb] to-[#e2ecf9] p-10 lg:flex dark:from-[#0c1712] dark:via-[#0f1a15] dark:to-[#13201a]">
        <div className="pointer-events-none absolute inset-0 bg-dots-pattern opacity-40" />
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 size-80 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative z-10">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Simplifiez votre gestion. Amplifiez votre succès.
          </p>
        </div>

        {/* Browser / dashboard mockup */}
        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="animate-float rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
              <span className="size-2.5 rounded-full bg-red-400/80" />
              <span className="size-2.5 rounded-full bg-yellow-400/80" />
              <span className="size-2.5 rounded-full bg-green-400/80" />
              <span className="ml-3 truncate rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                app.lumina.ga/admin
              </span>
            </div>
            <div className="flex gap-3 p-4">
              <div className="flex w-9 shrink-0 flex-col items-center gap-3 rounded-xl bg-muted/60 py-3">
                <span className="size-6 rounded-lg bg-primary/90" />
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
              </div>
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Monitor className="size-3.5 text-accent" />
                    Gérance Live
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-success">
                    <TrendingUp className="size-3" /> +42%
                  </span>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
                    Ventes du jour
                  </p>
                  <p className="font-mono text-lg font-black text-foreground">542 000 FCFA</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full w-4/5 rounded-full bg-secondary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] font-bold">
                  <div className="rounded-lg bg-muted/60 p-2 text-foreground">46 Commandes</div>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">Airtel 88%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat card */}
          <div className="absolute -top-6 -right-6 hidden animate-pulse-slow rounded-xl border border-border/60 bg-card px-3 py-2 shadow-lg sm:block">
            <p className="text-[10px] text-muted-foreground">Total encaissé</p>
            <p className="font-mono text-sm font-extrabold text-primary">8 023 030 FCFA</p>
          </div>

          {/* Floating chat widget */}
          <div className="absolute -bottom-8 -left-6 w-56 rounded-2xl border border-border/60 bg-card p-3 shadow-xl sm:-left-10">
            <div className="flex items-start gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageCircle className="size-3.5" />
              </span>
              <p className="text-xs text-foreground">
                Bonjour ! Comment puis-je vous aider aujourd&apos;hui ?
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1.5">
              <span className="flex-1 truncate text-[11px] text-muted-foreground">Écrire un message...</span>
              <Mic className="size-3.5 text-muted-foreground" />
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ArrowUp className="size-3" />
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10" />
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 flex-col lg:w-[48%]">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:px-3.5"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Retour à l&apos;accueil</span>
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="mailto:support@lumina.ga"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:px-3.5"
          >
            <LifeBuoy className="size-3.5" />
            <span className="hidden sm:inline">Assistance</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
