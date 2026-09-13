"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { BenefitCategory } from "@/lib/constants";

export interface SkillFormInput {
  capabilityAreaId: string;
  levelId: string;
  title: string;
  description: string;
  practicalOutcome: string;
  whyItMatters?: string;
  benefitCategories: BenefitCategory[];
  tool?: string;
  estimatedTimeMins?: number;
  imageUrl?: string;
  videoUrl?: string;
  learningResourceUrl?: string;
  evidencePrompt?: string;
  order?: number;
  active?: boolean;
}

export async function createSkill(input: SkillFormInput) {
  await requireAdmin();
  await prisma.skill.create({
    data: {
      ...input,
      benefitCategories: JSON.stringify(input.benefitCategories ?? []),
      active: input.active ?? true,
    },
  });
  revalidatePath("/admin/skills");
  return { ok: true };
}

export async function updateSkill(id: string, input: SkillFormInput) {
  await requireAdmin();
  await prisma.skill.update({
    where: { id },
    data: {
      ...input,
      benefitCategories: JSON.stringify(input.benefitCategories ?? []),
    },
  });
  revalidatePath("/admin/skills");
  revalidatePath(`/admin/skills/${id}`);
  return { ok: true };
}

export async function setSkillActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.skill.update({ where: { id }, data: { active } });
  revalidatePath("/admin/skills");
  return { ok: true };
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  // Skills with user history are deactivated rather than hard-deleted, to
  // preserve staff activity/evidence records.
  const hasHistory = await prisma.userSkillStatus.findFirst({ where: { skillId: id } });
  if (hasHistory) {
    await prisma.skill.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.skill.delete({ where: { id } });
  }
  revalidatePath("/admin/skills");
  return { ok: true };
}

export async function moveSkillOrder(id: string, direction: "up" | "down") {
  await requireAdmin();
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) return { ok: false };
  const neighbour = await prisma.skill.findFirst({
    where: {
      capabilityAreaId: skill.capabilityAreaId,
      levelId: skill.levelId,
      order: direction === "up" ? { lt: skill.order } : { gt: skill.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return { ok: false };
  await prisma.$transaction([
    prisma.skill.update({ where: { id: skill.id }, data: { order: neighbour.order } }),
    prisma.skill.update({ where: { id: neighbour.id }, data: { order: skill.order } }),
  ]);
  revalidatePath("/admin/skills");
  return { ok: true };
}

export interface PedTechFactInput {
  title: string;
  fact: string;
  category: string;
  source?: string;
  sourceUrl?: string;
  active?: boolean;
}

export async function createPedTechFact(input: PedTechFactInput) {
  await requireAdmin();
  await prisma.pedTechFact.create({ data: { ...input, active: input.active ?? true } });
  revalidatePath("/admin/pedtech");
  return { ok: true };
}

export async function updatePedTechFact(id: string, input: PedTechFactInput) {
  await requireAdmin();
  await prisma.pedTechFact.update({ where: { id }, data: input });
  revalidatePath("/admin/pedtech");
  return { ok: true };
}

export async function deletePedTechFact(id: string) {
  await requireAdmin();
  await prisma.pedTechFact.delete({ where: { id } }).catch(async () => {
    await prisma.pedTechFact.update({ where: { id }, data: { active: false } });
  });
  revalidatePath("/admin/pedtech");
  return { ok: true };
}

export async function updateStageCompletionThreshold(percent: number) {
  await requireAdmin();
  await prisma.systemConfig.upsert({
    where: { key: "stageCompletionThreshold" },
    create: { key: "stageCompletionThreshold", value: String(percent) },
    update: { value: String(percent) },
  });
  revalidatePath("/admin/settings");
  return { ok: true };
}

export interface ImportRow {
  areaName: string;
  levelName: string;
  title: string;
  description: string;
  practicalOutcome: string;
  whyItMatters?: string;
  benefitCategory?: string;
  tool?: string;
  estimatedTimeMins?: number;
  resourceUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ImportRowResult {
  row: ImportRow;
  status: "created" | "updated" | "error";
  error?: string;
}

/** Imports validated rows (see admin import UI for the validate/preview step). */
export async function importSkillRows(rows: ImportRow[]): Promise<ImportRowResult[]> {
  await requireAdmin();
  const areas = await prisma.capabilityArea.findMany();
  const levels = await prisma.level.findMany();
  const results: ImportRowResult[] = [];

  for (const row of rows) {
    const area = areas.find((a) => a.name.toLowerCase() === row.areaName.trim().toLowerCase());
    const level = levels.find((l) => l.name.toLowerCase() === row.levelName.trim().toLowerCase());
    if (!area || !level) {
      results.push({ row, status: "error", error: !area ? `Unknown capability area "${row.areaName}"` : `Unknown level "${row.levelName}"` });
      continue;
    }
    if (!row.title?.trim()) {
      results.push({ row, status: "error", error: "Missing skill title" });
      continue;
    }

    try {
      const existing = await prisma.skill.findFirst({ where: { title: row.title.trim(), capabilityAreaId: area.id } });
      const count = await prisma.skill.count({ where: { capabilityAreaId: area.id, levelId: level.id } });
      const data = {
        capabilityAreaId: area.id,
        levelId: level.id,
        title: row.title.trim(),
        description: row.description?.trim() || row.title.trim(),
        practicalOutcome: row.practicalOutcome?.trim() || "",
        whyItMatters: row.whyItMatters?.trim() || null,
        benefitCategories: JSON.stringify(row.benefitCategory ? [row.benefitCategory.trim().toUpperCase().replace(/\s+/g, "_")] : []),
        tool: row.tool?.trim() || null,
        estimatedTimeMins: row.estimatedTimeMins ?? null,
        learningResourceUrl: row.resourceUrl?.trim() || null,
        imageUrl: row.imageUrl?.trim() || null,
        videoUrl: row.videoUrl?.trim() || null,
      };
      if (existing) {
        await prisma.skill.update({ where: { id: existing.id }, data });
        results.push({ row, status: "updated" });
      } else {
        await prisma.skill.create({ data: { ...data, order: count } });
        results.push({ row, status: "created" });
      }
    } catch (e) {
      results.push({ row, status: "error", error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  revalidatePath("/admin/skills");
  return results;
}
