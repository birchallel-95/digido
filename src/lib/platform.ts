import { prisma } from "@/lib/prisma";
import type { PlatformPreference } from "@/lib/constants";

/** Reads a user's chosen platform (set at onboarding, changeable in Profile). */
export async function getUserPlatform(userId: string): Promise<PlatformPreference> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { platformPreference: true } });
  return (user?.platformPreference as PlatformPreference) ?? "BOTH";
}

/**
 * A Prisma `where` fragment restricting Skill queries to what a user with
 * this platform preference should see: their chosen suite's skills, plus
 * every suite-agnostic ("BOTH") skill. A user who picked "Both" sees
 * everything — this returns an empty (no-op) filter for them.
 */
export function platformWhere(pref: PlatformPreference) {
  if (pref === "BOTH") return {};
  return { OR: [{ platform: "BOTH" }, { platform: pref }] };
}
