"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEvidence } from "@/lib/skillActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import type { MasteredSkillView } from "@/lib/achievements";

export function AchievedItem({ item }: { item: MasteredSkillView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [reflection, setReflection] = useState("");

  const masteredLabel = item.masteredAt
    ? new Date(item.masteredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  function submit() {
    startTransition(async () => {
      await addEvidence({ skillId: item.skillId, reflection });
      setShowForm(false);
      setReflection("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <LevelBadge level={item.levelName} size="sm" />
        <span className="text-xs font-medium" style={{ color: item.areaColor }}>
          {item.areaName}
        </span>
        {masteredLabel && <span className="text-xs text-[var(--color-ink-faint)]">Mastered {masteredLabel}</span>}
      </div>
      <h3 className="font-semibold text-[var(--color-ink)]">{item.title}</h3>

      {item.reflection ? (
        <p className="text-sm text-[var(--color-ink-muted)] mt-2 italic">&ldquo;{item.reflection}&rdquo;</p>
      ) : showForm ? (
        <div className="mt-3">
          <label htmlFor={`achieved-reflection-${item.skillId}`} className="sr-only">
            Reflection on {item.title}
          </label>
          <textarea
            id={`achieved-reflection-${item.skillId}`}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="How have you used this? What difference has it made?"
            rows={2}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={submit} disabled={!reflection.trim() || isPending}>
              Save reflection
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1 mt-2 text-sm text-[var(--color-brand-text)] hover:underline"
        >
          <Icon name="edit" className="h-3.5 w-3.5" /> Add your reflection
        </button>
      )}
    </div>
  );
}
