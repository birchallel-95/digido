import Link from "next/link";
import type { AreaProgress } from "@/types/domain";

/** Greedily wraps a label onto short lines so it never overruns the chart's radial padding. */
function wrapLabel(text: string, maxCharsPerLine = 9): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Six-axis radar chart of capability progress. Always paired with a visible
 * text/table alternative (via <details>) since radar charts are hard to read
 * for many screen-reader and low-vision users — WCAG guidance in the brief.
 */
export function RadarChart({ areas }: { areas: AreaProgress[] }) {
  const size = 340;
  const center = size / 2;
  const radius = 95;
  const labelRadius = radius + 40;
  const n = areas.length;

  const pointFor = (i: number, pct: number) => {
    const angle = -90 + (360 / n) * i;
    const rad = (angle * Math.PI) / 180;
    const r = (radius * pct) / 100;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  const ringLevels = [25, 50, 75, 100];
  const dataPoints = areas.map((a, i) => pointFor(i, a.overallPercent));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div>
      {/* aria-label, not a child <title> — React 19 treats any <title> element as
          document-head metadata and hoists/dedupes it, emptying it back out of the SVG. */}
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm mx-auto" role="img" aria-label="Progress across all six digital capability areas">
        {ringLevels.map((lvl) => {
          const pts = areas.map((_, i) => pointFor(i, lvl));
          return (
            <polygon
              key={lvl}
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          );
        })}
        {areas.map((_, i) => {
          const outer = pointFor(i, 100);
          return <line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="var(--color-border)" strokeWidth={1} />;
        })}
        <polygon points={dataPath} fill="var(--color-brand)" fillOpacity={0.35} stroke="var(--color-brand-text)" strokeWidth={2} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={areas[i].color} stroke="white" strokeWidth={1.5} />
        ))}
        {areas.map((a, i) => {
          const label = pointFor(i, (100 * labelRadius) / radius);
          const anchor = label.x < center - 5 ? "end" : label.x > center + 5 ? "start" : "middle";
          const lines = wrapLabel(a.shortName ?? a.areaName);
          const startDy = lines.length > 1 ? -5.5 : 0;
          return (
            <text
              key={a.areaId}
              x={label.x}
              y={label.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={10.5}
              fontWeight={600}
              fill="var(--color-ink-muted)"
            >
              {lines.map((line, li) => (
                <tspan key={li} x={label.x} dy={li === 0 ? startDy : 12}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      <details className="mt-3 group">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-brand-text)] w-fit mx-auto text-center list-none underline underline-offset-2">
          View as table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="sr-only">Progress by capability area</caption>
            <thead>
              <tr className="text-left text-[var(--color-ink-faint)]">
                <th scope="col" className="py-1.5 pr-2 font-medium">
                  Area
                </th>
                <th scope="col" className="py-1.5 pr-2 font-medium">
                  Current level
                </th>
                <th scope="col" className="py-1.5 font-medium text-right">
                  Overall progress
                </th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.areaId} className="border-t border-[var(--color-border)]">
                  <td className="py-2 pr-2">
                    <Link href={`/areas/${a.areaId}`} className="font-medium text-[var(--color-ink)] hover:text-[var(--color-brand-text)] hover:underline">
                      {a.areaName}
                    </Link>
                  </td>
                  <td className="py-2 pr-2 text-[var(--color-ink-muted)]">{a.currentLevel}</td>
                  <td className="py-2 text-right font-semibold" style={{ color: a.color }}>
                    {a.overallPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
