import { prisma } from "@/lib/prisma";
import type { LevelName, SkillStatusValue } from "@/lib/constants";

export interface StatusListItem {
  statusId: string;
  skillId: string;
  title: string;
  description: string;
  practicalOutcome: string;
  howToSteps: string[];
  areaId: string;
  areaName: string;
  areaColor: string;
  levelName: LevelName;
  tool: string | null;
  estimatedTimeMins: number | null;
  learningResourceUrl: string | null;
  evidencePrompt: string | null;
  notes: string | null;
  targetDate: string | null;
  startedAt: string | null;
  isPriority: boolean;
  updatedAt: string;
}

export async function getSkillsByStatus(userId: string, status: SkillStatusValue): Promise<StatusListItem[]> {
  const rows = await prisma.userSkillStatus.findMany({
    where: { userId, status },
    orderBy: { updatedAt: "desc" },
    include: {
      skill: { include: { capabilityArea: true, level: true, priorities: { where: { userId } } } },
    },
  });

  return rows.map((r) => ({
    statusId: r.id,
    skillId: r.skillId,
    title: r.skill.title,
    description: r.skill.description,
    practicalOutcome: r.skill.practicalOutcome,
    howToSteps: JSON.parse(r.skill.howToSteps || "[]"),
    areaId: r.skill.capabilityAreaId,
    areaName: r.skill.capabilityArea.name,
    areaColor: r.skill.capabilityArea.color,
    levelName: r.skill.level.name as LevelName,
    tool: r.skill.tool,
    estimatedTimeMins: r.skill.estimatedTimeMins,
    learningResourceUrl: r.skill.learningResourceUrl,
    evidencePrompt: r.skill.evidencePrompt,
    notes: r.notes,
    targetDate: r.targetDate?.toISOString() ?? null,
    startedAt: r.startedAt?.toISOString() ?? null,
    isPriority: r.skill.priorities.length > 0,
    updatedAt: r.updatedAt.toISOString(),
  }));
}
