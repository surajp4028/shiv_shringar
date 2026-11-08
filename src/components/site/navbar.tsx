"use client";
import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const items = [
  { name: "Darshan", link: "#darshan" },
  { name: "Specials", link: "#special" },
  { name: "Videos", link: "#videos" },
  { name: "Events", link: "#events" },
  { name: "Yatra", link: "#yatra" },
  { name: "Contact", link: "#contact" },
];

function Logo() {
  return (
    <a href="#top" className="relative z-20 mr-4 flex items-center gap-2.5 px-1 py-1">
      <img src="/brand/logo.png" alt="" className="h-10 w-10 rounded-full object-cover shadow-md ring-2 ring-white" />
      <span className="leading-tight">
        <span className="text-sacred block font-display text-lg font-bold">Shiv Shringar</span>
        <span className="block text-[10px] font-medium tracking-[0.2em] text-stone-500 uppercase">Sewa Samiti</span>
      </span>
    </a>
  );
}

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <Navbar className="fixed top-3">
      <NavBody>
        <Logo />
        <NavItems items={items} />
        <div className="relative z-20">
          <NavbarButton href="#support" variant="gradient">
            Offer Seva
          </NavbarButton>
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <Logo />
          <MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
          {[...items, { name: "Offer Seva", link: "#support" }].map((item) => (
            <a key={item.link} href={item.link} onClick={() => setOpen(false)} className="w-full text-lg text-stone-700">
              {item.name}
            </a>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
