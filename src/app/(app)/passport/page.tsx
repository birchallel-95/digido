import { requireUser } from "@/lib/session";
import { computeUserProgress } from "@/lib/progression";
import { getMomentumSummary } from "@/lib/momentum";
import { getAchievementsData } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";

export default async function PassportPage() {
  const user = await requireUser();
  const [progress, momentum, achievements, evidence, userRecord] = await Promise.all([
    computeUserProgress(user.id),
    getMomentumSummary(user.id),
    getAchievementsData(user.id),
    prisma.evidence.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { skill: true },
    }),
    prisma.user.findUnique({ where: { id: user.id } }),
  ]);

  const earnedBadges = achievements.badges.filter((b) => b.earned);
  const earnedMilestones = achievements.milestones.filter((m) => m.earned);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Digital Capability Passport</h1>
          <p className="text-[var(--color-ink-muted)] mt-1">
            A living record of {userRecord?.name ? `${userRecord.name}'s` : "your"} digital development — ready to support CPD and appraisal conversations.
          </p>
        </div>
        <Button variant="outline" disabled title="PDF export is coming soon">
          <Icon name="download" className="h-4 w-4" /> Export (coming soon)
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{momentum.totalDevelopmentDays}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Total development days</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{momentum.longestStreak}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Longest Digital Momentum streak</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{achievements.masteredSkills.length}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Skills mastered</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Capability level by area</h2>
          <div className="space-y-3">
            {progress.map((area) => (
              <div key={area.areaId} className="flex items-center justify-between gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: area.color }} />
                  <span className="text-sm font-medium text-[var(--color-ink)] truncate">{area.areaName}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <LevelBadge level={area.currentLevel} size="sm" />
                  <span className="text-sm font-semibold text-[var(--color-ink-muted)] w-10 text-right">{area.overallPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {earnedBadges.length > 0 && (
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Pathway badges earned</h2>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((b) => (
                <span key={b.id} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] px-3 py-1.5 text-sm font-medium">
                  🏆 {b.name}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {earnedMilestones.length > 0 && (
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Milestones earned</h2>
            <div className="flex flex-wrap gap-2">
              {earnedMilestones.map((m) => (
                <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink)] px-3 py-1.5 text-sm font-medium">
                  <Icon name={m.icon ?? "award"} className="h-3.5 w-3.5" /> {m.name}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Evidence &amp; reflections</h2>
          {evidence.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Add an optional reflection to a mastered skill in My Progress or Achievements to build your evidence record.
            </p>
          ) : (
            <ul className="space-y-4">
              {evidence.map((e) => (
                <li key={e.id} className="border-b border-[var(--color-border)] last:border-0 pb-4 last:pb-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{e.skill.title}</p>
                  {e.reflection && <p className="text-sm text-[var(--color-ink-muted)] mt-1">{e.reflection}</p>}
                  {e.externalUrl && (
                    <a href={e.externalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-brand)] hover:underline inline-flex items-center gap-1 mt-1">
                      <Icon name="external" className="h-3.5 w-3.5" /> Linked evidence
                    </a>
                  )}
                  <p className="text-xs text-[var(--color-ink-faint)] mt-1">
                    {new Date(e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
