import { requireAdmin } from "@/lib/session";
import { getPendingVideos, getReportedVideos } from "@/lib/videoAdmin";
import { ModerationPanel } from "@/components/admin/ModerationPanel";

export default async function AdminModerationPage() {
  await requireAdmin();
  const [pending, reported] = await Promise.all([getPendingVideos(), getReportedVideos()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Video moderation</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Review new uploads and reported videos before they appear in Video Tips.</p>
      </div>
      <ModerationPanel pending={pending} reported={reported} />
    </div>
  );
}
