"use client";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import {
  IconFlower,
  IconBowlSpoon,
  IconHeartHandshake,
  IconSparkles,
  IconCopy,
  IconCheck,
  IconBuildingBank,
  IconQrcode,
  IconMicrophone2,
  IconGift,
  IconLoader2,
  IconSend,
  IconCircleCheck,
} from "@tabler/icons-react";
import { SEVA_TYPES } from "@/lib/seva";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiWhatsapp } from "react-icons/si";
import { SectionHeading } from "./section-heading";
import { PhoneSwipe } from "./phone-swipe";
import { waLink } from "@/lib/media";
import type { Settings } from "@/lib/types";

const ways = [
  { icon: IconMicrophone2, type: SEVA_TYPES[0], title: "Host a Program", text: "Organise a bhajan sandhya, kirtan, jagran or Sunderkand path — at the mandir or at your home — with our samiti." },
  { icon: IconFlower, type: SEVA_TYPES[1], title: "Sponsor a Shringar", text: "Offer one evening's shringar of Mahadev or Mata Rani — on a birthday, anniversary or in memory of a loved one." },
  { icon: IconGift, type: SEVA_TYPES[2], title: "Offer Shringar Items", text: "Give flowers, garlands, vastra, abhushan, diyas or decorations to be used in the shringar." },
  { icon: IconBowlSpoon, type: SEVA_TYPES[4], title: "Prasad & Bhandara", text: "Contribute towards the daily prasad or sponsor a bhandara on a festival or a special day." },
  { icon: IconSparkles, type: SEVA_TYPES[3], title: "Rudrabhishek & Puja", text: "Book a Rudrabhishek or puja for your family's wellbeing, performed with the samiti." },
  { icon: IconHeartHandshake, type: SEVA_TYPES[5], title: "Volunteer as a Sewak", text: "Join our team for shringar, aarti, bhajan, event setup or yatra planning. Every pair of hands is a blessing." },
];

type Status = "idle" | "sending" | "sent" | "error";

