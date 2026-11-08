"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconSettings, IconCalendarEvent, IconVideo, IconFlower, IconCircles, IconRoute, IconPhoto, IconClock,
  IconMail, IconPlus, IconPencil, IconTrash, IconLoader2, IconLogout, IconExternalLink, IconDatabase, IconCheck, IconX,
} from "@tabler/icons-react";
import { sections, settingsFields, type Section } from "./schema";
import { FieldInput, Thumb } from "./fields";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

type Item = Record<string, unknown> & { id: string; createdAt: string };

const icons: Record<string, typeof IconSettings> = {
  settings: IconSettings, events: IconCalendarEvent, videos: IconVideo, shringar: IconFlower, highlights: IconCircles,
  trips: IconRoute, gallery: IconPhoto, schedule: IconClock, messages: IconMail,
};

async function api<T = Record<string, unknown>>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Logged out");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.error ?? "Request failed");
  return json as T;
}

function Toast({ msg, onDone }: { msg: { text: string; ok: boolean } | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  return (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={cn("fixed right-6 bottom-6 z-[200] flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-xl", msg.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white")}>
          {msg.ok ? <IconCheck size={16} /> : <IconX size={16} />} {msg.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SettingsEditor({ notify }: { notify: (t: string, ok?: boolean) => void }) {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api<{ settings: Settings }>("/api/admin/settings").then((r) => setS(r.settings)).catch((e) => notify(e.message, false));
  }, [notify]);
  if (!s) return <Loading />;
  const save = async () => {
    setSaving(true);
    try {
      const r = await api<{ settings: Settings }>("/api/admin/settings", { method: "PUT", body: JSON.stringify(s) });
      setS(r.settings);
      notify("Settings saved");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Save failed", false);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-8">
      {settingsFields.map((g) => (
        <div key={g.group} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
          <h3 className="mb-5 font-display text-xl font-semibold text-amber-100">{g.group}</h3>
          <div className="grid gap-5 md:grid-cols-2">
            {g.fields.map((f) => (
              <label key={f.key} className={cn("block space-y-2", ["textarea", "list", "mediaList", "media"].includes(f.type) && "md:col-span-2")}>
                <span className="text-sm text-neutral-300">{f.label}</span>
                <FieldInput field={f} value={s[f.key]} onChange={(v) => setS({ ...s, [f.key]: v })} />
                {f.hint && <span className="block text-xs text-neutral-500">{f.hint}</span>}
              </label>
            ))}
          </div>
        </div>
      ))}
      <SaveBar saving={saving} onSave={save} label="Save settings" />
    </div>
  );
}

function SaveBar({ saving, onSave, label, onCancel }: { saving: boolean; onSave: () => void; label: string; onCancel?: () => void }) {
  return (
    <div className="sticky bottom-0 -mx-1 flex justify-end gap-3 bg-gradient-to-t from-black via-black/90 to-transparent px-1 pt-6 pb-2">
      {onCancel && <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-neutral-300 hover:bg-white/5">Cancel</button>}
      <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-amber-300 to-orange-500 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-60">
        {saving && <IconLoader2 size={16} className="animate-spin" />} {label}
      </button>
    </div>
  );
}

function Loading() {
  return <div className="flex h-60 items-center justify-center text-neutral-500"><IconLoader2 className="animate-spin" /></div>;
}

function blank(section: Section) {
  const o: Record<string, unknown> = {};
  for (const f of section.fields) o[f.key] = f.type === "bool" ? false : f.type === "number" ? 0 : f.type === "list" || f.type === "mediaList" ? [] : "";
  if (o.date === "") o.date = new Date().toISOString().slice(0, 10);
  return o;
}

function CollectionEditor({ section, notify }: { section: Section; notify: (t: string, ok?: boolean) => void }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api<{ items: Item[] }>(`/api/admin/${section.id}`).then((r) => setItems(r.items)).catch((e) => notify(e.message, false));
  }, [section.id, notify]);
  // The editor is keyed by section, so each tab mounts fresh.
  useEffect(load, [load]);

  const save = async () => {
    if (!editing) return;
    const missing = section.fields.find((f) => f.required && !editing[f.key]);
    if (missing) return notify(`${missing.label} is required`, false);
    setSaving(true);
    try {
      const { id, ...data } = editing as Item;
      if (id) await api(`/api/admin/${section.id}/${id}`, { method: "PUT", body: JSON.stringify(data) });
      else await api(`/api/admin/${section.id}`, { method: "POST", body: JSON.stringify(data) });
      notify(id ? "Updated" : "Published on the website");
      setEditing(null);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Save failed", false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Item) => {
    if (!confirm(`Delete “${String(item[section.titleKey] || section.singular)}”? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/${section.id}/${item.id}`, { method: "DELETE" });
      notify("Deleted");
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Delete failed", false);
    }
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
        <h3 className="mb-6 font-display text-2xl font-semibold text-amber-100">{editing.id ? `Edit ${section.singular}` : `New ${section.singular}`}</h3>
        <div className="grid gap-5 md:grid-cols-2">
          {section.fields.map((f) => (
            <label key={f.key} className={cn("block space-y-2", ["textarea", "list", "mediaList", "media", "image"].includes(f.type) && "md:col-span-2")}>
              <span className="text-sm text-neutral-300">{f.label}{f.required && <span className="text-amber-500"> *</span>}</span>
              <FieldInput field={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
              {f.hint && <span className="block text-xs text-neutral-500">{f.hint}</span>}
            </label>
          ))}
        </div>
        <SaveBar saving={saving} onSave={save} label={editing.id ? "Save changes" : "Publish"} onCancel={() => setEditing(null)} />
      </div>
    );
  }

  return (
    <div>
      {!section.readOnly && (
        <button onClick={() => setEditing(blank(section))} className="mb-6 flex items-center gap-2 rounded-xl bg-gradient-to-b from-amber-300 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black">
          <IconPlus size={18} /> Add {section.singular}
        </button>
      )}
      {!items ? (
        <Loading />
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-neutral-500">Nothing here yet.</p>
      ) : section.readOnly ? (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-amber-100">{String(m.name)}</p>
                <p className="text-xs text-neutral-500">{new Date(m.createdAt).toLocaleString("en-IN")}</p>
              </div>
              <p className="mt-1 text-sm text-neutral-400">
                {m.email ? <a className="hover:text-amber-300" href={`mailto:${m.email}`}>{String(m.email)}</a> : null}
                {m.email && m.phone ? " • " : ""}
                {m.phone ? <a className="hover:text-amber-300" href={`tel:${m.phone}`}>{String(m.phone)}</a> : null}
              </p>
              {(m.type || m.preferredDate) ? (
                <p className="mt-2 flex flex-wrap gap-2 text-xs">
                  {m.type ? <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-200">{String(m.type)}</span> : null}
                  {m.preferredDate ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-neutral-300">Date: {String(m.preferredDate)}</span> : null}
                </p>
              ) : null}
              <p className="mt-3 text-sm whitespace-pre-wrap text-neutral-300">{String(m.message)}</p>
              <button onClick={() => remove(m)} className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:underline"><IconTrash size={14} /> Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((it) => (
            <div key={it.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
              {section.imageKey && (
                <div className="aspect-video overflow-hidden bg-neutral-900">
                  <Thumb src={String(it[section.imageKey] || (section.id === "videos" ? it.url : "") || "")} />
                </div>
              )}
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-amber-50">{String(it[section.titleKey] ?? "Untitled")}</p>
                  {section.subtitleKey && <p className="truncate text-xs text-neutral-500">{String(it[section.subtitleKey] ?? "")}</p>}
                  {it.featured === true && <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">Featured</span>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => setEditing({ ...blank(section), ...it })} aria-label="Edit" className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-amber-300"><IconPencil size={17} /></button>
                  <button onClick={() => remove(it)} aria-label="Delete" className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-red-400"><IconTrash size={17} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminApp({ mode }: { mode: string }) {
  const [tab, setTab] = useState<string>("settings");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const notify = useCallback((text: string, ok = true) => setMsg({ text, ok }), []);
  const section = sections.find((s) => s.id === tab);
  const tabs = [{ id: "settings", label: "Settings" }, ...sections.map((s) => ({ id: s.id, label: s.label }))];

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-black text-white lg:flex">
      <aside className="border-b border-white/10 bg-neutral-950 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-3 p-5">
          <img src="/brand/logo.png" alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-gold font-display text-lg font-semibold">Shiv Shringar</p>
            <p className="text-[10px] tracking-widest text-neutral-500 uppercase">Admin</p>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {tabs.map((t) => {
            const Icon = icons[t.id];
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", tab === t.id ? "bg-amber-500/15 text-amber-200" : "text-neutral-400 hover:bg-white/5 hover:text-white")}>
                <Icon size={18} /> {t.label}
              </button>
            );
          })}
        </nav>
        <div className="hidden space-y-1 px-3 lg:absolute lg:inset-x-0 lg:bottom-4 lg:block">
          <p className="flex items-center gap-2 px-3 pb-2 text-xs text-neutral-500"><IconDatabase size={14} /> {mode === "mysql" ? "Connected to MySQL" : "Using local JSON (MySQL offline)"}</p>
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-400 hover:bg-white/5 hover:text-white"><IconExternalLink size={18} /> View website</a>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-400 hover:bg-white/5 hover:text-red-400"><IconLogout size={18} /> Log out</button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-gold font-display text-4xl font-semibold">{section?.label ?? "Settings"}</h1>
              <p className="mt-1 text-sm text-neutral-500">{section?.description ?? "WhatsApp number, email, hero video, timings and mandir details."}</p>
            </div>
            <div className="flex gap-2 lg:hidden">
              <a href="/" target="_blank" className="rounded-xl border border-white/10 p-2.5 text-neutral-400"><IconExternalLink size={18} /></a>
              <button onClick={logout} className="rounded-xl border border-white/10 p-2.5 text-neutral-400"><IconLogout size={18} /></button>
            </div>
          </div>
          {section ? <CollectionEditor key={section.id} section={section} notify={notify} /> : <SettingsEditor notify={notify} />}
        </div>
      </main>
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
