"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconChevronLeft, IconChevronRight, IconFlower, IconFlame, IconMusic, IconSparkles, IconBowlSpoon, IconRoute } from "@tabler/icons-react";
import { SectionHeading } from "./section-heading";
import type { Settings } from "@/lib/types";

const seva = [
  { icon: IconFlower, title: "Daily Shringar", text: "Every evening the Shivling and Mata Rani are adorned with flowers, sandalwood, garments and ornaments." },
  { icon: IconFlame, title: "Aarti & Rudrabhishek", text: "Shayan aarti every night, Rudrabhishek on Mondays and Hanuman aarti every Tuesday." },
  { icon: IconMusic, title: "Bhajan & Kirtan", text: "Evening bhajan sandhya with dholak and manjeera, sung together by the whole neighbourhood." },
  { icon: IconSparkles, title: "Festival Shringar", text: "Mahakal, the nine forms of Durga, Shiv Parivar, Krishna's Nauka Vihar — a new form for every festival." },
  { icon: IconBowlSpoon, title: "Prasad Seva", text: "Prasad after every aarti, and bhandara on special occasions." },
  { icon: IconRoute, title: "Pilgrimages", text: "Group yatras to Ujjain Mahakal, Kubereshwar Dham in Sehore, ISKCON and more." },
];

export function About({ settings }: { settings: Settings }) {
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const go = (dir: number) => {
    const el = row.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + 12), behavior: "smooth" });
  };
  const arrow = "flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white/90 text-stone-700 shadow-sm transition hover:border-orange-400 hover:text-orange-600 disabled:pointer-events-none disabled:opacity-30";
  const photos = ["/media/mahakal/mahakal-3.jpg", "/media/mahakal/mahakal-6.jpg", "/media/mahakal/mahakal-7.jpg"];
  return (
    <section id="about" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4"
          >
            <img src={photos[0]} alt="Sewaks preparing the shringar" className="row-span-2 h-full w-full rounded-3xl object-cover shadow-xl" />
            <img src={photos[1]} alt="Bhajan with the dholak" className="aspect-square w-full rounded-3xl object-cover shadow-lg" />
            <img src={photos[2]} alt="Evening aarti" className="aspect-square w-full rounded-3xl object-cover shadow-lg" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl border border-orange-100 bg-white px-6 py-4 text-center shadow-xl">
              <p className="text-sacred font-display text-4xl font-bold">365</p>
              <p className="text-xs text-stone-500">days of shringar every year</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <SectionHeading eyebrow="Our Seva" title={<>Serving Mahadev, <span className="italic">every single day</span></>} className="mb-8 text-left lg:mx-0 [&>div]:justify-start" />
            <p className="font-display text-xl leading-snug text-stone-800 sm:text-2xl md:text-[1.7rem]">
              {settings.templeName}, East Azad Nagar — where Bholenath is adorned in a new form every evening.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed whitespace-pre-line text-stone-600 md:mt-6 md:text-base">{settings.aboutText}</p>
          </motion.div>
        </div>

        {/* Phone: swipeable row (like the videos). Tablet and up: grid. */}
        <div className="mt-14 flex justify-end gap-2 sm:hidden">
          <button type="button" aria-label="Previous" disabled={edge.start} onClick={() => go(-1)} className={arrow}><IconChevronLeft size={16} /></button>
          <button type="button" aria-label="Next" disabled={edge.end} onClick={() => go(1)} className={arrow}><IconChevronRight size={16} /></button>
        </div>
        <ul ref={row} className="no-scrollbar -mx-5 mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-5 px-5 py-2 sm:mx-0 sm:mt-20 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-3 md:mt-24">
          {seva.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-orange-100 bg-white p-5 sm:w-auto sm:rounded-3xl sm:p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_24px_50px_-24px_rgba(194,65,12,0.35)]"
            >
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-orange-100/70 transition duration-500 group-hover:scale-125" />
              <div className="relative w-fit rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-2.5 text-white sm:rounded-2xl sm:p-3 shadow-lg shadow-orange-500/30">
                <Icon size={22} />
              </div>
              <h3 className="relative mt-4 font-display text-lg leading-tight font-semibold text-stone-900 sm:mt-6 sm:text-2xl">{title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-stone-600 sm:mt-2">{text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
