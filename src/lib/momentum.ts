import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@/lib/constants";
import type { MomentumSummary } from "@/types/domain";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD, UTC-normalised
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Records a qualifying development activity and recomputes momentum.
 * Only call this for MEANINGFUL actions (see brief section 11) — never for
 * simple logins or page views.
 */
export async function logDevelopmentActivity(params: {
  userId: string;
  skillId?: string;
  activityType: ActivityType;
  detail?: string;
}) {
  await prisma.developmentActivity.create({
    data: {
      userId: params.userId,
      skillId: params.skillId,
      activityType: params.activityType,
      detail: params.detail,
    },
  });
  await recomputeMomentum(params.userId);
}

/** Recomputes streaks from the DevelopmentActivity log — source of truth, no drift. */
export async function recomputeMomentum(userId: string) {
  const activities = await prisma.developmentActivity.findMany({
    where: { userId },
    select: { activityDate: true },
    orderBy: { activityDate: "asc" },
  });

  const uniqueDayKeys = Array.from(new Set(activities.map((a) => toDateKey(a.activityDate)))).sort();
  const totalDevelopmentDays = uniqueDayKeys.length;

  // Consecutive-day streak (calendar days; weekends simply have no activity
  // and will end a raw streak — future enhancement: exclude non-working days
  // per user pattern, see brief section 13).
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;
  for (const key of uniqueDayKeys) {
    const d = new Date(key + "T00:00:00Z");
    if (prevDate) {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / 86400000);
      running = diffDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }
    longestStreak = Math.max(longestStreak, running);
    prevDate = d;
  }

  // Current streak: walk back from today/yesterday.
  let currentStreak = 0;
  if (uniqueDayKeys.length > 0) {
    const today = toDateKey(new Date());
    const daySet = new Set(uniqueDayKeys);
    const cursor = new Date(today + "T00:00:00Z");
    // allow the streak to still "count" if today has no activity yet but
    // yesterday did (streak isn't broken until a full day is missed)
    if (!daySet.has(toDateKey(cursor))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    while (daySet.has(toDateKey(cursor))) {
      currentStreak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  const lastQualifyingActivityDate = activities.length
    ? activities[activities.length - 1].activityDate
    : null;

  await prisma.userMomentum.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak,
      longestStreak,
      totalDevelopmentDays,
      lastQualifyingActivityDate,
    },
    update: {
      currentStreak,
      longestStreak,
      totalDevelopmentDays,
      lastQualifyingActivityDate,
    },
  });
}

export async function getMomentumSummary(userId: string): Promise<MomentumSummary> {
  const momentum = await prisma.userMomentum.findUnique({ where: { userId } });

  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [weekActivities, monthMasteredCount, weekImprovedSkills] = await Promise.all([
    prisma.developmentActivity.findMany({
      where: { userId, activityDate: { gte: weekStart, lt: weekEnd } },
      select: { activityDate: true },
    }),
    prisma.developmentActivity.count({
      where: { userId, activityType: "SKILL_MASTERED", activityDate: { gte: monthStart } },
    }),
    prisma.developmentActivity.count({
      where: {
        userId,
        activityDate: { gte: weekStart, lt: weekEnd },
        activityType: { in: ["SKILL_STARTED", "SKILL_MASTERED"] },
      },
    }),
  ]);

  const activeDayKeys = new Set(weekActivities.map((a) => toDateKey(a.activityDate)));

  const last7Days: { date: string; active: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    last7Days.push({ date: toDateKey(d), active: activeDayKeys.has(toDateKey(d)) });
  }

  return {
    currentStreak: momentum?.currentStreak ?? 0,
    longestStreak: momentum?.longestStreak ?? 0,
    totalDevelopmentDays: momentum?.totalDevelopmentDays ?? 0,
    activeDaysThisWeek: activeDayKeys.size,
    weeklyTarget: momentum?.weeklyTarget ?? 3,
    skillsImprovedThisWeek: weekImprovedSkills,
    skillsMasteredThisMonth: monthMasteredCount,
    last7Days,
  };
}
