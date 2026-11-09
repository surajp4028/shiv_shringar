"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { IconArrowRight, IconMapPin, IconVolume, IconVolumeOff, IconFlame, IconClock } from "@tabler/icons-react";
import { SiWhatsapp } from "react-icons/si";
import { FlipWords } from "@/components/ui/flip-words";
import { embedUrl, mediaKind, waLink } from "@/lib/media";
import { SmartVideo } from "./smart-video";
import type { Settings } from "@/lib/types";

const forms = ["Mahakal", "Rudra Roop", "Nau Devi", "Shiv Parivar", "flowers & diyas"];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// Parses "9:00 PM" and returns ms until the next occurrence in India time.
function msUntil(time: string) {
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3]?.toUpperCase() === "PM") h += 12;
  if (!m[3] && Number(m[1]) === 12) h = 12;
  const nowIst = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60_000);
  const target = new Date(nowIst);
  target.setHours(h, Number(m[2]), 0, 0);
  if (target <= nowIst) target.setDate(target.getDate() + 1);
  return target.getTime() - nowIst.getTime();
}

function Countdown({ time }: { time: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(msUntil(time));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [time]);
  if (left === null) return <span className="tabular-nums">--:--:--</span>;
  const s = Math.floor(left / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="tabular-nums">
      {pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
    </span>
  );
}

/** Thin mandala drawn in SVG, slowly rotating behind the photo. */
function Mandala({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" stroke="currentColor">
      {[180, 150, 120, 90].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} strokeWidth="0.6" />
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <ellipse key={i} cx="200" cy="80" rx="18" ry="62" strokeWidth="0.6" transform={`rotate(${i * 15} 200 200)`} />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={`p${i}`} d="M200 200 L200 20" strokeWidth="0.4" transform={`rotate(${i * 30} 200 200)`} />
      ))}
    </svg>
  );
}

