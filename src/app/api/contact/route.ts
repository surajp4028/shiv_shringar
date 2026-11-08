import { Resend } from "resend";
import { createItem, getSettings } from "@/lib/store";
import { SEVA_TYPES } from "@/lib/seva";

type Payload = { name?: string; email?: string; phone?: string; message?: string; type?: string; preferredDate?: string };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function emailHtml(name: string, email: string, phone: string, message: string, type: string, preferredDate: string) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#a1a1aa;width:90px">${label}</td><td style="padding:6px 0;color:#fafafa">${value || "—"}</td></tr>`;
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;padding:28px;background:#0a0a0a;border:1px solid #3f2d0f;border-radius:18px">
  <p style="margin:0;color:#d4a24c;letter-spacing:3px;font-size:12px">🔱 HAR HAR MAHADEV</p>
  <h2 style="margin:8px 0 4px;color:#f5d68a">New message — Shiv Shringar Sewa Samiti</h2>
  <p style="margin:0 0 16px;color:#a1a1aa;font-family:Arial,sans-serif;font-size:13px">A devotee filled the contact form on the website.</p>
  <table style="border-collapse:collapse;font-size:14px;font-family:Arial,sans-serif">
    ${row("Name", esc(name))}
    ${row("Email", email ? `<a style="color:#f5d68a" href="mailto:${esc(email)}">${esc(email)}</a>` : "")}
    ${row("Phone", phone ? `<a style="color:#f5d68a" href="tel:${esc(phone)}">${esc(phone)}</a>` : "")}
    ${type ? row("Request", esc(type)) : ""}
    ${preferredDate ? row("Date", esc(preferredDate)) : ""}
  </table>
  <div style="margin-top:16px;padding:16px;background:#171717;border-radius:12px;color:#fafafa;white-space:pre-wrap;font-size:14px;line-height:1.6;font-family:Arial,sans-serif">${esc(message)}</div>
</div>`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Payload | null;
  if (!body) return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const type = SEVA_TYPES.includes(body.type ?? "") ? (body.type as string) : "";
  const preferredDate = /^\d{4}-\d{2}-\d{2}$/.test(body.preferredDate ?? "") ? (body.preferredDate as string) : "";

  if (name.length < 2 || message.length < 5 || (!email && !phone) || (email && !isEmail(email))) {
    return Response.json(
      { ok: false, error: "Please enter your name, an email or phone number, and a message." },
      { status: 422 },
    );
  }
  if (name.length > 100 || phone.length > 20 || message.length > 5000) {
    return Response.json({ ok: false, error: "That message is too long." }, { status: 422 });
  }

  // Keep a copy in the admin panel even if email delivery fails.
  try {
    await createItem("messages", { name, email, phone, message, type, preferredDate });
  } catch (err) {
    console.error("Contact form: could not save message", err);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const settings = await getSettings().catch(() => null);
  // The admin-editable email wins; .env is the fallback.
  const to = settings?.email || process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
    return Response.json({ ok: true, emailed: false });
  }

  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "Shiv Shringar Sewa Samiti <onboarding@resend.dev>",
    to,
    replyTo: email || undefined,
    subject: type ? `🔱 Seva request: ${type} — ${name}` : `🔱 New message from ${name} — Shiv Shringar`,
    text: `From: ${name}\nEmail: ${email || "-"}\nPhone: ${phone || "-"}${type ? `\nRequest: ${type}` : ""}${preferredDate ? `\nDate: ${preferredDate}` : ""}\n\n${message}`,
    html: emailHtml(name, email, phone, message, type, preferredDate),
  });

  if (error) {
    console.error("Contact form: Resend error", error.name, error.message);
    // The message is saved in /admin, so the devotee still gets a success.
    return Response.json({ ok: true, emailed: false });
  }
  return Response.json({ ok: true, emailed: true });
}
