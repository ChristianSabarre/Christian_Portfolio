"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query.
 *
 * useSyncExternalStore rather than useState+useEffect: matchMedia is exactly
 * the "external store" this API exists for, so React handles the
 * server-snapshot-then-client-correct handoff without a hydration mismatch and
 * without a setState inside an effect.
 */
function useMediaQuery(query: string, serverValue: boolean): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * True when the visitor has not asked for reduced motion.
 *
 * Defaults to false on the server so the first paint is the still version;
 * effects then switch on once the client confirms. Erring this way means a
 * reduced-motion visitor never sees a flash of animation.
 */
export function useMotionAllowed(): boolean {
  return !useMediaQuery("(prefers-reduced-motion: reduce)", true);
}

/** True for a precise pointer (mouse/trackpad). Gates cursor and tilt effects. */
export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)", false);
}

/**
 * Convenience: heavy pointer-driven effects need both.
 * Both hooks are read into locals first — `a() && b()` would short-circuit and
 * skip the second hook, changing hook order between renders.
 */
export function useRichPointerEffects(): boolean {
  const motion = useMotionAllowed();
  const fine = useFinePointer();
  return motion && fine;
}
