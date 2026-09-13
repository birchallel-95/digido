import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SkillForm } from "@/components/admin/SkillForm";

export default async function NewSkillPage() {
  await requireAdmin();
  const [areas, levels] = await Promise.all([
    prisma.capabilityArea.findMany({ orderBy: { order: "asc" } }),
    prisma.level.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Add a skill</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">New skills are active immediately and appear in Discover.</p>
      </div>
      <SkillForm areas={areas} levels={levels} />
    </div>
  );
}
