import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { ReflectionDetail } from "@/lib/adminDashboard";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ReflectionsPanel({ reflections, showReflections }: { reflections: ReflectionDetail[]; showReflections: boolean }) {
  if (!showReflections) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-5 text-center">
        <Icon name="lock" className="h-6 w-6 mx-auto text-[var(--color-ink-faint)] mb-2" />
        <p className="text-sm font-medium text-[var(--color-ink)]">Reflection text is hidden</p>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1 max-w-md mx-auto">
          The counts above already include reflections, but what people actually wrote stays private until you
          switch this on.
        </p>
        <Link href="/admin/settings" className="inline-block mt-3 text-sm font-medium text-[var(--color-brand-text)] hover:underline">
          Turn on in Settings →
        </Link>
      </div>
    );
  }

  if (reflections.length === 0) {
    return <p className="text-sm text-[var(--color-ink-muted)]">No reflections written yet.</p>;
  }

  return (
    <div className="space-y-3">
      {reflections.map((r) => (
        <div key={r.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{r.skillTitle}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">{formatDate(r.createdAt)}</p>
          </div>
          <p className="text-sm text-[var(--color-ink-muted)]">{r.reflection}</p>
          <p className="text-xs text-[var(--color-ink-faint)] mt-2">
            {r.userName ?? "Unnamed"} · {r.userEmail}
          </p>
        </div>
      ))}
    </div>
  );
}
