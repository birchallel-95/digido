import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getNextUnassessedLevel, getSkillsForAreaLevel } from "@/lib/progression";
import { SwipeDeck } from "@/components/discover/SwipeDeck";
import { Icon } from "@/components/ui/Icon";
import type { LevelName } from "@/lib/constants";

export default async function AreaDiscoverPage({
  params,
  searchParams,
}: {
  params: Promise<{ areaId: string }>;
  searchParams: Promise<{ skill?: string; level?: string }>;
}) {
  const user = await requireUser();
  const { areaId } = await params;
  const { skill: focusSkillId, level: levelOverride } = await searchParams;

  const area = await prisma.capabilityArea.findUnique({ where: { id: areaId } });
  if (!area) notFound();

  const levelName = ((levelOverride as LevelName) || (await getNextUnassessedLevel(user.id, areaId)) || "Navigator") as LevelName;
  const allSkills = await getSkillsForAreaLevel(user.id, areaId, levelName);
  const deckSkills = allSkills.filter((s) => s.status !== "MASTERED");

  return (
    <div>
      <Link href="/discover" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-brand-text)] mb-6">
        <Icon name="arrow-left" className="h-4 w-4" />
        All areas
      </Link>
      <SwipeDeck
        key={`${area.id}-${levelName}-${focusSkillId ?? ""}`}
        skills={deckSkills}
        areaId={area.id}
        areaName={area.name}
        levelName={levelName}
        focusSkillId={focusSkillId}
      />
    </div>
  );
}
