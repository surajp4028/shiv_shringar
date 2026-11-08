"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal snap carousel with small arrow buttons tucked into the top-right
 * corner. Arrows fade out at either end; touch users simply swipe.
 */
export function Scroller({
  children,
  className,
  trackClassName,
  dark = false,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  trackClassName?: string;
  dark?: boolean;
  label?: React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * Math.max(260, el.clientWidth * 0.8), behavior: "smooth" });
  };

  const btn = cn(
    "flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition disabled:pointer-events-none disabled:opacity-30",
    dark
      ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
      : "border-orange-200 bg-white/90 text-stone-700 shadow-sm hover:border-orange-400 hover:text-orange-600",
  );

  return (
    <div className={cn("relative", className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">{label}</div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" aria-label="Scroll left" disabled={edge.start} onClick={() => go(-1)} className={btn}>
            <IconChevronLeft size={16} />
          </button>
          <button type="button" aria-label="Scroll right" disabled={edge.end} onClick={() => go(1)} className={btn}>
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={track}
        className={cn("no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 md:mx-0 md:px-0", trackClassName)}
      >
        {children}
      </div>
    </div>
  );
}
