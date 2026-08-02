"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRichPointerEffects } from "@/lib/useMedia";

/**
 * Nudges its child toward the pointer while hovered.
 *
 * Wraps in a span rather than cloning the child, so it works with buttons,
 * links, and anything else without touching their props. Disabled on touch
 * devices and under reduced motion, where it renders the child untouched.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const enabled = useRichPointerEffects();
  const ref = useRef<HTMLSpanElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 320, damping: 18, mass: 0.5 });

  if (!enabled) return <span className={className}>{children}</span>;

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: springX, y: springY }}
      onPointerMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
