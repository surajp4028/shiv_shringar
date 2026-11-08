"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import DottedMap from "dotted-map";

// Aceternity "World Map", extended with an optional lat/lng region (so it can
// zoom into India) and point labels.

type Point = { lat: number; lng: number; label?: string };

interface MapProps {
  dots?: Array<{ start: Point; end: Point }>;
  lineColor?: string;
  dotColor?: string;
  region?: { lat: { min: number; max: number }; lng: { min: number; max: number } };
  height?: number;
  showLabels?: boolean;
  /** ISO3 codes, e.g. ["IND"], to draw only those countries. */
  countries?: string[];
}

export default function WorldMap({
  dots = [],
  lineColor = "#f59e0b",
  dotColor = "#FFFFFF33",
  region,
  height = 100,
  showLabels = false,
  countries,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.3 });

  const { svgMap, width, mapHeight, box } = useMemo(() => {
    const map = new DottedMap({
      height,
      grid: "diagonal",
      ...(region ? { region } : {}),
      ...(countries ? { countries } : {}),
    });
    const svg = map.getSVG({ radius: 0.22, color: dotColor, shape: "circle", backgroundColor: "transparent" });
    const img = map.image as { width: number; height: number; region?: MapProps["region"] };
    return {
      svgMap: svg,
      width: img.width,
      mapHeight: img.height,
      box: img.region ?? region ?? { lat: { min: -90, max: 90 }, lng: { min: -180, max: 180 } },
    };
  }, [height, region, dotColor, countries]);

  // Project into the same coordinate space as the dotted SVG.
  const W = 800;
  const H = (W * mapHeight) / width;
  const project = (lat: number, lng: number) => ({
    x: ((lng - box.lng.min) / (box.lng.max - box.lng.min)) * W,
    y: ((box.lat.max - lat) / (box.lat.max - box.lat.min)) * H,
  });

  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const midX = (a.x + b.x) / 2;
    const midY = Math.min(a.y, b.y) - Math.max(40, Math.abs(a.x - b.x) * 0.35);
    return `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
  };

  const labels = new Map<string, Point>();
  dots.forEach((d) => {
    if (d.start.label) labels.set(d.start.label, d.start);
    if (d.end.label) labels.set(d.end.label, d.end);
  });

  return (
    <div ref={containerRef} className="relative w-full font-sans" style={{ aspectRatio: `${W} / ${H}` }}>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        alt="map"
        draggable={false}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full select-none">
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => (
          <motion.path
            key={`path-${i}`}
            d={curve(project(dot.start.lat, dot.start.lng), project(dot.end.lat, dot.end.lng))}
            fill="none"
            stroke="url(#path-gradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={
              inView
                ? { duration: 1.6, delay: 0.4 * i, ease: "easeOut", repeat: Infinity, repeatType: "loop", repeatDelay: 2.5 }
                : { duration: 0 }
            }
          />
        ))}

        {[...labels.values()].map((p, i, all) => {
          const { x, y } = project(p.lat, p.lng);
          // If another pin sits just to the right, put this label on the left so they don't collide.
          const crowded = all.some((q) => {
            const o = project(q.lat, q.lng);
            return q !== p && o.x > x && o.x - x < 220 && Math.abs(o.y - y) < 40;
          });
          return (
            <g key={`pt-${i}`}>
              <circle cx={x} cy={y} r="5" fill={lineColor} />
              <circle cx={x} cy={y} r="5" fill={lineColor} opacity="0.5">
                <animate attributeName="r" from="5" to="18" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite" />
              </circle>
              {showLabels && (
                <text
                  x={crowded ? x - 14 : x + 14}
                  y={y + 8}
                  textAnchor={crowded ? "end" : "start"}
                  className="fill-stone-800 text-[26px] font-semibold"
                  style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 6 }}
                >
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
