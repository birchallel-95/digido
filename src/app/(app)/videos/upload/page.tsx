import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { getVideoTagOptions } from "@/lib/videoActions";
import { captionsAiConfigured } from "@/lib/captions";
import { VideoUploadWizard } from "@/components/videos/VideoUploadWizard";

export default async function UploadVideoPage() {
  await requireUser();
  const tagOptions = await getVideoTagOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Share a video tip</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">A quick top tip, hack, or example — up to 60 seconds.</p>
      </div>
      <Suspense>
        <VideoUploadWizard tagOptions={tagOptions} captionsAiAvailable={captionsAiConfigured} />
      </Suspense>
    </div>
  );
}
