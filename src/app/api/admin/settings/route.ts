import { isAdmin, unauthorized } from "@/lib/auth";
import { getSettings, storeMode, updateSettings } from "@/lib/store";
import type { Settings } from "@/lib/types";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const settings = await getSettings();
  return Response.json({ ok: true, settings, mode: storeMode() });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const patch = (await request.json().catch(() => null)) as Partial<Settings> | null;
  if (!patch || typeof patch !== "object") {
    return Response.json({ ok: false, error: "Invalid data" }, { status: 400 });
  }
  const settings = await updateSettings(patch);
  return Response.json({ ok: true, settings });
}
