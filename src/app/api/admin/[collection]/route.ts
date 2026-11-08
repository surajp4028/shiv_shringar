import { isAdmin, unauthorized } from "@/lib/auth";
import { createItem, listItems } from "@/lib/store";
import { COLLECTIONS, type CollectionName } from "@/lib/types";

const isCollection = (c: string): c is CollectionName => (COLLECTIONS as string[]).includes(c);

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/[collection]">) {
  if (!(await isAdmin())) return unauthorized();
  const { collection } = await ctx.params;
  if (!isCollection(collection)) return Response.json({ ok: false, error: "Unknown section" }, { status: 404 });
  return Response.json({ ok: true, items: await listItems(collection) });
}

export async function POST(request: Request, ctx: RouteContext<"/api/admin/[collection]">) {
  if (!(await isAdmin())) return unauthorized();
  const { collection } = await ctx.params;
  if (!isCollection(collection)) return Response.json({ ok: false, error: "Unknown section" }, { status: 404 });
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return Response.json({ ok: false, error: "Invalid data" }, { status: 400 });
  delete data.id;
  delete data.createdAt;
  return Response.json({ ok: true, item: await createItem(collection, data) });
}
