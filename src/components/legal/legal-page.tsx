import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";
import { cn } from "@/lib/utils";

// Mise en page des documents légaux : sommaire collant (ordinateur),
// « L'essentiel » en tête, sections ancrées (#id) pour pouvoir y renvoyer.

export type LegalSection = { id: string; title: string; body: ReactNode };

export function LegalPage({
  kind,
  title,
  intro,
  summary,
  sections,
}: {
  kind: "privacy" | "terms";
  title: string;
  intro: ReactNode;
  summary: ReactNode[];
  sections: LegalSection[];
}) {
  const other = kind === "privacy" ? { href: LEGAL_LINKS.terms, label: "Conditions d'utilisation" } : { href: LEGAL_LINKS.privacy, label: "Politique de confidentialité" };
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      {/* En tête aligné sur la colonne du texte (sommaire de 230 px + 56 px). */}
      <div className="max-w-3xl lg:ml-[286px]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Informations légales</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[42px] sm:leading-[1.1]">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          En vigueur le {LEGAL.effectiveDate} · Version {LEGAL.version}
        </p>
        <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-foreground/85">{intro}</div>
      </div>

      <section aria-labelledby="essentiel" className="mt-8 max-w-3xl rounded-2xl border border-border bg-muted/40 p-5 sm:p-6 lg:ml-[286px]">
        <h2 id="essentiel" className="font-display text-base font-semibold">
          L&apos;essentiel
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/85">
          {summary.map((s, i) => (
            <li key={i} className="flex gap-2.5">
              <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
        <nav aria-label="Sommaire" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sommaire</p>
            <ol className="mt-3 space-y-1.5 border-l border-border text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-3 text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <Link href={other.href} className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
              {other.label} →
            </Link>
          </div>
        </nav>

        <article className="min-w-0 max-w-3xl">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`} className={cn("scroll-mt-28", i > 0 && "mt-12 border-t border-border pt-10")}>
              <h2 id={`${s.id}-t`} className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {i + 1}. {s.title}
              </h2>
              <div className="legal-body mt-4 space-y-4 text-[15px] leading-[1.75] text-foreground/85">{s.body}</div>
            </section>
          ))}
          <p className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
            Voir aussi :{" "}
            <Link href={other.href} className="font-medium text-primary underline-offset-4 hover:underline">
              {other.label}
            </Link>
            .
          </p>
        </article>
      </div>
    </main>
  );
}

// Briques de contenu.

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 font-display text-base font-semibold text-foreground">{children}</h3>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden className="mt-[11px] size-1 shrink-0 rounded-full bg-foreground/50" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// Tableau sur ordinateur ; fiches empilées sur téléphone (pas de défilement
// horizontal). display:none masque l'autre version aux lecteurs d'écran.
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {rows.map((r, i) => (
          <dl key={i} className="rounded-xl border border-border p-4 text-sm">
            <dt className="sr-only">{head[0]}</dt>
            <dd className="font-semibold text-foreground">{r[0]}</dd>
            {r.slice(1).map((c, j) => (
              <div key={j} className="mt-2.5">
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{head[j + 1]}</dt>
                <dd className="mt-0.5 leading-relaxed">{c}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      <TableWide head={head} rows={rows} />
    </>
  );
}

function TableWide({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border align-top">
              {r.map((c, j) => (
                <td key={j} className={cn("px-4 py-3 leading-relaxed", j === 0 && "font-medium text-foreground")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 text-sm leading-relaxed">{children}</div>;
}

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
      {children}
    </a>
  );
}

export function Mail({ to }: { to: string }) {
  return (
    <a href={`mailto:${to}`} className="font-medium text-primary underline underline-offset-4">
      {to}
    </a>
  );
}
