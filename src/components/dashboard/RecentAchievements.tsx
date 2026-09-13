import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { RecentAchievement } from "@/lib/dashboard";

const KIND_ICON: Record<RecentAchievement["kind"], string> = {
  skill: "check",
  level: "trophy",
  milestone: "award",
};

export function RecentAchievements({ items }: { items: RecentAchievement[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-ink-muted)]">Your recent achievements will appear here.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <Icon name={KIND_ICON[item.kind]} className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-ink)] truncate">{item.title}</p>
            <p className="text-xs text-[var(--color-ink-faint)] truncate">{item.subtitle}</p>
          </div>
        </li>
      ))}
      <Link href="/achievements" className="block text-sm font-medium text-[var(--color-brand)] hover:underline pt-1">
        View all achievements →
      </Link>
    </ul>
  );
}
