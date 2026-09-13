import { requireUser } from "@/lib/session";
import { getAchievementsData } from "@/lib/achievements";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import clsx from "clsx";

export default async function AchievementsPage() {
  const user = await requireUser();
  const { badges, milestones, masteredSkills } = await getAchievementsData(user.id);

  const earnedBadges = badges.filter((b) => b.earned);
  const earnedMilestones = milestones.filter((m) => m.earned);
  const upcomingMilestones = milestones.filter((m) => !m.earned);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">My Achievements</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">A professional record of the digital capability you&apos;ve built.</p>
      </div>

      <section>
        <h2 className="font-display font-bold text-[var(--color-ink)] mb-3">
          Pathway badges {earnedBadges.length > 0 && <span className="text-[var(--color-ink-faint)] font-normal">({earnedBadges.length})</span>}
        </h2>
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">Complete your first stage in any area to earn a badge here.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((b) => (
              <Card key={b.id} className="border-[var(--color-brand-light)]">
                <CardBody className="pt-5 flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${b.areaColor}1a` }}>
                    🏆
                  </span>
                  <div>
                    <LevelBadge level={b.levelName} size="sm" className="mb-1.5" />
                    <p className="font-semibold text-sm text-[var(--color-ink)]">{b.name}</p>
                    <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">{b.description}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display font-bold text-[var(--color-ink)] mb-3">Development milestones</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...earnedMilestones, ...upcomingMilestones].map((m) => (
            <div
              key={m.id}
              className={clsx(
                "rounded-2xl border p-4 flex items-start gap-3",
                m.earned ? "border-[var(--color-brand-light)] bg-[var(--color-brand-soft)]" : "border-[var(--color-border)] bg-[var(--color-surface-raised)] opacity-70"
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: m.earned ? "var(--color-brand)" : "var(--color-surface-sunken)",
                  color: m.earned ? "var(--color-ink)" : "var(--color-ink-faint)",
                }}
              >
                <Icon name={m.earned ? m.icon ?? "award" : "lock"} className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="font-semibold text-sm text-[var(--color-ink)]">{m.name}</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display font-bold text-[var(--color-ink)] mb-3">
          Skills I&apos;ve mastered {masteredSkills.length > 0 && <span className="text-[var(--color-ink-faint)] font-normal">({masteredSkills.length})</span>}
        </h2>
        {masteredSkills.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">Skills you master will build your record here.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {masteredSkills.map((s) => (
              <div key={s.skillId} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.areaColor }} />
                  <span className="text-xs text-[var(--color-ink-faint)]">{s.areaName}</span>
                </div>
                <p className="text-sm font-medium text-[var(--color-ink)] leading-snug">{s.title}</p>
                {s.hasEvidence && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-[var(--color-brand-text)]">
                    <Icon name="edit" className="h-3 w-3" /> Evidence added
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
