"use client";

import { motion } from "motion/react";
import { useMotionAllowed } from "@/lib/useMedia";

/**
 * Reveals a headline word by word with an overshooting spring.
 *
 * The text is always present as real text in a single element for screen
 * readers and copy/paste; only the visual layer is split into words.
 */
export default function RevealText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const animate = useMotionAllowed();
  const words = text.split(" ").filter(Boolean);

  if (!animate || words.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", rotate: 6, opacity: 0 }}
              animate={{ y: "0%", rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 24,
                mass: 0.7,
                delay: delay + i * 0.06,
              }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 ? <span>&nbsp;</span> : null}
          </span>
        ))}
      </span>
    </span>
  );
}