function SevaRequestForm({ type, setType }: { type: string; setType: (t: string) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

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
    <div id="seva-request" className="scroll-mt-24 rounded-[2rem] border border-orange-100 bg-white p-5 shadow-[0_30px_60px_-40px_rgba(124,45,18,0.45)] md:p-10">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center">
            <div className="rounded-full bg-orange-100 p-4 text-orange-600"><IconCircleCheck size={44} /></div>
            <h3 className="text-sacred mt-5 font-display text-3xl font-semibold">Thank you! Har Har Mahadev 🙏</h3>
            <p className="mt-2 max-w-md text-sm text-stone-600">Your request has reached the samiti. We will call or message you shortly to plan the seva together.</p>
            <button onClick={() => setStatus("idle")} className="mt-6 text-sm font-medium text-orange-600 hover:underline">Send another request</button>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-orange-600 uppercase">Request a Seva</p>
              <h3 className="mt-2 font-display text-[1.75rem] leading-tight font-semibold text-stone-900 md:text-4xl">Book a program or offer a seva</h3>
              <p className="mt-2 text-sm text-stone-600">Tell us what you would like to do and when. The samiti will get in touch to arrange everything.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>What would you like to do?</Label>
              <input type="hidden" name="type" value={type} />
              <div className="flex flex-wrap gap-2">
                {SEVA_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-full px-3.5 py-2 text-[13px] transition sm:px-4 sm:text-sm ${type === t ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md" : "border border-orange-200 bg-orange-50/50 text-stone-700 hover:border-orange-400"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sr-name">Your name</Label>
              <Input id="sr-name" name="name" required minLength={2} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sr-phone">Phone / WhatsApp</Label>
              <Input id="sr-phone" name="phone" type="tel" required placeholder="+91 98xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sr-email">Email (optional)</Label>
              <Input id="sr-email" name="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sr-date">Preferred date</Label>
              <Input id="sr-date" name="preferredDate" type="date" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sr-msg">Details</Label>
              <Textarea id="sr-msg" name="message" required minLength={5} placeholder="e.g. Bhajan sandhya at my home for my father's birthday, about 50 people…" />
            </div>
            {status === "error" && <p role="alert" className="text-sm text-red-600 md:col-span-2">{error}</p>}
            <button type="submit" disabled={status === "sending" || !type} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-red-700 font-semibold text-white shadow-[0_12px_30px_-10px_rgba(194,65,12,0.8)] transition hover:brightness-110 disabled:opacity-50 md:col-span-2">
              {status === "sending" ? <><IconLoader2 size={18} className="animate-spin" /> Sending…</> : <>{type ? "Send request" : "Choose a seva above"} <IconSend size={18} /></>}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Support({ settings }: { settings: Settings }) {
  const [copied, setCopied] = useState(false);
  const [type, setType] = useState("");
  const choose = (t: string) => {
    setType(t);
    document.getElementById("seva-request")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const upiLink = settings.upiId
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiName || settings.samitiName)}&cu=INR&tn=${encodeURIComponent("Shiv Shringar Seva")}`
    : "";

  const copy = async () => {
    await navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="support" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(251,146,60,0.18),transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow="Support the Seva"
          title="Be a Part of the Shringar"
          description="Want to host a program, offer a seva, give something for the shringar or simply help? Every offering, big or small, reaches Mahadev."
        />

        <div className="grid gap-6 lg:grid-cols-5">
          <PhoneSwipe className="min-w-0 lg:col-span-3" grid="sm:grid sm:grid-cols-2 sm:gap-5">
            {ways.map(({ icon: Icon, title, text, type: t }, i) => (
              <motion.button
                type="button"
                onClick={() => choose(t)}
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group rounded-2xl border border-orange-100 bg-white p-5 text-left sm:rounded-3xl sm:p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_24px_50px_-24px_rgba(194,65,12,0.35)]"
              >
                <div className="w-fit rounded-xl bg-orange-50 p-2.5 text-orange-600 sm:rounded-2xl sm:p-3 ring-1 ring-orange-100 transition group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-600 group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-3 font-display text-lg leading-tight font-semibold text-stone-900 sm:mt-5 sm:text-2xl">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600 sm:mt-2">{text}</p>
                <p className="mt-3 text-sm font-semibold text-orange-600 sm:mt-4 sm:text-sm sm:opacity-0 sm:transition sm:group-hover:opacity-100">Request →</p>
              </motion.button>
            ))}
          </PhoneSwipe>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-red-700 to-rose-900 p-6 text-white sm:p-8 shadow-[0_40px_80px_-40px_rgba(124,45,18,0.8)] lg:col-span-2"
          >
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-orange-200 uppercase">Offer your contribution</p>
              <h3 className="mt-3 font-display text-4xl leading-tight font-semibold">Every diya counts</h3>
              <p className="mt-4 text-sm leading-relaxed text-orange-50/85">{settings.donationNote}</p>

              {settings.upiQr && (
                <div className="mt-6 w-fit rounded-2xl bg-white p-3">
                  <img src={settings.upiQr} alt="UPI QR code" className="h-40 w-40 object-contain" />
                </div>
              )}

              {settings.upiId ? (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                    <span className="flex items-center gap-2 text-sm">
                      <IconQrcode size={18} /> <span className="font-mono">{settings.upiId}</span>
                    </span>
                    <button onClick={copy} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-700">
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />} {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <a href={upiLink} className="flex h-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 md:hidden">
                    Pay with any UPI app
                  </a>
                </div>
              ) : null}

              {settings.bankDetails && (
                <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm ring-1 ring-white/20">
                  <p className="mb-1 flex items-center gap-2 font-semibold"><IconBuildingBank size={16} /> Bank transfer</p>
                  <p className="whitespace-pre-line text-orange-50/85">{settings.bankDetails}</p>
                </div>
              )}

              <a
                href={waLink(settings.whatsapp, "Har Har Mahadev 🙏 I would like to contribute to / volunteer for the seva.")}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-white/15 text-sm font-semibold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
              >
                <SiWhatsapp /> {settings.upiId ? "Tell us about your offering" : "Contact us to contribute"}
              </a>
              <p className="mt-4 text-center text-xs text-orange-100/70">Every contribution is used only for the seva of Mahadev.</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-8">
          <SevaRequestForm type={type} setType={setType} />
        </div>
      </div>
    </section>
  );
}
