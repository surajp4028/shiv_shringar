import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

const PUBLIC = path.join(process.cwd(), "public");
const UPLOADS = path.join(PUBLIC, "uploads");
const MEDIA = path.join(PUBLIC, "media");

const IMAGE = /\.(jpe?g|png|webp|gif|avif)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

export type MediaFile = {
  url: string;
  name: string;
  kind: "image" | "video";
  size: number;
  modified: string;
  /** Files you uploaded from /admin (vs. photos that came with the site). */
  uploaded: boolean;
};

/** Maps a site URL to its file on disk, or null if it isn't a managed media file. */
export function urlToPath(url: string): string | null {
  let file: string | null = null;
  if (url.startsWith("/files/")) file = path.join(UPLOADS, url.slice("/files/".length));
  else if (url.startsWith("/media/")) file = path.join(MEDIA, url.slice("/media/".length));
  if (!file) return null;
  const resolved = path.resolve(file);
  const ok = resolved.startsWith(UPLOADS + path.sep) || resolved.startsWith(MEDIA + path.sep);
  return ok && (IMAGE.test(resolved) || VIDEO.test(resolved)) ? resolved : null;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const out: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (IMAGE.test(e.name) || VIDEO.test(e.name)) out.push(p);
  }
  return out;
}

export async function listMedia(): Promise<MediaFile[]> {
  const files = [...(await walk(UPLOADS)), ...(await walk(MEDIA))];
  const list = await Promise.all(
    files.map(async (p) => {
      const st = await fs.stat(p);
      const uploaded = p.startsWith(UPLOADS + path.sep);
      const rel = path.relative(uploaded ? UPLOADS : MEDIA, p).split(path.sep).join("/");
      return {
        url: (uploaded ? "/files/" : "/media/") + rel,
        name: path.basename(p),
        kind: VIDEO.test(p) ? "video" : "image",
        size: st.size,
        modified: st.mtime.toISOString(),
        uploaded,
      } satisfies MediaFile;
    }),
  );
  return list.sort((a, b) => b.modified.localeCompare(a.modified));
}

export async function deleteMediaFile(url: string): Promise<boolean> {
  const p = urlToPath(url);
  if (!p) return false;
  try {
    await fs.unlink(p);
    return true;
  } catch {
    return false;
  }
}

/** All managed media URLs mentioned inside a JSON value. */
export function mediaUrlsIn(value: unknown): string[] {
  const text = JSON.stringify(value ?? "");
  return [...new Set(text.match(/\/(?:files|media)\/[\w./-]+\.(?:jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v)/gi) ?? [])];
}
