"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useMotionAllowed } from "@/lib/useMedia";

const SEEN_KEY = "portfolio-intro-seen";

/**
 * Brief load-in shown once per browser session.
 *
 * Deliberately cannot trap the visitor: it renders nothing on the server, is
 * skipped entirely under reduced motion, unmounts on a timer rather than on an
 * animation callback, and sits behind `pointer-events-none` for its final
 * moments so it can never block a click even if something stalls.
 */
export default function IntroOverlay({ title }: { title: string }) {
  const animate = useMotionAllowed();
  const [phase, setPhase] = useState<"hidden" | "playing" | "done">("hidden");

  useEffect(() => {
    if (!animate) return;
    let seen = true;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false; // Storage blocked — play it, harmless.
    }
    if (seen) return;

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Non-fatal.
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- gated on session storage, which the server cannot read
    setPhase("playing");
    const timer = window.setTimeout(() => setPhase("done"), 1500);
    return () => window.clearTimeout(timer);
  }, [animate]);

  if (phase !== "playing") return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[80] grid place-items-center bg-bg"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.45, delay: 0.95, ease: "easeInOut" }}
      style={{ pointerEvents: "none" }}
    >
      <div className="flex flex-col items-center gap-5">
        <motion.span
          className="block h-1 w-40 origin-left rounded-full bg-gradient-to-r from-accent to-accent-2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.p
          className="font-display text-2xl font-semibold tracking-tight"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.15 }}
        >
          {title}
        </motion.p>
      </div>
    </motion.div>
  );
}
