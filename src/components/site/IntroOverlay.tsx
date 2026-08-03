"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import PixelSprite from "@/components/PixelSprite";

const SEEN_KEY = "portfolio-intro-seen";

/**
 * Brief load-in shown once per browser session: the pixel character runs
 * across the screen ahead of the wordmark.
 *
 * Plays regardless of prefers-reduced-motion, deliberately: it is a one-shot
 * 1.8s decoration, and the OS toggle (often off by default on Windows) was
 * hiding the site's centrepiece from its own owner. It cannot trap the
 * visitor: nothing renders on the server, it unmounts on a timer rather than
 * an animation callback, and pointer-events stay off throughout.
 */
export default function IntroOverlay({ title }: { title: string }) {
  const [phase, setPhase] = useState<"hidden" | "playing" | "done">("hidden");

  useEffect(() => {
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
    const timer = window.setTimeout(() => setPhase("done"), 1900);
    return () => window.clearTimeout(timer);
  }, []);

  if (phase !== "playing") return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-bg"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.45, delay: 1.35, ease: "easeInOut" }}
      style={{ pointerEvents: "none" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Run cycle crossing the viewport; the wordmark chases it in. */}
        <div className="relative h-24 w-full">
          <motion.div
            className="absolute top-0"
            initial={{ x: "-30vw" }}
            animate={{ x: "60vw" }}
            transition={{ duration: 1.6, ease: "linear" }}
          >
            <PixelSprite src="/sprites/chris-run.png" frames={5} size={96} fps={12} />
          </motion.div>
        </div>

        <motion.span
          className="block h-1 w-40 origin-left rounded-full bg-gradient-to-r from-accent to-accent-2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.p
          className="font-display text-2xl font-semibold tracking-tight"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.2 }}
        >
          {title}
        </motion.p>
      </div>
    </motion.div>
  );
}
