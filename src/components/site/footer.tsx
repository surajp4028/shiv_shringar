import { IconBrandInstagram, IconBrandYoutube, IconBrandWhatsapp, IconMapPin } from "@tabler/icons-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { waLink } from "@/lib/media";
import type { Settings } from "@/lib/types";

const links = [
  { name: "Darshan", href: "#darshan" },
  { name: "Videos", href: "#videos" },
  { name: "Events", href: "#events" },
  { name: "Yatra", href: "#yatra" },
  { name: "Gallery", href: "#gallery" },
  { name: "Support", href: "#support" },
  { name: "Contact", href: "#contact" },
];

export function Footer({ settings, hidden = [] }: { settings: Settings; hidden?: string[] }) {
  return (
    <footer className="bg-[#1a0f0a] pb-10 text-stone-300">
      <div className="mx-auto hidden h-[16rem] max-w-6xl items-center justify-center md:flex">
        <TextHoverEffect text="MAHADEV" />
      </div>
      <div className="mx-auto flex h-36 items-center justify-center px-2 pt-6 md:hidden">
        <TextHoverEffect text="MAHADEV" automatic />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-6 md:grid-cols-3 md:pt-0">
        <div>
          <div className="flex items-center gap-3">
            <img src="/brand/logo.png" alt="" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="text-gold font-display text-xl font-semibold">{settings.samitiName}</p>
              <p className="text-xs text-stone-500">{settings.templeName}</p>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-stone-400">
            <IconMapPin size={16} className="mt-0.5 shrink-0 text-orange-400" /> {settings.address}
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm md:justify-self-center">
          {links.filter((l) => !hidden.includes(l.href.slice(1))).map((l) => (
            <a key={l.href} href={l.href} className="text-stone-400 transition hover:text-orange-300">
              {l.name}
            </a>
          ))}
        </nav>
        <div className="md:justify-self-end">
          <p className="text-sm text-stone-400">Darshan {settings.darshanTime} · Aarti {settings.aartiTime}</p>
          <div className="mt-4 flex gap-3">
            {[
              { href: settings.instagram, icon: IconBrandInstagram, label: "Instagram" },
              { href: settings.youtube, icon: IconBrandYoutube, label: "YouTube" },
              { href: waLink(settings.whatsapp, "Har Har Mahadev 🙏"), icon: IconBrandWhatsapp, label: "WhatsApp" },
            ].map(({ href, icon: Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full border border-white/10 bg-white/5 p-2.5 transition hover:border-orange-400/50 hover:text-orange-300">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/10 px-5 pt-6 text-xs text-stone-500 md:flex-row">
        <p>© {new Date().getFullYear()} {settings.samitiName}. All rights reserved.</p>
        <p className="font-display text-base text-orange-300/80 italic">Om Namah Shivaya · Har Har Mahadev</p>
      </div>
    </footer>
  );
}
