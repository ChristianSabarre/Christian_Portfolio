"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRichPointerEffects } from "@/lib/useMedia";

/**
 * Trailing ring that grows over interactive elements.
 *
 * Additive only — the native cursor is left visible, so nothing becomes harder
 * to aim with, and the whole thing is skipped on touch and under reduced
 * motion. Position is driven through motion values rather than React state so
 * pointer movement never triggers a re-render.
 */
export default function CustomCursor() {
  const enabled = useRichPointerEffects();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 26, mass: 0.45 });
  const ringY = useSpring(y, { stiffness: 380, damping: 26, mass: 0.45 });

  useEffect(() => {
    if (!enabled) return;

    const INTERACTIVE = 'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';

    function onMove(event: PointerEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visible) setVisible(true);
      const el = event.target as Element | null;
      setActive(Boolean(el?.closest?.(INTERACTIVE)));
    }
    function onLeave() {
      setVisible(false);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, visible, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden lg:block"
      style={{ x: ringX, y: ringY }}
    >
      <motion.span
        className="block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent-2"
        animate={{
          width: active ? 44 : 26,
          height: active ? 44 : 26,
          opacity: visible ? (active ? 0.9 : 0.55) : 0,
          backgroundColor: active ? "color-mix(in oklab, var(--accent-2) 18%, transparent)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 24, mass: 0.5 }}
      />
    </motion.div>
  );
}
