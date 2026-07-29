"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Counts up to `value` the first time it scrolls into view. Non-numeric values
 * (e.g. "10+") are shown verbatim.
 */
export default function StatCounter({ value, label }: { value: string; label: string }) {
  const numeric = Number.parseFloat(value);
  const isNumeric = Number.isFinite(numeric) && /^\d+$/.test(value.trim());
  const reduceMotion = useReducedMotion();

  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(() => (isNumeric && !reduceMotion ? 0 : numeric));
  const started = useRef(false);

  useEffect(() => {
    if (!isNumeric || reduceMotion) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const duration = 1100;
        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo — fast start, gentle settle.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setShown(Math.round(eased * numeric));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isNumeric, numeric, reduceMotion]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">
        {isNumeric ? shown : value}
      </div>
      <div className="eyebrow mt-1 text-faint">{label}</div>
    </div>
  );
}
