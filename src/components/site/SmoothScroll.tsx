"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMotionAllowed } from "@/lib/useMedia";

/**
 * Inertia scrolling.
 *
 * Skipped entirely under reduced motion, where hijacking the scroll would be
 * exactly the wrong thing to do. Anchor links are handed to Lenis so in-page
 * jumps still glide, and the instance is destroyed on unmount so native
 * scrolling is always restored.
 */
export default function SmoothScroll() {
  const animate = useMotionAllowed();

  useEffect(() => {
    if (!animate) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      // Leave touch scrolling native — momentum there is the OS's job.
      syncTouch: false,
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    function onAnchorClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -24 });
    }

    document.addEventListener("click", onAnchorClick);
    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [animate]);

  return null;
}
