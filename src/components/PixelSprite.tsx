"use client";

/* eslint-disable @next/next/no-img-element -- sprite strips animate via CSS
   steps() over a translated <img>; next/image's wrapper interferes and the
   assets are tiny local PNGs that need no optimisation. */

/**
 * Plays a one-row sprite sheet using CSS steps() — no JS per frame.
 *
 * The strip is `frames` cells wide; animating translateX from 0 to -100% in
 * `steps(frames)` shows each cell in turn. Under prefers-reduced-motion the
 * animation is disabled by globals.css and the first frame stays visible.
 */
export default function PixelSprite({
  src,
  frames,
  size,
  fps = 2,
  alt = "",
  className = "",
}: {
  /** Path to a one-row sprite sheet in /public. */
  src: string;
  frames: number;
  /** Rendered size of one square frame, in CSS px. */
  size: number;
  fps?: number;
  alt?: string;
  className?: string;
}) {
  return (
    <span
      className={`pixel-sprite ${className}`}
      style={{ width: size, height: size }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          height: size,
          width: size * frames,
          animationDuration: `${frames / fps}s`,
          animationTimingFunction: `steps(${frames})`,
        }}
      />
    </span>
  );
}
