"use client";
import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "motion/react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

// Native <select> styled like the Aceternity Input (same hover spotlight).
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const radius = 100; // change this to increase the rdaius of the hover effect
    const [visible, setVisible] = React.useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      const { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }
    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
          #f59e0b,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input relative rounded-lg p-[2px] transition duration-300"
      >
        <select
          className={cn(
            `shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full cursor-pointer appearance-none rounded-md border-none bg-gray-50 py-2 pr-9 pl-3 invalid:text-neutral-400 [&>option]:text-black dark:[&>option]:bg-zinc-800 dark:[&>option]:text-white text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-amber-600/60`,
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      </motion.div>
    );
  },
);
Select.displayName = "Select";

export { Select };
