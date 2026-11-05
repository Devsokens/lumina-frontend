"use client";

import { EvCard } from "@/components/events/ev-ui";

// Écran 5b · Visuels par type de question (refonte Claude Design, 2026-11).
// Catalogue de référence des 12 représentations graphiques adaptées à chaque
// type de question du questionnaire.

const PAL = ["#0F8A64", "#E39A1F", "#2C5BA8", "#C2547A", "#6B8E23"];
const C = 2 * Math.PI * 60;

function computeDonut(rows: [string, number][]) {
  const total = rows.reduce((a, r) => a + r[1], 0) || 1;
  let acc = 0;
  return rows.map(([label, n], i) => {
    const len = (n / total) * C;
    const seg = {
      label,
      n,
      pct: `${Math.round((n / total) * 100)} %`,
      color: PAL[i % PAL.length],
      dash: `${Math.max(len - 2.5, 0).toFixed(2)} ${C.toFixed(2)}`,
      off: (-acc).toFixed(2),
    };
    acc += len;
    return seg;
  });
}

export function QuestionVisualsLibrary() {
  const dn = computeDonut([
    ["Option A", 35],
    ["Option B", 18],
    ["Option C", 11],
  ]);

  const halfC = Math.PI * 60;
  const yesLen = 0.72 * halfC;
  const half = {
    track: `${halfC.toFixed(2)} ${C.toFixed(2)}`,
    yes: `${(yesLen - 1.5).toFixed(2)} ${C.toFixed(2)}`,
    no: `${(halfC - yesLen - 1.5).toFixed(2)} ${C.toFixed(2)}`,
    noOff: (-(yesLen + 1.5)).toFixed(2),
  };

  const villes = [
    ["Libreville", 58],
    ["Port-Gentil", 14],
    ["Franceville", 9],
    ["Oyem", 6],
    ["Autres (6)", 13],
  ] as const;

  const multi = [
    ["Option A", 78],
    ["Option B", 67],
    ["Option C", 34],
    ["Option D", 22],
  ] as const;

  const scale = [
    ["5", 29],
    ["4", 20],
    ["3", 9],
    ["2", 4],
    ["1", 2],
  ] as const;

  const stars = [
    ["5", 68],
    ["4", 24],
    ["3", 6],
    ["2", 1],
    ["1", 1],
  ] as const;

  const hist = [
    ["18–22", 11],
    ["23–27", 24],
    ["28–32", 15],
    ["33–37", 8],
    ["38–42", 4],
    ["43 +", 2],
  ] as const;

  const dates = [
    ["juin", 3],
    ["juil.", 5],
    ["août", 4],
    ["sept.", 9],
    ["oct.", 14],
    ["nov.", 11],
  ] as const;

  const likert = [
    { label: "Le contenu était clair", a: 3, b: 5, c: 12, d: 40, e: 40 },
    { label: "Les intervenants étaient pertinents", a: 2, b: 6, c: 10, d: 36, e: 46 },
    { label: "L'organisation était fluide", a: 8, b: 14, c: 20, d: 34, e: 24 },
  ];

  const ranking = [
    { label: "Networking", avg: "1,6", pos: "1", first: true },
    { label: "Ateliers pratiques", avg: "2,1", pos: "2", first: false },
    { label: "Conférence", avg: "2,7", pos: "3", first: false },
    { label: "Concert", avg: "3,6", pos: "4", first: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-[860px] flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.14em] text-ev-primary dark:text-ev-link">
          STATISTIQUES · BIBLIOTHÈQUE DE VISUELS
        </span>
        <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em]">
          Un visuel par type de question
        </h2>
        <p className="m-0 text-sm leading-[1.6] text-ev-ink2">
          Quand l&apos;organisateur ajoute une question au questionnaire, l&apos;onglet Statistiques
          choisit automatiquement le bon graphique selon le type. Chaque bloc affiche le nombre de
          répondants et propose une bascule Graphique / Tableau, ainsi qu&apos;un croisement avec la
          formule de pass ou la présence.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <span className="rounded-[10px] border border-ev-border bg-ev-surface px-3 py-2 text-[13px]">
          <b>≤ 5 options</b> → anneau (camembert)
        </span>
        <span className="rounded-[10px] border border-ev-border bg-ev-surface px-3 py-2 text-[13px]">
          <b>&gt; 5 options</b> → barres triées + « Autres »
        </span>
        <span className="rounded-[10px] border border-ev-border bg-ev-surface px-3 py-2 text-[13px]">
          <b>Options ordonnées</b> → histogramme, dans l&apos;ordre
        </span>
        <span className="rounded-[10px] border border-ev-border bg-ev-surface px-3 py-2 text-[13px]">
          <b>Valeurs toujours écrites</b>, la couleur ne suffit jamais
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. Choix unique <= 5 options */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              CHOIX UNIQUE · ≤ 5 OPTIONS
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Anneau (camembert)</h3>
          </div>
          <div className="flex h-[150px] items-center gap-[18px]">
            <div className="relative size-[130px] shrink-0">
              <svg width="130" height="130" viewBox="0 0 160 160" aria-label="Camembert">
                <circle cx="80" cy="80" r="60" fill="none" stroke="#F1EFE9" strokeWidth="24" />
                {dn.map((s) => (
                  <circle
                    key={s.label}
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="24"
                    strokeDasharray={s.dash}
                    strokeDashoffset={s.off}
                    transform="rotate(-90 80 80)"
                  />
                ))}
              </svg>
              <div className=" absolute inset-0 flex items-center justify-center text-xl font-semibold">
                55 %
              </div>
            </div>
            <ul className="m-0 flex flex-1 list-none flex-col gap-2 p-0 text-xs">
              {dn.map((l) => (
                <li key={l.label} className="flex items-center gap-2">
                  <span
                    className="size-[9px] shrink-0 rounded-[2px]"
                    style={{ background: l.color }}
                  />
                  <span className="flex-1">{l.label}</span>
                  <b>{l.pct}</b>
                </li>
              ))}
            </ul>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Le pourcentage principal au centre. Autres vues : barres, tableau.
          </p>
        </EvCard>

        {/* 2. Liste déroulante > 5 options */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              LISTE DÉROULANTE · &gt; 5 OPTIONS
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Classement, top 8 + « Autres »</h3>
          </div>
          <div className="flex h-[150px] flex-col justify-center gap-[9px]">
            {villes.map(([label, p]) => {
              const w = Math.round((p / 58) * 100);
              const fill = label.startsWith("Autres") ? "#B9B5A9" : "#0F8A64";
              return (
                <div key={label} className="flex items-center gap-2.5 text-xs">
                  <span className="w-[92px] truncate">{label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                    <div
                      className="h-full rounded-r-[4px]"
                      style={{ width: `${w}%`, background: fill }}
                    />
                  </div>
                  <b className="w-[34px] text-right">{p} %</b>
                </div>
              );
            })}
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Pour une ville, un pays, un établissement… Trié du plus fréquent au moins fréquent.
          </p>
        </EvCard>

        {/* 3. Choix multiples */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              CHOIX MULTIPLES
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Barres en % des répondants</h3>
          </div>
          <div className="flex h-[150px] flex-col justify-center gap-3">
            {multi.map(([label, p]) => (
              <div key={label} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span>{label}</span>
                  <b>{p} %</b>
                </div>
                <div className="h-2 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                  <div
                    className="h-full rounded-r-[4px] bg-[#0F8A64]"
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Jamais de camembert : le total dépasse 100 %. Le nombre moyen de choix est affiché.
          </p>
        </EvCard>

        {/* 4. Oui / Non */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              OUI / NON
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Demi-anneau + chiffre clé</h3>
          </div>
          <div className="flex h-[150px] items-center justify-center gap-[22px]">
            <div className="relative h-[102px] w-[180px]">
              <svg width="180" height="102" viewBox="0 0 160 90" aria-label="Oui 72 %">
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#F1EFE9"
                  strokeWidth="22"
                  strokeDasharray={half.track}
                  transform="rotate(180 80 80)"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#0F8A64"
                  strokeWidth="22"
                  strokeDasharray={half.yes}
                  transform="rotate(180 80 80)"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#B9B5A9"
                  strokeWidth="22"
                  strokeDasharray={half.no}
                  strokeDashoffset={half.noOff}
                  transform="rotate(180 80 80)"
                />
              </svg>
              <div className="absolute inset-x-0 -bottom-0.5 text-center text-2xl font-semibold">
                72 %
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-[9px] rounded-[2px] bg-[#0F8A64]" />
                Oui · 46
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-[9px] rounded-[2px] bg-[#B9B5A9]" />
                Non · 18
              </span>
            </div>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Le « Oui » en vert, le « Non » en gris neutre : aucune couleur d&apos;alerte.
          </p>
        </EvCard>

        {/* 5. Échelle linéaire */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              ÉCHELLE LINÉAIRE · 1–5 / 1–10
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Moyenne + distribution</h3>
          </div>
          <div className="flex h-[150px] items-center gap-[18px]">
            <div className="flex w-[84px] flex-col gap-0.5">
              <span className="text-[34px] font-semibold leading-none tracking-[-0.03em]">4,1</span>
              <span className="text-xs text-ev-muted">sur 5</span>
            </div>
            <div className="flex flex-1 flex-col gap-[7px]">
              {scale.map(([label, v]) => {
                const w = Math.round((v / 29) * 100);
                const fill = Number(label) >= 4 ? "#0F8A64" : "#B9B5A9";
                return (
                  <div key={label} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2.5 text-ev-muted">{label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                      <div
                        className="h-full rounded-r-[4px]"
                        style={{ width: `${w}%`, background: fill }}
                      />
                    </div>
                    <b className="w-5 text-right">{v}</b>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Les notes hautes sont mises en avant ; la médiane apparaît sous la moyenne.
          </p>
        </EvCard>

        {/* 6. Note en étoiles */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              NOTE EN ÉTOILES · SATISFACTION
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Note moyenne en étoiles</h3>
          </div>
          <div className="flex h-[150px] flex-col justify-center gap-3">
            <div className="flex items-center gap-3.5">
              <span className="text-[34px] font-semibold tracking-[-0.03em]">4,6</span>
              <div className="flex gap-[3px]" role="img" aria-label="4,6 étoiles sur 5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#E39A1F"
                    aria-hidden="true"
                  >
                    <path d="m12 2 2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              {stars.map(([label, p]) => (
                <div key={label} className="flex items-center gap-2 text-[11px]">
                  <span className="w-[22px] text-ev-muted">{label}★</span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                    <div className="h-full bg-[#E39A1F]" style={{ width: `${p}%` }} />
                  </div>
                  <span className="w-[30px] text-right">{p} %</span>
                </div>
              ))}
            </div>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Pour le questionnaire de satisfaction envoyé après l&apos;événement.
          </p>
        </EvCard>

        {/* 7. NPS */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              RECOMMANDATION 0–10 (NPS)
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Score NPS + trois groupes</h3>
          </div>
          <div className="flex h-[150px] flex-col justify-center gap-3.5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[34px] font-semibold tracking-[-0.03em]">+42</span>
              <span className="text-xs text-ev-muted">score de recommandation</span>
            </div>
            <div className="flex h-[22px] gap-0.5 overflow-hidden rounded-[4px] text-[11px] font-semibold">
              <div
                style={{ width: "14%" }}
                className="flex items-center justify-center bg-[#C2547A] text-white"
              >
                14 %
              </div>
              <div
                style={{ width: "30%" }}
                className="flex items-center justify-center bg-[#D9D6CC] text-[#16211C]"
              >
                30 %
              </div>
              <div
                style={{ width: "56%" }}
                className="flex items-center justify-center bg-[#0F8A64] text-white"
              >
                56 %
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-ev-muted">
              <span>Détracteurs 0–6</span>
              <span>Passifs 7–8</span>
              <span>Promoteurs 9–10</span>
            </div>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            NPS = % de promoteurs − % de détracteurs.
          </p>
        </EvCard>

        {/* 8. Nombre / Histogramme */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              NOMBRE · ÂGE, EFFECTIF, BUDGET
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Histogramme par tranches</h3>
          </div>
          <div className="flex h-[150px] flex-col gap-1.5">
            <div className="flex flex-1 items-end gap-1.5 border-b border-[#D9D6CC]">
              {hist.map(([label, v]) => {
                const h = Math.round((v / 24) * 92);
                const fill = v === 24 ? "#0C4A3A" : "#8FC7AE";
                return (
                  <div
                    key={label}
                    className="flex-1 rounded-t-[3px]"
                    style={{ height: `${h}%`, background: fill }}
                  />
                );
              })}
            </div>
            <div className="flex gap-1.5 text-[10px] text-ev-muted">
              {hist.map(([label]) => (
                <span key={label} className="flex-1 text-center">
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span>
                Min <b>18</b>
              </span>
              <span>
                Médiane <b>26</b>
              </span>
              <span>
                Moyenne <b>28</b>
              </span>
              <span>
                Max <b>52</b>
              </span>
            </div>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Les tranches sont calculées automatiquement à partir des valeurs saisies.
          </p>
        </EvCard>

        {/* 9. Date */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              DATE
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Barres par période</h3>
          </div>
          <div className="flex h-[150px] flex-col gap-1.5">
            <div className="flex flex-1 items-end gap-2.5 border-b border-[#D9D6CC]">
              {dates.map(([label, v]) => {
                const h = Math.round((v / 14) * 78);
                return (
                  <div
                    key={label}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <span className="text-[11px] font-semibold">{v}</span>
                    <div
                      className="w-full rounded-t-[3px] bg-[#0F8A64]"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2.5 text-[10px] text-ev-muted">
              {dates.map(([label]) => (
                <span key={label} className="flex-1 text-center">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Regroupement par jour, semaine ou mois selon l&apos;étendue des dates.
          </p>
        </EvCard>

        {/* 10. Grille accord / désaccord */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              GRILLE · ACCORD / DÉSACCORD
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Barres empilées à 100 %</h3>
          </div>
          <div className="flex h-[150px] flex-col justify-center gap-2.5">
            {likert.map((l) => (
              <div key={l.label} className="flex flex-col gap-1 text-[11px]">
                <span>{l.label}</span>
                <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-[3px]">
                  <div style={{ width: `${l.a}%`, background: "#C2547A" }} />
                  <div style={{ width: `${l.b}%`, background: "#E7A9BE" }} />
                  <div style={{ width: `${l.c}%`, background: "#D9D6CC" }} />
                  <div style={{ width: `${l.d}%`, background: "#8FC7AE" }} />
                  <div style={{ width: `${l.e}%`, background: "#0F8A64" }} />
                </div>
              </div>
            ))}
            <div className="flex justify-between text-[10px] text-ev-muted">
              <span>Pas du tout d&apos;accord</span>
              <span>Neutre</span>
              <span>Tout à fait d&apos;accord</span>
            </div>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Une ligne par affirmation, toutes notées sur la même échelle.
          </p>
        </EvCard>

        {/* 11. Classement / Ordonner */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              CLASSEMENT · ORDONNER
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Rang moyen</h3>
          </div>
          <div className="flex h-[150px] flex-col justify-center gap-2.5">
            {ranking.map((r) => (
              <div key={r.label} className="flex items-center gap-2.5 text-xs">
                <span
                  className="flex size-[22px] items-center justify-center rounded-[6px] text-[11px] font-semibold"
                  style={{
                    background: r.first ? "#0C4A3A" : "#EFEDE6",
                    color: r.first ? "#FFFFFF" : "#3F4A45",
                  }}
                >
                  {r.pos}
                </span>
                <span className="flex-1">{r.label}</span>
                <span className="text-ev-muted">rang moyen</span>
                <b className="w-[26px] text-right">{r.avg}</b>
              </div>
            ))}
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Plus le rang moyen est bas, plus l&apos;option a été placée en tête.
          </p>
        </EvCard>

        {/* 12. Texte court / long */}
        <EvCard className="flex flex-col gap-3.5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              TEXTE COURT / LONG
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Thèmes + extraits</h3>
          </div>
          <div className="flex h-[150px] flex-col justify-center gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["Ambition", 21],
                  ["Études", 14],
                  ["Tech", 12],
                  ["Projet", 11],
                ] as const
              ).map(([tag, n]) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#D5E6DE] bg-[#F2F7F5] px-2.5 py-[5px] text-xs dark:border-ev-border dark:bg-ev-selected"
                >
                  {tag} <b className="text-ev-primary dark:text-ev-link">{n}</b>
                </span>
              ))}
            </div>
            <blockquote className="m-0 rounded-[8px] bg-ev-bg px-3 py-2.5 text-xs leading-[1.5] text-ev-ink2">
              « Je prépare le lancement d&apos;une activité de livraison à Libreville. »
            </blockquote>
          </div>
          <p className="m-0 text-xs text-ev-muted">
            Recherche dans les réponses ; regroupement en catégories, puis anneau, si les réponses
            s&apos;y prêtent.
          </p>
        </EvCard>
      </div>
    </div>
  );
}

