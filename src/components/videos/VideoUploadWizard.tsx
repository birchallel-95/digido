"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CapabilityTagPicker } from "@/components/videos/CapabilityTagPicker";
import { CaptionEditor } from "@/components/videos/CaptionEditor";
import {
  requestVideoUpload,
  probeUploadedVideo,
  requestCaptionGeneration,
  parseUploadedCaptionFile,
  createVideo,
  type TagPickerArea,
} from "@/lib/videoActions";
import type { CaptionSegment } from "@/lib/captions";
import { VIDEO_MAX_DURATION_SECONDS, VIDEO_MAX_DURATION_LABEL, VIDEO_MAX_FILE_SIZE_BYTES, VIDEO_TYPE_LABELS, VIDEO_TYPES, type VideoType } from "@/lib/constants";

type Stage = "capture" | "uploading" | "captions" | "details" | "done";
type CaptionsSourceKind = "AI_GENERATED" | "AI_EDITED" | "UPLOADED_FILE" | "MANUAL_TRANSCRIPT";
type TaggedSkill = { id: string; title: string; areaName: string; levelName: string };

function uploadWithProgress(url: string, file: Blob, contentType: string, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export function VideoUploadWizard({ tagOptions, captionsAiAvailable }: { tagOptions: TagPickerArea[]; captionsAiAvailable: boolean }) {
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("capture");
  const [clientError, setClientError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [probe, setProbe] = useState<{ durationSeconds: number; width: number | null; height: number | null } | null>(null);

  const [captionSegments, setCaptionSegments] = useState<CaptionSegment[] | null>(null);
  const [captionsSource, setCaptionsSource] = useState<CaptionsSourceKind | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [captionBusy, setCaptionBusy] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);

  const [type, setType] = useState<VideoType>("TOP_TIP");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<TaggedSkill[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Camera recording
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Preselect a skill when arriving from a flashcard's "Be the first to add a tip" link
  useEffect(() => {
    const skillId = searchParams.get("skillId");
    if (!skillId || selectedSkills.length > 0) return;
    for (const area of tagOptions) {
      for (const level of area.levels) {
        const match = level.skills.find((s) => s.id === skillId);
        if (match) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time preselect from the ?skillId link on mount
          setSelectedSkills([{ id: match.id, title: match.title, areaName: area.name, levelName: level.name }]);
          return;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tagOptions]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setClientError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setClientError("Couldn't access your camera or microphone — check your browser permissions, or upload a file instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function startRecording() {
    if (!streamRef.current) return;
    const candidates = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
    const mimeType = candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const recordedFile = new File([blob], `recording.${ext}`, { type: blob.type });
      stopCamera();
      handleSelectedFile(recordedFile);
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    setRecordSeconds(0);
    const interval = setInterval(() => {
      setRecordSeconds((s) => {
        if (s + 1 >= VIDEO_MAX_DURATION_SECONDS) {
          recorder.stop();
          clearInterval(interval);
          setRecording(false);
          return VIDEO_MAX_DURATION_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleSelectedFile(f);
  }

  function handleSelectedFile(selected: File) {
    setClientError(null);
    if (selected.size > VIDEO_MAX_FILE_SIZE_BYTES) {
      setClientError("That file is over the 100MB limit — try a shorter or more compressed clip.");
      return;
    }
    const url = URL.createObjectURL(selected);
    const probeEl = document.createElement("video");
    probeEl.preload = "metadata";
    probeEl.onloadedmetadata = () => {
      if (probeEl.duration > VIDEO_MAX_DURATION_SECONDS + 2) {
        setClientError(
          `That clip is about ${Math.round(probeEl.duration)}s — tips need to be ${VIDEO_MAX_DURATION_LABEL} or under. Trim it and try again!`
        );
        URL.revokeObjectURL(url);
        return;
      }
      setPreviewUrl(url);
      setFile(selected);
      startUpload(selected);
    };
    probeEl.src = url;
  }

  async function startUpload(uploadFile: File) {
    setStage("uploading");
    setUploadPct(0);
    const res = await requestVideoUpload(uploadFile.name, uploadFile.type || "video/mp4", uploadFile.size);
    if (!res.ok) {
      setClientError(res.error);
      setStage("capture");
      return;
    }
    try {
      await uploadWithProgress(res.uploadUrl, uploadFile, uploadFile.type || "video/mp4", setUploadPct);
    } catch {
      setClientError("Upload failed — check your connection and try again.");
      setStage("capture");
      return;
    }
    const probeRes = await probeUploadedVideo(res.key, uploadFile.size);
    if (!probeRes.ok) {
      setClientError(probeRes.error ?? "Something went wrong processing that video.");
      setStage("capture");
      return;
    }
    setStorageKey(res.key);
    setProbe({ durationSeconds: probeRes.durationSeconds!, width: probeRes.width ?? null, height: probeRes.height ?? null });
    setStage("captions");
  }

  async function handleGenerateCaptions() {
    if (!storageKey) return;
    setCaptionBusy(true);
    setCaptionError(null);
    const res = await requestCaptionGeneration(storageKey);
    setCaptionBusy(false);
    if (!res.ok) {
      setCaptionError(res.error ?? "Couldn't generate captions.");
      return;
    }
    setCaptionSegments(res.segments ?? []);
    setCaptionsSource("AI_GENERATED");
  }

  async function handleCaptionFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const segments = await parseUploadedCaptionFile(text, f.name);
    if (segments.length === 0) {
      setCaptionError("Couldn't read that caption file — check it's a valid .vtt or .srt.");
      return;
    }
    setCaptionSegments(segments);
    setCaptionsSource("UPLOADED_FILE");
    setCaptionError(null);
  }

  function handleCaptionEdit(next: CaptionSegment[]) {
    setCaptionSegments(next);
    setCaptionsSource((s) => (s === "AI_GENERATED" ? "AI_EDITED" : s));
  }

  const hasCaptions = Boolean(captionSegments && captionSegments.length > 0);
  const captionsStepValid = hasCaptions || transcriptText.trim().length > 0;

  async function handleSubmit() {
    setSubmitError(null);
    if (!title.trim()) return setSubmitError("Add a short title.");
    if (selectedSkills.length === 0) return setSubmitError("Tag at least one capability statement.");
    if (!agreed) return setSubmitError("Please confirm the upload agreement.");
    if (!captionsStepValid) return setSubmitError("Add captions or a written transcript before publishing.");
    if (!storageKey || !probe) return setSubmitError("Still processing your video — please wait a moment.");

    setSubmitting(true);
    const res = await createVideo({
      storageKey,
      mimeType: file?.type || "video/mp4",
      fileSize: file?.size ?? 0,
      durationSeconds: probe.durationSeconds,
      width: probe.width,
      height: probe.height,
      title,
      description,
      type,
      skillIds: selectedSkills.map((s) => s.id),
      captionSegments: hasCaptions ? captionSegments : null,
      transcriptText: transcriptText.trim() || null,
      captionsSource: captionsSource ?? "MANUAL_TRANSCRIPT",
      agreedToPolicy: agreed,
    });
    setSubmitting(false);
    if (!res.ok) return setSubmitError(res.error);
    setStage("done");
  }

  // ---------------------------------------------------------------------

  if (stage === "done") {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <Icon name="check" className="h-10 w-10 mx-auto text-[var(--color-success)] mb-3" />
        <h2 className="font-display text-xl font-bold text-[var(--color-ink)] mb-1">Thanks for sharing!</h2>
        <p className="text-[var(--color-ink-muted)] mb-6">
          Your video is in the review queue — it&apos;ll appear in Video Tips as soon as an admin approves it.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/videos">
            <Button variant="outline">Back to Video Tips</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Add another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {stage === "capture" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--color-brand-soft)] p-4 text-sm text-[var(--color-brand-text)] flex items-start gap-2.5">
            <Icon name="info" className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Tip: film vertically (portrait, 9:16) for the best experience — landscape clips are still fine and will just be letterboxed.</span>
          </div>

          {clientError && (
            <div role="alert" className="rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm px-4 py-3">
              {clientError}
            </div>
          )}

          {!cameraOn ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-border)] py-10 cursor-pointer hover:bg-[var(--color-surface-sunken)] transition-colors">
                <Icon name="upload" className="h-6 w-6 text-[var(--color-ink-faint)]" />
                <span className="text-sm font-medium text-[var(--color-ink)]">Upload a file</span>
                <span className="text-xs text-[var(--color-ink-faint)]">.mp4 or .mov, up to 100MB</span>
                <input type="file" accept="video/mp4,video/quicktime" onChange={handleFileInput} className="sr-only" />
              </label>
              <button
                type="button"
                onClick={startCamera}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-border)] py-10 hover:bg-[var(--color-surface-sunken)] transition-colors"
              >
                <Icon name="camera" className="h-6 w-6 text-[var(--color-ink-faint)]" />
                <span className="text-sm font-medium text-[var(--color-ink)]">Record with camera</span>
                <span className="text-xs text-[var(--color-ink-faint)]">Up to {VIDEO_MAX_DURATION_LABEL}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-w-xs mx-auto">
                <video ref={videoPreviewRef} muted playsInline className="h-full w-full object-cover" />
                {recording && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 text-white text-xs font-semibold px-2.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
                    {VIDEO_MAX_DURATION_SECONDS - recordSeconds}s left
                  </span>
                )}
              </div>
              <div className="flex justify-center gap-3">
                {!recording ? (
                  <Button onClick={startRecording}>
                    <Icon name="video" className="h-4 w-4" /> Start recording
                  </Button>
                ) : (
                  <Button variant="danger" onClick={stopRecording}>
                    <Icon name="pause" className="h-4 w-4" /> Stop
                  </Button>
                )}
                <Button variant="outline" onClick={stopCamera} disabled={recording}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "uploading" && (
        <div className="text-center py-16">
          {previewUrl && (
            <video src={previewUrl} muted className="mx-auto h-48 rounded-2xl object-cover mb-6" aria-hidden />
          )}
          <Icon name="spinner" className="h-6 w-6 mx-auto text-[var(--color-brand-text)] animate-spin mb-3" />
          <p className="font-medium text-[var(--color-ink)]">Uploading… {uploadPct}%</p>
          <div className="h-1.5 max-w-xs mx-auto rounded-full bg-[var(--color-surface-sunken)] overflow-hidden mt-3">
            <div className="h-full bg-[var(--color-brand)] transition-all" style={{ width: `${uploadPct}%` }} />
          </div>
        </div>
      )}

      {stage === "captions" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Captions</h2>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Add captions, or a written transcript/summary — at least one is required before this can be published.
            </p>
          </div>

          {captionError && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {captionError}
            </p>
          )}

          <div className="flex flex-wrap gap-2.5">
            {captionsAiAvailable && (
              <Button variant="outline" onClick={handleGenerateCaptions} disabled={captionBusy}>
                {captionBusy ? <Icon name="spinner" className="h-4 w-4 animate-spin" /> : <Icon name="captions" className="h-4 w-4" />}
                Generate captions with AI
              </Button>
            )}
            <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-[var(--color-surface-sunken)]">
              <Icon name="upload" className="h-4 w-4" />
              Upload caption file (.vtt/.srt)
              <input type="file" accept=".vtt,.srt" onChange={handleCaptionFile} className="sr-only" />
            </label>
          </div>

          {captionSegments && captionSegments.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)] mb-2">
                Check the wording below and fix anything that&apos;s wrong
              </p>
              <CaptionEditor segments={captionSegments} onChange={handleCaptionEdit} />
            </div>
          )}

          <div>
            <label htmlFor="transcript" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
              Written transcript / summary {hasCaptions ? "(optional — captions already cover this)" : ""}
            </label>
            <textarea
              id="transcript"
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm"
              placeholder="e.g. This clip shows how to set up a marking rubric in 60 seconds…"
            />
          </div>

          <Button onClick={() => setStage("details")} disabled={!captionsStepValid}>
            Continue
          </Button>
          {!captionsStepValid && <p className="text-xs text-[var(--color-ink-faint)]">Add captions or a transcript to continue.</p>}
        </div>
      )}

      {stage === "details" && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Type</p>
            <div className="grid grid-cols-3 gap-2">
              {VIDEO_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    type === t
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-text)]"
                      : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"
                  }`}
                >
                  {VIDEO_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm"
              placeholder="e.g. Set up a marking rubric in 60 seconds"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Tag at least one capability statement</p>
            <CapabilityTagPicker areas={tagOptions} selected={selectedSkills} onChange={setSelectedSkills} />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-[var(--color-ink-muted)]">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" required />
            <span>
              I confirm this video doesn&apos;t show learners or identifiable members of the public without their consent,
              doesn&apos;t display any personal data on screen, and follows the staff code of conduct.
            </span>
          </label>

          {submitError && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {submitError}
            </p>
          )}

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Icon name="spinner" className="h-4 w-4 animate-spin" />}
            Submit for review
          </Button>
        </div>
      )}
    </div>
  );
}
