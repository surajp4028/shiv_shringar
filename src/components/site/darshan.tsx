"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconCalendar, IconVolume, IconVolumeOff, IconPhoto, IconChevronLeft, IconChevronRight, IconPlayerPlayFilled, IconBrandInstagram } from "@tabler/icons-react";
import { SectionHeading } from "./section-heading";
import { Modal } from "./modal";
import { Scroller } from "./scroller";
import { MediaImg } from "./event-viewer";
import { VideoModal } from "./video-modal";
import { embedUrl, formatDate, mediaKind } from "@/lib/media";
import type { ShringarItem } from "@/lib/types";
import { Slides } from "./slides";

const photosOf = (s: ShringarItem) => [...new Set([s.image, ...(s.gallery ?? [])].filter(Boolean))];

/** Autoplaying, muted, looping darshan video with a sound toggle. */
function DarshanVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const kind = mediaKind(src);

  // Pause when scrolled away to save battery and data.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  if (kind === "youtube") {
    return <iframe src={embedUrl(src)} title="Darshan video" allow="autoplay; encrypted-media; picture-in-picture" className="h-full w-full" />;
  }
  return (
    <>
      <video ref={ref} src={src} poster={poster} autoPlay muted={muted} loop playsInline className="h-full w-full object-cover" />
      <button
        onClick={() => setMuted(!muted)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-full bg-black/55 px-3.5 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-black/75"
      >
        {muted ? <IconVolumeOff size={16} /> : <IconVolume size={16} />} {muted ? "Tap for sound" : "Sound on"}
      </button>
    </>
  );
}

function PhotoViewer({ photos, start, title }: { photos: string[]; start: number; title: string }) {
  const [i, setI] = useState(start);
  const step = (d: number) => setI((x) => (x + d + photos.length) % photos.length);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-950">
      <Slides
        items={photos}
        index={i}
        onIndex={setI}
        className="h-[70vh] sm:h-[80vh]"
        render={(p) => <MediaImg src={p} alt={title} className="h-full w-full object-contain" />}
      />
      {photos.length > 1 && (
        <>
          <button onClick={() => step(-1)} aria-label="Previous" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 shadow-lg"><IconChevronLeft size={20} /></button>
          <button onClick={() => step(1)} aria-label="Next" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 shadow-lg"><IconChevronRight size={20} /></button>
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">{i + 1} / {photos.length}</span>
        </>
      )}
    </div>
  );
}

