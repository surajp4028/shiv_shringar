"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { IconCalendarEvent, IconClock, IconMapPin, IconPhoto, IconFlag, IconArrowUpRight } from "@tabler/icons-react";
import { SectionHeading } from "./section-heading";
import { Scroller } from "./scroller";
import { Modal } from "./modal";
import { EventViewer, MediaImg, photosOf } from "./event-viewer";
import { formatDate } from "@/lib/media";
import type { EventItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Theme = "fire" | "ice";

const themes: Record<Theme, { wrap: string; glow: string; eyebrow: string; title: string; text: string; chip: string; stepDot: string; stepLine: string; stepText: string; dark: boolean }> = {
  fire: {
    wrap: "bg-[radial-gradient(ellipse_at_top_right,#7c2d12_0%,#2a0d07_45%,#140906_100%)] text-white",
    glow: "bg-orange-500/25",
    eyebrow: "text-amber-300",
    title: "text-gold",
    text: "text-orange-50/80",
    chip: "border-white/15 bg-white/10 text-orange-50",
    stepDot: "bg-gradient-to-br from-amber-300 to-orange-600 text-black",
    stepLine: "bg-gradient-to-b from-amber-400/60 to-orange-700/20",
    stepText: "text-orange-50/90",
    dark: true,
  },
  ice: {
    wrap: "bg-[radial-gradient(ellipse_at_top_left,#e0f2fe_0%,#f8fafc_45%,#eef2ff_100%)] text-slate-900",
    glow: "bg-sky-300/40",
    eyebrow: "text-sky-600",
    title: "bg-gradient-to-b from-sky-700 to-indigo-900 bg-clip-text text-transparent",
    text: "text-slate-600",
    chip: "border-sky-200 bg-white/80 text-slate-700",
    stepDot: "bg-gradient-to-br from-sky-400 to-indigo-600 text-white",
    stepLine: "bg-gradient-to-b from-sky-400/60 to-indigo-300/20",
    stepText: "text-slate-700",
    dark: false,
  },
};

function Showcase({ event, theme, onOpen }: { event: EventItem; theme: Theme; onOpen: (i: number) => void }) {
  const t = themes[theme];
  const photos = photosOf(event);
  const [lead, ...rest] = event.description.split("\n\n");
  const route = (event.route ?? []).filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative overflow-hidden rounded-[2rem] p-5 shadow-[0_50px_100px_-50px_rgba(60,20,5,0.6)] md:rounded-[2.5rem] md:p-10", t.wrap)}
    >
      <div className={cn("pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[110px]", t.glow)} />
      {theme === "fire" && <div className="bg-temple-grid-dark pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />}

      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        {/* Photo collage */}
        <div className="grid grid-cols-3 grid-rows-2 gap-2.5 md:gap-3">
          {photos.slice(0, 3).map((p, k) => (
            <button
              key={p}
              onClick={() => onOpen(k)}
              className={cn(
                "group relative overflow-hidden rounded-2xl",
                k === 0 ? "col-span-2 row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[26rem]" : "aspect-square md:aspect-auto",
              )}
            >
              <MediaImg src={p} alt={event.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              {k === 2 && photos.length > 3 && (
                <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white">
                  <span className="font-display text-3xl font-semibold">+{photos.length - 3}</span>
                  <span className="text-[11px] tracking-wider uppercase opacity-80">photos</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Story */}
        <div className="flex flex-col justify-center">
          <p className={cn("flex items-center gap-2 text-[11px] font-semibold tracking-[0.3em] uppercase", t.eyebrow)}>
            <span className="h-px w-8 bg-current opacity-60" /> Special Event
          </p>
          <h3 className={cn("mt-3 font-display text-4xl leading-[1.05] font-semibold md:text-6xl", t.title)}>{event.title}</h3>
          <p className={cn("mt-5 leading-relaxed", t.text)}>{lead}</p>
          {rest.length > 0 && <p className={cn("mt-3 hidden text-sm leading-relaxed md:block", t.text)}>{rest.join(" ")}</p>}

          <div className="mt-6 flex flex-wrap gap-2 text-xs md:text-sm">
            <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5", t.chip)}><IconCalendarEvent size={15} /> {formatDate(event.date, { day: "numeric", month: "long", year: "numeric" })}</span>
            {event.time && <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5", t.chip)}><IconClock size={15} /> {event.time}</span>}
            {event.location && <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5", t.chip)}><IconMapPin size={15} /> {event.location}</span>}
          </div>

          {route.length > 0 && (
            <div className="mt-8">
              <p className={cn("mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase", t.eyebrow)}>
                <IconFlag size={15} /> Yatra Route
              </p>
              <ol className="grid gap-x-6 sm:grid-cols-2">
                {route.map((stop, k) => (
                  <li key={stop} className="relative flex gap-3 pb-4">
                    {k < route.length - 1 && <span className={cn("absolute top-7 left-[13px] h-[calc(100%-1.25rem)] w-px sm:hidden", t.stepLine)} />}
                    <span className={cn("relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-md", t.stepDot)}>{k + 1}</span>
                    <span className={cn("pt-1 text-sm leading-snug", t.stepText)}>{stop}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {photos.length > 3 && (
        <Scroller
          dark={t.dark}
          className="relative mt-10"
          label={
            <p className={cn("flex items-center gap-2 text-sm font-medium", t.text)}>
              <IconPhoto size={16} /> {photos.length} moments from the day
            </p>
          }
        >
          {photos.map((p, k) => (
            <button
              key={p + k}
              onClick={() => onOpen(k)}
              className="group relative h-56 w-44 shrink-0 snap-start overflow-hidden rounded-2xl md:h-72 md:w-56"
            >
              <MediaImg src={p} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100" />
              <IconArrowUpRight size={18} className="absolute right-3 bottom-3 text-white opacity-0 transition group-hover:opacity-100" />
            </button>
          ))}
        </Scroller>
      )}
    </motion.article>
  );
}

export function SpecialEvents({ items }: { items: EventItem[] }) {
  const [open, setOpen] = useState<{ event: EventItem; i: number } | null>(null);
  const specials = items.filter((e) => e.special).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (specials.length === 0) return null;

  return (
    <section id="special" className="relative py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5">
        <SectionHeading eyebrow="Celebrations to Remember" title="Special Events" description="The days our whole mohalla came together for Mahadev." />
        <div className="space-y-10 md:space-y-14">
          {specials.map((e, k) => (
            <Showcase key={e.id} event={e} theme={k % 2 === 0 ? "fire" : "ice"} onOpen={(i) => setOpen({ event: e, i })} />
          ))}
        </div>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} className="max-w-4xl">
        {open && <EventViewer key={open.event.id + open.i} event={open.event} start={open.i} />}
      </Modal>
    </section>
  );
}
