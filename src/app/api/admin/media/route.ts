import { isAdmin, unauthorized } from "@/lib/auth";
import { contentText } from "@/lib/store";
import { deleteMediaFile, listMedia, urlToPath } from "@/lib/media-files";

// GET: every photo/video on the site with how many places use it.
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const [files, text] = await Promise.all([listMedia(), contentText()]);
  const items = files.map((f) => ({ ...f, uses: text.split(f.url).length - 1 }));
  return Response.json({ ok: true, items });
}

// DELETE ?url=/files/images/x.jpg — removes the file from disk.
export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const url = new URL(request.url).searchParams.get("url") ?? "";
  if (!urlToPath(url)) return Response.json({ ok: false, error: "Not a media file" }, { status: 400 });
  const ok = await deleteMediaFile(url);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
