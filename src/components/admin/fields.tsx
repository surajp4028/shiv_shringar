"use client";
import { useRef, useState } from "react";
import { IconUpload, IconLoader2, IconX, IconLink, IconPhoto, IconCheck, IconPlus } from "@tabler/icons-react";
import { MediaLibraryModal } from "./media-library";
import { SITE_SECTIONS } from "@/lib/sections";
import { mediaKind, youtubeThumb } from "@/lib/media";
import type { Field } from "./schema";

export const inputCls =
  "w-full rounded-xl border border-white/10 bg-neutral-900 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20";

export async function uploadFiles(files: FileList | File[]): Promise<string[]> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("file", f));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.error ?? "Upload failed");
  return json.urls as string[];
}

export function Thumb({ src, className = "h-full w-full" }: { src: string; className?: string }) {
  const kind = mediaKind(src);
  if (!src) return <div className={`${className} bg-neutral-800`} />;
  if (kind === "file") return <video src={src} muted playsInline className={`${className} object-cover`} />;
  if (kind === "youtube") return <img src={youtubeThumb(src)} alt="" className={`${className} object-cover`} />;
  if (kind === "instagram")
    return <div className={`${className} flex items-center justify-center bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-[10px] font-bold text-white`}>IG</div>;
  return <img src={src} alt="" className={`${className} object-cover`} />;
}

function UploadButton({ accept, multiple, onUploaded }: { accept: string; multiple?: boolean; onUploaded: (urls: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          setBusy(true);
          setErr("");
          try {
            onUploaded(await uploadFiles(e.target.files));
          } catch (error) {
            setErr(error instanceof Error ? error.message : "Upload failed");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-60">
        {busy ? <IconLoader2 size={16} className="animate-spin" /> : <IconUpload size={16} />}
        {busy ? "Uploading…" : "Upload"}
      </button>
      {err && <p className="text-xs text-red-400">{err}</p>}
    </>
  );
}

function LibraryButton({ multiple, only, onPick }: { multiple?: boolean; only?: "image"; onPick: (urls: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-neutral-200 transition hover:bg-white/10">
        <IconPhoto size={16} /> Library
      </button>
      <MediaLibraryModal open={open} onClose={() => setOpen(false)} onPick={onPick} multiple={multiple} only={only} />
    </>
  );
}

/** Text box that suggests values already used elsewhere in the section. */
function SuggestInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const q = value.trim().toLowerCase();
  const matches = options.filter((o) => !q || o.toLowerCase().includes(q));
  const exact = options.some((o) => o.toLowerCase() === q);
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };
  return (
    <div className="relative">
      <input
        className={inputCls}
        value={value}
        placeholder={options.length ? "Choose or type a new one" : "Type a name"}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (!open || !matches.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % matches.length); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + matches.length) % matches.length); }
          if (e.key === "Enter") { e.preventDefault(); pick(matches[active] ?? value); }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && (matches.length > 0 || (q && !exact)) && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-neutral-900 p-1.5 shadow-2xl">
          {matches.map((o, i) => (
            <button
              key={o}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(o)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${i === active ? "bg-amber-500/15 text-amber-100" : "text-neutral-300 hover:bg-white/5"}`}
            >
              {o}
              {o.toLowerCase() === q && <IconCheck size={15} className="text-amber-400" />}
            </button>
          ))}
          {q && !exact && (
            <div className="flex items-center gap-2 border-t border-white/5 px-3 pt-2 pb-1 text-xs text-neutral-400">
              <IconPlus size={13} /> “{value.trim()}” will be saved as a new one
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FieldInput({
  field,
  value,
  onChange,
  suggestions,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  suggestions?: string[];
}) {
  switch (field.type) {
    case "textarea":
      return <textarea className={`${inputCls} min-h-28`} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "date":
      return <input type="date" className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <input type="number" step="any" className={inputCls} value={value === undefined || value === null ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />;
    case "bool":
      return (
        <button type="button" onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition ${value ? "bg-amber-500" : "bg-neutral-700"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-[22px]" : "left-0.5"}`} />
        </button>
      );
    case "sections": {
      const hidden = (value as string[]) ?? [];
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {SITE_SECTIONS.map((sec) => {
            const on = !hidden.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onChange(on ? [...hidden, sec.id] : hidden.filter((h) => h !== sec.id))}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${on ? "border-amber-500/30 bg-amber-500/10 text-amber-50" : "border-white/10 bg-white/[0.02] text-neutral-500"}`}
              >
                <span>{sec.label}</span>
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-amber-500" : "bg-neutral-700"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-[22px]" : "left-0.5"}`} />
                </span>
              </button>
            );
          })}
        </div>
      );
    }
    case "list":
      return (
        <textarea
          className={`${inputCls} min-h-28`}
          value={((value as string[]) ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        />
      );
    case "image":
    case "media": {
      const v = (value as string) ?? "";
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconLink size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
              <input className={`${inputCls} pl-9`} placeholder={field.type === "media" ? "Upload, or paste a YouTube / Instagram / .mp4 / image link" : "Upload, or paste an image link"} value={v} onChange={(e) => onChange(e.target.value)} />
            </div>
            <LibraryButton only={field.type === "image" ? "image" : undefined} onPick={(u) => onChange(u[0])} />
            <UploadButton accept={field.type === "image" ? "image/*" : "image/*,video/*"} onUploaded={(u) => onChange(u[0])} />
          </div>
          {v && (
            <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-white/10">
              <Thumb src={v} />
              <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"><IconX size={12} /></button>
            </div>
          )}
        </div>
      );
    }
    case "mediaList": {
      const list = (value as string[]) ?? [];
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="Paste a link and press Enter"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const v = e.currentTarget.value.trim();
                if (v) onChange([...list, v]);
                e.currentTarget.value = "";
              }}
            />
            <LibraryButton multiple onPick={(u) => onChange([...list, ...u.filter((x) => !list.includes(x))])} />
            <UploadButton accept="image/*,video/*" multiple onUploaded={(u) => onChange([...list, ...u])} />
          </div>
          {list.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {list.map((src, i) => (
                <div key={src + i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                  <Thumb src={src} />
                  <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"><IconX size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    default:
      if (field.suggest && suggestions)
        return <SuggestInput value={(value as string) ?? ""} onChange={onChange} options={suggestions} />;
      return <input className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}
