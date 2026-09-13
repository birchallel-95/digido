import { prisma } from "@/lib/prisma";
import { computeUserProgress } from "@/lib/progression";
import type { LevelName } from "@/lib/constants";
import type { RecommendationResult } from "@/types/domain";

/**
 * Rules-based "Today's Digital Step" recommendation.
 *
 * Priority order (brief section 14 / 46):
 *   1. Skills marked In Progress
 *   2. Capability stages close to completion
 *   3. Navigator skills preventing progression (blocking skills)
 *   4. User-selected development priorities
 *   5. Skills not reviewed for a long period
 *   6. Less developed capability areas
 *
 * This is intentionally a plain function behind no interface magic — but its
 * single responsibility (given a userId, return one RecommendationResult)
 * means an AI-backed implementation could later be swapped in as a drop-in
 * replacement (e.g. `getRecommendation = getAIRecommendation`).
 */
export async function getRecommendation(userId: string): Promise<RecommendationResult | null> {
  const progress = await computeUserProgress(userId);

  // --- 1. Skills marked In Progress (oldest-updated first = likely stale) ---
  const inProgress = await prisma.userSkillStatus.findFirst({
    where: { userId, status: "IN_PROGRESS" },
    orderBy: { updatedAt: "asc" },
    include: { skill: { include: { capabilityArea: true, level: true } } },
  });
  if (inProgress) {
    return buildResult(inProgress.skill, 1, "You're already working on this — pick it back up.");
  }

  // --- 2. Capability stages close to completion (1 skill remaining) ---
  for (const area of progress) {
    for (const level of area.levels) {
      if (level.isLocked || level.isComplete) continue;
      const remaining = level.totalSkills - level.masteredCount;
      if (remaining === 1) {
        const skill = await findOneActionableSkill(userId, area.areaId, level.levelName);
        if (skill) {
          return buildResult(
            skill,
            2,
            `You're one skill away from completing ${level.levelName} in ${area.areaName}.`
          );
        }
      }
    }
  }

  // --- 3. Navigator skills blocking progression (any incomplete unlocked Navigator stage) ---
  for (const area of progress) {
    const navigator = area.levels.find((l) => l.levelName === "Navigator");
    if (navigator && !navigator.isComplete) {
      const skill = await findOneActionableSkill(userId, area.areaId, "Navigator");
      if (skill) {
        return buildResult(
          skill,
          3,
          `Completing Navigator in ${area.areaName} will unlock Elevator.`
        );
      }
    }
  }

  // --- 4. User-selected development priorities ---
  const priority = await prisma.userPriority.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { skill: { include: { capabilityArea: true, level: true } } },
  });
  if (priority) {
    return buildResult(priority.skill, 4, "You flagged this as a personal priority.");
  }

  // --- 5. Skills not reviewed for a long period (e.g. To Develop, oldest first) ---
  const stale = await prisma.userSkillStatus.findFirst({
    where: { userId, status: "TO_DEVELOP" },
    orderBy: { updatedAt: "asc" },
    include: { skill: { include: { capabilityArea: true, level: true } } },
  });
  if (stale) {
    return buildResult(stale.skill, 5, "This has been on your development list for a while.");
  }

  // --- 6. Less developed capability area — suggest its lowest unlocked, unassessed skill ---
  const sortedByLeastDeveloped = [...progress].sort((a, b) => a.overallPercent - b.overallPercent);
  for (const area of sortedByLeastDeveloped) {
    for (const level of area.levels) {
      if (level.isLocked) continue;
      const skill = await findOneActionableSkill(userId, area.areaId, level.levelName);
      if (skill) {
        return buildResult(
          skill,
          6,
          `${area.areaName} has room to grow — here's a good place to start.`
        );
      }
    }
  }

  return null; // everything assessed across every unlocked level
}

async function findOneActionableSkill(userId: string, areaId: string, levelName: LevelName) {
  const level = await prisma.level.findUnique({ where: { name: levelName } });
  if (!level) return null;
  const skill = await prisma.skill.findFirst({
    where: {
      capabilityAreaId: areaId,
      levelId: level.id,
      active: true,
      statuses: { none: { userId, status: "MASTERED" } },
    },
    orderBy: { order: "asc" },
    include: { capabilityArea: true, level: true },
  });
  return skill;
}

function buildResult(
  skill: {
    id: string;
    title: string;
    whyItMatters: string | null;
    practicalOutcome: string;
    estimatedTimeMins: number | null;
    capabilityAreaId: string;
    capabilityArea: { name: string; color: string };
    level: { name: string };
  },
  reasonRank: number,
  reason: string
): RecommendationResult {
  return {
    skillId: skill.id,
    areaId: skill.capabilityAreaId,
    areaName: skill.capabilityArea.name,
    areaColor: skill.capabilityArea.color,
    levelName: skill.level.name as LevelName,
    title: skill.title,
    whyItMatters: skill.whyItMatters,
    practicalOutcome: skill.practicalOutcome,
    estimatedTimeMins: skill.estimatedTimeMins,
    reason,
    reasonRank,
  };
}
