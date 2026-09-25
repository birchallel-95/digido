"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getUploadUrl, getPlaybackUrl, deleteObject, newStorageKey, uploadsAvailable } from "@/lib/storage";
import { probeVideo } from "@/lib/videoProbe";
import { generateCaptions, captionsAiConfigured, segmentsToVtt, segmentsToPlainText, parseCaptionFile, type CaptionSegment } from "@/lib/captions";
import {
  VIDEO_MAX_DURATION_SECONDS,
  VIDEO_MAX_DURATION_LABEL,
  VIDEO_MAX_FILE_SIZE_BYTES,
  type VideoType,
} from "@/lib/constants";

// A little headroom over the cap so a clip that's genuinely at the limit but
// probes a fraction over isn't rejected on a rounding technicality.
const DURATION_TOLERANCE_SECONDS = 1.5;

export interface TagPickerArea {
  id: string;
  name: string;
  color: string;
  levels: {
    id: string;
    name: string;
    skills: { id: string; title: string }[];
  }[];
}

/** Nested Jisc element → tier → statement data for the upload tagging picker. */
export async function getVideoTagOptions(): Promise<TagPickerArea[]> {
  const areas = await prisma.capabilityArea.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      skills: {
        where: { active: true },
        orderBy: { order: "asc" },
        include: { level: true },
      },
    },
  });

  return areas.map((area) => {
    const levelMap = new Map<string, { id: string; name: string; order: number; skills: { id: string; title: string }[] }>();
    for (const skill of area.skills) {
      if (!levelMap.has(skill.levelId)) {
        levelMap.set(skill.levelId, { id: skill.levelId, name: skill.level.name, order: skill.level.order, skills: [] });
      }
      levelMap.get(skill.levelId)!.skills.push({ id: skill.id, title: skill.title });
    }
    return {
      id: area.id,
      name: area.name,
      color: area.color,
      levels: [...levelMap.values()].sort((a, b) => a.order - b.order),
    };
  });
}

export async function requestVideoUpload(filename: string, contentType: string, fileSize: number) {
  await requireUser();
  if (!uploadsAvailable) {
    return { ok: false as const, error: "Video uploads aren't set up on this site yet — ask your admin to configure storage." };
  }
  if (fileSize > VIDEO_MAX_FILE_SIZE_BYTES) {
    return { ok: false as const, error: "That file is over the 100MB limit — try a shorter or more compressed clip." };
  }
  const key = newStorageKey(filename);
  const uploadUrl = await getUploadUrl(key, contentType);
  return { ok: true as const, key, uploadUrl };
}

export interface ProbeUploadResult {
  ok: boolean;
  durationSeconds?: number;
  width?: number | null;
  height?: number | null;
  error?: string;
}

/** Server-side duration/dimension check — the real duration-limit enforcement, not just the client's courtesy check. */
export async function probeUploadedVideo(key: string, fileSize: number): Promise<ProbeUploadResult> {
  await requireUser();
  try {
    const url = await getPlaybackUrl(key);
    const { durationSeconds, width, height } = await probeVideo(url);

    if (!durationSeconds) {
      return { ok: false, error: "We couldn't read that video — try a different file." };
    }
    if (durationSeconds > VIDEO_MAX_DURATION_SECONDS + DURATION_TOLERANCE_SECONDS) {
      await deleteObject(key);
      return {
        ok: false,
        error: `That clip is ${Math.round(durationSeconds)}s — tips need to be ${VIDEO_MAX_DURATION_LABEL} or under. Trim it and try again!`,
      };
    }
    if (fileSize > VIDEO_MAX_FILE_SIZE_BYTES) {
      await deleteObject(key);
      return { ok: false, error: "That file is over the 100MB limit — try a shorter or more compressed clip." };
    }
    return { ok: true, durationSeconds: Math.min(durationSeconds, VIDEO_MAX_DURATION_SECONDS), width, height };
  } catch {
    return { ok: false, error: "We couldn't process that video — try a different file." };
  }
}

export interface CaptionGenerationResult {
  ok: boolean;
  segments?: CaptionSegment[];
  error?: string;
}

/** Runs Whisper on the uploaded clip; the caller shows the result in an editable box before it's ever saved. */
export async function requestCaptionGeneration(key: string): Promise<CaptionGenerationResult> {
  await requireUser();
  if (!captionsAiConfigured) {
    return { ok: false, error: "AI captioning isn't set up yet — add your own captions or a transcript instead." };
  }
  try {
    const url = await getPlaybackUrl(key);
    const segments = await generateCaptions(url);
    if (segments.length === 0) {
      return { ok: false, error: "Couldn't detect any speech to caption — add your own captions or a transcript instead." };
    }
    return { ok: true, segments };
  } catch {
    return { ok: false, error: "Caption generation failed — add your own captions or a transcript instead." };
  }
}

