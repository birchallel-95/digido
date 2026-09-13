import { Icon } from "@/components/ui/Icon";
import type { MomentumSummary } from "@/types/domain";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function MomentumWidget({ momentum }: { momentum: MomentumSummary }) {
  const hasStreak = momentum.currentStreak > 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon name="flame" className="h-5 w-5 text-[var(--color-warning)]" />
        <h2 className="font-display font-bold text-[var(--color-ink)]">Digital Momentum</h2>
      </div>
      <p className="text-3xl font-display font-extrabold text-[var(--color-ink)]">
        {momentum.currentStreak} <span className="text-base font-medium text-[var(--color-ink-muted)]">development day{momentum.currentStreak === 1 ? "" : "s"}</span>
      </p>
      <p className="text-sm text-[var(--color-ink-muted)] mt-1">
        {hasStreak
          ? `Longest streak so far: ${momentum.longestStreak} day${momentum.longestStreak === 1 ? "" : "s"}.`
          : "Ready to start building momentum again?"}
      </p>

      <div className="flex items-center gap-1.5 mt-4" role="img" aria-label={`${momentum.activeDaysThisWeek} active development days this week`}>
        {momentum.last7Days.map((d, i) => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                background: d.active ? "var(--color-brand)" : "var(--color-surface-sunken)",
                color: d.active ? "var(--color-ink)" : "var(--color-ink-faint)",
              }}
              aria-hidden
            >
              {d.active ? <Icon name="check" className="h-4 w-4" /> : ""}
            </span>
            <span className="text-[10px] text-[var(--color-ink-faint)]">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-[var(--color-ink-muted)]">Weekly target</span>
        <span className="font-semibold text-[var(--color-ink)]">
          {momentum.activeDaysThisWeek} / {momentum.weeklyTarget} days
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-brand)] transition-all"
          style={{ width: `${Math.min(100, (momentum.activeDaysThisWeek / Math.max(momentum.weeklyTarget, 1)) * 100)}%` }}
        />
      </div>
    </div>
  );
}
