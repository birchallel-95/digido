"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { PlatformPreference } from "@/lib/constants";

export async function updateProfile(data: { name: string; department?: string; jobTitle?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: data.name.trim(), department: data.department?.trim() || null, jobTitle: data.jobTitle?.trim() || null },
  });
  revalidatePath("/profile");
  return { ok: true };
}

export async function updatePlatformPreference(platformPreference: PlatformPreference) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.user.update({ where: { id: session.user.id }, data: { platformPreference } });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/discover");
  revalidatePath("/develop");
  revalidatePath("/progress");
  return { ok: true };
}

export async function updateWeeklyTarget(weeklyTarget: number) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.userMomentum.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, weeklyTarget },
    update: { weeklyTarget },
  });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