/** Parses an uploaded .vtt/.srt file (pure text parsing) into the same editable segment shape as AI captions. */
export async function parseUploadedCaptionFile(text: string, filename: string): Promise<CaptionSegment[]> {
  await requireUser();
  return parseCaptionFile(text, filename);
}

export interface CreateVideoInput {
  storageKey: string;
  mimeType: string;
  fileSize: number;
  durationSeconds: number;
  width: number | null;
  height: number | null;
  title: string;
  description?: string;
  type: VideoType;
  skillIds: string[];
  captionSegments: CaptionSegment[] | null; // null when relying on transcriptText only
  transcriptText: string | null;
  captionsSource: "AI_GENERATED" | "AI_EDITED" | "UPLOADED_FILE" | "MANUAL_TRANSCRIPT";
  agreedToPolicy: boolean;
}

export async function createVideo(input: CreateVideoInput) {
  const user = await requireUser();

  if (!input.title.trim()) return { ok: false as const, error: "A title is required." };
  if (input.skillIds.length === 0) return { ok: false as const, error: "Tag at least one capability statement." };
  if (!input.agreedToPolicy) return { ok: false as const, error: "You must agree to the upload policy." };
  const hasCaptions = input.captionSegments && input.captionSegments.length > 0;
  const hasTranscript = Boolean(input.transcriptText?.trim());
  if (!hasCaptions && !hasTranscript) {
    return { ok: false as const, error: "Add captions or a written transcript/summary before publishing." };
  }

  const captionsVtt = hasCaptions ? segmentsToVtt(input.captionSegments!) : null;
  const transcriptText = input.transcriptText?.trim() || (hasCaptions ? segmentsToPlainText(input.captionSegments!) : null);

  const video = await prisma.video.create({
    data: {
      uploaderId: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      type: input.type,
      status: "PENDING",
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      durationSeconds: input.durationSeconds,
      width: input.width,
      height: input.height,
      captionsVtt,
      transcriptText,
      captionsSource: input.captionsSource,
      agreedToPolicy: input.agreedToPolicy,
      skillTags: { create: input.skillIds.map((skillId) => ({ skillId })) },
    },
  });

  revalidatePath("/videos");
  revalidatePath("/admin/moderation");
  return { ok: true as const, id: video.id };
}

export async function deleteVideo(id: string) {
  const user = await requireUser();
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return { ok: false, error: "Not found." };
  if (video.uploaderId !== user.id && user.role !== "ADMIN") return { ok: false, error: "Not your video." };

  await deleteObject(video.storageKey);
  await prisma.video.delete({ where: { id } });
  revalidatePath("/videos");
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function updateVideo(
  id: string,
  input: { title: string; description?: string; type: VideoType; skillIds: string[] }
) {
  const user = await requireUser();
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return { ok: false, error: "Not found." };
  if (video.uploaderId !== user.id && user.role !== "ADMIN") return { ok: false, error: "Not your video." };
  if (!input.title.trim()) return { ok: false, error: "A title is required." };
  if (input.skillIds.length === 0) return { ok: false, error: "Tag at least one capability statement." };

  await prisma.$transaction([
    prisma.videoSkillTag.deleteMany({ where: { videoId: id } }),
    prisma.video.update({
      where: { id },
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        type: input.type,
        skillTags: { create: input.skillIds.map((skillId) => ({ skillId })) },
      },
    }),
  ]);

  revalidatePath("/videos");
  return { ok: true };
}

export async function toggleHelpful(videoId: string) {
  const user = await requireUser();
  const existing = await prisma.videoHelpful.findUnique({ where: { videoId_userId: { videoId, userId: user.id } } });

  if (existing) {
    await prisma.$transaction([
      prisma.videoHelpful.delete({ where: { id: existing.id } }),
      prisma.video.update({ where: { id: videoId }, data: { helpfulCount: { decrement: 1 } } }),
    ]);
    return { ok: true, helpful: false };
  }

  await prisma.$transaction([
    prisma.videoHelpful.create({ data: { videoId, userId: user.id } }),
    prisma.video.update({ where: { id: videoId }, data: { helpfulCount: { increment: 1 } } }),
  ]);
  return { ok: true, helpful: true };
}

export async function reportVideo(videoId: string, reason?: string) {
  const user = await requireUser();
  const existing = await prisma.videoReport.findFirst({ where: { videoId, reporterId: user.id, resolved: false } });
  if (existing) return { ok: true }; // already reported and pending review — avoid duplicate spam

  await prisma.videoReport.create({ data: { videoId, reporterId: user.id, reason: reason?.trim() || null } });
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function recordView(videoId: string) {
  const session = await prisma.video.findUnique({ where: { id: videoId }, select: { id: true } });
  if (!session) return { ok: false };
  await prisma.$transaction([
    prisma.videoView.create({ data: { videoId } }),
    prisma.video.update({ where: { id: videoId }, data: { viewCount: { increment: 1 } } }),
  ]);
  return { ok: true };
}
