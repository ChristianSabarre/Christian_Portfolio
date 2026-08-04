"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PixelSprite from "@/components/PixelSprite";
import ProjectIcon from "@/components/ProjectIcon";
import type { PublicProject } from "@/lib/queries";

const CABINET_SPACING = 260;
const STREET_MARGIN = 340;
const WALK_SPEED = 300; // px/s
const NEAR_DISTANCE = 90;
const PLAYER_SIZE = 96;

/**
 * The walkable street: one arcade cabinet per project, keyboard/touch
 * movement, camera follow, Enter (or tap) to open the project dialog.
 *
 * The simulation writes transforms straight to refs inside a rAF loop — React
 * state only changes when something discrete happens (facing flip, nearest
 * cabinet change), so walking never re-renders the tree.
 */
export default function WorldMode({
  projects,
  onView,
  paused,
}: {
  projects: PublicProject[];
  onView: (project: PublicProject) => void;
  paused: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const pos = useRef(STREET_MARGIN * 0.55);
  const keys = useRef({ left: false, right: false });
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const [facing, setFacing] = useState<1 | -1>(1);
  const [moving, setMoving] = useState(false);
  const [nearIndex, setNearIndex] = useState<number | null>(null);
  const nearRef = useRef<number | null>(null);

  const worldWidth = STREET_MARGIN * 2 + Math.max(projects.length - 1, 0) * CABINET_SPACING;
  const cabinetX = (i: number) => STREET_MARGIN + i * CABINET_SPACING;

  // Keyboard: arrows/WASD to move, Enter/E/Space to open the nearby cabinet.
  useEffect(() => {
    function typing() {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      );
    }
    function onKeyDown(e: KeyboardEvent) {
      if (typing() || pausedRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keys.current.left = true;
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keys.current.right = true;
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === "e" || e.key === "E" || e.key === " ") {
        if (nearRef.current !== null && projects[nearRef.current]) {
          e.preventDefault();
          onView(projects[nearRef.current]);
        }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [projects, onView]);

  // Simulation loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      if (dir !== 0 && !pausedRef.current) {
        pos.current = Math.max(60, Math.min(worldWidth - 60, pos.current + dir * WALK_SPEED * dt));
        setFacing(dir === 1 ? 1 : -1);
      }
      setMoving(dir !== 0 && !pausedRef.current);

      const viewport = viewportRef.current;
      const world = worldRef.current;
      const player = playerRef.current;
      if (viewport && world && player) {
        const vw = viewport.clientWidth;
        const camera = Math.max(0, Math.min(worldWidth - vw, pos.current - vw / 2));
        world.style.transform = `translateX(${-camera}px)`;
        player.style.transform = `translateX(${pos.current - camera - PLAYER_SIZE / 2}px)`;
        // Observable mirror of the sim for tests and debugging.
        world.dataset.px = String(Math.round(pos.current));
      }

      // Nearest cabinet within reach.
      let near: number | null = null;
      let best = NEAR_DISTANCE;
      for (let i = 0; i < projects.length; i++) {
        const d = Math.abs(cabinetX(i) - pos.current);
        if (d < best) {
          best = d;
          near = i;
        }
      }
      if (near !== nearRef.current) {
        nearRef.current = near;
        setNearIndex(near);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
     
  }, [projects.length, worldWidth]);

  function hold(dir: "left" | "right", down: boolean) {
    keys.current[dir] = down;
  }

  return (
    <div className="select-none">
      <p className="eyebrow mb-2 text-center text-faint">
        ← → walk&nbsp;&nbsp;·&nbsp;&nbsp;Enter open&nbsp;&nbsp;·&nbsp;&nbsp;tap a cabinet on touch
      </p>

      <div
        ref={viewportRef}
        tabIndex={0}
        aria-label="Walkable project street. Use arrow keys to walk and Enter to open the nearby project."
        className="relative h-[26rem] touch-none overflow-hidden border-2 border-line-strong bg-gradient-to-b from-bg-deep via-bg to-bg-raised outline-none"
      >
        {/* Parallax-ish decorations, fixed to the viewport. */}
        <span className="absolute left-[8%] top-8 opacity-70">
          <PixelSprite src="/sprites/star-twinkle.png" frames={6} size={16} fps={2} />
        </span>
        <span className="absolute right-[12%] top-14 opacity-50">
          <PixelSprite src="/sprites/star-twinkle.png" frames={6} size={12} fps={3} />
        </span>
        <span className="absolute left-[45%] top-5 opacity-60">
          <PixelSprite src="/sprites/star-twinkle.png" frames={6} size={10} fps={2.5} />
        </span>

        {/* The scrolling world. */}
        <div
          ref={worldRef}
          className="absolute inset-y-0 left-0 will-change-transform"
          style={{ width: worldWidth }}
        >
          {projects.map((p, i) => {
            const active = i === nearIndex;
            const cover = p.coverImage?.trim();
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onView(p)}
                aria-label={`Open ${p.title}`}
                className="absolute bottom-14 w-44 -translate-x-1/2 text-left"
                style={{ left: cabinetX(i) }}
              >
                {active ? (
                  <span className="pixel-bubble absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    PRESS ENTER
                  </span>
                ) : null}
                <span
                  className={`block border-4 bg-bg-raised p-1.5 transition-colors ${
                    active ? "border-accent" : "border-line-strong"
                  }`}
                  style={{ boxShadow: "4px 4px 0 0 color-mix(in oklab, var(--text) 20%, transparent)" }}
                >
                  <span
                    className="flex h-24 items-center justify-center overflow-hidden border-2 border-line bg-bg-deep bg-cover bg-center"
                    style={cover ? { backgroundImage: `url("${cover}")`, imageRendering: "pixelated" } : undefined}
                  >
                    {!cover ? <ProjectIcon name={p.icon} className="size-9 text-accent-2" /> : null}
                  </span>
                  <span className="mt-1.5 block truncate text-center font-display text-[0.6rem] font-bold uppercase leading-tight">
                    {p.title}
                  </span>
                  <span className="block text-center font-display text-[0.5rem] text-faint">
                    ♥ {p.votes}
                  </span>
                </span>
                {/* Cabinet feet */}
                <span className="mx-auto block h-2 w-[88%] bg-bg-deep" />
              </button>
            );
          })}
        </div>

        {/* The player, camera-space. */}
        <div
          ref={playerRef}
          className="absolute bottom-11 left-0 will-change-transform"
          aria-hidden
        >
          <span className="block" style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }}>
            {moving ? (
              <PixelSprite src="/sprites/chris-run.png" frames={5} size={PLAYER_SIZE} fps={12} />
            ) : (
              <PixelSprite src="/sprites/chris-talk.png" frames={6} size={PLAYER_SIZE} fps={3} />
            )}
          </span>
        </div>

        {/* Street. */}
        <div
          className="absolute inset-x-0 bottom-0 h-12 border-t-4 border-line-strong"
          style={{
            background:
              "repeating-linear-gradient(90deg, color-mix(in oklab, var(--text) 14%, var(--bg-deep)) 0 26px, var(--bg-deep) 26px 52px)",
          }}
        />

        {/* Touch controls. */}
        <div className="absolute bottom-16 left-3 flex gap-2 sm:hidden">
          <button
            type="button"
            className="btn btn-ghost size-12 !px-0"
            aria-label="Walk left"
            onPointerDown={() => hold("left", true)}
            onPointerUp={() => hold("left", false)}
            onPointerLeave={() => hold("left", false)}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="btn btn-ghost size-12 !px-0"
            aria-label="Walk right"
            onPointerDown={() => hold("right", true)}
            onPointerUp={() => hold("right", false)}
            onPointerLeave={() => hold("right", false)}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
