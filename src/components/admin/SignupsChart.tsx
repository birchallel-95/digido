"use client";

import { useMemo, useState } from "react";
import type { SignupPoint } from "@/lib/adminDashboard";

const LINE_COLOR = "#2a78d6"; // dataviz reference palette, categorical slot 1 (blue) — a single series, sequential/identity hue

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function SignupsChart({ points }: { points: SignupPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 640;
  const height = 200;
  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxY = useMemo(() => Math.max(1, ...points.map((p) => p.cumulative)), [points]);
  const niceMax = useMemo(() => {
    // round up to a clean step so gridlines land on whole numbers
    const step = maxY <= 5 ? 1 : maxY <= 20 ? 5 : maxY <= 100 ? 10 : Math.ceil(maxY / 5 / 10) * 10;
    let max = Math.ceil(maxY / step) * step;
    // the last point is always the max (cumulative never falls), so if it
    // lands exactly on the top gridline there's no headroom left for its
    // direct label — bump one more step so the label has room to sit above it
    if (max <= maxY) max += step;
    return Math.max(step, max);
  }, [maxY]);

  // A single day of data has nothing to draw a line across — centre the one
  // point instead of pinning it to x=0, which would sit directly under the
  // y-axis label and collide with it.
  const xFor = (i: number) => (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const yFor = (v: number) => plotH - (v / niceMax) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(2)} ${yFor(p.cumulative).toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(points.length - 1).toFixed(2)} ${plotH} L 0 ${plotH} Z`;

  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => Math.round((niceMax / gridSteps) * i));

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
    return <p className="text-sm text-[var(--color-ink-muted)]">No sign-ups yet.</p>;
  }

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-labelledby="signups-chart-title">
          <title id="signups-chart-title">Total sign-ups over time — currently {last.cumulative}</title>
          <g transform={`translate(${padding.left},${padding.top})`}>
            {gridValues.map((v) => (
              <g key={v}>
                <line x1={0} x2={plotW} y1={yFor(v)} y2={yFor(v)} stroke="var(--color-border)" strokeWidth={1} />
                <text x={-8} y={yFor(v)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--color-ink-faint)">
                  {v}
                </text>
              </g>
            ))}

            <path d={areaPath} fill={LINE_COLOR} fillOpacity={0.1} stroke="none" />
            <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {/* end marker + direct label, per spec: label the endpoint, not every point */}
            <circle cx={xFor(points.length - 1)} cy={yFor(last.cumulative)} r={5} fill={LINE_COLOR} stroke="var(--color-surface-raised)" strokeWidth={2} />
            <text
              x={xFor(points.length - 1)}
              y={yFor(last.cumulative) - 12}
              textAnchor="end"
              fontSize={12}
              fontWeight={600}
              fill="var(--color-ink)"
            >
              {last.cumulative}
            </text>

            {hovered && hoverIndex !== null && (
              <>
                <line x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={0} y2={plotH} stroke="var(--color-ink-faint)" strokeWidth={1} strokeDasharray="0" opacity={0.4} />
                <circle cx={xFor(hoverIndex)} cy={yFor(hovered.cumulative)} r={5} fill={LINE_COLOR} stroke="var(--color-surface-raised)" strokeWidth={2} />
              </>
            )}

            {/* transparent hover surface */}
            <rect
              x={0}
              y={0}
              width={plotW}
              height={plotH}
              fill="transparent"
              onMouseMove={handleMove}
              onMouseLeave={() => setHoverIndex(null)}
            />

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
            <caption className="sr-only">Sign-ups by day</caption>
            <thead>
              <tr className="text-left text-[var(--color-ink-faint)] sticky top-0 bg-[var(--color-surface-raised)]">
                <th scope="col" className="py-1.5 pr-3 font-medium">
                  Date
                </th>
                <th scope="col" className="py-1.5 px-3 font-medium text-right">
                  New sign-ups
                </th>
                <th scope="col" className="py-1.5 pl-3 font-medium text-right">
                  Total
                </th>
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
