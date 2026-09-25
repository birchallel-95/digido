import { auth } from "@/lib/auth";
import { isCloudStorageConfigured, localUploadPath, writeLocalFile } from "@/lib/storage";
import fs from "fs/promises";

/**
 * Local-dev stand-in for R2. Only reachable when R2 env vars aren't set —
 * storage.ts hands out URLs under this path in that case, so this route
 * simply mirrors the R2 PUT/GET contract against the git-ignored uploads/
 * folder on disk. Never used once real R2 credentials are configured.
 */

export async function PUT(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (isCloudStorageConfigured) return new Response("Not found", { status: 404 });
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { key } = await params;
  const buffer = Buffer.from(await req.arrayBuffer());
  await writeLocalFile(key.join("/"), buffer);
  return new Response(null, { status: 200 });
}

export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (isCloudStorageConfigured) return new Response("Not found", { status: 404 });

  const { key } = await params;
  try {
    const filePath = localUploadPath(key.join("/"));
    const stat = await fs.stat(filePath);
    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentType = ext === "mov" ? "video/quicktime" : ext === "vtt" ? "text/vtt" : "video/mp4";

    // Video playback (scrubbing, some browsers' autoplay checks) relies on
    // Range support — the real R2 URLs this stands in for support it natively.
    const range = req.headers.get("range");
    if (range) {
      const match = /bytes=(\d+)-(\d+)?/.exec(range);
      const start = match ? Number(match[1]) : 0;
      const end = match && match[2] ? Number(match[2]) : stat.size - 1;
      const handle = await fs.open(filePath, "r");
      const buf = Buffer.alloc(end - start + 1);
      await handle.read(buf, 0, buf.length, start);
      await handle.close();
      return new Response(new Uint8Array(buf), {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(buf.length),
        },
      });
    }

    const data = await fs.readFile(filePath);
    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "Accept-Ranges": "bytes",
        "Content-Length": String(stat.size),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
