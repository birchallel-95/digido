import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Object storage for video files. Targets Cloudflare R2 (S3-compatible) in
 * production. When R2 env vars aren't set — e.g. local development before a
 * bucket exists — everything falls back to writing under a git-ignored
 * `uploads/` folder on disk and serving it through /api/uploads/[...key],
 * mirroring how this app already uses SQLite as a zero-config stand-in for
 * Postgres (see prisma/schema.prisma). Swapping in real R2 credentials later
 * is just setting env vars — no code change.
 */

const r2Configured = Boolean(
  process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME
);

export const isCloudStorageConfigured = r2Configured;

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads");

const s3 = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const BUCKET = process.env.R2_BUCKET_NAME;

export function newStorageKey(originalFilename: string): string {
  const ext = path.extname(originalFilename) || ".mp4";
  return `videos/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;
}

// ffprobe/ffmpeg run as separate child processes, not the browser, so a local
// dev URL must be absolute — relative paths only resolve inside a browser tab.
const LOCAL_BASE_URL = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** A short-lived URL the browser can PUT the raw file bytes to directly. */
export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  if (s3 && BUCKET) {
    const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
    return getSignedUrl(s3, cmd, { expiresIn: 600 });
  }
  // Local fallback: PUT straight to our own route handler, which writes to disk.
  return `${LOCAL_BASE_URL}/api/uploads/${encodeURIComponent(key)}`;
}

/** A URL the <video> element (or ffprobe) can read the file from. */
export async function getPlaybackUrl(key: string): Promise<string> {
  if (s3 && BUCKET) {
    if (process.env.R2_PUBLIC_URL) return `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, cmd, { expiresIn: 3600 });
  }
  return `${LOCAL_BASE_URL}/api/uploads/${encodeURIComponent(key)}`;
}

export async function deleteObject(key: string): Promise<void> {
  if (s3 && BUCKET) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => null);
    return;
  }
  await fs.rm(path.join(LOCAL_UPLOADS_DIR, key), { force: true }).catch(() => null);
}

// --- Local-disk adapter helpers, used only by src/app/api/uploads/[...key] ---

export function localUploadPath(key: string): string {
  const resolved = path.normalize(path.join(LOCAL_UPLOADS_DIR, key));
  if (!resolved.startsWith(LOCAL_UPLOADS_DIR)) throw new Error("Invalid storage key");
  return resolved;
}

export async function writeLocalFile(key: string, data: Buffer): Promise<void> {
  const filePath = localUploadPath(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, data);
}
