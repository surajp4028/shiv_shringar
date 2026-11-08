"use client";
import { motion } from "motion/react";
import { SectionHeading } from "./section-heading";
import type { ScheduleItem } from "@/lib/types";

const minutes = (t: string) => {
  const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3]?.toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
};

export function Schedule({ items }: { items: ScheduleItem[] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => minutes(a.time) - minutes(b.time));
  return (
    <section id="schedule" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeading eyebrow="Daily Programme" title="Darshan & Aarti Timings" />
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[5.5rem] w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent md:left-1/2" />
          <ul className="space-y-8">
            {sorted.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.05 }}
                className={`relative flex items-start gap-6 md:w-1/2 ${i % 2 ? "md:ml-auto md:pl-12" : "md:flex-row-reverse md:pr-12 md:text-right"}`}
              >
                <span className={`absolute top-3 left-[5.5rem] h-3 w-3 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_14px_3px_rgba(245,158,11,0.6)] ${i % 2 ? "md:left-0" : "md:left-full"}`} />
                <p className="text-sacred w-20 shrink-0 font-display text-xl font-semibold md:hidden">{s.time}</p>
                <div className="flex-1 rounded-2xl border border-orange-100 bg-white p-5 pl-8 md:pl-5">
                  <p className="text-sacred hidden font-display text-2xl font-semibold md:block">{s.time}</p>
                  <p className="text-[10px] tracking-widest text-orange-600 uppercase">{s.day}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-stone-900">{s.title}</h3>
                  {s.description && <p className="mt-1 text-sm text-stone-600">{s.description}</p>}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
