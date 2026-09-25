import { execFile } from "child_process";
import { promisify } from "util";
import ffprobeStatic from "ffprobe-static";

const execFileAsync = promisify(execFile);

export interface ProbeResult {
  durationSeconds: number;
  width: number | null;
  height: number | null;
}

/**
 * Reads duration/dimensions straight off the uploaded file's URL — ffprobe
 * can read HTTP(S) input directly (including a presigned R2 GET URL or our
 * local dev route), so we never have to download the whole clip server-side
 * just to validate it. This is what actually enforces the duration cap
 * (see VIDEO_MAX_DURATION_SECONDS): client-side duration checks are a
 * courtesy, not a guarantee.
 */
export async function probeVideo(url: string): Promise<ProbeResult> {
  const { stdout } = await execFileAsync(ffprobeStatic.path, [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    url,
  ]);

  const data = JSON.parse(stdout);
  const videoStream = (
    data.streams as { codec_type: string; width?: number; height?: number; duration?: string }[]
  ).find((s) => s.codec_type === "video");
  const durationSeconds = Number(data.format?.duration ?? videoStream?.duration ?? 0) || 0;

  return {
    durationSeconds,
    width: videoStream?.width ?? null,
    height: videoStream?.height ?? null,
  };
}
