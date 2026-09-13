import { Icon } from "@/components/ui/Icon";

export function PedTechFactCard({
  fact,
}: {
  fact: { title: string; fact: string; source: string | null; sourceUrl: string | null } | null;
}) {
  if (!fact) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon name="info" className="h-4.5 w-4.5 text-[var(--color-brand-text)]" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">PedTech fact of the day</span>
      </div>
      <h3 className="font-display font-bold text-[var(--color-ink)] mb-1.5">{fact.title}</h3>
      <p className="text-sm text-[var(--color-ink-muted)]">&ldquo;{fact.fact}&rdquo;</p>
      {fact.source && (
        <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
          Source: {fact.sourceUrl ? (
            <a href={fact.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-brand-text)]">
              {fact.source}
            </a>
          ) : (
            fact.source
          )}
        </p>
      )}
    </div>
  );
}
