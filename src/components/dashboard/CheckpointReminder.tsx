"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { markCheckpointComplete } from "@/lib/checkpointActions";
import { formatCheckpointDate, type CheckpointWindowState } from "@/lib/checkpoint";

export function CheckpointReminder({
  window,
  completedThisWindow,
  linkUrl,
}: {
  window: CheckpointWindowState;
  completedThisWindow: boolean;
  linkUrl: string;
}) {
  const [completed, setCompleted] = useState(completedThisWindow);
  const [saving, setSaving] = useState(false);

  if (window.status === "closed") {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-4 flex items-center gap-3">
        <Icon name="calendar" className="h-5 w-5 text-[var(--color-ink-faint)] shrink-0" aria-hidden />
        <p className="text-sm text-[var(--color-ink-muted)]">
          Next digital capabilities checkpoint: <strong className="text-[var(--color-ink)]">{window.label}</strong> opens{" "}
          {formatCheckpointDate(window.opensOn)}.
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] px-5 py-4 flex items-center gap-3"
      >
        <Icon name="check" className="h-5 w-5 text-[var(--color-success)] shrink-0" aria-hidden />
        <p className="text-sm font-medium text-[var(--color-success)]">
          Done — thank you! You&apos;ve confirmed the {window.label.toLowerCase()}.
        </p>
      </div>
    );
  }

  async function handleComplete() {
    setSaving(true);
    if (window.status === "open") await markCheckpointComplete(window.windowKey);
    setSaving(false);
    setCompleted(true);
  }

  return (
    <div className="rounded-2xl border-2 border-[var(--color-brand)] bg-[var(--color-brand-soft)] p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand)] text-[var(--color-ink)]" aria-hidden>
          <Icon name="calendar-check" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Your digital capabilities checkpoint</h2>
          <p className="text-sm font-semibold text-[var(--color-brand-text)] mt-0.5">
            {window.label} is open — closes {formatCheckpointDate(window.closesOn)}
          </p>
        </div>
      </div>

      <p className="text-sm text-[var(--color-ink)] mb-3">
        Twice a year, as a college, we ask all staff to complete the Jisc Overall Digital Capabilities assessment:
      </p>
      <ul className="text-sm text-[var(--color-ink)] mb-3 space-y-1">
        <li>
          <strong>Autumn (September–October):</strong> sets our starting benchmark
        </li>
        <li>
          <strong>Summer (May–June):</strong> shows the progress we&apos;ve made
        </li>
      </ul>
      <p className="text-sm text-[var(--color-ink-muted)] mb-3">
        It&apos;s our summative checkpoint, and the college uses the overall results to see where to focus support and
        training. Your own Jisc report is completely confidential to you.
      </p>
      <p className="text-sm text-[var(--color-ink-muted)] mb-4">
        It takes a little time, so it&apos;s worth setting aside a quiet 15–20 minutes.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          <Button>
            Complete the Jisc assessment
            <Icon name="external" className="h-4 w-4" />
          </Button>
        </a>
        <Button variant="outline" onClick={handleComplete} disabled={saving}>
          <Icon name="check" className="h-4 w-4" />
          I&apos;ve completed it this time
        </Button>
      </div>
    </div>
  );
}
