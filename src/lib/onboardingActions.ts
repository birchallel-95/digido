"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { PlatformPreference } from "@/lib/constants";

export async function completeOnboarding(platformPreference: PlatformPreference) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboarded: true, platformPreference },
  });
  return { ok: true };
}
