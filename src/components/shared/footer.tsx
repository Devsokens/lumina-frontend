import { Logo } from "./logo";
import Link from "next/link";
import { ShieldCheck, Smartphone, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#06140f] text-white">
      <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-secondary/10 blur-[120px]" />

      {/* Top Value Banner */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
              <Smartphone className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">100% Mobile & Offline</p>
              <p className="text-xs text-white/60">PWA conçue pour la connectivité africaine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-secondary">
              <Zap className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Mobile Money Intégré</p>
              <p className="text-xs text-white/60">Airtel Money, Moov Money, Carte</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Souveraineté des Données</p>
              <p className="text-xs text-white/60">Export auto Google Drive / Dropbox</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <Logo size="lg" inverted />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              La plateforme tout-en-un de digitalisation sectorielle pour les restaurants, événements et commerces en Afrique.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-300">
                Tous les systèmes opérationnels (99.9%)
              </span>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <p className="text-sm font-semibold tracking-wider text-white uppercase">Secteurs</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li>
                <a href="#secteurs" className="transition-colors hover:text-secondary">
                  Restauration & KDS
                </a>
              </li>
              <li>
                <a href="#secteurs" className="transition-colors hover:text-secondary">
                  Événements & Billetterie
                </a>
              </li>
              <li>
                <a href="#secteurs" className="transition-colors hover:text-secondary">
                  Boutiques & Retail
                </a>
              </li>
              <li>
                <a href="#demo" className="transition-colors hover:text-secondary">
                  Démo Live
                </a>
              </li>
            </ul>
          </div>

          {/* Produit Col */}
          <div>
            <p className="text-sm font-semibold tracking-wider text-white uppercase">Produit</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li>
                <a href="#features" className="transition-colors hover:text-secondary">
                  Menus & QR Codes
                </a>
              </li>
              <li>
                <a href="#features" className="transition-colors hover:text-secondary">
                  Paiement Mobile Money
                </a>
              </li>
              <li>
                <a href="#tarifs" className="transition-colors hover:text-secondary">
                  Grille Tarifaire
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-secondary">
                  FAQ & Aide
                </a>
              </li>
            </ul>
          </div>

          {/* Légal & Accès */}
          <div>
            <p className="text-sm font-semibold tracking-wider text-white uppercase">Plateforme</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li>
                <Link href="/login" className="transition-colors hover:text-secondary">
                  Connexion Pro
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-secondary">
                  Créer un compte
                </Link>
              </li>
              <li>
                <span className="text-xs text-white/40">Gabon • Afrique Centrale & Ouest</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p className="flex items-center">
            © {new Date().getFullYear()} LUMINA Technologies.
          </p>
          <div className="flex items-center gap-6">
            <span>Confidentialité & RGPD/APDP</span>
            <span>Conditions d&apos;Utilisation</span>
            <span>Sécurité ISO/TLS 1.3</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
