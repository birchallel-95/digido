import { requireUser } from "@/lib/session";
import { getSkillsByStatus } from "@/lib/lists";
import { DevelopmentItem } from "@/components/lists/DevelopmentItem";
import { Icon } from "@/components/ui/Icon";

export default async function DevelopPage() {
  const user = await requireUser();
  const items = await getSkillsByStatus(user.id, "TO_DEVELOP");

  // Priority-flagged items first (this is the same signal the recommendation
  // engine reads), then most recently added.
  const sorted = [...items].sort((a, b) => Number(b.isPriority) - Number(a.isPriority));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">My Development</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Your personalised development plan — skills you&apos;ve said you need to learn.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="target" className="h-10 w-10 mx-auto text-[var(--color-ink-faint)] mb-3" />
          <p className="font-medium text-[var(--color-ink)]">Nothing on your development list right now.</p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Head to Discover to assess more skills — anything marked &ldquo;need to learn this&rdquo; will land here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => (
            <DevelopmentItem key={item.statusId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
