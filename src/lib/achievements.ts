import { prisma } from "@/lib/prisma";
import { computeUserProgress } from "@/lib/progression";
import type { LevelName } from "@/lib/constants";

export interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  areaName: string;
  areaColor: string;
  levelName: LevelName;
  earnedAt: string | null;
  earned: boolean;
}

export interface MilestoneView {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  earned: boolean;
  earnedAt: string | null;
}

export interface MasteredSkillView {
  skillId: string;
  title: string;
  areaName: string;
  areaColor: string;
  levelName: LevelName;
  masteredAt: string | null;
  hasEvidence: boolean;
  reflection: string | null;
}

export async function getAchievementsData(userId: string) {
  const [progress, badges, milestones, userMilestones, masteredStatuses] = await Promise.all([
    computeUserProgress(userId),
    prisma.badge.findMany({ include: { capabilityArea: true, level: true } }),
    prisma.milestone.findMany({ where: { active: true } }),
    prisma.userMilestone.findMany({ where: { userId } }),
    prisma.userSkillStatus.findMany({
      where: { userId, status: "MASTERED" },
      orderBy: { masteredAt: "desc" },
      include: { skill: { include: { capabilityArea: true, level: true, evidence: { where: { userId } } } } },
    }),
  ]);

  const earnedMilestoneMap = new Map(userMilestones.map((m) => [m.milestoneId, m.earnedAt]));

  const earnedBadges: EarnedBadge[] = badges.map((b) => {
    const area = progress.find((a) => a.areaId === b.capabilityAreaId);
    const level = area?.levels.find((l) => l.levelName === b.level.name);
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      areaName: b.capabilityArea.name,
      areaColor: b.capabilityArea.color,
      levelName: b.level.name as LevelName,
      earned: Boolean(level?.isComplete),
      earnedAt: null, // level-completion timestamp lives in DevelopmentActivity; not critical for display
    };
  });

  const milestoneViews: MilestoneView[] = milestones.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    icon: m.icon,
    earned: earnedMilestoneMap.has(m.id),
    earnedAt: earnedMilestoneMap.get(m.id)?.toISOString() ?? null,
  }));

  const masteredSkills: MasteredSkillView[] = masteredStatuses.map((s) => ({
    skillId: s.skillId,
    title: s.skill.title,
    areaName: s.skill.capabilityArea.name,
    areaColor: s.skill.capabilityArea.color,
    levelName: s.skill.level.name as LevelName,
    masteredAt: s.masteredAt?.toISOString() ?? null,
    hasEvidence: s.skill.evidence.length > 0,
    reflection: s.skill.evidence.find((e) => e.reflection)?.reflection ?? null,
  }));

  return {
    badges: earnedBadges.sort((a, b) => Number(b.earned) - Number(a.earned)),
    milestones: milestoneViews.sort((a, b) => Number(b.earned) - Number(a.earned)),
    masteredSkills,
  };
}
