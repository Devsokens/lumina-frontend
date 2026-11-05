import { Fragment, type ReactNode } from "react";

// Mise en forme légère des descriptions (éditeur d'événement) :
// **gras**, *italique*, lignes « - » en liste, [texte](https://lien).
// Rendu en éléments React (jamais de HTML injecté).

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\(https:\/\/[^\s)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${key}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[")) {
      const label = tok.slice(1, tok.indexOf("]"));
      const href = tok.slice(tok.indexOf("(") + 1, -1);
      out.push(
        <a key={k} href={href} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
          {label}
        </a>
      );
    } else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let list: string[] = [];
  const flush = (k: number) => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${k}`} className="my-1 list-disc pl-5">
        {list.map((l, j) => (
          <li key={j}>{inline(l, `li-${k}-${j}`)}</li>
        ))}
      </ul>
    );
    list = [];
  };
  lines.forEach((line, k) => {
    if (/^\s*-\s+/.test(line)) {
      list.push(line.replace(/^\s*-\s+/, ""));
      return;
    }
    flush(k);
    blocks.push(<Fragment key={`p-${k}`}>{line.trim() ? <span className="block">{inline(line, `p-${k}`)}</span> : <span className="block h-2" />}</Fragment>);
  });
  flush(lines.length);
  return <div className={className}>{blocks}</div>;
}
