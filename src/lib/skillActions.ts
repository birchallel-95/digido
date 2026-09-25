"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logDevelopmentActivity } from "@/lib/momentum";
import { checkAndAwardMilestones } from "@/lib/milestones";
import { computeUserProgress } from "@/lib/progression";
import type { SkillStatusValue } from "@/lib/constants";

export interface StatusChangeResult {
  ok: boolean;
  newlyEarnedMilestones: string[];
  levelJustCompleted?: { areaName: string; levelName: string };
  error?: string;
}

/**
 * Sets a skill's status for the current user. This is the single mutation
 * path used by the swipe deck, My Development, and My Progress screens, so
 * activity logging / momentum / milestone logic stays in one place.
 */
export async function setSkillStatus(
  skillId: string,
  status: SkillStatusValue,
  opts?: { notes?: string; targetDate?: string }
): Promise<StatusChangeResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, newlyEarnedMilestones: [], error: "Not authenticated" };
  const userId = session.user.id;

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: { capabilityArea: true, level: true },
  });
  if (!skill) return { ok: false, newlyEarnedMilestones: [], error: "Skill not found" };

  const existing = await prisma.userSkillStatus.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });
  const isFirstAssessment = !existing;
  const now = new Date();

  await prisma.userSkillStatus.upsert({
    where: { userId_skillId: { userId, skillId } },
    create: {
      userId,
      skillId,
      status,
      notes: opts?.notes,
      targetDate: opts?.targetDate ? new Date(opts.targetDate) : undefined,
      startedAt: status !== "TO_DEVELOP" ? now : undefined,
      masteredAt: status === "MASTERED" ? now : undefined,
    },
    update: {
      status,
      notes: opts?.notes,
      targetDate: opts?.targetDate ? new Date(opts.targetDate) : undefined,
      startedAt: status !== "TO_DEVELOP" && !existing?.startedAt ? now : undefined,
      masteredAt: status === "MASTERED" ? now : null,
    },
  });

  // Log the qualifying activity
  let activityType: "SKILL_ASSESSED" | "SKILL_STARTED" | "SKILL_MASTERED" = "SKILL_ASSESSED";
  if (status === "IN_PROGRESS") activityType = "SKILL_STARTED";
  if (status === "MASTERED") activityType = "SKILL_MASTERED";
  if (isFirstAssessment && status === "TO_DEVELOP") activityType = "SKILL_ASSESSED";

  await logDevelopmentActivity({
    userId,
    skillId,
    activityType,
    detail: skill.title,
  });

  // Check whether this just completed a level for this area
  let levelJustCompleted: { areaName: string; levelName: string } | undefined;
  if (status === "MASTERED") {
    const progress = await computeUserProgress(userId);
    const area = progress.find((a) => a.areaId === skill.capabilityAreaId);
    const level = area?.levels.find((l) => l.levelName === skill.level.name);
    if (level?.isComplete) {
      // avoid double-logging: only log if we haven't already logged completion for this area+level
      const alreadyLogged = await prisma.developmentActivity.findFirst({
        where: {
          userId,
          activityType: "LEVEL_COMPLETED",
          detail: `${skill.capabilityArea.name}::${skill.level.name}`,
        },
      });
      if (!alreadyLogged) {
        await logDevelopmentActivity({
          userId,
          activityType: "LEVEL_COMPLETED",
          detail: `${skill.capabilityArea.name}::${skill.level.name}`,
        });
        levelJustCompleted = { areaName: skill.capabilityArea.name, levelName: skill.level.name };
      }
    }
  }

  const newlyEarnedMilestones = await checkAndAwardMilestones(userId);

  revalidatePath("/dashboard");
  revalidatePath("/discover");
  revalidatePath("/my-progress");
  revalidatePath(`/areas/${skill.capabilityAreaId}`);

  return { ok: true, newlyEarnedMilestones, levelJustCompleted };
}

/** Removes a user's status for a skill (used by "undo last swipe"). */
export async function clearSkillStatus(skillId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.userSkillStatus
    .delete({ where: { userId_skillId: { userId: session.user.id, skillId } } })
    .catch(() => null);
  revalidatePath("/discover");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateSkillMeta(skillId: string, opts: { notes?: string; targetDate?: string | null }) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const userId = session.user.id;
  await prisma.userSkillStatus.updateMany({
    where: { userId, skillId },
    data: {
      notes: opts.notes,
      targetDate: opts.targetDate === null ? null : opts.targetDate ? new Date(opts.targetDate) : undefined,
    },
  });
  revalidatePath("/my-progress");
  return { ok: true };
}

export async function togglePriority(skillId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const userId = session.user.id;
  const existing = await prisma.userPriority.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });
  if (existing) {
    await prisma.userPriority.delete({ where: { id: existing.id } });
  } else {
    await prisma.userPriority.create({ data: { userId, skillId } });
  }
  revalidatePath("/my-progress");
  return { ok: true, isPriority: !existing };
}

export async function addEvidence(params: {
  skillId: string;
  reflection?: string;
  fileUrl?: string;
  externalUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const userId = session.user.id;
  const skill = await prisma.skill.findUnique({ where: { id: params.skillId } });
  if (!skill) return { ok: false };

  await prisma.evidence.create({
    data: {
      userId,
      skillId: params.skillId,
      reflection: params.reflection,
      fileUrl: params.fileUrl,
      externalUrl: params.externalUrl,
    },
  });
  await logDevelopmentActivity({
    userId,
    skillId: params.skillId,
    activityType: "EVIDENCE_ADDED",
    detail: skill.title,
  });
  await checkAndAwardMilestones(userId);
  revalidatePath("/passport");
  revalidatePath("/my-progress");
  return { ok: true };
}
