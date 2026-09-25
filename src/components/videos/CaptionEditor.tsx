"use client";

import type { CaptionSegment } from "@/lib/captions";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Per-line editable captions — timing stays fixed, only wording can be corrected. */
export function CaptionEditor({
  segments,
  onChange,
}: {
  segments: CaptionSegment[];
  onChange: (next: CaptionSegment[]) => void;
}) {
  function updateText(index: number, text: string) {
    onChange(segments.map((s, i) => (i === index ? { ...s, text } : s)));
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] max-h-72 overflow-y-auto">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-start gap-3 px-3.5 py-2.5">
          <span className="text-xs font-mono text-[var(--color-ink-faint)] pt-2 shrink-0 w-20">
            {formatTime(seg.start)}–{formatTime(seg.end)}
          </span>
          <textarea
            value={seg.text}
            onChange={(e) => updateText(i, e.target.value)}
            rows={1}
            aria-label={`Caption text from ${formatTime(seg.start)} to ${formatTime(seg.end)}`}
            className="flex-1 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1.5 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
