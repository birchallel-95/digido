"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCheckpointSettings } from "@/lib/checkpointConfig";
import { computeCheckpointWindow, type CheckpointWindowState } from "@/lib/checkpoint";

export interface CheckpointDashboardState {
  window: CheckpointWindowState;
  completedThisWindow: boolean;
  linkUrl: string;
}

/** Null means the reminder is switched off entirely — render nothing. */
export async function getCheckpointDashboardState(): Promise<CheckpointDashboardState | null> {
  const user = await requireUser();
  const settings = await getCheckpointSettings();
  if (!settings.enabled) return null;

  const window = computeCheckpointWindow(settings);
  let completedThisWindow = false;
  if (window.status === "open") {
    const existing = await prisma.checkpointCompletion.findUnique({
      where: { userId_windowKey: { userId: user.id, windowKey: window.windowKey } },
    });
    completedThisWindow = Boolean(existing);
  }

  return { window, completedThisWindow, linkUrl: settings.linkUrl };
}

/** Self-report only — records that this person says they've done it, not a verified result. */
export async function markCheckpointComplete(windowKey: string) {
  const user = await requireUser();
  await prisma.checkpointCompletion.upsert({
    where: { userId_windowKey: { userId: user.id, windowKey } },
    create: { userId: user.id, windowKey },
    update: {},
  });
  revalidatePath("/dashboard");
  return { ok: true };
}
