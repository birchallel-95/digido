import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { getVideoTagOptions } from "@/lib/videoActions";
import { captionsAiConfigured } from "@/lib/captions";
import { uploadsAvailable } from "@/lib/storage";
import { VideoUploadWizard } from "@/components/videos/VideoUploadWizard";
import { Icon } from "@/components/ui/Icon";

export default async function UploadVideoPage() {
  await requireUser();
  const tagOptions = await getVideoTagOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Share a video tip</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">A quick top tip, hack, or example — up to 60 seconds.</p>
      </div>
      {uploadsAvailable ? (
        <Suspense>
          <VideoUploadWizard tagOptions={tagOptions} captionsAiAvailable={captionsAiConfigured} />
        </Suspense>
      ) : (
        <div className="max-w-xl mx-auto rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center">
          <Icon name="video" className="h-8 w-8 mx-auto text-[var(--color-ink-faint)] mb-3" />
          <p className="font-medium text-[var(--color-ink)] mb-1">Video uploads aren&apos;t set up yet</p>
          <p className="text-sm text-[var(--color-ink-muted)]">Ask your admin to configure storage before staff can share video tips.</p>
        </div>
      )}
    </div>
  );
}
