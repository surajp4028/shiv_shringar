"use client";
import { useState } from "react";
import { IconCalendarEvent, IconClock, IconMapPin, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { formatDate, isVideo } from "@/lib/media";
import type { EventItem } from "@/lib/types";

export const photosOf = (e: EventItem) => [...new Set([e.image, ...(e.gallery ?? [])].filter(Boolean))];

export function MediaImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (!src) return <div className={`bg-gradient-to-br from-orange-100 via-orange-200 to-rose-200 ${className}`} />;
  return isVideo(src) ? (
    <video src={src} autoPlay muted loop playsInline className={className} />
  ) : (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
  );
}

/** Lightbox for an event: big photo, prev/next, thumbnails and details. */
export function EventViewer({ event, start = 0 }: { event: EventItem; start?: number }) {
  const photos = photosOf(event);
  const [i, setI] = useState(Math.min(start, photos.length - 1));
  const step = (d: number) => setI((x) => (x + d + photos.length) % photos.length);

  return (
    <div className="max-h-[92vh] overflow-y-auto rounded-3xl bg-white">
      <div className="relative bg-stone-950">
        <MediaImg src={photos[i]} alt={event.title} className="mx-auto max-h-[62vh] w-full object-contain" />
        {photos.length > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 shadow-lg">
              <IconChevronLeft size={20} />
            </button>
            <button onClick={() => step(1)} aria-label="Next photo" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 shadow-lg">
              <IconChevronRight size={20} />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {i + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto bg-stone-100 p-3">
          {photos.map((p, k) => (
            <button
              key={p + k}
              onClick={() => setI(k)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 ${k === i ? "border-orange-500" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              {isVideo(p) ? <div className="flex h-full items-center justify-center bg-stone-300 text-xs">▶</div> : <img src={p} alt="" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      )}
      <div className="p-6 md:p-8">
        <h3 className="text-sacred font-display text-3xl font-semibold md:text-4xl">{event.title}</h3>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
          <span className="flex items-center gap-1.5"><IconCalendarEvent size={15} /> {formatDate(event.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          {event.time && <span className="flex items-center gap-1.5"><IconClock size={15} /> {event.time}</span>}
          {event.location && <span className="flex items-center gap-1.5"><IconMapPin size={15} /> {event.location}</span>}
        </div>
        <p className="mt-5 leading-relaxed whitespace-pre-line text-stone-700">{event.description}</p>
      </div>
    </div>
  );
}
