"use client";
import { useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/**
 * Cards that sit in a grid on tablet/desktop but become a swipeable row with
 * small ‹ › arrows on phones (one card plus a peek of the next).
 * `grid` is the class list used from the `sm` breakpoint up.
 */
export function PhoneSwipe({ children, grid, className }: { children: React.ReactNode; grid: string; className?: string }) {
  const row = useRef<HTMLDivElement>(null);
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

  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white/90 text-stone-700 shadow-sm transition hover:border-orange-400 hover:text-orange-600 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className={className}>
      <div className="mb-2 flex justify-end gap-2 sm:hidden">
        <button type="button" aria-label="Previous" disabled={edge.start} onClick={() => go(-1)} className={arrow}>
          <IconChevronLeft size={16} />
        </button>
        <button type="button" aria-label="Next" disabled={edge.end} onClick={() => go(1)} className={arrow}>
          <IconChevronRight size={16} />
        </button>
      </div>
      <div
        ref={row}
        className={cn(
          "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-5 px-5 py-2",
          "[&>*]:w-[78%] [&>*]:shrink-0 [&>*]:snap-start",
          "sm:mx-0 sm:overflow-visible sm:p-0 sm:[&>*]:w-auto",
          grid,
        )}
      >
        {children}
      </div>
    </div>
  );
}
