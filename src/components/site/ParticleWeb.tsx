"use client";

import { useEffect, useRef } from "react";
import { useMotionAllowed } from "@/lib/useMedia";

type Node = { x: number; y: number; vx: number; vy: number };

const LINK_DISTANCE = 132;
const POINTER_RADIUS = 190;
const MAX_NODES = 90;

/**
 * Drifting node field with lines drawn between near neighbours, reacting to the
 * pointer. Canvas rather than DOM so the link count stays cheap.
 *
 * Guards: skipped entirely under reduced motion, paused when scrolled out of
 * view or the tab is hidden, node count scales with area and is hard-capped,
 * and the backing store is redrawn on resize only.
 */
export default function ParticleWeb({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animate = useMotionAllowed();

  useEffect(() => {
    if (!animate) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    let running = true;
    const pointer = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(MAX_NODES, Math.round((width * height) / 15000));
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    }

    // Read the accent colour from the theme so the web recolours with it.
    function accent(alpha: number) {
      const styles = getComputedStyle(document.documentElement);
      const raw = styles.getPropertyValue("--accent-2").trim() || "oklch(0.8 0.135 205)";
      return raw.startsWith("oklch")
        ? raw.replace(/\)$/, ` / ${alpha})`)
        : `rgba(125, 211, 252, ${alpha})`;
    }

    /** One frame. Split from the loop so the first can be painted eagerly. */
    function render(step: boolean) {
      ctx!.clearRect(0, 0, width, height);

      if (step) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          // Gentle push away from the cursor.
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_RADIUS && dist > 0.01) {
            const push = (1 - dist / POINTER_RADIUS) * 0.7;
            n.x += (dx / dist) * push;
            n.y += (dy / dist) * push;
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DISTANCE) continue;
          ctx!.strokeStyle = accentCache(0.16 * (1 - d / LINK_DISTANCE));
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      ctx!.fillStyle = accentCache(0.5);
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function draw() {
      if (!running) return;
      render(true);
      frame = requestAnimationFrame(draw);
    }

    // getComputedStyle per line would be brutal; resolve once per alpha bucket.
    const colourCache = new Map<number, string>();
    function accentCache(alpha: number) {
      const key = Math.round(alpha * 50) / 50;
      let value = colourCache.get(key);
      if (!value) {
        value = accent(key);
        colourCache.set(key, value);
      }
      return value;
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    }
    function onPointerLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    function start() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    build();
    // Paint immediately rather than waiting on the first animation frame, so a
    // throttled or suspended rAF (background tab, power saving) still leaves a
    // rendered web on screen instead of an empty canvas.
    render(false);
    frame = requestAnimationFrame(draw);

    const resize = new ResizeObserver(() => {
      colourCache.clear();
      build();
      render(false);
    });
    resize.observe(canvas);

    // Stop burning frames when the hero is scrolled away or the tab is hidden.
    const visible = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    visible.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      resize.disconnect();
      visible.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [animate]);

  if (!animate) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  );
}
