"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSkillStatus, addEvidence } from "@/lib/skillActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import type { StatusListItem } from "@/lib/lists";

export function ProgressItem({ item }: { item: StatusListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // A reflection is required before a skill can be marked mastered. If one's
  // already been added while it was in progress, mastering is one click; if
  // not, clicking "Mark as mastered" opens the same textarea to collect it.
  const [showEvidence, setShowEvidence] = useState(false);
  const [pendingMastery, setPendingMastery] = useState(false);
  const [reflection, setReflection] = useState("");
  const [celebrate, setCelebrate] = useState<string | null>(null);

  async function finishMastering() {
    const result = await setSkillStatus(item.skillId, "MASTERED");
    if (result.levelJustCompleted) {
      setCelebrate(`🏆 ${result.levelJustCompleted.levelName} complete in ${result.levelJustCompleted.areaName}!`);
    }
    router.refresh();
  }

  function markMastered() {
    if (!item.hasEvidence) {
      setPendingMastery(true);
      setShowEvidence(true);
      return;
    }
    startTransition(finishMastering);
  }

  function submitEvidence() {
    startTransition(async () => {
      await addEvidence({ skillId: item.skillId, reflection });
      setShowEvidence(false);
      setReflection("");
      if (pendingMastery) {
        setPendingMastery(false);
        await finishMastering();
      } else {
        router.refresh();
      }
    });
  }

  const startedLabel = item.startedAt ? new Date(item.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5">
      {celebrate && (
        <div role="status" className="mb-3 rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)] text-sm font-medium px-3 py-2">
          {celebrate}
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <LevelBadge level={item.levelName} size="sm" />
            <span className="text-xs font-medium" style={{ color: item.areaColor }}>
              {item.areaName}
            </span>
            {startedLabel && <span className="text-xs text-[var(--color-ink-faint)]">Started {startedLabel}</span>}
          </div>
          <h3 className="font-semibold text-[var(--color-ink)]">{item.title}</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">{item.practicalOutcome}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Button size="sm" onClick={markMastered} disabled={isPending}>
          <Icon name="check" className="h-4 w-4" /> Mark as mastered
        </Button>
        {item.learningResourceUrl && (
          <a href={item.learningResourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-text)] hover:underline">
            <Icon name="external" className="h-3.5 w-3.5" /> Learning resource
          </a>
        )}
        {item.hasEvidence ? (
          <span className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-text)]">
            <Icon name="edit" className="h-3.5 w-3.5" /> Reflection added
          </span>
        ) : (
          <button
            onClick={() => {
              setPendingMastery(false);
              setShowEvidence((s) => !s);
            }}
            className="inline-flex items-center gap-1 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <Icon name="edit" className="h-3.5 w-3.5" /> Add reflection
          </button>
        )}
      </div>

      {showEvidence && (
        <div className="mt-3">
          {pendingMastery && (
            <p className="text-xs text-[var(--color-ink-muted)] mb-1.5">
              Add a quick reflection to mark this as mastered — a sentence or two is fine.
            </p>
          )}
          <label htmlFor={`reflection-${item.skillId}`} className="sr-only">
            Reflection on {item.title}
          </label>
          <textarea
            id={`reflection-${item.skillId}`}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={item.evidencePrompt ?? "How have you used this so far?"}
            rows={2}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={submitEvidence} disabled={!reflection.trim() || isPending}>
              {pendingMastery ? "Save & mark as mastered" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowEvidence(false);
                setPendingMastery(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
