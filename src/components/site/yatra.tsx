"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { IconMapPin, IconCalendar, IconPhoto } from "@tabler/icons-react";
import WorldMap from "@/components/ui/world-map";
import { useMounted } from "@/hooks/use-mounted";
import { SectionHeading } from "./section-heading";
import { Modal } from "./modal";
import { formatDate, isVideo } from "@/lib/media";
import type { Settings, TripItem } from "@/lib/types";

const INDIA = ["IND"];

export function Yatra({ items, settings }: { items: TripItem[]; settings: Settings }) {
  const [open, setOpen] = useState<TripItem | null>(null);
  const [photo, setPhoto] = useState(0);
  const mounted = useMounted();
  if (items.length === 0) return null;

  const home = { lat: settings.mapLat, lng: settings.mapLng, label: "Our Mandir" };
  const dots = items
    // trips inside Delhi sit on top of the mandir pin, so they get no arc
    .filter((t) => t.lat && t.lng && Math.abs(t.lat - home.lat) + Math.abs(t.lng - home.lng) > 1)
    .map((t) => ({ start: home, end: { lat: t.lat, lng: t.lng, label: t.place.split(",")[0] } }));

  return (
    <section id="yatra" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute top-1/3 right-0 h-[30rem] w-[30rem] rounded-full bg-orange-300/20 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="Our Yatras" title="Journeys with Mahadev" description="Our samiti's pilgrimages — from the Bhasm Aarti of Mahakal in Ujjain to Kubereshwar Dham in Sehore and ISKCON in Delhi." />

        <div className="grid items-center gap-10 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <div className="absolute inset-0 rounded-full bg-orange-50 blur-3xl" />
            {mounted && <WorldMap dots={dots} countries={INDIA} height={70} lineColor="#f59e0b" dotColor="#9a341238" showLabels />}
          </div>

          <div className="space-y-5 lg:col-span-3">
            {items.map((t, i) => (
              <motion.button
                key={t.id}
                onClick={() => { setOpen(t); setPhoto(0); }}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group grid w-full overflow-hidden rounded-3xl border border-orange-100 bg-white text-left transition hover:border-orange-300 sm:grid-cols-[180px_1fr]"
              >
                <div className="relative h-44 overflow-hidden sm:h-full">
                  {t.cover && <img src={t.cover} alt={t.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />}
                  <span className="absolute top-3 left-3 font-display text-5xl font-bold text-white/80">0{i + 1}</span>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-orange-600">
                    <span className="flex items-center gap-1"><IconMapPin size={13} /> {t.place}</span>
                    {t.date && <span className="flex items-center gap-1"><IconCalendar size={13} /> {formatDate(t.date, { month: "long", year: "numeric" })}</span>}
                  </div>
                  <h3 className="text-sacred mt-2 font-display text-3xl font-semibold">{t.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600">{t.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.spots.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] text-stone-700">{s}</span>
                    ))}
                    {t.spots.length > 4 && <span className="px-1 py-1 text-[11px] text-orange-600">+{t.spots.length - 4} more</span>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} className="max-w-5xl">
        {open && (() => {
          const photos = open.gallery.length ? open.gallery : [open.cover];
          const src = photos[photo] ?? photos[0];
          return (
            <div className="grid max-h-[90vh] overflow-y-auto rounded-3xl border border-orange-100 bg-white lg:grid-cols-2">
              <div className="bg-stone-100">
                {isVideo(src) ? (
                  <video src={src} autoPlay muted loop playsInline controls className="max-h-[60vh] w-full object-contain" />
                ) : (
                  <img src={src} alt={open.title} className="max-h-[60vh] w-full object-contain" />
                )}
                {photos.length > 1 && (
                  <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
                    {photos.map((p, k) => (
                      <button key={p + k} onClick={() => setPhoto(k)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${k === photo ? "border-orange-500" : "border-transparent opacity-60"}`}>
                        {isVideo(p) ? <div className="flex h-full items-center justify-center bg-stone-300 text-xs">▶</div> : <img src={p} alt="" className="h-full w-full object-cover" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8">
                <p className="flex items-center gap-1 text-xs text-orange-600"><IconMapPin size={13} /> {open.place}</p>
                <h3 className="text-sacred mt-2 font-display text-4xl font-semibold">{open.title}</h3>
                <p className="mt-5 leading-relaxed whitespace-pre-line text-stone-700">{open.description}</p>
                <p className="mt-8 mb-3 flex items-center gap-2 text-xs tracking-widest text-orange-600/80 uppercase"><IconPhoto size={14} /> Places we visited</p>
                <ol className="space-y-2">
                  {open.spots.map((s, k) => (
                    <li key={s} className="flex items-start gap-3 text-sm text-stone-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] text-orange-700">{k + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          );
        })()}
      </Modal>
    </section>
  );
}
