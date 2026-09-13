import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SkillForm } from "@/components/admin/SkillForm";
import type { BenefitCategory, PlatformPreference } from "@/lib/constants";

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [skill, areas, levels] = await Promise.all([
    prisma.skill.findUnique({ where: { id } }),
    prisma.capabilityArea.findMany({ orderBy: { order: "asc" } }),
    prisma.level.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!skill) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Edit skill</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Changes apply immediately for all staff.</p>
      </div>
      <SkillForm
        areas={areas}
        levels={levels}
        skillId={skill.id}
        initial={{
          capabilityAreaId: skill.capabilityAreaId,
          levelId: skill.levelId,
          title: skill.title,
          description: skill.description,
          practicalOutcome: skill.practicalOutcome,
          whyItMatters: skill.whyItMatters ?? "",
          howToSteps: JSON.parse(skill.howToSteps || "[]") as string[],
          platform: skill.platform as PlatformPreference,
          benefitCategories: JSON.parse(skill.benefitCategories || "[]") as BenefitCategory[],
          tool: skill.tool ?? "",
          estimatedTimeMins: skill.estimatedTimeMins ?? undefined,
          imageUrl: skill.imageUrl ?? "",
          videoUrl: skill.videoUrl ?? "",
          learningResourceUrl: skill.learningResourceUrl ?? "",
          evidencePrompt: skill.evidencePrompt ?? "",
        }}
      />
    </div>
  );
}
