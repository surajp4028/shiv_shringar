"use client";
import { forwardRef, useState } from "react";
import { driveId, videoSrc } from "@/lib/media";

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & { src: string };

/**
 * <video> that also understands Google Drive share links: it streams the file
 * directly (so autoplay/loop/mute work), and if Drive refuses the direct
 * stream it falls back to Drive's own embedded player so the video still plays.
 */
export const SmartVideo = forwardRef<HTMLVideoElement, Props>(function SmartVideo({ src, className, onError, ...rest }, ref) {
  const [failed, setFailed] = useState<string | null>(null);
  const id = driveId(src);
  if (id && failed === src) {
    return (
      <iframe
        src={`https://drive.google.com/file/d/${id}/preview`}
        title="Video"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        className={className}
      />
    );
  }
  return (
    <video
      ref={ref}
      src={videoSrc(src)}
      className={className}
      onError={(e) => {
        if (id) setFailed(src);
        onError?.(e);
      }}
      {...rest}
    />
  );
});
