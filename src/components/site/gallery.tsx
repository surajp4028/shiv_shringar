"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { SectionHeading } from "./section-heading";
import { Modal } from "./modal";
import { isVideo } from "@/lib/media";
import type { GalleryItem } from "@/lib/types";
import { Swipe } from "./swipe";
import { cn } from "@/lib/utils";

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const cats = useMemo(() => ["All", ...new Set(items.map((g) => g.category).filter(Boolean))], [items]);
  const shown = cat === "All" ? items : items.filter((g) => g.category === cat);
  if (items.length === 0) return null;

  const current = open !== null ? shown[open] : null;
  const step = (d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length));

  return (
    <section id="gallery" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="Gallery" title="Moments of Bhakti" description="Shringar, festivals and seva — straight from the mandir." />

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition",
                cat === c ? "text-white" : "border border-orange-100 text-stone-700 hover:border-orange-400",
              )}
            >
              {cat === c && <motion.span layoutId="gallery-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-600" />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="columns-2 gap-4 md:columns-3 lg:columns-4">
          <AnimatePresence>
            {shown.map((g, i) => (
              <motion.button
                layout
                key={g.id}
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative mb-4 block w-full overflow-hidden rounded-2xl border border-orange-100 break-inside-avoid"
              >
                {isVideo(g.src) ? (
                  <video src={g.src} autoPlay muted loop playsInline className="w-full" />
                ) : (
                  <img src={g.src} alt={g.title} loading="lazy" decoding="async" className="w-full transition duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                  <p className="font-display text-lg text-stone-900">{g.title}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <Modal open={!!current} onClose={() => setOpen(null)} className="max-w-5xl">
        {current && (
          <div className="relative flex flex-col items-center">
            {isVideo(current.src) ? (
              <video src={current.src} autoPlay controls playsInline className="max-h-[80vh] rounded-2xl" />
            ) : (
              <Swipe onPrev={() => step(-1)} onNext={() => step(1)} enabled={shown.length > 1}>
                <img key={current.src} src={current.src} alt={current.title} className="max-h-[80vh] rounded-2xl object-contain" />
              </Swipe>
            )}
            <p className="mt-4 font-display text-xl text-white">{current.title}</p>
            {shown.length > 1 && (
              <>
                <button onClick={() => step(-1)} aria-label="Previous" className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white"><IconChevronLeft /></button>
                <button onClick={() => step(1)} aria-label="Next" className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white"><IconChevronRight /></button>
              </>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
