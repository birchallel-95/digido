import { Icon } from "@/components/ui/Icon";
import type { RagBreakdown } from "@/lib/adminDashboard";

// Reserved status colours (never reused for identity/series elsewhere in the
// app) — red = "need to learn this", amber = "working on it", green =
// "I've got this". Never shown as colour alone: every use pairs the swatch
// with an icon and a text label.
export const RAG_COLORS = {
  red: "#d03b3b",
  amber: "#fab219",
  green: "#0ca30c",
} as const;

export function RagLegend() {
  const items: { key: keyof typeof RAG_COLORS; icon: string; label: string }[] = [
    { key: "red", icon: "arrow-left", label: "Need to learn" },
    { key: "amber", icon: "arrow-up", label: "Working on it" },
    { key: "green", icon: "check", label: "Mastered" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-ink-muted)]" role="list" aria-label="RAG legend">
      {items.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-1.5" role="listitem">
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full text-white"
            style={{ background: RAG_COLORS[item.key] }}
          >
            <Icon name={item.icon} className="h-2.5 w-2.5" />
          </span>
          {item.label}
        </span>
      ))}
    </div>
  );
}

/** One horizontal 100%-stacked bar: red/amber/green share of one row's total. */
export function RagBar({ row }: { row: RagBreakdown }) {
  const total = row.total || 1; // avoid divide-by-zero for an empty row
  const redPct = (row.red / total) * 100;
  const amberPct = (row.amber / total) * 100;
  const greenPct = (row.green / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="w-44 shrink-0 flex items-center gap-1.5 text-sm text-[var(--color-ink)]">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: row.color }} aria-hidden />
        <span className="truncate" title={row.label}>
          {row.label}
        </span>
      </div>
      <div
        className="flex-1 h-5 flex overflow-hidden bg-[var(--color-surface-sunken)]"
        style={{ borderRadius: "0 10px 10px 0" }}
        role="img"
        aria-label={`${row.label}: ${row.red} red, ${row.amber} amber, ${row.green} green, out of ${row.total} rated`}
      >
        {row.red > 0 && <div className="h-full" style={{ width: `${redPct}%`, background: RAG_COLORS.red, marginRight: row.amber || row.green ? 2 : 0 }} />}
        {row.amber > 0 && <div className="h-full" style={{ width: `${amberPct}%`, background: RAG_COLORS.amber, marginRight: row.green ? 2 : 0 }} />}
        {row.green > 0 && <div className="h-full" style={{ width: `${greenPct}%`, background: RAG_COLORS.green }} />}
      </div>
      <span className="w-16 shrink-0 text-right text-sm text-[var(--color-ink-muted)] tabular-nums">{row.total}</span>
    </div>
  );
}
