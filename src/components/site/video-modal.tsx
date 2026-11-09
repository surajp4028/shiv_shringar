"use client";
import { IconBrandInstagram } from "@tabler/icons-react";
import { Modal } from "./modal";
import { embedUrl, mediaKind } from "@/lib/media";
import { SmartVideo } from "./smart-video";

/**
 * Plays any video link on top of the page — the visitor never leaves the site.
 * MP4 → our own player, YouTube → embedded player, Instagram → Instagram's
 * embedded player (with a small fallback link for posts Instagram won't embed).
 */
export function VideoModal({ url, title, onClose }: { url: string | null; title?: string; onClose: () => void }) {
  const kind = url ? mediaKind(url) : null;
  return (
    <Modal open={!!url} onClose={onClose} className={kind === "file" || kind === "youtube" ? "max-w-4xl" : "max-w-[440px]"}>
      {url && kind === "file" && (
        <SmartVideo src={url} autoPlay controls playsInline className="max-h-[85vh] w-full rounded-2xl bg-black" />
      )}
      {url && kind === "youtube" && (
        <iframe
          src={embedUrl(url, { autoplay: true, muted: false })}
          title={title ?? "Video"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="aspect-video w-full rounded-2xl bg-black"
        />
      )}
      {url && kind !== "file" && kind !== "youtube" && (
        <div className="overflow-hidden rounded-2xl bg-white">
          <iframe
            src={embedUrl(url)}
            title={title ?? "Video"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-[78vh] max-h-[760px] w-full bg-white"
          />
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 border-t border-stone-100 py-2.5 text-xs text-stone-500 hover:text-pink-600">
            <IconBrandInstagram size={14} /> Video not loading? Open on Instagram
          </a>
        </div>
      )}
    </Modal>
  );
}
