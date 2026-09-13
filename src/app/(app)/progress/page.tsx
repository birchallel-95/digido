import { requireUser } from "@/lib/session";
import { getSkillsByStatus } from "@/lib/lists";
import { ProgressItem } from "@/components/lists/ProgressItem";
import { Icon } from "@/components/ui/Icon";

export default async function ProgressPage() {
  const user = await requireUser();
  const items = await getSkillsByStatus(user.id, "IN_PROGRESS");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">In Progress</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Skills you&apos;re actively working on right now.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="clock" className="h-10 w-10 mx-auto text-[var(--color-ink-faint)] mb-3" />
          <p className="font-medium text-[var(--color-ink)]">Nothing in progress at the moment.</p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Mark a skill &ldquo;working on this&rdquo; while swiping to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ProgressItem key={item.statusId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
