// Helpers for the different kinds of media links the admin can paste.

export type MediaKind = "file" | "youtube" | "instagram" | "image" | "unknown";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
  return m?.[1] ?? null;
}

export function instagramCode(url: string) {
  const m = url.match(/instagram\.com\/(?:[\w.]+\/)?(?:reel|p|tv)\/([\w-]+)/);
  return m?.[1] ?? null;
}

/** Google Drive file id from a share link (/file/d/ID/…, open?id=ID, uc?id=ID). */
export function driveId(url: string) {
  if (!/drive\.google\.com|docs\.google\.com/.test(url)) return null;
  const m = url.match(/\/file\/d\/([\w-]{20,})/) ?? url.match(/[?&]id=([\w-]{20,})/);
  return m?.[1] ?? null;
}

/** Preview image of a public Drive video. */
export const driveThumb = (url: string) => {
  const id = driveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w720` : "";
};

export function mediaKind(url: string): MediaKind {
  if (!url) return "unknown";
  if (youtubeId(url)) return "youtube";
  // Public Google Drive videos stream straight into our own player.
  if (driveId(url)) return "file";
  if (instagramCode(url)) return "instagram";
  if (VIDEO_EXT.test(url) || url.startsWith("/files/videos/")) return "file";
  if (IMAGE_EXT.test(url) || url.startsWith("/files/images/")) return "image";
  return "unknown";
}

export const isVideo = (url: string) => mediaKind(url) === "file";

/** The address a <video> tag should load: Drive share links become Drive's direct stream. */
export function videoSrc(url: string) {
  const id = driveId(url);
  return id ? `https://drive.usercontent.google.com/download?id=${id}&export=download` : url;
}

export function embedUrl(url: string, { autoplay = true, muted = true } = {}) {
  const yt = youtubeId(url);
  if (yt) {
    const p = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      loop: "1",
      playlist: yt,
      playsinline: "1",
      controls: "1",
      rel: "0",
      modestbranding: "1",
      enablejsapi: "1",
    });
    return `https://www.youtube-nocookie.com/embed/${yt}?${p}`;
  }
  const ig = instagramCode(url);
  if (ig) return `https://www.instagram.com/p/${ig}/embed/`;
  return url;
}

export function youtubeThumb(url: string) {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

export const waLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export function formatDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString("en-IN", opts);
}
