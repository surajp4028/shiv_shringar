"use client";
import { useEffect, useRef, useState } from "react";
import { IconBrandInstagram, IconPlayerPlayFilled, IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { embedUrl, mediaKind, youtubeThumb } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Plays any admin-provided video link:
 *  - uploaded / direct .mp4 → native <video>, autoplays muted while on screen, unmute toggle
 *  - YouTube → embedded player, autoplays muted, unmute toggle via the iframe API
 *  - Instagram → poster + play; Instagram embeds can't autoplay, so it opens the reel
 */
export function VideoPlayer({
  url,
  poster,
  title,
  className,
  onOpen,
}: {
  url: string;
  poster?: string;
  title?: string;
  className?: string;
  onOpen?: () => void;
}) {
  const kind = mediaKind(url);
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(false);

  // Only play while on screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (visible) v.play().catch(() => {});
    else v.pause();
  }, [visible]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (video.current) video.current.muted = next;
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: [] }),
      "*",
    );
  };

  const muteBtn = (
    <button
      onClick={toggleMute}
      aria-label={muted ? "Unmute" : "Mute"}
      className="absolute right-3 bottom-3 z-10 rounded-full border border-white/20 bg-black/60 p-2.5 text-white transition hover:scale-105 hover:bg-black/80"
    >
      {muted ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
    </button>
  );

  return (
    <div ref={wrap} className={cn("relative overflow-hidden bg-neutral-900", className)}>
      {kind === "file" && (
        <>
          <video ref={video} src={url} poster={poster || undefined} muted loop playsInline preload="metadata" className={`h-full w-full object-cover${onOpen ? " cursor-pointer" : ""}`} onClick={onOpen} />
          {muteBtn}
        </>
      )}

      {kind === "youtube" && (
        <>
          {visible ? (
            <iframe
              ref={frame}
              src={embedUrl(url)}
              title={title ?? "Video"}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              className="h-full w-full"
            />
          ) : (
            <img src={poster || youtubeThumb(url)} alt={title ?? ""} className="h-full w-full object-cover" />
          )}
          {visible && muteBtn}
        </>
      )}

      {(kind === "instagram" || kind === "unknown" || kind === "image") && (
        <button onClick={onOpen} className="group/play relative block h-full w-full text-left">
          {poster || kind === "image" ? (
            <img src={poster || url} alt={title ?? ""} className="h-full w-full object-cover transition duration-700 group-hover/play:scale-105" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-900/40 to-black" />
          )}
          <span className="absolute inset-0 bg-black/20 transition group-hover/play:bg-black/35" />
          <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white shadow-lg transition group-hover/play:scale-110">
            <IconPlayerPlayFilled size={22} />
          </span>
          {kind === "instagram" && (
            <span className="absolute top-3 right-3 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1.5 text-white">
              <IconBrandInstagram size={14} />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
