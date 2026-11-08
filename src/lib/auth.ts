import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ss_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Admin credentials live in .env.local (defaults match the samiti's account).
const adminEmail = () => (process.env.ADMIN_EMAIL ?? "surajp4028@gmail.com").toLowerCase();
const adminPassword = () => process.env.ADMIN_PASSWORD ?? "Password555@";
const secret = () => process.env.AUTH_SECRET ?? "change-me-shiv-shringar";

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkCredentials(email: string, password: string) {
  return safeEqual(email.trim().toLowerCase(), adminEmail()) && safeEqual(password, adminPassword());
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ e: adminEmail(), x: Date.now() + MAX_AGE * 1000 })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    const { x } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof x === "number" && x > Date.now();
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export function unauthorized() {
  return Response.json({ ok: false, error: "Please log in again." }, { status: 401 });
}
