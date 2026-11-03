import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";

const PLATFORM_LINKS = [
  { href: "/login", label: "Connexion" },
  { href: "/signup", label: "Créer un compte GiyaX" },
  { href: "/pricing", label: "Tarifs" },
];

// Coordonnées de l'assistance (SOKEN'S DIGITAL).
const CONTACT = {
  email: "supportsokensdigital@gmail.com",
  phoneLabel: "060 00 13 33",
  phoneHref: "tel:060001333",
  city: "Libreville, Gabon",
};

const DISCOVER_LINKS = [
  { href: "/#secteurs", label: "Solutions" },
  { href: "/#clients", label: "Ils utilisent GiyaX" },
  { href: "/#faq", label: "Questions fréquentes" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#06140f] text-white">
      <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          <div>
            <Logo size="lg" inverted />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              La digitalisation qui éclaire : vendez, accueillez et encaissez depuis une seule plateforme, pensée pour
              l&apos;Afrique.
            </p>
          </div>

          <nav aria-label="Découvrir">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Découvrir</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              {DISCOVER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-secondary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Plateforme">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Plateforme</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-secondary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2.5 break-all transition-colors hover:text-secondary">
                  <Mail className="size-4 shrink-0 text-secondary" />
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2.5 transition-colors hover:text-secondary">
                  <Phone className="size-4 shrink-0 text-secondary" />
                  {CONTACT.phoneLabel}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-secondary" />
                {CONTACT.city}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} GiyaX Technologies. Tous droits réservés.</p>
          <a
            href="https://www.sokensdigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-secondary"
          >
            Une Solution de
            <strong className="font-semibold tracking-wide text-white transition-colors group-hover:text-secondary">
              SOKEN&apos;S DIGITAL
            </strong>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <div className="flex items-center gap-6">
            <span>Confidentialité</span>
            <span>Conditions d&apos;utilisation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
