import { isAdmin, unauthorized } from "@/lib/auth";
import { contentText, deleteItem, listItems, updateItem } from "@/lib/store";
import { deleteMediaFile, mediaUrlsIn } from "@/lib/media-files";
import { COLLECTIONS, type CollectionName } from "@/lib/types";

const isCollection = (c: string): c is CollectionName => (COLLECTIONS as string[]).includes(c);

export async function PUT(request: Request, ctx: RouteContext<"/api/admin/[collection]/[id]">) {
  if (!(await isAdmin())) return unauthorized();
  const { collection, id } = await ctx.params;
  if (!isCollection(collection)) return Response.json({ ok: false, error: "Unknown section" }, { status: 404 });
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return Response.json({ ok: false, error: "Invalid data" }, { status: 400 });
  const item = await updateItem(collection, id, data);
  if (!item) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  return Response.json({ ok: true, item });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/[collection]/[id]">) {
  if (!(await isAdmin())) return unauthorized();
  const { collection, id } = await ctx.params;
  if (!isCollection(collection)) return Response.json({ ok: false, error: "Unknown section" }, { status: 404 });
  const item = (await listItems(collection)).find((x) => x.id === id);
  const ok = await deleteItem(collection, id);
  if (!ok) return Response.json({ ok }, { status: 404 });

  // Remove this item's uploaded files from public/uploads when nothing else uses them.
  const removed: string[] = [];
  const stillUsed = await contentText();
  for (const url of mediaUrlsIn(item).filter((u) => u.startsWith("/files/"))) {
    if (!stillUsed.includes(url) && (await deleteMediaFile(url))) removed.push(url);
  }
  return Response.json({ ok, removed });
}
