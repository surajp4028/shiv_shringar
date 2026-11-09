"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps the big photo in a lightbox so it can be changed by hand:
 * finger swipe (phone), mouse drag, two-finger trackpad swipe, or ← → keys.
 * The photo follows the finger while dragging, then snaps back or moves on.
 */
export function Swipe({
  onPrev,
  onNext,
  children,
  className,
  enabled = true,
}: {
  onPrev: () => void;
  onNext: () => void;
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}) {
  const start = useRef<{ x: number; y: number; t: number; id: number } | null>(null);
  const wheel = useRef({ x: 0, lock: 0 });
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Keyboard arrows while the lightbox is open.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onPrev, onNext]);

  const end = (x: number) => {
    const s = start.current;
    start.current = null;
    setDragging(false);
    setDx(0);
    if (!s) return;
    const dist = x - s.x;
    const speed = Math.abs(dist) / Math.max(1, Date.now() - s.t); // px per ms
    if (dist < -60 || (dist < -20 && speed > 0.5)) onNext();
    else if (dist > 60 || (dist > 20 && speed > 0.5)) onPrev();
  };

  return (
    <div
      className={cn("touch-pan-y select-none [&_img]:pointer-events-none", enabled && "cursor-grab active:cursor-grabbing", className)}
      style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: dragging ? "none" : "transform 0.25s ease" }}
      onPointerDown={(e) => {
        if (!enabled || e.button !== 0) return;
        start.current = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Some browsers refuse capture for synthetic/odd pointers; swiping still works.
        }
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s || s.id !== e.pointerId) return;
        const moveX = e.clientX - s.x;
        // Only treat it as a swipe once it's clearly horizontal.
        if (!dragging && Math.abs(moveX) > 8 && Math.abs(moveX) > Math.abs(e.clientY - s.y)) setDragging(true);
        if (dragging || Math.abs(moveX) > 8) setDx(moveX * 0.6);
      }}
      onPointerUp={(e) => end(e.clientX)}
      onPointerCancel={() => end(start.current?.x ?? 0)}
      onWheel={(e) => {
        // Two-finger horizontal swipe on a trackpad.
        if (!enabled || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        const now = Date.now();
        if (now < wheel.current.lock) return;
        wheel.current.x += e.deltaX;
        if (Math.abs(wheel.current.x) > 70) {
          if (wheel.current.x > 0) onNext();
          else onPrev();
          wheel.current = { x: 0, lock: now + 450 };
        }
      }}
    >
      {children}
    </div>
  );
}
