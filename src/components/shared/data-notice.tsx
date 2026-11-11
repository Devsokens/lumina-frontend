import { APP_URL } from "@/lib/constants";
import { LEGAL_LINKS } from "@/lib/legal";
import { cn } from "@/lib/utils";

// Information des personnes au moment de la collecte (loi gabonaise
// n° 001/2011 modifiée par la loi n° 025/2023 ; RGPD art. 13) : qui reçoit
// les données, pour quoi faire, où elles vont, et comment exercer ses droits.
// Lien absolu : le formulaire peut être servi sur le sous-domaine d'un compte.
// La couleur suit le thème du site qui l'affiche (opacité sur currentColor).
export function DataNotice({ controller, purpose, className }: { controller: string; purpose: string; className?: string }) {
  return (
    <p className={cn("text-[11px] leading-relaxed opacity-70", className)}>
      Vos coordonnées sont utilisées par {controller} pour {purpose}. GiyaX les traite pour son compte : elles ne sont ni vendues, ni utilisées pour de la publicité, et
      certaines sont hébergées hors du Gabon. Vous pouvez y accéder, les corriger ou demander leur suppression :{" "}
      <a href={`${APP_URL}${LEGAL_LINKS.privacy}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
        politique de confidentialité
      </a>
      .
    </p>
  );
}
