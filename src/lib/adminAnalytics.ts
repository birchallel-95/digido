import { prisma } from "@/lib/prisma";
import { computeUserProgress } from "@/lib/progression";

/**
 * Organisational analytics — deliberately aggregate-only. No query here ever
 * returns a result keyed by individual user; every number is a count or an
 * average across staff, matching the brief's privacy principles (section 25).
 *
 * NOTE: at real-world scale (hundreds of staff) this should move to a
 * precomputed nightly aggregate table rather than recomputing progress for
 * every user on each admin page load — fine for an MVP/demo, called out here
 * so it isn't mistaken for the intended production approach.
 */
export async function getOrganisationalAnalytics() {
  const staffUsers = await prisma.user.findMany({ where: { role: "STAFF" }, select: { id: true } });
  const areas = await prisma.capabilityArea.findMany({ where: { active: true }, orderBy: { order: "asc" } });

  const allProgress = await Promise.all(staffUsers.map((u) => computeUserProgress(u.id)));

  const areaAverages = areas.map((area) => {
    const percents = allProgress.map((p) => p.find((a) => a.areaId === area.id)?.overallPercent ?? 0);
    const avg = percents.length ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0;
    return { areaId: area.id, areaName: area.name, color: area.color, averagePercent: avg };
  });

  const strongest = [...areaAverages].sort((a, b) => b.averagePercent - a.averagePercent).slice(0, 3);
  const gaps = [...areaAverages].sort((a, b) => a.averagePercent - b.averagePercent).slice(0, 3);

  // Navigator/Elevator/Catalyst distribution: count, per area, how many
  // staff currently sit at each level.
  const levelDistribution = areas.map((area) => {
    const counts = { Navigator: 0, Elevator: 0, Catalyst: 0 };
    for (const userProgress of allProgress) {
      const areaProgress = userProgress.find((a) => a.areaId === area.id);
      if (areaProgress) counts[areaProgress.currentLevel]++;
    }
    return { areaName: area.name, color: area.color, counts };
  });

  const progressingCount = allProgress.filter((p) => p.some((a) => a.overallPercent > 0)).length;
  const percentProgressing = staffUsers.length ? Math.round((progressingCount / staffUsers.length) * 100) : 0;

  const [mostToDevelop, mostInProgress, activityByArea] = await Promise.all([
    prisma.userSkillStatus.groupBy({
      by: ["skillId"],
      where: { status: "TO_DEVELOP" },
      _count: { skillId: true },
      orderBy: { _count: { skillId: "desc" } },
      take: 5,
    }),
    prisma.userSkillStatus.groupBy({
      by: ["skillId"],
      where: { status: "IN_PROGRESS" },
      _count: { skillId: true },
      orderBy: { _count: { skillId: "desc" } },
      take: 5,
    }),
    prisma.developmentActivity.findMany({
      where: { activityDate: { gte: new Date(Date.now() - 30 * 86400000) }, skillId: { not: null } },
      select: { skill: { select: { capabilityAreaId: true } } },
    }),
  ]);

  const skillIds = [...mostToDevelop.map((r) => r.skillId), ...mostInProgress.map((r) => r.skillId)];
  const skills = await prisma.skill.findMany({ where: { id: { in: skillIds } }, include: { capabilityArea: true } });
  const skillById = new Map(skills.map((s) => [s.id, s]));

  const momentumByAreaCount = new Map<string, number>();
  for (const a of activityByArea) {
    const id = a.skill?.capabilityAreaId;
    if (!id) continue;
    momentumByAreaCount.set(id, (momentumByAreaCount.get(id) ?? 0) + 1);
  }
  const strongestMomentum = areas
    .map((a) => ({ areaName: a.name, color: a.color, activityCount: momentumByAreaCount.get(a.id) ?? 0 }))
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, 3);

  return {
    totalStaff: staffUsers.length,
    percentProgressing,
    areaAverages,
    strongest,
    gaps,
    levelDistribution,
    mostCommonDevelopmentNeeds: mostToDevelop
      .map((r) => ({ title: skillById.get(r.skillId)?.title ?? "Unknown", area: skillById.get(r.skillId)?.capabilityArea.name ?? "", count: r._count.skillId }))
      .filter((r) => r.title !== "Unknown"),
    mostCommonInProgress: mostInProgress
      .map((r) => ({ title: skillById.get(r.skillId)?.title ?? "Unknown", area: skillById.get(r.skillId)?.capabilityArea.name ?? "", count: r._count.skillId }))
      .filter((r) => r.title !== "Unknown"),
    strongestMomentum,
  };
}
