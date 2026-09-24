"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { CHECKPOINT_CONFIG_KEYS, getCheckpointSettings } from "@/lib/checkpointConfig";
import { computeCheckpointWindow } from "@/lib/checkpoint";

export interface UpdateCheckpointSettingsInput {
  enabled: boolean;
  linkUrl: string;
  autumnStartMonth: number;
  autumnStartDay: number;
  autumnEndMonth: number;
  autumnEndDay: number;
  summerStartMonth: number;
  summerStartDay: number;
  summerEndMonth: number;
  summerEndDay: number;
}

export async function updateCheckpointSettings(input: UpdateCheckpointSettingsInput) {
  await requireAdmin();

  if (!input.linkUrl.trim()) return { ok: false, error: "The assessment link can't be empty." };
  const pad = (n: number) => String(n).padStart(2, "0");
  const afterStart = (sm: number, sd: number, em: number, ed: number) => em > sm || (em === sm && ed >= sd);
  if (!afterStart(input.autumnStartMonth, input.autumnStartDay, input.autumnEndMonth, input.autumnEndDay)) {
    return { ok: false, error: "The Autumn window's end date must be on or after its start date." };
  }
  if (!afterStart(input.summerStartMonth, input.summerStartDay, input.summerEndMonth, input.summerEndDay)) {
    return { ok: false, error: "The Summer window's end date must be on or after its start date." };
  }

  const writes = [
    { key: CHECKPOINT_CONFIG_KEYS.enabled, value: String(input.enabled) },
    { key: CHECKPOINT_CONFIG_KEYS.linkUrl, value: input.linkUrl.trim() },
    { key: CHECKPOINT_CONFIG_KEYS.autumnStart, value: `${pad(input.autumnStartMonth)}-${pad(input.autumnStartDay)}` },
    { key: CHECKPOINT_CONFIG_KEYS.autumnEnd, value: `${pad(input.autumnEndMonth)}-${pad(input.autumnEndDay)}` },
    { key: CHECKPOINT_CONFIG_KEYS.summerStart, value: `${pad(input.summerStartMonth)}-${pad(input.summerStartDay)}` },
    { key: CHECKPOINT_CONFIG_KEYS.summerEnd, value: `${pad(input.summerEndMonth)}-${pad(input.summerEndDay)}` },
  ];
  await prisma.$transaction(
    writes.map((w) => prisma.systemConfig.upsert({ where: { key: w.key }, create: w, update: { value: w.value } }))
  );

  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  return { ok: true };
}

export interface CheckpointWindowStats {
  windowKey: string;
  label: string;
  completedCount: number;
}

export interface CheckpointStats {
  totalStaff: number;
  currentWindow: CheckpointWindowStats | null; // null when no window is currently open
  recentWindows: CheckpointWindowStats[];
}

function formatWindowLabel(windowKey: string): string {
  const [year, season] = windowKey.split("-");
  return `${season === "autumn" ? "Autumn" : "Summer"} ${year}`;
}

export async function getCheckpointStats(): Promise<CheckpointStats> {
  await requireAdmin();

  const settings = await getCheckpointSettings();
  const window = computeCheckpointWindow(settings);
  const [totalStaff, grouped] = await Promise.all([
    prisma.user.count(),
    prisma.checkpointCompletion.groupBy({ by: ["windowKey"], _count: { _all: true } }),
  ]);
  const countByKey = new Map(grouped.map((g) => [g.windowKey, g._count._all]));

  const currentWindow =
    window.status === "open"
      ? { windowKey: window.windowKey, label: formatWindowLabel(window.windowKey), completedCount: countByKey.get(window.windowKey) ?? 0 }
      : null;

  const recentWindows = [...countByKey.entries()]
    .filter(([key]) => key !== currentWindow?.windowKey)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 6)
    .map(([key, count]) => ({ windowKey: key, label: formatWindowLabel(key), completedCount: count }));

  return { totalStaff, currentWindow, recentWindows };
}
