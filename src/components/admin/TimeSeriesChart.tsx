"use client";

import { useMemo, useState } from "react";

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  count: number;
  cumulative: number;
}

const LINE_COLOR = "#2a78d6"; // dataviz reference palette, categorical slot 1 (blue) — a single series, sequential/identity hue

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** A cumulative daily line+area chart — used for sign-ups over time and video uploads over time. */
export function TimeSeriesChart({
  points,
  emptyLabel,
  chartTitle,
  countLabel,
}: {
  points: TimeSeriesPoint[];
  emptyLabel: string;
  chartTitle: string;
  countLabel: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 640;
  const height = 200;
  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxY = useMemo(() => Math.max(1, ...points.map((p) => p.cumulative)), [points]);
  const niceMax = useMemo(() => {
    const step = maxY <= 5 ? 1 : maxY <= 20 ? 5 : maxY <= 100 ? 10 : Math.ceil(maxY / 5 / 10) * 10;
    let max = Math.ceil(maxY / step) * step;
    if (max <= maxY) max += step;
    return Math.max(step, max);
  }, [maxY]);

  const xFor = (i: number) => (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const yFor = (v: number) => plotH - (v / niceMax) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(2)} ${yFor(p.cumulative).toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(points.length - 1).toFixed(2)} ${plotH} L 0 ${plotH} Z`;

  // Pick the largest divisor of niceMax that's <=4, so every gridline value
  // is a whole number and none repeat — rounding a fixed 4-way split (e.g.
  // niceMax=2 -> 0, 0.5, 1, 1.5, 2 rounded to 0,1,1,2,2) produced duplicate
  // labels at different heights.
  const gridSteps = useMemo(() => {
    for (let g = 4; g >= 1; g--) {
      if (niceMax % g === 0) return g;
    }
    return 1;
  }, [niceMax]);
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => (niceMax / gridSteps) * i);

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const last = points[points.length - 1];

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIndex(idx);
  }

  if (points.length === 0) {
    return <p className="text-sm text-[var(--color-ink-muted)]">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="relative">
        {/* aria-label, not a child <title> — React 19 treats any <title> element as
            document-head metadata and hoists/dedupes it, which empties it right back
            out of the SVG (and causes a hydration mismatch in the process). */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={`${chartTitle} — currently ${last.cumulative}`}>
          <g transform={`translate(${padding.left},${padding.top})`}>
            {gridValues.map((v, i) => (
              <g key={i}>
                <line x1={0} x2={plotW} y1={yFor(v)} y2={yFor(v)} stroke="var(--color-border)" strokeWidth={1} />
                <text x={-8} y={yFor(v)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--color-ink-faint)">
                  {v}
                </text>
              </g>
            ))}

            <path d={areaPath} fill={LINE_COLOR} fillOpacity={0.1} stroke="none" />
            <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            <circle cx={xFor(points.length - 1)} cy={yFor(last.cumulative)} r={5} fill={LINE_COLOR} stroke="var(--color-surface-raised)" strokeWidth={2} />
            <text x={xFor(points.length - 1)} y={yFor(last.cumulative) - 12} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--color-ink)">
              {last.cumulative}
            </text>

            {hovered && hoverIndex !== null && (
              <>
                <line x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={0} y2={plotH} stroke="var(--color-ink-faint)" strokeWidth={1} opacity={0.4} />
                <circle cx={xFor(hoverIndex)} cy={yFor(hovered.cumulative)} r={5} fill={LINE_COLOR} stroke="var(--color-surface-raised)" strokeWidth={2} />
              </>
            )}

            <rect x={0} y={0} width={plotW} height={plotH} fill="transparent" onMouseMove={handleMove} onMouseLeave={() => setHoverIndex(null)} />

            {points.length <= 1 ? (
              <text x={plotW / 2} y={plotH + 20} textAnchor="middle" fontSize={10} fill="var(--color-ink-faint)">
                {formatDate(points[0].date)}
              </text>
            ) : (
              <>
                <text x={0} y={plotH + 20} textAnchor="start" fontSize={10} fill="var(--color-ink-faint)">
                  {formatDate(points[0].date)}
                </text>
                <text x={plotW} y={plotH + 20} textAnchor="end" fontSize={10} fill="var(--color-ink-faint)">
                  {formatDate(points[points.length - 1].date)}
                </text>
              </>
            )}
          </g>
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-1 rounded-lg bg-[var(--color-ink)] text-white text-xs px-2.5 py-1.5 shadow-lg"
            style={{ left: `${(xFor(hoverIndex!) / plotW) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="font-semibold">{hovered.cumulative} total</div>
            <div className="text-white/70">{formatDate(hovered.date)}</div>
          </div>
        )}
      </div>

      <details className="mt-2 group">
        <summary className="cursor-pointer text-xs font-medium text-[var(--color-brand-text)] w-fit list-none underline underline-offset-2">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto max-h-56">
          <table className="w-full text-sm border-collapse">
            <caption className="sr-only">{chartTitle} by day</caption>
            <thead>
              <tr className="text-left text-[var(--color-ink-faint)] sticky top-0 bg-[var(--color-surface-raised)]">
                <th scope="col" className="py-1.5 pr-3 font-medium">Date</th>
                <th scope="col" className="py-1.5 px-3 font-medium text-right">{countLabel}</th>
                <th scope="col" className="py-1.5 pl-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {points
                .filter((p) => p.count > 0)
                .map((p) => (
                  <tr key={p.date} className="border-t border-[var(--color-border)]">
                    <td className="py-1.5 pr-3">{formatDate(p.date)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">{p.count}</td>
                    <td className="py-1.5 pl-3 text-right font-semibold tabular-nums">{p.cumulative}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
