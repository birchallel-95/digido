"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { approveVideo, rejectVideo, adminDeleteVideo, resolveReport, type ModerationVideo, type ReportedVideo } from "@/lib/videoAdmin";
import { VIDEO_TYPE_LABELS } from "@/lib/constants";

function VideoPreviewCard({ video, children }: { video: ModerationVideo; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <video src={video.playbackUrl} controls muted className="w-full sm:w-36 aspect-[9/16] object-cover rounded-xl bg-black shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)]">
            {VIDEO_TYPE_LABELS[video.type]}
          </span>
          <span className="text-xs text-[var(--color-ink-faint)]">{new Date(video.createdAt).toLocaleDateString("en-GB")}</span>
        </div>
        <h3 className="font-semibold text-[var(--color-ink)]">{video.title}</h3>
        <p className="text-xs text-[var(--color-ink-faint)] mb-1.5">
          {video.uploaderName} · {video.uploaderEmail}
        </p>
        {video.description && <p className="text-sm text-[var(--color-ink-muted)] mb-1.5">{video.description}</p>}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {video.skillTitles.map((t) => (
            <span key={t} className="text-xs bg-[var(--color-surface-sunken)] rounded-full px-2 py-0.5 text-[var(--color-ink-muted)]">
              {t}
            </span>
          ))}
        </div>
        {(video.captionsVtt || video.transcriptText) && (
          <details className="mb-2">
            <summary className="cursor-pointer text-xs font-medium text-[var(--color-brand-text)] w-fit">Captions / transcript</summary>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1 whitespace-pre-wrap max-h-24 overflow-y-auto">
              {video.transcriptText ?? video.captionsVtt}
            </p>
          </details>
        )}
        {children}
      </div>
    </div>
  );
}

function PendingCard({ video }: { video: ModerationVideo }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    setBusy(true);
    await approveVideo(video.id);
    router.refresh();
  }
  async function handleReject() {
    setBusy(true);
    await rejectVideo(video.id, reason);
    router.refresh();
  }
  async function handleDelete() {
    if (!confirm("Delete this video permanently?")) return;
    setBusy(true);
    await adminDeleteVideo(video.id);
    router.refresh();
  }

  return (
    <VideoPreviewCard video={video}>
      {rejecting ? (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (sent to the uploader, optional)"
            rows={2}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleReject} disabled={busy}>
              Confirm reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRejecting(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleApprove} disabled={busy}>
            <Icon name="check" className="h-4 w-4" /> Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejecting(true)} disabled={busy}>
            Reject
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete} disabled={busy}>
            <Icon name="delete" className="h-4 w-4" /> Delete
          </Button>
        </div>
      )}
    </VideoPreviewCard>
  );
}

function ReportedCard({ video }: { video: ReportedVideo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleResolve(reportId: string) {
    setBusy(true);
    await resolveReport(reportId);
    router.refresh();
  }
  async function handleDelete() {
    if (!confirm("Delete this video permanently?")) return;
    setBusy(true);
    await adminDeleteVideo(video.id);
    router.refresh();
  }

  return (
    <VideoPreviewCard video={video}>
      <div className="space-y-1.5 mb-2">
        {video.reports.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-2 text-xs bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-lg px-3 py-2">
            <span>
              <strong>{r.reporterName}</strong>
              {r.reason ? `: ${r.reason}` : " (no reason given)"} · {new Date(r.createdAt).toLocaleDateString("en-GB")}
            </span>
            <button onClick={() => handleResolve(r.id)} disabled={busy} className="underline shrink-0">
              Resolve
            </button>
          </div>
        ))}
      </div>
      <Button size="sm" variant="danger" onClick={handleDelete} disabled={busy}>
        <Icon name="delete" className="h-4 w-4" /> Delete video
      </Button>
    </VideoPreviewCard>
  );
}

export function ModerationPanel({ pending, reported }: { pending: ModerationVideo[]; reported: ReportedVideo[] }) {
  const [tab, setTab] = useState<"pending" | "reported">(pending.length > 0 ? "pending" : "reported");

  return (
    <div>
      <div className="flex gap-2 mb-5" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "pending"}
          onClick={() => setTab("pending")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === "pending" ? "bg-[var(--color-brand)] text-[var(--color-ink)]" : "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]"}`}
        >
          Pending ({pending.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === "reported"}
          onClick={() => setTab("reported")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === "reported" ? "bg-[var(--color-brand)] text-[var(--color-ink)]" : "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]"}`}
        >
          Reported ({reported.length})
        </button>
      </div>

      {tab === "pending" ? (
        pending.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">Nothing waiting for review.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((v) => (
              <PendingCard key={v.id} video={v} />
            ))}
          </div>
        )
      ) : reported.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">No open reports.</p>
      ) : (
        <div className="space-y-3">
          {reported.map((v) => (
            <ReportedCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
