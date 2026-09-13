import { prisma } from "@/lib/prisma";
import { logDevelopmentActivity } from "@/lib/momentum";
import { LEVEL_NAMES } from "@/lib/progression";

/**
 * Checks all active milestone definitions against a user's current stats and
 * awards any newly-earned ones. Called after any qualifying activity.
 * Returns the list of newly-earned milestone names (for celebratory UI).
 */
export async function checkAndAwardMilestones(userId: string): Promise<string[]> {
  const [milestones, alreadyEarned, momentum, masteredCount, activityCount, distinctAreasWithActivity] =
    await Promise.all([
      prisma.milestone.findMany({ where: { active: true } }),
      prisma.userMilestone.findMany({ where: { userId }, select: { milestoneId: true } }),
      prisma.userMomentum.findUnique({ where: { userId } }),
      prisma.userSkillStatus.count({ where: { userId, status: "MASTERED" } }),
      prisma.developmentActivity.count({ where: { userId } }),
      prisma.developmentActivity.findMany({
        where: { userId, skillId: { not: null } },
        select: { skill: { select: { capabilityAreaId: true } } },
        distinct: ["skillId"],
      }),
    ]);

  const earnedIds = new Set(alreadyEarned.map((m) => m.milestoneId));
  const areaCount = new Set(distinctAreasWithActivity.map((a) => a.skill?.capabilityAreaId)).size;
  const levelCompletions = await prisma.developmentActivity.count({
    where: { userId, activityType: "LEVEL_COMPLETED" },
  });

  const newlyEarned: string[] = [];

  for (const milestone of milestones) {
    if (earnedIds.has(milestone.id)) continue;

    let qualifies = false;
    switch (milestone.criteriaType) {
      case "FIRST_ASSESSMENT":
        qualifies = activityCount >= 1;
        break;
      case "ACTIVE_DAYS_TOTAL":
        qualifies = (momentum?.totalDevelopmentDays ?? 0) >= (milestone.criteriaValue ?? 0);
        break;
      case "SKILLS_MASTERED_TOTAL":
        qualifies = masteredCount >= (milestone.criteriaValue ?? 0);
        break;
      case "LEVEL_COMPLETED_ANY":
        qualifies = levelCompletions >= 1;
        break;
      case "LEVEL_COMPLETED_SPECIFIC": {
        // criteriaValue holds the level's order index (0=Navigator, 1=Elevator, 2=Catalyst)
        const levelName = LEVEL_NAMES[milestone.criteriaValue ?? -1];
        if (levelName) {
          const completedThisLevel = await prisma.developmentActivity.findFirst({
            where: {
              userId,
              activityType: "LEVEL_COMPLETED",
              detail: { endsWith: `::${levelName}` },
            },
          });
          qualifies = Boolean(completedThisLevel);
        }
        break;
      }
      case "ALL_AREAS_STARTED":
        qualifies = areaCount >= 6;
        break;
    }

    if (qualifies) {
      await prisma.userMilestone.create({ data: { userId, milestoneId: milestone.id } });
      await logDevelopmentActivity({
        userId,
        activityType: "MILESTONE_EARNED",
        detail: milestone.name,
      });
      newlyEarned.push(milestone.name);
    }
  }

  return newlyEarned;
}
