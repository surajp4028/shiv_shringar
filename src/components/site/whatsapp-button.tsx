"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";
import { waLink } from "@/lib/media";

export function WhatsAppButton({ number }: { number: string }) {
  const [hovered, setHovered] = useState(false);
  if (!number) return null;
  return (
    <motion.a
      href={waLink(number, "Har Har Mahadev 🙏 I want to know more about Shiv Shringar Sewa Samiti.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.6 }}
      whileTap={{ scale: 0.92 }}
      className="fixed right-4 bottom-4 z-[80] md:right-6 md:bottom-6"
    >
      <span className="pointer-events-none absolute inset-1 animate-ping rounded-full bg-emerald-400/25 [animation-duration:2.8s]" />
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative flex h-12 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] px-[15px] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.6),inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-white/25"
      >
        <motion.span
          animate={{ rotate: [0, -12, 12, -8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 4 }}
          className="relative flex"
        >
          <SiWhatsapp className="h-5 w-5" />
        </motion.span>
        <AnimatePresence initial={false}>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="relative overflow-hidden pr-0.5 text-[13px] font-semibold whitespace-nowrap"
            >
              Chat on WhatsApp
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.a>
  );
}
