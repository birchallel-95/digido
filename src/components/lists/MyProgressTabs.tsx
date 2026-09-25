"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { DevelopmentItem } from "@/components/lists/DevelopmentItem";
import { ProgressItem } from "@/components/lists/ProgressItem";
import { AchievedItem } from "@/components/lists/AchievedItem";
import type { StatusListItem } from "@/lib/lists";
import type { EarnedBadge, MilestoneView, MasteredSkillView } from "@/lib/achievements";
import type { AreaProgress } from "@/types/domain";

export type ViewKey = "to-develop" | "in-progress" | "achieved";

const TABS: { key: ViewKey; label: string; icon: string }[] = [
  { key: "to-develop", label: "To develop", icon: "target" },
  { key: "in-progress", label: "In progress", icon: "clock" },
  { key: "achieved", label: "Achieved", icon: "trophy" },
];

const RAG_META = {
  toDevelop: { label: "To develop", icon: "target", color: "var(--color-danger)" },
  inProgress: { label: "In progress", icon: "clock", color: "var(--color-warning)" },
  achieved: { label: "Achieved", icon: "check", color: "var(--color-success)" },
} as const;

export function MyProgressTabs({
  toDevelop,
  inProgress,
  achieved,
  earnedBadges,
  earnedMilestones,
  areaProgress,
  initialView,
}: {
  toDevelop: StatusListItem[];
  inProgress: StatusListItem[];
  achieved: MasteredSkillView[];
  earnedBadges: EarnedBadge[];
  earnedMilestones: MilestoneView[];
  areaProgress: AreaProgress[];
  initialView: ViewKey;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<ViewKey>(initialView);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectView(next: ViewKey) {
    setView(next);
    router.replace(`${pathname}?view=${next}`, { scroll: false });
  }

  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex === null) return;
    e.preventDefault();
    selectView(TABS[nextIndex].key);
    tabRefs.current[nextIndex]?.focus();
  }

  const sortedToDevelop = [...toDevelop].sort((a, b) => Number(b.isPriority) - Number(a.isPriority));

  const totalSkills = areaProgress.reduce((sum, a) => sum + a.levels.reduce((s, l) => s + l.totalSkills, 0), 0);
  const masteredTotal = areaProgress.reduce((sum, a) => sum + a.levels.reduce((s, l) => s + l.masteredCount, 0), 0);
  const overallPercent = totalSkills === 0 ? 0 : Math.round((masteredTotal / totalSkills) * 100);

  const counts = { toDevelop: toDevelop.length, inProgress: inProgress.length, achieved: achieved.length };
  const countByKey: Record<ViewKey, number> = {
    "to-develop": counts.toDevelop,
    "in-progress": counts.inProgress,
    achieved: counts.achieved,
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-3">
          {(["toDevelop", "inProgress", "achieved"] as const).map((key) => {
            const meta = RAG_META[key];
            return (
              <div key={key} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: meta.color }}>
                  <Icon name={meta.icon} className="h-4 w-4" />
                  <span className="text-2xl font-display font-bold text-[var(--color-ink)]">{counts[key]}</span>
                </div>
                <p className="text-xs font-medium text-[var(--color-ink-muted)]">{meta.label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
            <span>Overall progress</span>
            <span>{overallPercent}% achieved</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={overallPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall percentage of capability statements achieved"
            className="h-2 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden"
          >
            <div className="h-full rounded-full bg-[var(--color-success)]" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>

        {/* Breakdown by Jisc element and tier */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-1.5">
          {areaProgress.map((area) => {
            const toDevelopCount = area.levels.reduce((s, l) => s + l.toDevelopCount, 0);
            const inProgressCount = area.levels.reduce((s, l) => s + l.inProgressCount, 0);
            const masteredCount = area.levels.reduce((s, l) => s + l.masteredCount, 0);
            const totalAssessed = toDevelopCount + inProgressCount + masteredCount;
            const isExpanded = expandedArea === area.areaId;
            return (
              <div key={area.areaId}>
                <button
                  onClick={() => setExpandedArea(isExpanded ? null : area.areaId)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-3 py-1.5 text-left"
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: area.color }} aria-hidden />
                  <span className="text-sm font-medium text-[var(--color-ink)] truncate flex-1">{area.areaName}</span>
                  <LevelBadge level={area.currentLevel} size="sm" />
                  {totalAssessed > 0 && (
                    <div className="hidden sm:flex h-1.5 w-24 rounded-full overflow-hidden bg-[var(--color-surface-sunken)]" aria-hidden>
                      <div style={{ width: `${(toDevelopCount / totalAssessed) * 100}%`, background: "var(--color-danger)" }} />
                      <div style={{ width: `${(inProgressCount / totalAssessed) * 100}%`, background: "var(--color-warning)" }} />
                      <div style={{ width: `${(masteredCount / totalAssessed) * 100}%`, background: "var(--color-success)" }} />
                    </div>
                  )}
                  <Icon name="chevron" className={`h-3.5 w-3.5 text-[var(--color-ink-faint)] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                <p className="text-xs text-[var(--color-ink-faint)] pl-5 -mt-0.5 pb-1">
                  {toDevelopCount} to develop · {inProgressCount} in progress · {masteredCount} achieved
                </p>
                {isExpanded && (
                  <div className="pl-5 pb-2 space-y-1">
                    {area.levels.map((level) => (
                      <div key={level.levelName} className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] py-0.5">
                        <span className="flex items-center gap-1.5">
                          {level.levelName}
                          {level.isLocked && <Icon name="lock" className="h-3 w-3" />}
                        </span>
                        <span>
                          {level.toDevelopCount} to develop · {level.inProgressCount} in progress · {level.masteredCount} achieved
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div role="tablist" aria-label="Development sections" className="flex gap-1 border-b border-[var(--color-border)]">
          {TABS.map((tab, i) => {
            const selected = view === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectView(tab.key)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  selected
                    ? "border-[var(--color-brand)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon name={tab.icon} className="h-4 w-4" />
                {tab.label}
                <span className="text-xs text-[var(--color-ink-faint)]">({countByKey[tab.key]})</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="panel-to-develop"
          aria-labelledby="tab-to-develop"
          hidden={view !== "to-develop"}
          className="pt-4"
        >
          {sortedToDevelop.length === 0 ? (
            <EmptyState
              icon="target"
              title="Nothing on your development list right now."
              hint="Head to Discover to assess more skills — anything marked “need to learn this” will land here."
            />
          ) : (
            <div className="space-y-3">
              {sortedToDevelop.map((item) => (
                <DevelopmentItem key={item.statusId} item={item} />
              ))}
            </div>
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-in-progress"
          aria-labelledby="tab-in-progress"
          hidden={view !== "in-progress"}
          className="pt-4"
        >
          {inProgress.length === 0 ? (
            <EmptyState
              icon="clock"
              title="Nothing in progress at the moment."
              hint="Start something from your To develop list to see it here."
            />
          ) : (
            <div className="space-y-3">
              {inProgress.map((item) => (
                <ProgressItem key={item.statusId} item={item} />
              ))}
            </div>
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-achieved"
          aria-labelledby="tab-achieved"
          hidden={view !== "achieved"}
          className="pt-4 space-y-4"
        >
          {(earnedBadges.length > 0 || earnedMilestones.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] px-3 py-1.5 text-sm font-medium"
                >
                  🏆 {b.name}
                </span>
              ))}
              {earnedMilestones.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink)] px-3 py-1.5 text-sm font-medium"
                >
                  <Icon name={m.icon ?? "award"} className="h-3.5 w-3.5" /> {m.name}
                </span>
              ))}
            </div>
          )}

          {achieved.length === 0 ? (
            <EmptyState
              icon="trophy"
              title="Nothing achieved yet — that's about to change!"
              hint={
                sortedToDevelop.length > 0
                  ? `Try "${sortedToDevelop[0].title}" from your To develop list for an easy first win.`
                  : "Once you mark a skill as mastered, it'll build your record here."
              }
            />
          ) : (
            <div className="space-y-3">
              {achieved.map((item) => (
                <AchievedItem key={item.skillId} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div className="text-center py-16">
      <Icon name={icon} className="h-10 w-10 mx-auto text-[var(--color-ink-faint)] mb-3" />
      <p className="font-medium text-[var(--color-ink)]">{title}</p>
      <p className="text-sm text-[var(--color-ink-muted)] mt-1">{hint}</p>
    </div>
  );
}
