"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await prisma.user.update({ where: { id: session.user.id }, data: { onboarded: true } });
  return { ok: true };
}
