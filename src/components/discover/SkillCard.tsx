import { Icon } from "@/components/ui/Icon";
import { BenefitTag } from "@/components/ui/Tag";
import { LevelBadge } from "@/components/ui/LevelBadge";
import type { BenefitCategory } from "@/lib/constants";
import type { SkillWithStatus } from "@/types/domain";

export function SkillCard({ skill }: { skill: SkillWithStatus }) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-[var(--shadow-raised)] p-6 sm:p-8 flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-4">
        <LevelBadge level={skill.levelName} />
        {skill.tool && (
          <span className="text-xs font-medium text-[var(--color-ink-faint)] bg-[var(--color-surface-sunken)] rounded-full px-2.5 py-1">
            {skill.tool}
          </span>
        )}
      </div>

      <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-ink)] leading-snug mb-3">{skill.title}</h2>
      <p className="text-[var(--color-ink-muted)] mb-4">{skill.description}</p>

      <div className="rounded-2xl bg-[var(--color-brand-soft)] p-4 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-dark)] mb-1">What this lets you do</p>
        <p className="text-sm text-[var(--color-ink)]">{skill.practicalOutcome}</p>
      </div>

      {skill.whyItMatters && (
        <details className="mb-4 group">
          <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] flex items-center gap-1.5">
            <Icon name="info" className="h-4 w-4" />
            Why this matters
          </summary>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2 pl-5.5">{skill.whyItMatters}</p>
        </details>
      )}

      {skill.benefitCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skill.benefitCategories.map((b) => (
            <BenefitTag key={b} category={b as BenefitCategory} />
          ))}
        </div>
      )}

      <div className="mt-auto pt-3 flex items-center gap-4 text-xs text-[var(--color-ink-faint)]">
        {skill.estimatedTimeMins && (
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" className="h-3.5 w-3.5" />
            {skill.estimatedTimeMins} min
          </span>
        )}
        {skill.learningResourceUrl && (
          <a
            href={skill.learningResourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--color-brand)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="external" className="h-3.5 w-3.5" />
            Learning resource
          </a>
        )}
      </div>
    </div>
  );
}
