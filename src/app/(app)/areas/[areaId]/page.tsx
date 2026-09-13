import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeUserProgress, getSkillsForAreaLevel, LEVEL_NAMES } from "@/lib/progression";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { JourneyPath } from "@/components/areas/JourneyPath";

export default async function CapabilityAreaPage({ params }: { params: Promise<{ areaId: string }> }) {
  const user = await requireUser();
  const { areaId } = await params;

  const area = await prisma.capabilityArea.findUnique({ where: { id: areaId } });
  if (!area) notFound();

  const progress = await computeUserProgress(user.id);
  const areaProgress = progress.find((a) => a.areaId === areaId);
  if (!areaProgress) notFound();

  const skillsByLevel = await Promise.all(LEVEL_NAMES.map((level) => getSkillsForAreaLevel(user.id, areaId, level)));

  const totals = areaProgress.levels.reduce(
    (acc, l) => ({
      mastered: acc.mastered + l.masteredCount,
      inProgress: acc.inProgress + l.inProgressCount,
      toDevelop: acc.toDevelop + l.toDevelopCount,
    }),
    { mastered: 0, inProgress: 0, toDevelop: 0 }
  );

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-brand-text)]">
        <Icon name="arrow-left" className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${area.color}1a`, color: area.color }}>
            <Icon name={area.icon ?? "compass"} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{area.name}</h1>
            <p className="text-[var(--color-ink-muted)] text-sm max-w-xl mt-0.5">{area.description}</p>
          </div>
        </div>
        <Link href={`/discover/${area.id}`}>
          <Button size="lg">Start a swipe session</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="pt-5 flex items-center gap-4">
            <ProgressRing percent={areaProgress.overallPercent} color={area.color} />
            <div>
              <p className="text-xs text-[var(--color-ink-faint)]">Overall progress</p>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{areaProgress.currentLevel} level</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-success)]">{totals.mastered}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Skills mastered</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-elevator)]">{totals.inProgress}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">In progress</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink-muted)]">{totals.toDevelop}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">To develop</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="pt-5 space-y-8">
          <h2 className="font-display font-bold text-[var(--color-ink)]">Your capability journey</h2>
          {areaProgress.levels.map((level, i) => (
            <JourneyPath key={level.levelName} areaId={area.id} level={level} skills={skillsByLevel[i]} />
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