export function Darshan({ items }: { items: ShringarItem[] }) {
  const [open, setOpen] = useState<ShringarItem | null>(null);
  const [viewer, setViewer] = useState<{ photos: string[]; i: number; title: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const [today, ...rest] = sorted;
  const photos = photosOf(today);
  // Uploaded MP4s and YouTube links play inline; other links (Instagram,
  // Facebook, Drive…) can't autoplay, so we show the photo with a watch button.
  const vKind = today.video ? mediaKind(today.video) : null;
  const playable = vKind === "file" || vKind === "youtube";
  const collage = playable ? photos : photos.slice(1);

  return (
    <section id="darshan" className="relative overflow-hidden bg-gradient-to-b from-[#f6ede1] to-[#fbf7f1] py-20 md:py-28">
      <div className="pointer-events-none absolute top-20 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-orange-300/20 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow="Special Shringar"
          title="Darshan of the Day"
          description="Sometimes as Mahakal, sometimes as the nine forms of the Devi — every festival brings a new shringar."
        />

        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          {/* Video or main photo + collage */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-stone-900 shadow-[0_40px_80px_-35px_rgba(124,45,18,0.55)]">
              <div className={playable ? "aspect-video" : "aspect-[4/5]"}>
                {playable ? (
                  <DarshanVideo src={today.video!} poster={today.image} />
                ) : today.video ? (
                  <button type="button" onClick={() => setVideoUrl(today.video!)} className="group relative block h-full w-full">
                    <img src={today.image} alt={today.title} className="h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
                    <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-stone-900 shadow-xl">
                      {vKind === "instagram" ? <IconBrandInstagram size={18} className="text-pink-600" /> : <IconPlayerPlayFilled size={18} className="text-orange-600" />}
                      Watch the video
                    </span>
                  </button>
                ) : (
                  <button onClick={() => setViewer({ photos, i: 0, title: today.title })} className="block h-full w-full">
                    <img src={today.image} alt={today.title} className="h-full w-full object-cover" />
                  </button>
                )}
              </div>
              <span className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800 shadow backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Today&apos;s Darshan
              </span>
            </div>

            {collage.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 md:mt-4 md:gap-3">
                {collage.slice(0, 9).map((p, k) => {
                  const idx = photos.indexOf(p);
                  const more = k === 8 && collage.length > 9;
                  return (
                    <motion.button
                      key={p}
                      onClick={() => setViewer({ photos, i: idx, title: today.title })}
                      initial={{ opacity: 0, scale: 0.92 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: k * 0.05 }}
                      className={`group relative overflow-hidden rounded-xl shadow-md md:rounded-2xl ${k === 0 ? "col-span-2 row-span-2" : ""} aspect-square`}
                    >
                      <img src={p} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      {more && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-display text-xl font-semibold text-white">+{collage.length - 9}</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold tracking-[0.25em] text-orange-600 uppercase">
              {today.deity} • {today.occasion}
            </p>
            <h3 className="text-sacred mt-3 font-display text-4xl leading-[1.05] font-semibold md:text-6xl">{today.title}</h3>
            <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
              <IconCalendar size={16} /> {formatDate(today.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="mt-6 text-lg leading-relaxed whitespace-pre-line text-stone-700">{today.description}</p>
            {photos.length > 1 && (
              <button
                onClick={() => setViewer({ photos, i: 0, title: today.title })}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400"
              >
                <IconPhoto size={16} /> View all {photos.length} photos
              </button>
            )}
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { n: items.length + "+", l: "divine forms" },
                { n: "365", l: "days of seva" },
                { n: "9:00 PM", l: "daily darshan" },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl border border-orange-100 bg-white/70 px-2 py-4">
                  <p className="text-sacred font-display text-2xl font-semibold md:text-3xl">{x.n}</p>
                  <p className="mt-0.5 text-[11px] tracking-wider text-stone-500 uppercase">{x.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Scroller className="mt-14" label={<p className="font-display text-2xl font-semibold text-stone-900">Shringar of the Season</p>}>
          {rest.map((s) => (
            <button
              key={s.id}
              onClick={() => setOpen(s)}
              className="group relative aspect-[3/4] w-44 shrink-0 snap-start overflow-hidden rounded-2xl text-left shadow-lg md:w-56"
            >
              <img src={s.image} alt={s.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
              {s.video && (
                <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white shadow">
                  <IconPlayerPlayFilled size={14} />
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="text-[10px] font-medium tracking-wider text-orange-200 uppercase">{s.occasion}</p>
                <p className="font-display text-lg leading-tight font-semibold text-white">{s.title}</p>
              </div>
            </button>
          ))}
        </Scroller>
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} className="max-w-3xl">
        {open && (
          <div className="grid overflow-hidden rounded-3xl bg-white md:grid-cols-2">
            {open.video && mediaKind(open.video) === "file" ? (
              <video src={open.video} autoPlay muted loop playsInline controls className="max-h-[80vh] w-full bg-black object-contain" />
            ) : open.video && mediaKind(open.video) === "youtube" ? (
              <iframe src={embedUrl(open.video)} title={open.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" className="aspect-[9/16] max-h-[80vh] w-full bg-black md:aspect-auto md:h-full" />
            ) : (
              <img src={open.image} alt={open.title} className="max-h-[80vh] w-full object-cover md:h-full" />
            )}
            <div className="p-8">
              <p className="text-xs font-semibold tracking-widest text-orange-600 uppercase">{open.deity} • {open.occasion}</p>
              <h3 className="text-sacred mt-2 font-display text-4xl font-semibold">{open.title}</h3>
              <p className="mt-2 text-sm text-stone-500">{formatDate(open.date)}</p>
              <p className="mt-6 leading-relaxed text-stone-700">{open.description}</p>
              {open.video && mediaKind(open.video) !== "file" && mediaKind(open.video) !== "youtube" && (
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl(open.video!);
                    setOpen(null);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
                >
                  <IconPlayerPlayFilled size={16} /> Watch the video
                </button>
              )}
              {(open.gallery?.length ?? 0) > 0 && (
                <button onClick={() => { setViewer({ photos: photosOf(open), i: 0, title: open.title }); setOpen(null); }} className="mt-6 flex items-center gap-2 text-sm font-semibold text-orange-600">
                  <IconPhoto size={16} /> View {photosOf(open).length} photos
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!viewer} onClose={() => setViewer(null)} className="max-w-5xl">
        {viewer && <PhotoViewer key={viewer.title + viewer.i} photos={viewer.photos} start={viewer.i} title={viewer.title} />}
      </Modal>
      <VideoModal url={videoUrl} onClose={() => setVideoUrl(null)} />
    </section>
  );
}
