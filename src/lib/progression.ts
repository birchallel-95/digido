import { prisma } from "@/lib/prisma";
import {
  DEFAULT_STAGE_COMPLETION_THRESHOLD,
  LEVEL_META,
  type LevelName,
} from "@/lib/constants";
import { getUserPlatform, platformWhere } from "@/lib/platform";
import { getVideoCountsBySkill } from "@/lib/videoFeed";
import type { AreaProgress, LevelProgress, SkillWithStatus } from "@/types/domain";

const LEVEL_ORDER: LevelName[] = ["Navigator", "Elevator", "Catalyst"];

/** Reads the stage-completion threshold (%) from SystemConfig, default 100. */
export async function getStageCompletionThreshold(): Promise<number> {
  const row = await prisma.systemConfig.findUnique({ where: { key: "stageCompletionThreshold" } });
  if (!row) return DEFAULT_STAGE_COMPLETION_THRESHOLD;
  const parsed = Number(row.value);
  return Number.isFinite(parsed) ? parsed : DEFAULT_STAGE_COMPLETION_THRESHOLD;
}

/**
 * Computes per-area, per-level progress for a user. This is the single
 * source of truth for stage locking: an area's Elevator stage is locked
 * until that SAME area's Navigator stage clears the completion threshold —
 * progression in one area never depends on any other area.
 */
export async function computeUserProgress(userId: string): Promise<AreaProgress[]> {
  const [threshold, platform] = await Promise.all([getStageCompletionThreshold(), getUserPlatform(userId)]);

  const areas = await prisma.capabilityArea.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      skills: {
        where: { active: true, ...platformWhere(platform) },
        include: {
          level: true,
          statuses: { where: { userId } },
        },
      },
    },
  });

  return areas.map((area) => {
    const byLevel = new Map<LevelName, typeof area.skills>();
    for (const level of LEVEL_ORDER) byLevel.set(level, []);
    for (const skill of area.skills) {
      const levelName = skill.level.name as LevelName;
      byLevel.get(levelName)?.push(skill);
    }

    const levels: LevelProgress[] = [];
    let previousComplete = true; // Navigator always unlocked
    for (const levelName of LEVEL_ORDER) {
      const skills = byLevel.get(levelName) ?? [];
      const total = skills.length;
      let mastered = 0;
      let inProgress = 0;
      let toDevelop = 0;
      for (const s of skills) {
        const status = s.statuses[0]?.status;
        if (status === "MASTERED") mastered++;
        else if (status === "IN_PROGRESS") inProgress++;
        else if (status === "TO_DEVELOP") toDevelop++;
      }
      const unassessed = total - mastered - inProgress - toDevelop;
      const percent = total === 0 ? 0 : Math.round((mastered / total) * 100);
      const isComplete = total > 0 && percent >= threshold;

      levels.push({
        levelName,
        totalSkills: total,
        masteredCount: mastered,
        inProgressCount: inProgress,
        toDevelopCount: toDevelop,
        unassessedCount: Math.max(unassessed, 0),
        percentComplete: percent,
        isComplete,
        isLocked: !previousComplete,
      });

      previousComplete = isComplete;
    }

    const totalAll = levels.reduce((sum, l) => sum + l.totalSkills, 0);
    const masteredAll = levels.reduce((sum, l) => sum + l.masteredCount, 0);
    const overallPercent = totalAll === 0 ? 0 : Math.round((masteredAll / totalAll) * 100);

    // Current level = the highest unlocked level with incomplete or active skills
    let currentLevel: LevelName = "Navigator";
    for (const l of levels) {
      if (!l.isLocked) currentLevel = l.levelName;
      if (!l.isLocked && !l.isComplete) break;
    }

    return {
      areaId: area.id,
      areaName: area.name,
      shortName: area.shortName,
      description: area.description,
      color: area.color,
      icon: area.icon,
      levels,
      overallPercent,
      currentLevel,
    };
  });
}

/** Fetches all active skills for one area/level, joined with this user's status. */
export async function getSkillsForAreaLevel(
  userId: string,
  areaId: string,
  levelName: LevelName
): Promise<SkillWithStatus[]> {
  const [level, platform, videoCounts] = await Promise.all([
    prisma.level.findUnique({ where: { name: levelName } }),
    getUserPlatform(userId),
    getVideoCountsBySkill(),
  ]);
  if (!level) return [];

  const skills = await prisma.skill.findMany({
    where: { capabilityAreaId: areaId, levelId: level.id, active: true, ...platformWhere(platform) },
    orderBy: { order: "asc" },
    include: {
      capabilityArea: true,
      statuses: { where: { userId } },
      priorities: { where: { userId } },
      evidence: { where: { userId } },
    },
  });

  return skills.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    practicalOutcome: s.practicalOutcome,
    whyItMatters: s.whyItMatters,
    howToSteps: JSON.parse(s.howToSteps || "[]"),
    benefitCategories: JSON.parse(s.benefitCategories || "[]"),
    tool: s.tool,
    estimatedTimeMins: s.estimatedTimeMins,
    imageUrl: s.imageUrl,
    videoUrl: s.videoUrl,
    learningResourceUrl: s.learningResourceUrl,
    evidencePrompt: s.evidencePrompt,
    order: s.order,
    levelName,
    capabilityAreaId: s.capabilityAreaId,
    capabilityAreaName: s.capabilityArea.name,
    status: (s.statuses[0]?.status as SkillWithStatus["status"]) ?? null,
    statusUpdatedAt: s.statuses[0]?.updatedAt.toISOString() ?? null,
    isPriority: s.priorities.length > 0,
    hasEvidence: s.evidence.length > 0,
    videoTipCount: videoCounts.get(s.id) ?? 0,
  }));
}

/** Returns the next unassessed skill in a user's unlocked levels for an area (used to start a swipe deck). */
export async function getNextUnassessedLevel(
  userId: string,
  areaId: string
): Promise<LevelName | null> {
  const progress = await computeUserProgress(userId);
  const area = progress.find((a) => a.areaId === areaId);
  if (!area) return null;
  for (const level of area.levels) {
    if (level.isLocked) continue;
    if (level.unassessedCount > 0 || level.toDevelopCount > 0 || level.inProgressCount > 0) {
      return level.levelName;
    }
  }
  // everything assessed — return the highest unlocked level for review
  const unlocked = area.levels.filter((l) => !l.isLocked);
  return unlocked.length ? unlocked[unlocked.length - 1].levelName : "Navigator";
}

export const LEVEL_NAMES = LEVEL_ORDER;
export { LEVEL_META };
