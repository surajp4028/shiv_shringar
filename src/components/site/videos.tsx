"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";
import { Scroller } from "./scroller";
import { SectionHeading } from "./section-heading";
import { VideoPlayer } from "./video-player";
import { VideoModal } from "./video-modal";
import type { Settings, VideoItem } from "@/lib/types";

export function Videos({ items, settings }: { items: VideoItem[]; settings: Settings }) {
  const [open, setOpen] = useState<VideoItem | null>(null);
  if (items.length === 0) return null;

  return (
    <section id="videos" className="relative overflow-hidden bg-[#1a0f0a] py-20 md:py-28 text-white">
      <div className="bg-temple-grid-dark pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-600/20 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeading
          dark
          eyebrow="Shringar Videos"
          title="Watch the Shringar Come Alive"
          description="Reels from our daily seva. Uploaded videos play automatically — tap the speaker to hear the bhajan."
        />

        <Scroller
          dark
          label={
            <div className="flex gap-2">
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1.5 text-sm text-pink-200 transition hover:bg-pink-500/20">
                <IconBrandInstagram size={16} /> Instagram
              </a>
              <a href={settings.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-sm text-red-200 transition hover:bg-red-500/20">
                <IconBrandYoutube size={16} /> YouTube
              </a>
            </div>
          }
        >
          {items.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 5) * 0.08 }}
              className="w-[230px] shrink-0 snap-start sm:w-[260px] md:w-[280px]"
            >
              <div className="rounded-[1.75rem] bg-gradient-to-b from-amber-400/40 via-amber-700/10 to-transparent p-px">
                <VideoPlayer url={v.url} poster={v.poster} title={v.title} onOpen={() => setOpen(v)} className="aspect-[9/16] rounded-[1.7rem]" />
              </div>
              <p className="mt-3 text-[11px] font-medium tracking-widest text-orange-300/80 uppercase">{v.category}</p>
              <p className="font-display text-xl font-semibold text-amber-50">{v.title}</p>
            </motion.div>
          ))}
        </Scroller>
      </div>

      <VideoModal url={open?.url ?? null} title={open?.title} onClose={() => setOpen(null)} />
    </section>
  );
}