function MainMedia({ settings }: { settings: Settings }) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const kind = mediaKind(settings.heroVideo);
  const images = settings.heroImages.filter(Boolean);

  useEffect(() => {
    if (kind === "file" || kind === "youtube" || images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [kind, images.length]);

  if (kind === "file") {
    return (
      <>
        <SmartVideo src={settings.heroVideo} autoPlay muted={muted} loop playsInline className="h-full w-full object-cover" />
        <button
          onClick={() => setMuted(!muted)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-4 bottom-4 z-20 rounded-full bg-white/85 p-3 text-stone-800 shadow-lg backdrop-blur transition hover:scale-105"
        >
          {muted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
        </button>
      </>
    );
  }
  if (kind === "youtube") {
    return (
      <iframe
        src={embedUrl(settings.heroVideo)}
        allow="autoplay; encrypted-media"
        className="pointer-events-none absolute top-1/2 left-1/2 h-full w-[178%] -translate-x-1/2 -translate-y-1/2"
        title="Hero video"
      />
    );
  }
  return (
    <AnimatePresence mode="sync">
      {images.length > 0 && (
        <motion.img
          key={images[index]}
          src={images[index]}
          alt="Today's shringar"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </AnimatePresence>
  );
}

export function Hero({ settings }: { settings: Settings }) {
  // gentle 3D tilt that follows the pointer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 });

  const side = settings.heroImages.filter(Boolean);
  const float1 = side[1] ?? side[0];
  const float2 = side[2] ?? side[0];

  return (
    <section id="top" className="relative overflow-hidden pt-24 pb-16 lg:pt-36 lg:pb-28">
      {/* warm light backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_30%,rgba(251,146,60,0.22),transparent_60%),radial-gradient(ellipse_60%_50%_at_10%_80%,rgba(244,114,182,0.14),transparent_60%)]" />
      <div className="bg-temple-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-stone-600 shadow-sm backdrop-blur md:text-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            {settings.templeName} · East Azad Nagar, Delhi
          </motion.div>

          <motion.p {...fadeUp(0.08)} className="mt-7 font-display text-xl font-medium tracking-wide text-orange-600 italic md:text-2xl">
            {settings.tagline}
          </motion.p>

          <motion.h1 {...fadeUp(0.16)} className="mt-2 font-display text-[3rem] leading-[0.95] font-semibold tracking-tight text-stone-900 sm:text-7xl xl:text-[5.6rem]">
            Shiv Shringar
            <span className="text-sacred block">Sewa Samiti</span>
          </motion.h1>

          <motion.div {...fadeUp(0.24)} className="mt-6 text-lg text-stone-600 md:text-2xl">
            Mahadev, adorned every evening as
            <FlipWords words={forms} className="font-display text-xl font-semibold whitespace-nowrap text-red-700 italic md:text-[1.7rem]" />
          </motion.div>

          <motion.p {...fadeUp(0.32)} className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-stone-500 lg:mx-0">
            {settings.heroSubtitle}
          </motion.p>

          <motion.div {...fadeUp(0.4)} className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
            <a
              href="#darshan"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-orange-500 to-red-700 px-7 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(194,65,12,0.8),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.35),55%,transparent)] bg-[length:200%_100%]" />
              <span className="relative">Today&apos;s Darshan</span>
              <IconArrowRight size={18} className="relative transition group-hover:translate-x-1" />
            </a>
            <a
              href={waLink(settings.whatsapp, "Har Har Mahadev 🙏")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white/80 px-7 text-sm font-semibold text-stone-800 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-400"
            >
              <SiWhatsapp className="text-emerald-500" /> Join on WhatsApp
            </a>
          </motion.div>

          <motion.dl {...fadeUp(0.48)} className="mx-auto mt-8 grid max-w-lg grid-cols-3 divide-x divide-orange-200 rounded-2xl border border-orange-100 bg-white/70 py-4 shadow-sm backdrop-blur lg:mx-0">
            {[
              { label: "Shringar Darshan", value: settings.darshanTime },
              { label: "Shayan Aarti", value: settings.aartiTime },
              { label: "Next darshan in", value: <Countdown time={settings.darshanTime} /> },
            ].map((s) => (
              <div key={s.label} className="px-3 text-center">
                <dd className="font-display text-xl font-semibold text-stone-900 sm:text-2xl md:text-[1.7rem]">{s.value}</dd>
                <dt className="mt-0.5 text-[10px] font-medium tracking-wider text-stone-500 uppercase md:text-[11px]">{s.label}</dt>
              </div>
            ))}
          </motion.dl>

          <motion.p {...fadeUp(0.56)} className="mt-5 flex items-start justify-center gap-1.5 text-sm text-stone-500 lg:justify-start">
            <IconMapPin size={16} className="text-orange-500" /> {settings.address}
          </motion.p>
        </div>

        {/* Image composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          className="relative mx-auto aspect-[4/5] w-[82%] max-w-[460px] sm:w-full [perspective:1200px]"
        >
          <Mandala className="pointer-events-none absolute -inset-[22%] animate-spin-slower text-orange-300/60" />
          <div className="pointer-events-none absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-orange-400/40 to-rose-400/30 blur-3xl" />

          <motion.div style={{ rotateX, rotateY }} className="relative h-full w-full [transform-style:preserve-3d]">
            <div className="absolute inset-0 overflow-hidden rounded-[2.25rem] border-[6px] border-white bg-orange-100 shadow-[0_40px_80px_-30px_rgba(124,45,18,0.55)]">
              <MainMedia settings={settings} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white">
                <p className="text-[11px] font-medium tracking-[0.25em] uppercase opacity-80">Tonight</p>
                <p className="font-display text-2xl font-semibold">Shringar Darshan</p>
              </div>
            </div>

            {float1 && (
              <motion.div
                initial={{ opacity: 0, x: -30, rotate: -10 }}
                animate={{ opacity: 1, x: 0, rotate: -7 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                style={{ translateZ: 60 }}
                className="absolute top-10 -left-3 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:-left-14 sm:w-36"
              >
                <img src={float1} alt="" className="aspect-[3/4] w-full object-cover" />
              </motion.div>
            )}
            {float2 && (
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: 6 }}
                transition={{ delay: 0.85, duration: 0.8 }}
                style={{ translateZ: 80 }}
                className="absolute -right-3 bottom-20 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:-right-12 sm:w-48"
              >
                <img src={float2} alt="" className="aspect-[4/3] w-full object-cover" />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              style={{ translateZ: 100 }}
              className="absolute -top-5 -right-2 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md sm:-right-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-white">
                <IconFlame size={18} className="animate-flame" />
              </span>
              <span className="text-left">
                <span className="block text-[10px] font-medium tracking-wider text-stone-500 uppercase">Shayan Aarti</span>
                <span className="flex items-center gap-1 font-display text-lg leading-tight font-semibold text-stone-900">
                  <IconClock size={14} className="text-orange-500" /> {settings.aartiTime}
                </span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
