import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
import ffmpegStatic from "ffmpeg-static";

const execFileAsync = promisify(execFile);

export const captionsAiConfigured = Boolean(process.env.OPENAI_API_KEY);

export interface CaptionSegment {
  start: number; // seconds
  end: number;
  text: string;
}

function formatVttTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}

export function segmentsToVtt(segments: CaptionSegment[]): string {
  const cues = segments
    .filter((s) => s.text.trim().length > 0)
    .map((s) => `${formatVttTimestamp(s.start)} --> ${formatVttTimestamp(s.end)}\n${s.text.trim()}`)
    .join("\n\n");
  return `WEBVTT\n\n${cues}\n`;
}

export function segmentsToPlainText(segments: CaptionSegment[]): string {
  return segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Downloads the clip's audio, transcribes it with OpenAI's Whisper API, and
 * returns per-segment timestamps so the uploader can correct wording without
 * losing sync. Requires OPENAI_API_KEY — check captionsAiConfigured first;
 * callers fall back to manual captions/transcript when it isn't set.
 */
export async function generateCaptions(videoUrl: string): Promise<CaptionSegment[]> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  if (!ffmpegStatic) throw new Error("ffmpeg binary is not available in this environment");

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "digido-captions-"));
  const audioPath = path.join(tmpDir, "audio.mp3");
  try {
    // Extract compressed mono audio: keeps us well under Whisper's 25MB
    // per-request limit and is faster to upload than sending the whole clip.
    await execFileAsync(ffmpegStatic as string, [
      "-y",
      "-i",
      videoUrl,
      "-vn",
      "-acodec",
      "libmp3lame",
      "-ar",
      "16000",
      "-ac",
      "1",
      "-b:a",
      "64k",
      audioPath,
    ]);

    const audioBuffer = await fs.readFile(audioPath);
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(audioBuffer)], { type: "audio/mpeg" }), "audio.mp3");
    form.append("model", "whisper-1");
    form.append("response_format", "verbose_json");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`Whisper transcription failed (${resp.status}): ${errText}`);
    }
    const data = (await resp.json()) as { segments?: { start: number; end: number; text: string }[] };
    return (data.segments ?? []).map((s) => ({ start: s.start, end: s.end, text: s.text.trim() }));
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
  }
}

/** Parses an uploaded .srt file into the same segment shape as Whisper's output. */
export function srtToSegments(srt: string): CaptionSegment[] {
  const blocks = srt.replace(/\r/g, "").trim().split(/\n\n+/);
  const segments: CaptionSegment[] = [];
  const timeRe = /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/;

  for (const block of blocks) {
    const lines = block.split("\n");
    const timeLine = lines.find((l) => timeRe.test(l));
    if (!timeLine) continue;
    const m = timeRe.exec(timeLine)!;
    const start = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
    const end = Number(m[5]) * 3600 + Number(m[6]) * 60 + Number(m[7]) + Number(m[8]) / 1000;
    const text = lines.slice(lines.indexOf(timeLine) + 1).join(" ").trim();
    if (text) segments.push({ start, end, text });
  }
  return segments;
}

/** Accepts either .vtt or .srt text and normalises it to segments. */
export function parseCaptionFile(text: string, filename: string): CaptionSegment[] {
  if (filename.toLowerCase().endsWith(".srt") || !text.trim().startsWith("WEBVTT")) {
    return srtToSegments(text);
  }
  // Minimal WEBVTT parser — same cue shape as .srt, just WEBVTT-style timestamps.
  const body = text.replace(/\r/g, "").replace(/^WEBVTT.*\n/, "");
  const blocks = body.trim().split(/\n\n+/);
  const segments: CaptionSegment[] = [];
  const timeRe = /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/;
  for (const block of blocks) {
    const lines = block.split("\n");
    const timeLine = lines.find((l) => timeRe.test(l));
    if (!timeLine) continue;
    const m = timeRe.exec(timeLine)!;
    const start = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
    const end = Number(m[5]) * 3600 + Number(m[6]) * 60 + Number(m[7]) + Number(m[8]) / 1000;
    const text2 = lines.slice(lines.indexOf(timeLine) + 1).join(" ").trim();
    if (text2) segments.push({ start, end, text: text2 });
  }
  return segments;
}
