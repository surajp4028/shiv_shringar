"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Smooth photo slider for lightboxes. All slides sit side by side; dragging
 * (finger, mouse) moves the whole strip with the pointer and letting go glides
 * to the next/previous slide. Also supports trackpad swipes and ← → keys.
 */
export function Slides<T>({
  items,
  index,
  onIndex,
  render,
  className,
}: {
  items: T[];
  index: number;
  onIndex: (i: number) => void;
  render: (item: T, i: number, active: boolean) => React.ReactNode;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; t: number; id: number; horizontal: boolean | null } | null>(null);
  const wheel = useRef({ x: 0, lock: 0 });
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const n = items.length;

  const go = (i: number) => onIndex(Math.max(0, Math.min(n - 1, i)));

  useEffect(() => {
    if (n < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onIndex(Math.min(n - 1, index + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, n, onIndex]);

  const finish = (x: number) => {
    const s = start.current;
    start.current = null;
    setDragging(false);
    setDx(0);
    if (!s || !s.horizontal) return;
    const w = box.current?.clientWidth || 1;
    const dist = x - s.x;
    const speed = Math.abs(dist) / Math.max(1, Date.now() - s.t);
    if (dist < -w * 0.18 || (dist < -25 && speed > 0.45)) go(index + 1);
    else if (dist > w * 0.18 || (dist > 25 && speed > 0.45)) go(index - 1);
  };

  return (
    <div
      ref={box}
      className={cn("relative touch-pan-y overflow-hidden select-none", n > 1 && "cursor-grab active:cursor-grabbing", className)}
      onPointerDown={(e) => {
        if (n < 2 || e.button !== 0) return;
        // Let native video controls work.
        if ((e.target as HTMLElement).closest("video[controls], iframe")) return;
        start.current = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId, horizontal: null };
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s || s.id !== e.pointerId) return;
        const mx = e.clientX - s.x;
        const my = e.clientY - s.y;
        if (s.horizontal === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) {
          s.horizontal = Math.abs(mx) > Math.abs(my);
          if (s.horizontal) {
            setDragging(true);
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {}
          }
        }
        if (!s.horizontal) return;
        // Resist at the ends.
        const atEdge = (index === 0 && mx > 0) || (index === n - 1 && mx < 0);
        setDx(atEdge ? mx * 0.3 : mx);
      }}
      onPointerUp={(e) => finish(e.clientX)}
      onPointerCancel={() => finish(start.current?.x ?? 0)}
      onWheel={(e) => {
        if (n < 2 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        const now = Date.now();
        if (now < wheel.current.lock) return;
        wheel.current.x += e.deltaX;
        if (Math.abs(wheel.current.x) > 60) {
          go(index + (wheel.current.x > 0 ? 1 : -1));
          wheel.current = { x: 0, lock: now + 500 };
        }
      }}
    >
      <div
        className="flex h-full w-full"
        style={{
          transform: `translate3d(calc(${-index * 100}% + ${dx}px), 0, 0)`,
          transition: dragging ? "none" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {items.map((item, i) => (
          <div key={i} className="flex h-full w-full shrink-0 items-center justify-center [&_img]:pointer-events-none" aria-hidden={i !== index}>
            {/* Only mount nearby slides so big photos/videos don't all load at once. */}
            {Math.abs(i - index) <= 1 ? render(item, i, i === index) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
