import { requireAdmin } from "@/lib/session";
import { getStageCompletionThreshold } from "@/lib/progression";
import { getShowReflections } from "@/lib/adminConfig";
import { getCheckpointSettings } from "@/lib/checkpointConfig";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { CheckpointSettingsForm } from "@/components/admin/CheckpointSettingsForm";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [threshold, showReflections, checkpointSettings] = await Promise.all([
    getStageCompletionThreshold(),
    getShowReflections(),
    getCheckpointSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Settings</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Organisation-wide configuration for progression.</p>
      </div>
      <SettingsForm threshold={threshold} showReflections={showReflections} />
      <CheckpointSettingsForm settings={checkpointSettings} />
    </div>
  );
}
