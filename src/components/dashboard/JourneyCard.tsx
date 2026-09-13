import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { AreaProgress } from "@/types/domain";

export function JourneyCard({ area }: { area: AreaProgress }) {
  return (
    <Link
      href={`/areas/${area.areaId}`}
      className="block rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-4 hover:shadow-[var(--shadow-raised)] transition-shadow"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${area.color}1a`, color: area.color }}>
          <Icon name={area.icon ?? "compass"} className="h-4.5 w-4.5" />
        </span>
        <h3 className="font-semibold text-sm text-[var(--color-ink)] leading-tight">{area.areaName}</h3>
      </div>
      <div className="space-y-1.5">
        {area.levels.map((level) => (
          <div key={level.levelName} className="flex items-center justify-between text-xs">
            <span className={level.isLocked ? "text-[var(--color-ink-faint)]" : "text-[var(--color-ink-muted)]"}>{level.levelName}</span>
            {level.isLocked ? (
              <Icon name="lock" className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" />
            ) : level.isComplete ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-success)]">
                <Icon name="check" className="h-3.5 w-3.5" /> Complete
              </span>
            ) : (
              <span className="font-semibold" style={{ color: area.color }}>
                {level.percentComplete}%
              </span>
            )}
          </div>
        ))}
      </div>
    </Link>
  );
}
