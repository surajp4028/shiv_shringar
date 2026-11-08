import { isAdmin, unauthorized } from "@/lib/auth";
import { deleteItem, updateItem } from "@/lib/store";
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
  const ok = await deleteItem(collection, id);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
