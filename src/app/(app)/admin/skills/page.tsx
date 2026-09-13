import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { SkillRowActions } from "@/components/admin/SkillRowActions";
import { PLATFORMS, PLATFORM_SHORT_LABELS, type LevelName, type PlatformPreference } from "@/lib/constants";

export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; level?: string; platform?: string }>;
}) {
  await requireAdmin();
  const { area: areaFilter, level: levelFilter, platform: platformFilter } = await searchParams;

  const [areas, levels, skills] = await Promise.all([
    prisma.capabilityArea.findMany({ orderBy: { order: "asc" } }),
    prisma.level.findMany({ orderBy: { order: "asc" } }),
    prisma.skill.findMany({
      where: {
        capabilityAreaId: areaFilter || undefined,
        levelId: levelFilter || undefined,
        platform: platformFilter || undefined,
      },
      orderBy: [{ capabilityAreaId: "asc" }, { levelId: "asc" }, { order: "asc" }],
      include: { capabilityArea: true, level: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Manage skills</h1>
          <p className="text-[var(--color-ink-muted)] mt-1">{skills.length} skill{skills.length === 1 ? "" : "s"} shown.</p>
        </div>
        <Link href="/admin/skills/new">
          <Button>Add skill</Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select name="area" defaultValue={areaFilter ?? ""} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface-raised)]">
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select name="level" defaultValue={levelFilter ?? ""} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface-raised)]">
          <option value="">All levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <select name="platform" defaultValue={platformFilter ?? ""} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface-raised)]">
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_SHORT_LABELS[p]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-ink-faint)] border-b border-[var(--color-border)]">
              <th className="py-2.5 px-4 font-medium">Title</th>
              <th className="py-2.5 px-4 font-medium">Area</th>
              <th className="py-2.5 px-4 font-medium">Level</th>
              <th className="py-2.5 px-4 font-medium">Platform</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2.5 px-4 font-medium text-[var(--color-ink)] max-w-xs">{s.title}</td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{s.capabilityArea.name}</td>
                <td className="py-2.5 px-4">
                  <LevelBadge level={s.level.name as LevelName} size="sm" />
                </td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">
                  {PLATFORM_SHORT_LABELS[s.platform as PlatformPreference]}
                </td>
                <td className="py-2.5 px-4">
                  <span className={s.active ? "text-[var(--color-success)]" : "text-[var(--color-ink-faint)]"}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <SkillRowActions id={s.id} active={s.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
