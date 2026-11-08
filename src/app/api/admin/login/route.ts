import { checkCredentials, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!checkCredentials(body.email ?? "", body.password ?? "")) {
    return Response.json({ ok: false, error: "Wrong email or password." }, { status: 401 });
  }
  (await cookies()).set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return Response.json({ ok: true });
}
