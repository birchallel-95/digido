import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { LevelBadge } from "@/components/ui/LevelBadge";
import type { RecommendationResult } from "@/types/domain";

export function DailyStepCard({ recommendation }: { recommendation: RecommendationResult | null }) {
  if (!recommendation) {
    return (
      <div className="text-center py-4">
        <Icon name="check" className="h-8 w-8 mx-auto text-[var(--color-success)] mb-2" />
        <p className="font-medium text-[var(--color-ink)]">You&apos;re all caught up across every unlocked skill.</p>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">Check back as new skills are added, or revisit an area to go deeper.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">Today&apos;s Digital Step</span>
        <LevelBadge level={recommendation.levelName} size="sm" />
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: recommendation.areaColor }}>
        {recommendation.areaName}
      </p>
      <h3 className="font-display text-lg font-bold text-[var(--color-ink)] mb-2">{recommendation.title}</h3>
      {recommendation.whyItMatters && (
        <p className="text-sm text-[var(--color-ink-muted)] mb-3">{recommendation.whyItMatters}</p>
      )}
      {recommendation.howToSteps.length > 0 && (
        <div className="rounded-xl bg-[var(--color-surface-sunken)] p-3.5 mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)] mb-2 flex items-center gap-1.5">
            <Icon name="list-checks" className="h-3.5 w-3.5" />
            How to do this
          </p>
          <ol className="space-y-1.5">
            {recommendation.howToSteps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-[var(--color-ink)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] text-xs font-bold">
                  {i + 1}
                </span>
                <span className="pt-px">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <p className="text-xs text-[var(--color-ink-faint)] mb-4 italic">{recommendation.reason}</p>
      <div className="flex items-center justify-between gap-3">
        {recommendation.estimatedTimeMins && (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
            <Icon name="clock" className="h-3.5 w-3.5" />
            {recommendation.estimatedTimeMins} min
          </span>
        )}
        <Link href={`/discover/${recommendation.areaId}?skill=${recommendation.skillId}`} className="ml-auto">
          <Button>Let&apos;s do this</Button>
        </Link>
      </div>
    </div>
  );
}
