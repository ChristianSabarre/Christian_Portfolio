"use client";

import { useEffect, useRef } from "react";

/**
 * Plays a one-row sprite sheet by stepping background-position with a JS timer.
 *
 * Deliberately JS-driven rather than a CSS animation: the site's reduced-motion
 * rules zero out CSS animation durations globally, and many Windows machines
 * ship with "Animation effects" off — which froze the avatar for exactly the
 * person it depicts. A ~2fps 60px sprite is decorative, not vestibular, so it
 * is exempted by default; pass respectReducedMotion to opt back in.
 */
export default function PixelSprite({
  src,
  frames,
  size,
  fps = 2,
  alt = "",
  className = "",
  respectReducedMotion = false,
}: {
  /** Path to a one-row sprite sheet in /public. */
  src: string;
  frames: number;
  /** Rendered size of one square frame, in CSS px. */
  size: number;
  fps?: number;
  alt?: string;
  className?: string;
  respectReducedMotion?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || frames <= 1) return;
    if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    const id = window.setInterval(
      () => {
        if (document.hidden) return;
        frame = (frame + 1) % frames;
        // With background-size at frames×100%, x% aligns frame x/(n-1).
        node.style.backgroundPosition = `${(frame / (frames - 1)) * 100}% 0%`;
      },
      Math.max(40, Math.round(1000 / fps)),
    );
    return () => window.clearInterval(id);
  }, [frames, fps, respectReducedMotion]);

  return (
    <span
      ref={ref}
      className={`pixel-sprite ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${src}")`,
        backgroundSize: `${frames * 100}% 100%`,
        backgroundPosition: "0% 0%",
      }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    />
  );
}
