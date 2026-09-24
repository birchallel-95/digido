import { prisma } from "@/lib/prisma";

const SHOW_REFLECTIONS_KEY = "adminShowReflections";

/**
 * Whether admins can see the *text* of staff reflections/evidence. Off by
 * default — the admin dashboard always shows how many reflections someone
 * has written (a count), but never the content unless this is explicitly
 * switched on in Settings. Keeping this behind an explicit, off-by-default
 * toggle (rather than a permanent admin capability) is a deliberate privacy
 * choice, not an oversight.
 */
export async function getShowReflections(): Promise<boolean> {
  const row = await prisma.systemConfig.findUnique({ where: { key: SHOW_REFLECTIONS_KEY } });
  return row?.value === "true";
}

export { SHOW_REFLECTIONS_KEY };
