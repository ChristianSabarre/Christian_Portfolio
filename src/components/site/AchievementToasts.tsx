"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import PixelSprite from "@/components/PixelSprite";
import { ACHIEVEMENT_EVENT, track, type Achievement } from "@/lib/achievements";

const SHOW_MS = 4200;

/**
 * Game-style "ACHIEVEMENT UNLOCKED" toasts, shown one at a time from a queue so
 * simultaneous unlocks read as a satisfying little parade rather than a pile.
 *
 * pointer-events-none is load-bearing: the toast overlaps the sticky view-mode
 * controls in the top-right, and without it an unlock would silently swallow
 * clicks on them for its whole four seconds.
 * Mount once on the public layout; unlock events arrive via a CustomEvent.
 */
export default function AchievementToasts() {
  const [current, setCurrent] = useState<Achievement | null>(null);
  const queue = useRef<Achievement[]>([]);
  const showing = useRef(false);

  useEffect(() => {
    function showNext() {
      const next = queue.current.shift();
      if (!next) {
        showing.current = false;
        return;
      }
      showing.current = true;
      setCurrent(next);
      window.setTimeout(() => {
        setCurrent(null);
        // Small gap so back-to-back toasts visibly re-enter.
        window.setTimeout(showNext, 350);
      }, SHOW_MS);
    }

    function onUnlock(event: Event) {
      queue.current.push((event as CustomEvent<Achievement>).detail);
      if (!showing.current) showNext();
    }

    window.addEventListener(ACHIEVEMENT_EVENT, onUnlock);

    // Entering the site at all is the first unlock, after a beat.
    const visitTimer = window.setTimeout(() => track.visit(), 2500);

    return () => {
      window.removeEventListener(ACHIEVEMENT_EVENT, onUnlock);
      window.clearTimeout(visitTimer);
    };
  }, []);

  if (!current) return null;

  return (
    <motion.div
      role="status"
      className="pointer-events-none fixed right-4 top-20 z-[75] flex items-center gap-3 border-2 border-gold bg-bg-raised px-4 py-3"
      style={{ boxShadow: "4px 4px 0 0 color-mix(in oklab, var(--gold) 45%, transparent)" }}
      initial={{ opacity: 0, y: -28, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      <PixelSprite src="/sprites/star-twinkle.png" frames={6} size={28} fps={8} />
      <div className="min-w-0">
        <p className="eyebrow text-gold">Achievement unlocked</p>
        <p className="font-display text-sm font-bold leading-tight">{current.title}</p>
        <p className="text-xs text-muted">{current.description}</p>
      </div>
    </motion.div>
  );
}
