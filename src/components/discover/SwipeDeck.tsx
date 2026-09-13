"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useAnimation, useReducedMotion, type PanInfo } from "framer-motion";
import { setSkillStatus, clearSkillStatus } from "@/lib/skillActions";
import { SkillCard } from "@/components/discover/SkillCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SWIPE_STATUS_MAP, type SkillStatusValue } from "@/lib/constants";
import type { SkillWithStatus } from "@/types/domain";

type Direction = "left" | "up" | "right";

const DIRECTION_META: Record<Direction, { label: string; icon: string; color: string }> = {
  left: { label: "Need to learn", icon: "arrow-left", color: "var(--color-navigator)" },
  up: { label: "Working on it", icon: "arrow-up", color: "var(--color-elevator)" },
  right: { label: "I've got this", icon: "arrow-right", color: "var(--color-success)" },
};

export function SwipeDeck({
  skills,
  areaId,
  areaName,
  levelName,
  focusSkillId,
}: {
  skills: SkillWithStatus[];
  areaId: string;
  areaName: string;
  levelName: string;
  focusSkillId?: string;
}) {
  const router = useRouter();
  const ordered = useMemo(() => {
    if (!focusSkillId) return skills;
    const idx = skills.findIndex((s) => s.id === focusSkillId);
    if (idx <= 0) return skills;
    const copy = [...skills];
    const [item] = copy.splice(idx, 1);
    return [item, ...copy];
  }, [skills, focusSkillId]);

  // `ordered` only changes when the parent route/query changes (a new area,
  // level, or focus skill), and the page passes a matching `key` so this
  // component remounts fresh at that point — so plain useState (no
  // synchronising effect) is enough here.
  const [queue] = useState(ordered);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<{ skillId: string; index: number }[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  const current = queue[index];

  const commit = useCallback(
    async (direction: Direction) => {
      if (!current || pending) return;
      setPending(true);
      const status: SkillStatusValue = SWIPE_STATUS_MAP[direction];
      await controls.start({
        x: prefersReducedMotion ? 0 : direction === "left" ? -420 : direction === "right" ? 420 : 0,
        y: prefersReducedMotion ? 0 : direction === "up" ? -420 : 0,
        opacity: prefersReducedMotion ? 1 : 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.25 },
      });

      const result = await setSkillStatus(current.id, status);
      setHistory((h) => [...h, { skillId: current.id, index }]);

      if (result.levelJustCompleted) {
        setBanner(`🏆 ${result.levelJustCompleted.levelName} complete in ${result.levelJustCompleted.areaName}!`);
      } else if (result.newlyEarnedMilestones.length > 0) {
        setBanner(`🎉 Milestone earned: ${result.newlyEarnedMilestones[0]}`);
      } else {
        setBanner(null);
      }

      controls.set({ x: 0, y: 0, opacity: 1 });
      setIndex((i) => i + 1);
      setPending(false);
      router.refresh();
    },
    [current, pending, controls, index, router, prefersReducedMotion]
  );

  async function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    await clearSkillStatus(last.skillId);
    setHistory((h) => h.slice(0, -1));
    setIndex(last.index);
    setBanner(null);
    router.refresh();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (pending || !current) return;
      if (e.key === "ArrowLeft") commit("left");
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        commit("up");
      } else if (e.key === "ArrowRight") commit("right");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, pending, current]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    const threshold = 90;
    if (offset.y < -threshold && Math.abs(offset.y) > Math.abs(offset.x)) {
      commit("up");
    } else if (offset.x > threshold || velocity.x > 500) {
      commit("right");
    } else if (offset.x < -threshold || velocity.x < -500) {
      commit("left");
    } else {
      controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
    }
  }

  if (!current) {
    return (
      <div className="text-center py-16">
        <Icon name="check" className="h-10 w-10 mx-auto text-[var(--color-success)] mb-3" />
        <h2 className="font-display text-xl font-bold text-[var(--color-ink)] mb-1">
          You&apos;ve assessed every {levelName} skill in {areaName}.
        </h2>
        <p className="text-[var(--color-ink-muted)] mb-6">Come back any time to review or move things forward.</p>
        <div className="flex justify-center gap-3">
          <Link href={`/areas/${areaId}`}>
            <Button variant="outline">View area progress</Button>
          </Link>
          <Link href="/discover">
            <Button>Choose another area</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">{areaName}</p>
          <p className="text-xs text-[var(--color-ink-faint)]">
            {levelName} · Card {index + 1} of {queue.length}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={undo} disabled={history.length === 0} aria-label="Undo last swipe">
          <Icon name="undo" className="h-4 w-4" /> Undo
        </Button>
      </div>

      <div className="h-1.5 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-[var(--color-brand)] transition-all"
          style={{ width: `${(index / queue.length) * 100}%` }}
        />
      </div>

      {banner && (
        <div role="status" className="mb-4 rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)] text-sm font-medium px-4 py-3 text-center">
          {banner}
        </div>
      )}

      <div className="relative" style={{ minHeight: 460 }}>
        {/* Peek of next card for depth, purely decorative */}
        {queue[index + 1] && (
          <div className="absolute inset-0 scale-[0.96] translate-y-2 opacity-60 pointer-events-none" aria-hidden>
            <SkillCard skill={queue[index + 1]} />
          </div>
        )}
        <motion.div
          key={current.id}
          drag
          dragElastic={0.6}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ x: 0, y: 0, opacity: 1 }}
          className="relative cursor-grab active:cursor-grabbing"
          role="group"
          aria-roledescription="skill card"
          aria-label={`${current.title}. Use the buttons below, or arrow keys, to record your status.`}
        >
          <SkillCard skill={current} />
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6" role="group" aria-label="Assess this skill">
        {(["left", "up", "right"] as Direction[]).map((dir) => {
          const meta = DIRECTION_META[dir];
          return (
            <button
              key={dir}
              onClick={() => commit(dir)}
              disabled={pending}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-4 text-xs font-semibold hover:shadow-[var(--shadow-card)] transition-shadow disabled:opacity-50"
              style={{ color: meta.color }}
            >
              <Icon name={meta.icon} className="h-5 w-5" />
              {meta.label}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-[var(--color-ink-faint)] mt-4">
        Swipe, tap a button, or use the arrow keys (← need to learn · ↑ working on it · → I&apos;ve got this).
      </p>
      {current.isPriority && (
        <p className="text-center text-xs text-[var(--color-brand-text)] mt-1 font-medium">⭐ You flagged this as a priority</p>
      )}
    </div>
  );
}
