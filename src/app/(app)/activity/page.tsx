import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";

const ACTIVITY_META: Record<string, { icon: string; verb: string; color: string }> = {
  SKILL_MASTERED: { icon: "check", verb: "Mastered", color: "var(--color-success)" },
  SKILL_STARTED: { icon: "arrow-up", verb: "Started", color: "var(--color-elevator)" },
  SKILL_ASSESSED: { icon: "arrow-left", verb: "Added to development list", color: "var(--color-ink-muted)" },
  RESOURCE_COMPLETED: { icon: "book", verb: "Completed a resource for", color: "var(--color-brand)" },
  REFLECTION_ADDED: { icon: "edit", verb: "Reflected on", color: "var(--color-brand)" },
  EVIDENCE_ADDED: { icon: "edit", verb: "Added evidence for", color: "var(--color-brand)" },
  LEVEL_COMPLETED: { icon: "trophy", verb: "Completed", color: "var(--color-catalyst)" },
  MILESTONE_EARNED: { icon: "award", verb: "Earned milestone", color: "var(--color-warning)" },
};

function dayLabel(date: Date): string {
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOf(now).getTime() - startOf(date).getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return date.toLocaleDateString("en-GB", { weekday: "long" });
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" }).toUpperCase();
}

export default async function ActivityPage() {
  const user = await requireUser();
  const activities = await prisma.developmentActivity.findMany({
    where: { userId: user.id },
    orderBy: { activityDate: "desc" },
    take: 100,
    include: { skill: { include: { capabilityArea: true } } },
  });

  const groups = new Map<string, typeof activities>();
  for (const a of activities) {
    const label = dayLabel(a.activityDate);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(a);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Activity</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Your private development history — visible only to you, and a useful evidence trail over time.
        </p>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">Your activity will appear here as you start assessing skills.</p>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([label, items]) => (
            <div key={label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)] mb-3">{label}</h2>
              <ul className="space-y-3">
                {items.map((a) => {
                  const meta = ACTIVITY_META[a.activityType] ?? { icon: "info", verb: a.activityType, color: "var(--color-ink-muted)" };
                  let detail = a.skill?.title ?? a.detail ?? "";
                  if (a.activityType === "LEVEL_COMPLETED" && a.detail) {
                    const [areaName, levelName] = a.detail.split("::");
                    detail = `${levelName} in ${areaName}`;
                  }
                  if (a.activityType === "MILESTONE_EARNED") detail = a.detail ?? "";
                  return (
                    <li key={a.id} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5" style={{ background: `${meta.color}1a`, color: meta.color }}>
                        <Icon name={meta.icon} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm text-[var(--color-ink)]">
                          <span className="font-medium">{meta.verb}:</span> {detail}
                        </p>
                        {a.skill?.capabilityArea && (
                          <p className="text-xs text-[var(--color-ink-faint)]">{a.skill.capabilityArea.name}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
