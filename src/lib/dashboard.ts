import { prisma } from "@/lib/prisma";
import { computeUserProgress } from "@/lib/progression";
import { getMomentumSummary } from "@/lib/momentum";
import { getRecommendation } from "@/lib/recommendations";
import type { AreaProgress, MomentumSummary, RecommendationResult } from "@/types/domain";

export interface NearlyThereItem {
  areaName: string;
  areaColor: string;
  levelName: string;
  remaining: number;
}

export interface RecentAchievement {
  id: string;
  title: string;
  subtitle: string;
  earnedAt: string;
  kind: "skill" | "milestone" | "level";
}

export interface DashboardData {
  progress: AreaProgress[];
  momentum: MomentumSummary;
  recommendation: RecommendationResult | null;
  nearlyThere: NearlyThereItem[];
  recentAchievements: RecentAchievement[];
  weeklySummary: {
    activeDays: number;
    skillsMastered: number;
    skillsStarted: number;
    levelsCompleted: number;
  };
  pedTechFact: {
    title: string;
    fact: string;
    source: string | null;
    sourceUrl: string | null;
  } | null;
  areasWithProgress: number;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [progress, momentum, recommendation, recentActivities, pedTechFact] = await Promise.all([
    computeUserProgress(userId),
    getMomentumSummary(userId),
    getRecommendation(userId),
    prisma.developmentActivity.findMany({
      where: { userId },
      orderBy: { activityDate: "desc" },
      take: 8,
      include: { skill: { include: { capabilityArea: true } } },
    }),
    getPedTechFactOfTheDay(),
  ]);

  const nearlyThere: NearlyThereItem[] = [];
  for (const area of progress) {
    for (const level of area.levels) {
      if (level.isLocked || level.isComplete) continue;
      const remaining = level.totalSkills - level.masteredCount;
      if (remaining > 0 && remaining <= 2) {
        nearlyThere.push({ areaName: area.areaName, areaColor: area.color, levelName: level.levelName, remaining });
      }
    }
  }
  nearlyThere.sort((a, b) => a.remaining - b.remaining);

  const recentAchievements: RecentAchievement[] = recentActivities
    .filter((a) => a.activityType === "SKILL_MASTERED" || a.activityType === "LEVEL_COMPLETED" || a.activityType === "MILESTONE_EARNED")
    .slice(0, 5)
    .map((a) => {
      if (a.activityType === "LEVEL_COMPLETED") {
        const [areaName, levelName] = (a.detail ?? "").split("::");
        return {
          id: a.id,
          title: `${levelName ?? ""} complete`,
          subtitle: areaName ?? "",
          earnedAt: a.activityDate.toISOString(),
          kind: "level" as const,
        };
      }
      if (a.activityType === "MILESTONE_EARNED") {
        return {
          id: a.id,
          title: a.detail ?? "Milestone earned",
          subtitle: "Milestone",
          earnedAt: a.activityDate.toISOString(),
          kind: "milestone" as const,
        };
      }
      return {
        id: a.id,
        title: a.skill?.title ?? a.detail ?? "Skill mastered",
        subtitle: a.skill?.capabilityArea.name ?? "",
        earnedAt: a.activityDate.toISOString(),
        kind: "skill" as const,
      };
    });

  const weekStart = new Date();
  const day = weekStart.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  weekStart.setUTCDate(weekStart.getUTCDate() + diff);
  weekStart.setUTCHours(0, 0, 0, 0);

  const [skillsMastered, skillsStarted, levelsCompleted] = await Promise.all([
    prisma.developmentActivity.count({ where: { userId, activityType: "SKILL_MASTERED", activityDate: { gte: weekStart } } }),
    prisma.developmentActivity.count({ where: { userId, activityType: "SKILL_STARTED", activityDate: { gte: weekStart } } }),
    prisma.developmentActivity.count({ where: { userId, activityType: "LEVEL_COMPLETED", activityDate: { gte: weekStart } } }),
  ]);

  const areasWithProgress = progress.filter((a) => a.levels.some((l) => l.masteredCount + l.inProgressCount + l.toDevelopCount > 0)).length;

  return {
    progress,
    momentum,
    recommendation,
    nearlyThere: nearlyThere.slice(0, 3),
    recentAchievements,
    weeklySummary: {
      activeDays: momentum.activeDaysThisWeek,
      skillsMastered,
      skillsStarted,
      levelsCompleted,
    },
    pedTechFact,
    areasWithProgress,
  };
}

async function getPedTechFactOfTheDay() {
  const facts = await prisma.pedTechFact.findMany({ where: { active: true } });
  if (facts.length === 0) return null;
  // Deterministic "fact of the day" — same fact all day for all users,
  // rotates daily, fully admin-controlled content (never AI-generated).
  const dayIndex = Math.floor(Date.now() / 86400000);
  const fact = facts[dayIndex % facts.length];
  return { title: fact.title, fact: fact.fact, source: fact.source, sourceUrl: fact.sourceUrl };
}
