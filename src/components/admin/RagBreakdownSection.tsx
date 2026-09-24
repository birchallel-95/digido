import { RagBar, RagLegend } from "@/components/admin/RagBar";
import type { RagBreakdown } from "@/lib/adminDashboard";

export function RagBreakdownSection({ title, rows }: { title: string; rows: RagBreakdown[] }) {
  if (rows.length === 0) {
    return (
      <div>
        <h3 className="font-display font-bold text-[var(--color-ink)] mb-3">{title}</h3>
        <p className="text-sm text-[var(--color-ink-muted)]">No skills rated yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-display font-bold text-[var(--color-ink)]">{title}</h3>
        <RagLegend />
      </div>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <RagBar key={row.key} row={row} />
        ))}
      </div>

      <details className="mt-3 group">
        <summary className="cursor-pointer text-xs font-medium text-[var(--color-brand-text)] w-fit list-none underline underline-offset-2">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="sr-only">{title} — red, amber, green counts</caption>
            <thead>
              <tr className="text-left text-[var(--color-ink-faint)]">
                <th scope="col" className="py-1.5 pr-3 font-medium">
                  {title}
                </th>
                <th scope="col" className="py-1.5 px-3 font-medium text-right">
                  Red
                </th>
                <th scope="col" className="py-1.5 px-3 font-medium text-right">
                  Amber
                </th>
                <th scope="col" className="py-1.5 px-3 font-medium text-right">
                  Green
                </th>
                <th scope="col" className="py-1.5 pl-3 font-medium text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-[var(--color-border)]">
                  <td className="py-2 pr-3 font-medium text-[var(--color-ink)]">{row.label}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{row.red}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{row.amber}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{row.green}</td>
                  <td className="py-2 pl-3 text-right font-semibold tabular-nums">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
