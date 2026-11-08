"use client";
import React, { useRef, useEffect, useState, useId } from "react";
import { motion } from "motion/react";

export const TextHoverEffect = ({
  text,
  duration,
  automatic = false,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const [touching, setTouching] = useState(false);

  // Automatic mode (touch screens): the glow sweeps across the word on its own,
  // but only while the word is actually on screen (and not display:none).
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    if (!automatic || !svgRef.current) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(svgRef.current);
    return () => io.disconnect();
  }, [automatic]);
  useEffect(() => {
    if (!automatic || touching || !onScreen) return;
    setHovered(true);
    let timer = 0;
    const start = performance.now();
    // ~20 fps is plenty for a slow glow and keeps React work tiny.
    const tick = () => {
      const t = (performance.now() - start) / 1600;
      setMaskPosition({ cx: `${50 + 42 * Math.sin(t)}%`, cy: `${50 + 18 * Math.sin(t * 1.7)}%` });
    };
    timer = window.setInterval(tick, 50);
    return () => window.clearInterval(timer);
  }, [automatic, touching, onScreen]);

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      // A hidden / not-yet-laid-out SVG measures 0×0, which would give NaN%.
      if (!svgRect.width || !svgRect.height) return;
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(automatic)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      onTouchStart={(e) => {
        setTouching(true);
        setHovered(true);
        setCursor({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }}
      onTouchMove={(e) => setCursor({ x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={() => setTouching(false)}
      className="select-none"
    >
      <defs>
        <linearGradient
          id={`textGradient-${uid}`}
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="75%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#d4a24c" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id={`revealMask-${uid}`}
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}

          // example for a smoother animation below

          //   transition={{
          //     type: "spring",
          //     stiffness: 300,
          //     damping: 50,
          //   }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={`textMask-${uid}`}>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#revealMask-${uid})`}
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-orange-700/80 font-display text-[54px] font-semibold dark:stroke-amber-900/40"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-orange-700/80 font-display text-[54px] font-semibold dark:stroke-amber-900/40"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke={`url(#textGradient-${uid})`}
        strokeWidth="0.3"
        mask={`url(#textMask-${uid})`}
        className="fill-transparent font-display text-[54px] font-semibold"
      >
        {text}
      </text>
    </svg>
  );
};
