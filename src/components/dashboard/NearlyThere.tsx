import { Icon } from "@/components/ui/Icon";
import type { NearlyThereItem } from "@/lib/dashboard";

export function NearlyThere({ items }: { items: NearlyThereItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon name="target" className="h-4.5 w-4.5 text-[var(--color-brand)]" />
        <h2 className="font-display font-bold text-[var(--color-ink)]">Nearly there</h2>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[var(--color-ink-muted)] flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: item.areaColor }} />
            <span>
              You only have <strong className="text-[var(--color-ink)]">{item.remaining} {item.levelName}</strong> skill
              {item.remaining === 1 ? "" : "s"} remaining in <strong className="text-[var(--color-ink)]">{item.areaName}</strong>.
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
