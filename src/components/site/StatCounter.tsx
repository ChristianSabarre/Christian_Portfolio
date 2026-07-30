"use client";

import { useEffect, useRef } from "react";

/**
 * Shows `value`, counting up to it the first time it scrolls into view.
 *
 * The real number is rendered on the server and never held in state — the
 * count-up is a DOM text mutation layered on top. So if the animation is
 * skipped (reduced motion, no IntersectionObserver, effect never runs) the
 * correct figure is already on screen rather than a stuck zero.
 */
export default function StatCounter({ value, label }: { value: string; label: string }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const target = Number.parseFloat(value);
  const isNumeric = /^\d+$/.test(value.trim()) && Number.isFinite(target);

  useEffect(() => {
    const node = numberRef.current;
    if (!node || !isNumeric || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const duration = 1100;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo — fast start, gentle settle.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          node.textContent = String(Math.round(eased * target));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      // Leave the true value behind if we unmount mid-count.
      node.textContent = String(target);
    };
  }, [isNumeric, target]);

  return (
    <div className="text-center sm:text-left">
      <div className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">
        <span ref={numberRef}>{value}</span>
      </div>
      <div className="eyebrow mt-1 text-faint">{label}</div>
    </div>
  );
}
