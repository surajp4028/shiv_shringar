"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronLeft, IconChevronRight, IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { Modal } from "./modal";
import { isVideo } from "@/lib/media";
import { SmartVideo } from "./smart-video";
import type { HighlightItem } from "@/lib/types";

const IMAGE_MS = 5000;

function StoryViewer({ list, start, onClose }: { list: HighlightItem[]; start: number; onClose: () => void }) {
  const [h, setH] = useState(start);
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const story = list[h];
  const media = story.media.length ? story.media : [story.cover];
  const src = media[i];
  const video = isVideo(src);

  const next = useCallback(() => {
    setProgress(0);
    if (i < media.length - 1) setI(i + 1);
    else if (h < list.length - 1) {
      setH(h + 1);
      setI(0);
    } else onClose();
  }, [i, h, media.length, list.length, onClose]);

  const prev = () => {
    setProgress(0);
    if (i > 0) setI(i - 1);
    else if (h > 0) {
      setH(h - 1);
      setI(0);
    }
  };

  useEffect(() => {
    if (video) return;
    const started = Date.now();
    const id = setInterval(() => {
      const p = (Date.now() - started) / IMAGE_MS;
      if (p >= 1) next();
      else setProgress(p);
    }, 50);
    return () => clearInterval(id);
  }, [src, video, next]);

  return (
    <div className="relative mx-auto aspect-[9/16] max-h-[88vh] overflow-hidden rounded-3xl bg-black">
      <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
        {media.map((_, k) => (
          <div key={k} className="h-0.5 flex-1 overflow-hidden rounded bg-white/25">
            <div className="h-full bg-white" style={{ width: k < i ? "100%" : k === i ? `${progress * 100}%` : "0%" }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 top-6 z-20 flex items-center gap-2">
        <img src={story.cover} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-amber-300/60" />
        <p className="text-sm font-semibold text-white drop-shadow">{story.title}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          {video ? (
            <SmartVideo
              src={src}
              autoPlay
              muted={muted}
              playsInline
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
              onEnded={next}
              className="h-full w-full object-cover"
            />
          ) : (
            <img src={src} alt={story.title} className="h-full w-full object-cover" />
          )}
        </motion.div>
      </AnimatePresence>

      <button aria-label="Previous" onClick={prev} className="absolute inset-y-0 left-0 z-10 w-1/3" />
      <button aria-label="Next" onClick={next} className="absolute inset-y-0 right-0 z-10 w-2/3" />
      {video && (
        <button onClick={() => setMuted(!muted)} aria-label="Toggle sound" className="absolute right-3 bottom-3 z-20 rounded-full bg-black/60 p-2.5 text-white">
          {muted ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
        </button>
      )}
      <div className="pointer-events-none absolute inset-y-0 -left-12 hidden items-center md:flex"><IconChevronLeft className="text-white/60" /></div>
      <div className="pointer-events-none absolute inset-y-0 -right-12 hidden items-center md:flex"><IconChevronRight className="text-white/60" /></div>
    </div>
  );
}

export function Highlights({ items }: { items: HighlightItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <section id="highlights" className="relative border-b border-orange-100 bg-white/60 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-8 text-center text-[11px] font-semibold tracking-[0.35em] text-orange-600 uppercase">Story Highlights</p>
        <div className="no-scrollbar flex justify-start gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain pt-2 pb-3 md:justify-center md:gap-10">
          {items.map((h, i) => (
            <motion.button
              key={h.id}
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
              whileHover={{ y: -4 }}
              className="group flex shrink-0 flex-col items-center gap-3"
            >
              <span className="relative rounded-full bg-[conic-gradient(from_180deg,#f59e0b,#ea580c,#ec4899,#f5d68a,#f59e0b)] p-[2.5px] transition group-hover:shadow-[0_10px_30px_-6px_rgba(234,88,12,0.6)]">
                <span className="block rounded-full bg-white p-[3px]">
                  <img src={h.cover} alt={h.title} className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24" />
                </span>
              </span>
              <span className="max-w-24 truncate text-sm font-medium text-stone-700">{h.title}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <Modal open={open !== null} onClose={() => setOpen(null)} className="max-w-[420px]">
        {open !== null && <StoryViewer list={items} start={open} onClose={() => setOpen(null)} />}
      </Modal>
    </section>
  );
}
