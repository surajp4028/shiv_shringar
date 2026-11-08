"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconSend,
  IconCircleCheck,
  IconMail,
  IconPhone,
  IconMapPin,
  IconLoader2,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandWhatsapp,
  IconClock,
} from "@tabler/icons-react";
import WorldMap from "@/components/ui/world-map";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMounted } from "@/hooks/use-mounted";
import { SectionHeading } from "./section-heading";
import { waLink } from "@/lib/media";
import type { Settings, TripItem } from "@/lib/types";

type Status = "idle" | "sending" | "sent" | "error";

const INDIA = ["IND"];

export function Contact({ settings, trips }: { settings: Settings; trips: TripItem[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const mounted = useMounted();

  const home = { lat: settings.mapLat, lng: settings.mapLng, label: "Prachin Hanuman Mandir" };
  const dots = trips
    .filter((t) => t.lat && t.lng && Math.abs(t.lat - home.lat) + Math.abs(t.lng - home.lng) > 1)
    .map((t) => ({ start: home, end: { lat: t.lat, lng: t.lng, label: t.place.split(",")[0] } }));

  const links = [
    { icon: IconMapPin, label: settings.address, href: settings.mapUrl || `https://www.google.com/maps/search/?api=1&query=${settings.mapLat},${settings.mapLng}` },
    { icon: IconPhone, label: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { icon: IconBrandWhatsapp, label: "WhatsApp us", href: waLink(settings.whatsapp, "Har Har Mahadev 🙏") },
    { icon: IconMail, label: settings.email, href: `mailto:${settings.email}` },
    { icon: IconClock, label: `Darshan ${settings.darshanTime} • Aarti ${settings.aartiTime}` },
  ];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong");
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-to-b from-[#fbf7f1] to-[#f6ede1] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Contact"
          title="Get in Touch"
          description="Want to join the shringar seva, ask about a festival, or arrange a prasad seva? Send us a message and the samiti will get back to you."
        />

        <div className="relative mx-auto mb-10 max-w-[280px] sm:max-w-md md:mb-12">
          {mounted && <WorldMap dots={dots} countries={INDIA} height={60} lineColor="#f59e0b" dotColor="#9a341238" showLabels />}
        </div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-3xl bg-[#1a0f0a] p-8 text-white lg:col-span-2">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-600/30 blur-3xl" />
            <div className="relative z-10">
              <img src="/brand/logo.png" alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-amber-400/30" />
              <h3 className="text-gold mt-4 font-display text-3xl font-semibold">{settings.samitiName}</h3>
              <p className="mt-1 text-sm text-neutral-400">{settings.templeName}</p>
              <ul className="mt-8 space-y-4">
                {links.map(({ icon: Icon, label, href }) => {
                  const inner = (
                    <>
                      <span className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-amber-300"><Icon size={18} /></span>
                      <span>{label}</span>
                    </>
                  );
                  return (
                    <li key={label}>
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-3 text-sm text-neutral-300 transition hover:text-amber-300">{inner}</a>
                      ) : (
                        <span className="flex items-center gap-3 text-sm text-neutral-300">{inner}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 flex gap-3">
                <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-neutral-300 transition hover:text-pink-400"><IconBrandInstagram size={20} /></a>
                <a href={settings.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-neutral-300 transition hover:text-red-400"><IconBrandYoutube size={20} /></a>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl border border-orange-100 bg-white p-6 shadow-[0_30px_60px_-40px_rgba(124,45,18,0.4)] md:p-8 lg:col-span-3">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                  <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 15 }} className="rounded-full bg-orange-100 p-4 text-orange-600">
                    <IconCircleCheck size={48} />
                  </motion.div>
                  <h3 className="text-sacred mt-6 font-display text-3xl font-semibold">Har Har Mahadev! 🙏</h3>
                  <p className="mt-2 max-w-sm text-sm text-stone-600">We have received your message. Someone from the samiti will contact you soon.</p>
                  <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-sm font-medium text-orange-600 hover:underline">Send another message</button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={onSubmit} className="space-y-5">
                  <h3 className="font-display text-3xl font-semibold text-stone-900">Send a message</h3>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex w-full flex-col space-y-2">
                      <Label htmlFor="name">Your name</Label>
                      <Input id="name" name="name" placeholder="Your full name" required minLength={2} />
                    </div>
                    <div className="flex w-full flex-col space-y-2">
                      <Label htmlFor="phone">Phone / WhatsApp</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+91 98xxxxxxx" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" placeholder="Seva, shringar sponsorship, bhandara or any question..." required minLength={5} />
                  </div>
                  {status === "error" && <p role="alert" className="text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={status === "sending"} className="group/btn relative flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-orange-500 to-red-700 font-semibold text-white shadow-[0_12px_30px_-10px_rgba(194,65,12,0.8)] transition hover:brightness-110 disabled:opacity-70">
                    {status === "sending" ? (<><IconLoader2 size={18} className="animate-spin" /> Sending...</>) : (<>Send message <IconSend size={18} /></>)}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative mx-auto mt-6 max-w-6xl overflow-hidden rounded-3xl border border-orange-100 shadow-sm">
          <a href={settings.mapUrl || `https://www.google.com/maps/search/?api=1&query=${settings.mapLat},${settings.mapLng}`} target="_blank" rel="noreferrer" className="absolute right-3 bottom-3 z-10 flex items-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
            <IconMapPin size={16} /> Get directions
          </a>
          <iframe
            title="Prachin Hanuman Mandir location"
            src={`https://maps.google.com/maps?q=${settings.mapLat},${settings.mapLng}&z=17&output=embed`}
            className="h-80 w-full [filter:sepia(0.25)_saturate(0.9)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
