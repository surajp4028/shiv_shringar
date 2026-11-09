"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { IconCalendarEvent, IconClock, IconMapPin, IconArrowUpRight, IconPhoto } from "@tabler/icons-react";
import { SectionHeading } from "./section-heading";
import { Modal } from "./modal";
import { Scroller } from "./scroller";
import { EventViewer, MediaImg as Media, photosOf } from "./event-viewer";
import { formatDate } from "@/lib/media";
import type { EventItem } from "@/lib/types";

export function Events({ items: all }: { items: EventItem[] }) {
  const [open, setOpen] = useState<EventItem | null>(null);
  const [start, setStart] = useState(0);
  const openAt = (e: EventItem, i = 0) => {
    setStart(i);
    setOpen(e);
  };
  // Special events get their own showcase section.
  const items = all.filter((e) => !e.special);
  if (items.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const featured = sorted.find((e) => e.featured) ?? sorted[0];
  const others = sorted.filter((e) => e.id !== featured.id);
  const fPhotos = photosOf(featured);

  return (
    <section id="events" className="relative py-20 md:py-28">
      <div className="bg-temple-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-5">
        <SectionHeading eyebrow="Events & Festivals" title="Upcoming & Recent Events" description="Festivals, special shringar, bhajan evenings and bhandara — come and receive the blessings of Mahadev." />

        {/* Featured event with its photo strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_40px_80px_-40px_rgba(124,45,18,0.4)] lg:grid-cols-[1.15fr_1fr]"
        >
          <button onClick={() => openAt(featured)} className="group relative overflow-hidden text-left">
            <Media src={featured.image} alt={featured.title} className="aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-105 lg:aspect-auto lg:min-h-[30rem]" />
            {featured.date >= today && (
              <span className="absolute top-5 left-5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 text-xs font-semibold text-white">Upcoming</span>
            )}
            {fPhotos.length > 1 && (
              <span className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                <IconPhoto size={14} /> {fPhotos.length} photos
              </span>
            )}
          </button>
          <div className="flex min-w-0 flex-col justify-center p-6 md:p-10">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-orange-600 uppercase">Featured</p>
            <h3 className="text-sacred mt-3 font-display text-3xl leading-tight font-semibold md:text-5xl">{featured.title}</h3>
            <p className="mt-4 line-clamp-4 leading-relaxed text-stone-600">{featured.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-stone-700 md:text-sm">
              <span className="flex items-center gap-1.5 rounded-full border border-orange-100 px-3 py-1.5"><IconCalendarEvent size={15} /> {formatDate(featured.date)}</span>
              {featured.time && <span className="flex items-center gap-1.5 rounded-full border border-orange-100 px-3 py-1.5"><IconClock size={15} /> {featured.time}</span>}
              {featured.location && <span className="flex items-center gap-1.5 rounded-full border border-orange-100 px-3 py-1.5"><IconMapPin size={15} /> {featured.location}</span>}
            </div>
            {fPhotos.length > 1 && (
              <Scroller
                className="mt-7"
                trackClassName="-mx-6 px-6 md:-mx-0 md:px-0"
                label={
                  <p className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
                    <IconPhoto size={15} /> {fPhotos.length} photos — swipe to see all
                  </p>
                }
              >
                {fPhotos.map((p, k) => (
                  <button
                    key={p}
                    onClick={() => openAt(featured, k)}
                    className="group relative h-24 w-24 shrink-0 snap-start overflow-hidden rounded-xl md:h-28 md:w-28"
                  >
                    <Media src={p} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  </button>
                ))}
              </Scroller>
            )}
          </div>
        </motion.div>

        {others.length > 0 && (
          <Scroller className="mt-10" label={<p className="font-display text-2xl font-semibold text-stone-900">More celebrations</p>}>
            {others.map((e, i) => {
              const n = photosOf(e).length;
              return (
                <motion.button
                  key={e.id}
                  onClick={() => openAt(e)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-orange-100 bg-white text-left transition hover:border-orange-300 hover:shadow-[0_24px_50px_-24px_rgba(194,65,12,0.35)] sm:w-[340px]"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Media src={e.image} alt={e.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 rounded-2xl bg-white/90 px-3 py-2 text-center shadow backdrop-blur">
                      <p className="text-sacred font-display text-2xl leading-none font-semibold">{formatDate(e.date, { day: "2-digit" })}</p>
                      <p className="text-[10px] tracking-wider text-stone-500 uppercase">{formatDate(e.date, { month: "short" })}</p>
                    </div>
                    {n > 1 && (
                      <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white">
                        <IconPhoto size={13} /> {n}
                      </span>
                    )}
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="font-display text-2xl leading-tight font-semibold text-stone-900">{e.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600">{e.description}</p>
                    <p className="mt-4 flex items-center gap-1 text-sm font-medium text-orange-600">
                      {n > 1 ? "View photos" : "Read more"} <IconArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </Scroller>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} className="max-w-4xl">
        {open && <EventViewer key={open.id + start} event={open} start={start} />}
      </Modal>
    </section>
  );
}
