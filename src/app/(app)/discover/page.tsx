import Link from "next/link";
import { requireUser } from "@/lib/session";
import { computeUserProgress } from "@/lib/progression";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default async function DiscoverPage() {
  const user = await requireUser();
  const progress = await computeUserProgress(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Discover skills</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Choose an area to start a quick assessment session.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {progress.map((area) => {
          const activeLevel = area.levels.find((l) => !l.isLocked && !l.isComplete) ?? area.levels.find((l) => !l.isLocked);
          const toReview = activeLevel ? activeLevel.totalSkills - activeLevel.masteredCount : 0;

          return (
            <Card key={area.areaId}>
              <CardBody className="pt-5">
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${area.color}1a`, color: area.color }}
                  >
                    <Icon name={area.icon ?? "compass"} className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display font-bold text-[var(--color-ink)] leading-tight">{area.areaName}</h2>
                    <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">{area.description}</p>
                  </div>
                </div>

                {activeLevel ? (
                  <>
                    <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                      <strong className="text-[var(--color-ink)]">{activeLevel.levelName}</strong> ·{" "}
                      {toReview > 0 ? `${toReview} skill${toReview === 1 ? "" : "s"} to review` : "All reviewed — revisit anytime"}
                    </p>
                    <Link href={`/discover/${area.areaId}`}>
                      <Button className="w-full sm:w-auto">Start swiping</Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-[var(--color-ink-faint)]">All stages complete for now — nice work.</p>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
