import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import type { LevelProgress, SkillWithStatus } from "@/types/domain";

const NODE_STYLES = {
  MASTERED: { icon: "check", bg: "var(--color-success)", fg: "white" },
  IN_PROGRESS: { icon: "arrow-up", bg: "var(--color-elevator)", fg: "white" },
  TO_DEVELOP: { icon: "arrow-left", bg: "var(--color-surface-raised)", fg: "var(--color-ink-muted)" },
  UNASSESSED: { icon: "arrow-left", bg: "var(--color-surface-raised)", fg: "var(--color-ink-faint)" },
} as const;

export function JourneyPath({
  areaId,
  level,
  skills,
}: {
  areaId: string;
  level: LevelProgress;
  skills: SkillWithStatus[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LevelBadge level={level.levelName} size="sm" />
          {level.isLocked && (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
              <Icon name="lock" className="h-3.5 w-3.5" /> Locked
            </span>
          )}
          {!level.isLocked && level.isComplete && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-success)]">
              <Icon name="check" className="h-3.5 w-3.5" /> Complete
            </span>
          )}
        </div>
        {!level.isLocked && !level.isComplete && (
          <span className="text-xs font-semibold text-[var(--color-ink-muted)]">{level.percentComplete}%</span>
        )}
      </div>

      {level.isLocked ? (
        <p className="text-sm text-[var(--color-ink-faint)] bg-[var(--color-surface-sunken)] rounded-xl px-4 py-3">
          Complete your {level.levelName === "Elevator" ? "Navigator" : "Elevator"} pathway to unlock {level.levelName}.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-3" role="list" aria-label={`${level.levelName} skills`}>
          {skills.map((skill, i) => {
            const style = NODE_STYLES[skill.status ?? "UNASSESSED"];
            return (
              <div key={skill.id} className="flex items-center" role="listitem">
                <Link
                  href={`/discover/${areaId}?level=${level.levelName}&skill=${skill.id}`}
                  className="group flex flex-col items-center gap-1.5 w-16 focus-visible:outline-none"
                  title={skill.title}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-[var(--color-brand-text)]"
                    style={{
                      background: style.bg,
                      color: style.fg,
                      borderColor: skill.status ? "transparent" : "var(--color-border)",
                    }}
                  >
                    <Icon name={style.icon} className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] text-center text-[var(--color-ink-faint)] line-clamp-2 leading-tight">
                    {skill.title}
                  </span>
                </Link>
                {i < skills.length - 1 && <span className="h-0.5 w-4 sm:w-6 bg-[var(--color-border)] -mt-5" aria-hidden />}
              </div>
            );
          })}
          <div className="flex items-center">
            <span className="h-0.5 w-4 sm:w-6 bg-[var(--color-border)] -mt-5" aria-hidden />
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
              style={{ background: level.isComplete ? "var(--color-warning-soft)" : "var(--color-surface-sunken)" }}
              aria-label={level.isComplete ? `${level.levelName} trophy earned` : `${level.levelName} trophy locked`}
            >
              🏆
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
