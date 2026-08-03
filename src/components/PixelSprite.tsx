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
 *
 * Modes:
 *  - "loop" (default): cycles forever.
 *  - "once": rests on `restFrame`; each time `playKey` changes it plays through
 *    every frame once and holds on the last. Used for the upvote heart burst.
 */
export default function PixelSprite({
  src,
  frames,
  size,
  fps = 2,
  alt = "",
  className = "",
  respectReducedMotion = false,
  mode = "loop",
  playKey,
  restFrame = 0,
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
  mode?: "loop" | "once";
  /** once-mode: bump this value to trigger a play-through. */
  playKey?: number | string;
  /** once-mode: frame shown while not playing. */
  restFrame?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const playing = useRef(false);
  const lastPlayKey = useRef(playKey);

  const setFrame = (node: HTMLElement, frame: number) => {
    node.style.backgroundPosition =
      frames > 1 ? `${(frame / (frames - 1)) * 100}% 0%` : "0% 0%";
  };

  // Loop mode: a simple interval for the component's lifetime.
  useEffect(() => {
    const node = ref.current;
    if (!node || frames <= 1 || mode !== "loop") return;
    if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let frame = 0;
    const id = window.setInterval(
      () => {
        if (document.hidden) return;
        frame = (frame + 1) % frames;
        setFrame(node, frame);
      },
      Math.max(40, Math.round(1000 / fps)),
    );
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, fps, mode, respectReducedMotion]);

  // Once mode: rest frame, updated whenever we're not mid-play.
  useEffect(() => {
    const node = ref.current;
    if (!node || mode !== "once" || playing.current) return;
    setFrame(node, restFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, restFrame, frames]);

  // Once mode: play through on playKey change (not on mount).
  useEffect(() => {
    const node = ref.current;
    if (!node || mode !== "once" || frames <= 1) return;
    if (playKey === lastPlayKey.current) return;
    lastPlayKey.current = playKey;

    playing.current = true;
    let frame = 0;
    setFrame(node, 0);
    const id = window.setInterval(
      () => {
        frame += 1;
        if (frame >= frames) {
          window.clearInterval(id);
          playing.current = false;
          setFrame(node, frames - 1);
          return;
        }
        setFrame(node, frame);
      },
      Math.max(40, Math.round(1000 / fps)),
    );
    return () => {
      window.clearInterval(id);
      playing.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey, mode, frames, fps]);

  return (
    <span
      ref={ref}
      className={`pixel-sprite ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${src}")`,
        backgroundSize: `${frames * 100}% 100%`,
        backgroundPosition:
          mode === "once" && frames > 1
            ? `${(restFrame / (frames - 1)) * 100}% 0%`
            : "0% 0%",
      }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    />
  );
}
