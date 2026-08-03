"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, Eye, Play } from "lucide-react";
import PixelSprite from "@/components/PixelSprite";
import ProjectIcon from "@/components/ProjectIcon";
import UpvoteButton from "./UpvoteButton";
import Magnetic from "./Magnetic";
import { youTubeId } from "@/lib/youtube";
import { useRichPointerEffects } from "@/lib/useMedia";
import type { PublicProject } from "@/lib/queries";

export default function ProjectCard({
  project,
  view,
  onView,
}: {
  project: PublicProject;
  view: "grid" | "list";
  onView: (project: PublicProject, origin?: DOMRect) => void;
}) {
  const isList = view === "list";
  const cover = project.coverImage?.trim();
  const hasCover = Boolean(cover);
  const hasVideo = youTubeId(project.videoUrl) !== null;

  const cardRef = useRef<HTMLElement>(null);
  const tiltEnabled = useRichPointerEffects() && !isList;

  // -0.5..0.5 across the card, springed so the tilt settles rather than snaps.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 260, damping: 20, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  // Cover drifts the opposite way to the tilt, which reads as depth.
  const coverX = useTransform(sx, [-0.5, 0.5], ["4%", "-4%"]);
  const coverY = useTransform(sy, [-0.5, 0.5], ["4%", "-4%"]);

  // Feeds the .spotlight radial gradient so the glow tracks the cursor.
  function trackPointer(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function trackTilt(event: PointerEvent<HTMLElement>) {
    if (!tiltEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function resetTilt() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={trackPointer}
      onPointerMove={trackTilt}
      onPointerLeave={resetTilt}
      data-cover={hasCover ? "" : undefined}
      style={
        tiltEnabled
          ? { rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }
          : undefined
      }
      whileHover={tiltEnabled ? { y: -6, scale: 1.015 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`spotlight group relative flex overflow-hidden rounded-[--radius-card] ${
        tiltEnabled ? "" : "transition-all duration-300 hover:-translate-y-1"
      } hover:shadow-2xl hover:shadow-black/30 ${
        hasCover ? "card-cover border border-line-strong" : "glass hover:border-line-strong"
      } ${isList ? "flex-col gap-4 p-5 sm:flex-row sm:items-center" : "flex-col p-5"}`}
    >
      {hasCover ? (
        <>
          {/* Photo layer. A plain background image rather than next/image so any
              host works without being whitelisted in next.config. Inset beyond
              the edges so the parallax drift never exposes a bare corner. */}
          <motion.span
            aria-hidden
            className="absolute -inset-[6%] -z-10 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={
              tiltEnabled
                ? { backgroundImage: `url("${cover}")`, x: coverX, y: coverY }
                : { backgroundImage: `url("${cover}")` }
            }
          />
          {/* Scrim: keeps text legible over an arbitrary photo, in both themes. */}
          <span aria-hidden className="card-cover-scrim absolute inset-0 -z-10" />
        </>
      ) : null}

      <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 p-2">
        {hasVideo ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
            title="Includes a video"
          >
            <Play className="size-2.5 fill-current" />
            Video
          </span>
        ) : null}
        {project.featured ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
              hasCover ? "bg-black/55 text-gold backdrop-blur-sm" : "bg-gold-soft text-gold"
            }`}
            title="Featured project"
          >
            <PixelSprite src="/sprites/star-twinkle.png" frames={6} size={12} fps={5} />
            Featured
          </span>
        ) : null}
      </div>

      <div className={`relative z-[1] flex min-w-0 flex-1 flex-col ${isList ? "sm:pr-4" : ""}`}>
        <div className="flex items-start gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
              hasCover
                ? "border-white/20 bg-black/40 text-white backdrop-blur-sm"
                : "border-line bg-accent-soft text-accent"
            }`}
          >
            <ProjectIcon name={project.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1 pr-16">
            <p className="eyebrow truncate text-faint">{project.platform}</p>
            <h3 className="mt-0.5 text-pretty font-display text-base font-semibold leading-snug">
              {project.title}
            </h3>
          </div>
        </div>

        <p
          className={`mt-3 text-sm leading-relaxed text-muted ${
            isList ? "line-clamp-2" : "line-clamp-4"
          }`}
        >
          {project.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`relative z-[1] flex gap-2 ${
          isList ? "shrink-0 sm:w-auto" : `mt-5 border-t pt-4 ${hasCover ? "border-white/15" : "border-line"}`
        }`}
      >
        <UpvoteButton projectId={project.id} votes={project.votes} className="shrink-0" />
        <button
          type="button"
          onClick={() => onView(project, cardRef.current?.getBoundingClientRect())}
          className="btn btn-ghost flex-1"
          aria-label={`View details for ${project.title}`}
        >
          <Eye className="size-4" />
          View
        </button>
        <Magnetic className="flex-1" strength={0.25}>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full"
            aria-label={`Open ${project.title} in a new tab`}
          >
            Open
            <ArrowUpRight className="size-4" />
          </a>
        </Magnetic>
      </div>
    </motion.article>
  );
}
