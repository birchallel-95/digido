import { requireAdmin } from "@/lib/session";
import { getStageCompletionThreshold } from "@/lib/progression";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const threshold = await getStageCompletionThreshold();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Settings</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Organisation-wide configuration for progression.</p>
      </div>
      <SettingsForm threshold={threshold} />
    </div>
  );
}
