"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSkillStatus, togglePriority } from "@/lib/skillActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import type { StatusListItem } from "@/lib/lists";

export function DevelopmentItem({ item }: { item: StatusListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [priority, setPriority] = useState(item.isPriority);
  // Open by default — the whole point is that "how do I do this" is visible
  // without an extra click, not buried behind a disclosure.
  const [showSteps, setShowSteps] = useState(true);

  function start() {
    startTransition(async () => {
      await setSkillStatus(item.skillId, "IN_PROGRESS");
      router.refresh();
    });
  }

  function togglePin() {
    setPriority((p) => !p);
    startTransition(async () => {
      await togglePriority(item.skillId);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <LevelBadge level={item.levelName} size="sm" />
            <span className="text-xs font-medium" style={{ color: item.areaColor }}>
              {item.areaName}
            </span>
          </div>
          <h3 className="font-semibold text-[var(--color-ink)]">{item.title}</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">{item.practicalOutcome}</p>
        </div>
        <button
          onClick={togglePin}
          aria-pressed={priority}
          aria-label={priority ? "Remove personal priority" : "Mark as personal priority"}
          className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)]"
        >
          <Icon name="star" className={priority ? "h-5 w-5 text-[var(--color-warning)]" : "h-5 w-5 text-[var(--color-ink-faint)]"} />
        </button>
      </div>

      {item.howToSteps.length > 0 && (
        <div className="mt-3 rounded-xl bg-[var(--color-surface-sunken)] p-3.5">
          <button
            onClick={() => setShowSteps((s) => !s)}
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]"
            aria-expanded={showSteps}
          >
            <span className="flex items-center gap-1.5">
              <Icon name="list-checks" className="h-3.5 w-3.5" />
              How to do this
            </span>
            <Icon name="chevron" className={`h-3.5 w-3.5 transition-transform ${showSteps ? "rotate-90" : ""}`} />
          </button>
          {showSteps && (
            <ol className="space-y-1.5 mt-2.5">
              {item.howToSteps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[var(--color-ink)]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-px">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Button size="sm" onClick={start} disabled={isPending}>
          Start this
        </Button>
        {item.learningResourceUrl && (
          <a
            href={item.learningResourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-text)] hover:underline"
          >
            <Icon name="external" className="h-3.5 w-3.5" />
            Learning resource
          </a>
        )}
        {item.estimatedTimeMins && (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
            <Icon name="clock" className="h-3.5 w-3.5" />
            {item.estimatedTimeMins} min
          </span>
        )}
      </div>
    </div>
  );
}
