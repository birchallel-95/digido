import { prisma } from "@/lib/prisma";
import { DEFAULT_CHECKPOINT_SETTINGS, type CheckpointSettings } from "@/lib/checkpoint";

// Same admin-tunable-settings pattern as stageCompletionThreshold / adminShowReflections.
export const CHECKPOINT_CONFIG_KEYS = {
  enabled: "checkpointEnabled",
  linkUrl: "checkpointLinkUrl",
  autumnStart: "checkpointAutumnStart",
  autumnEnd: "checkpointAutumnEnd",
  summerStart: "checkpointSummerStart",
  summerEnd: "checkpointSummerEnd",
} as const;

function parseMonthDay(value: string | undefined, fallbackMonth: number, fallbackDay: number): { month: number; day: number } {
  if (!value) return { month: fallbackMonth, day: fallbackDay };
  const [m, d] = value.split("-").map(Number);
  if (!m || !d || m < 1 || m > 12 || d < 1 || d > 31) return { month: fallbackMonth, day: fallbackDay };
  return { month: m, day: d };
}

export async function getCheckpointSettings(): Promise<CheckpointSettings> {
  const rows = await prisma.systemConfig.findMany({ where: { key: { in: Object.values(CHECKPOINT_CONFIG_KEYS) } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const autumnStart = parseMonthDay(map.get(CHECKPOINT_CONFIG_KEYS.autumnStart), DEFAULT_CHECKPOINT_SETTINGS.autumnStartMonth, DEFAULT_CHECKPOINT_SETTINGS.autumnStartDay);
  const autumnEnd = parseMonthDay(map.get(CHECKPOINT_CONFIG_KEYS.autumnEnd), DEFAULT_CHECKPOINT_SETTINGS.autumnEndMonth, DEFAULT_CHECKPOINT_SETTINGS.autumnEndDay);
  const summerStart = parseMonthDay(map.get(CHECKPOINT_CONFIG_KEYS.summerStart), DEFAULT_CHECKPOINT_SETTINGS.summerStartMonth, DEFAULT_CHECKPOINT_SETTINGS.summerStartDay);
  const summerEnd = parseMonthDay(map.get(CHECKPOINT_CONFIG_KEYS.summerEnd), DEFAULT_CHECKPOINT_SETTINGS.summerEndMonth, DEFAULT_CHECKPOINT_SETTINGS.summerEndDay);

  return {
    enabled: (map.get(CHECKPOINT_CONFIG_KEYS.enabled) ?? "true") !== "false",
    linkUrl: map.get(CHECKPOINT_CONFIG_KEYS.linkUrl) ?? DEFAULT_CHECKPOINT_SETTINGS.linkUrl,
    autumnStartMonth: autumnStart.month,
    autumnStartDay: autumnStart.day,
    autumnEndMonth: autumnEnd.month,
    autumnEndDay: autumnEnd.day,
    summerStartMonth: summerStart.month,
    summerStartDay: summerStart.day,
    summerEndMonth: summerEnd.month,
    summerEndDay: summerEnd.day,
  };
}
