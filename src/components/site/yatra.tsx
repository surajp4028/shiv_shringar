"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconMapPin, IconCalendar, IconPhoto, IconPlayerPlayFilled, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import WorldMap from "@/components/ui/world-map";
import { useMounted } from "@/hooks/use-mounted";
import { SectionHeading } from "./section-heading";
import { Modal } from "./modal";
import { embedUrl, formatDate, isVideo, mediaKind } from "@/lib/media";
import type { Settings, TripItem } from "@/lib/types";
import { Slides } from "./slides";
import { VideoModal } from "./video-modal";

const INDIA = ["IND"];

export function Yatra({ items, settings }: { items: TripItem[]; settings: Settings }) {
  const [open, setOpen] = useState<TripItem | null>(null);
  const [photo, setPhoto] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  // Keep the current thumbnail in view while sliding.
  useEffect(() => {
    (strip.current?.children[photo] as HTMLElement | undefined)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [photo]);
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
                  {t.video && (
                    <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
                      <IconPlayerPlayFilled size={12} /> Video
                    </span>
                  )}
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

      <Modal open={!!open} onClose={() => setOpen(null)} className="max-w-6xl">
        {open && (() => {
          const vKind = open.video ? mediaKind(open.video) : null;
          const playable = vKind === "file" || vKind === "youtube";
          // The showcase video (if it can play here) is the first slide.
          const photos = [...(playable ? [open.video!] : []), ...(open.gallery.length ? open.gallery : [open.cover])].filter(Boolean);
          const step = (d: number) => setPhoto((p) => (p + d + photos.length) % photos.length);
          return (
            <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white lg:grid lg:h-[82vh] lg:grid-cols-[1.45fr_1fr]">
              {/* Media: smooth slider + thumbnails */}
              <div className="flex shrink-0 flex-col bg-stone-950 lg:min-h-0">
                <div className="relative lg:min-h-0 lg:flex-1">
                  <Slides
                    items={photos}
                    index={photo}
                    onIndex={setPhoto}
                    className="h-[40vh] sm:h-[48vh] lg:h-full"
                    render={(src, _i, active) =>
                      mediaKind(src) === "youtube" ? (
                        active ? <iframe src={embedUrl(src)} title={open.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" className="aspect-video w-full" /> : null
                      ) : isVideo(src) ? (
                        active ? <video src={src} autoPlay muted loop playsInline controls className="h-full w-full object-contain" /> : null
                      ) : (
                        <img src={src} alt={open.title} decoding="async" className="h-full w-full object-contain" />
                      )
                    }
                  />
                  {photos.length > 1 && (
                    <>
                      <button onClick={() => step(-1)} aria-label="Previous" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 shadow-lg"><IconChevronLeft size={20} /></button>
                      <button onClick={() => step(1)} aria-label="Next" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 shadow-lg"><IconChevronRight size={20} /></button>
                      <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">{photo + 1} / {photos.length}</span>
                    </>
                  )}
                </div>
                {photos.length > 1 && (
                  <div ref={strip} className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto overflow-y-hidden bg-stone-900 p-3">
                    {photos.map((p, k) => (
                      <button key={p + k} onClick={() => setPhoto(k)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-16 ${k === photo ? "border-orange-500" : "border-transparent opacity-50 hover:opacity-100"}`}>
                        {isVideo(p) || mediaKind(p) === "youtube" ? (
                          <span className="relative block h-full w-full bg-stone-700">
                            {isVideo(p) && <video src={p + "#t=1"} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white"><IconPlayerPlayFilled size={16} /></span>
                          </span>
                        ) : (
                          <img src={p} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                <p className="flex items-center gap-1.5 text-xs font-medium text-orange-600"><IconMapPin size={14} /> {open.place}</p>
                <h3 className="text-sacred mt-2 font-display text-3xl leading-tight font-semibold sm:text-4xl">{open.title}</h3>
                {open.date && <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500"><IconCalendar size={15} /> {formatDate(open.date, { day: "numeric", month: "long", year: "numeric" })}</p>}
                {open.video && !playable && (
                  <button type="button" onClick={() => setVideoUrl(open.video!)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5">
                    <IconPlayerPlayFilled size={16} /> Watch the yatra video
                  </button>
                )}
                <p className="mt-5 leading-relaxed whitespace-pre-line text-stone-700">{open.description}</p>
                {open.spots.length > 0 && (
                  <>
                    <p className="mt-7 mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-orange-600/80 uppercase"><IconPhoto size={14} /> Places we visited</p>
                    <ol className="space-y-2">
                      {open.spots.map((sp, k) => (
                        <li key={sp} className="flex items-start gap-3 text-sm text-stone-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-semibold text-orange-700">{k + 1}</span>
                          {sp}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
      <VideoModal url={videoUrl} title={open?.title} onClose={() => setVideoUrl(null)} />
    </section>
  );
}
