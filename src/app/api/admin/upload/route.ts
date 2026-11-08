import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isAdmin, unauthorized } from "@/lib/auth";

// Uploaded photos/videos are saved under public/uploads/{images|videos}/ and
// served by app/files/[...path] (so they also work after `next build`).
const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const form = await request.formData().catch(() => null);
  const files = form?.getAll("file").filter((f): f is File => f instanceof File) ?? [];
  if (files.length === 0) return Response.json({ ok: false, error: "No file selected" }, { status: 400 });

  const urls: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    const kind = IMAGE.has(ext) ? "images" : VIDEO.has(ext) ? "videos" : null;
    if (!kind) return Response.json({ ok: false, error: `${file.name}: unsupported file type` }, { status: 415 });
    if (file.size > MAX_BYTES) return Response.json({ ok: false, error: `${file.name} is larger than 200 MB` }, { status: 413 });

    const base = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "file";
    const name = `${Date.now()}-${base}-${randomUUID().slice(0, 6)}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", kind);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/files/${kind}/${name}`);
  }
  return Response.json({ ok: true, urls, url: urls[0] });
}
