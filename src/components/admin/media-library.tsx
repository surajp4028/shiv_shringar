"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconX, IconCheck, IconTrash, IconLoader2, IconUpload, IconPlayerPlayFilled, IconSearch, IconPhoto } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type MediaFile = {
  url: string;
  name: string;
  kind: "image" | "video";
  size: number;
  modified: string;
  uploaded: boolean;
  uses: number;
};

const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

async function uploadFiles(files: FileList | File[]): Promise<string[]> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("file", f));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.error ?? "Upload failed");
  return json.urls as string[];
}

/**
 * Browse every photo/video on the site. In "pick" mode (onPick set) you can
 * choose one or many; in manage mode you can delete files from the server.
 */
export function MediaBrowser({
  onPick,
  multiple = false,
  only,
  className,
}: {
  onPick?: (urls: string[]) => void;
  multiple?: boolean;
  only?: "image";
  className?: string;
}) {
  const [items, setItems] = useState<MediaFile[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"all" | "image" | "video">(only ?? "all");
  const [source, setSource] = useState<"all" | "uploaded">("all");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/media");
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) setError(json.error ?? "Could not load files");
    else setItems(json.items);
  }, []);
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        if (json.ok) setItems(json.items);
        else setError(json.error ?? "Could not load files");
      })
      .catch(() => alive && setError("Could not load files"));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(
    () =>
      (items ?? []).filter(
        (f) =>
          (tab === "all" || f.kind === tab) &&
          (source === "all" || f.uploaded) &&
          (!q || f.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [items, tab, source, q],
  );

  const toggle = (url: string) => {
    if (!onPick) return;
    if (!multiple) return onPick([url]);
    setPicked((p) => (p.includes(url) ? p.filter((u) => u !== url) : [...p, url]));
  };

  const remove = async (f: MediaFile) => {
    const warn =
      f.uses > 0
        ? `“${f.name}” is still used in ${f.uses} place${f.uses > 1 ? "s" : ""} on the website. Deleting it will leave an empty image there.\n\nDelete it permanently from the server?`
        : `Delete “${f.name}” permanently from the server? This cannot be undone.`;
    if (!confirm(warn)) return;
    setBusy(f.url);
    const res = await fetch(`/api/admin/media?url=${encodeURIComponent(f.url)}`, { method: "DELETE" });
    setBusy("");
    if (res.ok) {
      setItems((list) => list?.filter((x) => x.url !== f.url) ?? null);
      setPicked((p) => p.filter((u) => u !== f.url));
    } else alert("Could not delete this file.");
  };

  const upload = async (files: FileList) => {
    setBusy("upload");
    try {
      const urls = await uploadFiles(files);
      await load();
      if (onPick && multiple) setPicked((p) => [...p, ...urls]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex flex-wrap items-center gap-2 pb-4">
        {!only &&
          (["all", "image", "video"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3.5 py-1.5 text-sm", tab === t ? "bg-amber-500 text-black" : "bg-white/5 text-neutral-300 hover:bg-white/10")}>
              {t === "all" ? "All" : t === "image" ? "Photos" : "Videos"}
            </button>
          ))}
        <button onClick={() => setSource(source === "all" ? "uploaded" : "all")} className={cn("rounded-full px-3.5 py-1.5 text-sm", source === "uploaded" ? "bg-amber-500 text-black" : "bg-white/5 text-neutral-300 hover:bg-white/10")}>
          My uploads only
        </button>
        <div className="relative ml-auto">
          <IconSearch size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search file name" className="w-44 rounded-full border border-white/10 bg-neutral-900 py-1.5 pr-3 pl-8 text-sm text-white outline-none focus:border-amber-500/60 sm:w-56" />
        </div>
        <input ref={fileRef} type="file" multiple accept={only === "image" ? "image/*" : "image/*,video/*"} hidden onChange={(e) => e.target.files?.length && upload(e.target.files)} />
        <button onClick={() => fileRef.current?.click()} disabled={busy === "upload"} className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-sm text-amber-200 hover:bg-amber-500/20 disabled:opacity-60">
          {busy === "upload" ? <IconLoader2 size={15} className="animate-spin" /> : <IconUpload size={15} />} Upload new
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!items ? (
        <div className="flex h-60 items-center justify-center text-neutral-500"><IconLoader2 className="animate-spin" /></div>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-neutral-500">No files here yet.</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-3 content-start gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {shown.map((f) => {
            const sel = picked.includes(f.url);
            return (
              <div key={f.url} className={cn("group relative overflow-hidden rounded-xl border-2 bg-neutral-900", sel ? "border-amber-400" : "border-transparent")}>
                <button type="button" onClick={() => toggle(f.url)} className={cn("block aspect-square w-full", !onPick && "cursor-default")}>
                  {f.kind === "video" ? (
                    <span className="relative block h-full w-full">
                      <video src={f.url + "#t=1"} muted preload="metadata" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-black/60 p-2 text-white"><IconPlayerPlayFilled size={14} /></span></span>
                    </span>
                  ) : (
                    <img src={`/_next/image?url=${encodeURIComponent(f.url)}&w=256&q=75`} alt={f.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  )}
                </button>
                {sel && <span className="absolute top-1.5 left-1.5 rounded-full bg-amber-400 p-1 text-black"><IconCheck size={12} /></span>}
                <button
                  type="button"
                  onClick={() => remove(f)}
                  aria-label="Delete file"
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  {busy === f.url ? <IconLoader2 size={13} className="animate-spin" /> : <IconTrash size={13} />}
                </button>
                <div className="flex items-center justify-between gap-1 px-2 py-1.5 text-[10px] text-neutral-400">
                  <span className="truncate">{fmtSize(f.size)}</span>
                  <span className={cn("shrink-0 rounded px-1", f.uses ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5")}>{f.uses ? `used ${f.uses}×` : "unused"}</span>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {onPick && multiple && (
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <span className="text-sm text-neutral-400">{picked.length} selected</span>
          <button disabled={!picked.length} onClick={() => onPick(picked)} className="rounded-xl bg-gradient-to-b from-amber-300 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50">
            Add selected
          </button>
        </div>
      )}
    </div>
  );
}

/** Modal wrapper used by the photo/video fields. */
export function MediaLibraryModal({
  open,
  onClose,
  onPick,
  multiple,
  only,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (urls: string[]) => void;
  multiple?: boolean;
  only?: "image";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-[88vh] w-full max-w-5xl flex-col rounded-3xl border border-white/10 bg-neutral-950 p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-amber-100"><IconPhoto size={22} /> Media library</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full bg-white/5 p-2 text-neutral-300 hover:bg-white/10"><IconX size={18} /></button>
        </div>
        <MediaBrowser
          className="min-h-0 flex-1"
          multiple={multiple}
          only={only}
          onPick={(urls) => {
            onPick(urls);
            onClose();
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
