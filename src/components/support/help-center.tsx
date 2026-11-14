"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ChevronRight, Headset, Search, X } from "lucide-react";
import { EvButton, EvCard } from "@/components/events/ev-ui";
import { HELP_SECTIONS, helpText, type HelpArticle, type HelpBlock, type HelpSection } from "@/lib/help-content";
import { useSupport } from "@/hooks/useSupport";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";

// Centre d'aide : la documentation de chaque module (lib/help-content.ts),
// avec recherche, et l'accès au support. Rubrique dans l'URL
// (?rubrique=billets) ; ?support=1 ouvre la conversation (lien des
// notifications).

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function SectionIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Block({ block }: { block: HelpBlock }) {
  if (block.type === "p") return <p className="m-0 text-[15px] leading-relaxed text-ev-ink2">{block.text}</p>;
  if (block.type === "note") {
    return <p className="m-0 rounded-[12px] border-l-[3px] border-ev-primary bg-ev-selected px-4 py-3 text-[14px] leading-relaxed text-ev-ink2">{block.text}</p>;
  }
  if (block.type === "steps") {
    return (
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {block.items.map((item, i) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ev-ink2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ev-primary text-xs font-semibold text-white">{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {block.items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ev-ink2">
          <span className="mt-[10px] size-1.5 shrink-0 rounded-full bg-ev-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Article({ article }: { article: HelpArticle }) {
  return (
    <article id={article.id} className="flex scroll-mt-24 flex-col gap-4 border-b border-ev-line px-5 py-6 last:border-b-0 sm:px-7">
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-[17px] font-semibold">{article.title}</h3>
        <p className="m-0 text-sm text-ev-muted">{article.summary}</p>
      </div>
      {article.blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
      {article.link && (
        <Link href={article.link.href} className="flex items-center gap-1 self-start text-sm font-semibold text-ev-link hover:underline">
          {article.link.label} <ArrowUpRight className="size-4" />
        </Link>
      )}
    </article>
  );
}

export function HelpCenter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const setSupportOpen = useShellStore((s) => s.setSupportOpen);
  const { data: support } = useSupport(false);
  const [query, setQuery] = useState("");

  const active = HELP_SECTIONS.find((s) => s.id === params.get("rubrique")) ?? null;
  const wantsSupport = params.get("support") === "1";

  // Lien « ?support=1 » (notification d'une réponse) : ouvre la conversation.
  useEffect(() => {
    if (!wantsSupport) return;
    setSupportOpen(true);
    router.replace(pathname, { scroll: false });
  }, [wantsSupport, setSupportOpen, router, pathname]);

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (q.length < 2) return null;
    const words = q.split(/\s+/);
    return HELP_SECTIONS.flatMap((section) =>
      section.articles.filter((a) => words.every((w) => fold(helpText(a)).includes(w))).map((article) => ({ section, article }))
    );
  }, [query]);

  const go = (section: HelpSection | null, articleId?: string) => {
    setQuery("");
    router.push(`${pathname}${section ? `?rubrique=${section.id}` : ""}${articleId ? `#${articleId}` : ""}`, { scroll: !articleId });
  };

  const unread = support?.unread ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-[20px] bg-[linear-gradient(150deg,#0F5A44,#0B3B2E)] px-5 py-8 text-white sm:px-9 sm:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">Comment pouvons-nous vous aider ?</h1>
          <p className="m-0 max-w-[620px] text-[15px] leading-relaxed text-white/75">La documentation de chaque module de GiyaX. Si vous ne trouvez pas votre réponse, notre équipe vous répond directement.</p>
        </div>
        <label className="flex h-[52px] max-w-[620px] items-center gap-3 rounded-[14px] bg-white px-4 text-ev-ink">
          <Search className="size-5 shrink-0 text-[#8A8F8B]" />
          <span className="sr-only">Rechercher dans l&apos;aide</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher : cotisation, versement, scanner…" className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#16211C] outline-none placeholder:text-[#8A8F8B]" />
          {query && (
            <button type="button" aria-label="Effacer la recherche" onClick={() => setQuery("")} className="flex size-8 items-center justify-center rounded-full text-[#5E6A64] hover:bg-[#F1EFE9]">
              <X className="size-4" />
            </button>
          )}
        </label>
      </section>

      {results ? (
        <EvCard className="overflow-hidden">
          <div className="border-b border-ev-line px-5 py-4 text-sm text-ev-muted sm:px-7">
            {results.length === 0 ? "Aucun article ne correspond." : `${results.length} article${results.length > 1 ? "s" : ""} pour « ${query.trim()} »`}
          </div>
          {results.length === 0 ? (
            <div className="flex flex-col items-start gap-3 px-5 py-6 sm:px-7">
              <span className="text-[15px] text-ev-ink2">Essayez un autre mot, ou posez votre question à notre équipe.</span>
              <EvButton variant="primary" onClick={() => setSupportOpen(true)}>
                <Headset className="size-4" /> Écrire au support
              </EvButton>
            </div>
          ) : (
            <ul className="m-0 list-none p-0">
              {results.map(({ section, article }) => (
                <li key={`${section.id}-${article.id}`} className="border-b border-ev-line last:border-b-0">
                  <button type="button" onClick={() => go(section, article.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-ev-soft sm:px-7">
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ev-muted">{section.title}</span>
                      <span className="text-[15px] font-semibold">{article.title}</span>
                      <span className="truncate text-[13px] text-ev-muted">{article.summary}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-ev-muted" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </EvCard>
      ) : active ? (
        <div className="flex items-start gap-7">
          <nav aria-label="Rubriques de l'aide" className="sticky top-24 hidden w-[230px] shrink-0 flex-col gap-0.5 lg:flex">
            <button type="button" onClick={() => go(null)} className="mb-2 flex h-9 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium text-ev-muted hover:bg-ev-line hover:text-ev-ink">
              Toutes les rubriques
            </button>
            {HELP_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-current={s.id === active.id ? "page" : undefined}
                onClick={() => go(s)}
                className={cn("flex h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-left text-sm", s.id === active.id ? "bg-ev-selected font-semibold text-ev-ink" : "text-ev-ink2 hover:bg-ev-line")}
              >
                <SectionIcon d={s.icon} className="size-4 shrink-0" />
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </nav>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <button type="button" onClick={() => go(null)} className="flex items-center gap-1 self-start text-sm font-medium text-ev-link hover:underline lg:hidden">
              Toutes les rubriques
            </button>
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-ev-mint text-ev-primary">
                <SectionIcon d={active.icon} className="size-6" />
              </span>
              <div className="flex flex-col gap-0.5">
                <h2 className="m-0 text-xl font-semibold">{active.title}</h2>
                <p className="m-0 text-sm text-ev-muted">{active.description}</p>
              </div>
            </div>
            <EvCard className="overflow-hidden">
              {active.articles.map((a) => (
                <Article key={a.id} article={a} />
              ))}
            </EvCard>
          </div>
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {HELP_SECTIONS.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => go(s)} className="group flex h-full w-full flex-col gap-3 rounded-[16px] border border-ev-border bg-ev-surface p-5 text-left transition-colors hover:border-ev-primary">
                <span className="flex size-11 items-center justify-center rounded-[12px] bg-ev-mint text-ev-primary">
                  <SectionIcon d={s.icon} className="size-[22px]" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-base font-semibold">{s.title}</span>
                  <span className="text-[13px] leading-relaxed text-ev-muted">{s.description}</span>
                </span>
                <span className="mt-auto flex items-center gap-1 text-[13px] font-semibold text-ev-link">
                  {s.articles.length} article{s.articles.length > 1 ? "s" : ""}
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <EvCard className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-ev-primary text-white">
            <Headset className="size-5" />
            {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[11px] font-bold">{unread}</span>}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-base font-semibold">{unread > 0 ? "Le support vous a répondu" : "Vous ne trouvez pas votre réponse ?"}</span>
            <span className="text-[13px] text-ev-muted">Écrivez à l&apos;équipe GiyaX : une personne vous répond dans la conversation.</span>
          </div>
        </div>
        <EvButton variant="primary" size="lg" onClick={() => setSupportOpen(true)}>
          <Headset className="size-4" />
          {unread > 0 ? "Lire la réponse" : "Contacter le support"}
        </EvButton>
      </EvCard>
    </div>
  );
}
