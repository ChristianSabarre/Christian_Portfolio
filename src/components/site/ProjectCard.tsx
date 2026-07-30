"use client";

import type { MouseEvent } from "react";
import { ArrowUpRight, Eye, Star } from "lucide-react";
import ProjectIcon from "@/components/ProjectIcon";
import UpvoteButton from "./UpvoteButton";
import type { PublicProject } from "@/lib/queries";

export default function ProjectCard({
  project,
  view,
  onView,
}: {
  project: PublicProject;
  view: "grid" | "list";
  onView: (project: PublicProject) => void;
}) {
  const isList = view === "list";

  // Feeds the .spotlight radial gradient so the glow tracks the cursor.
  function trackPointer(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <article
      onMouseMove={trackPointer}
      className={`spotlight glass group relative flex overflow-hidden rounded-[--radius-card] transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-2xl hover:shadow-black/25 ${
        isList ? "flex-col gap-4 p-5 sm:flex-row sm:items-center" : "flex-col p-5"
      }`}
    >
      {project.featured ? (
        <span
          className="absolute right-0 top-0 z-10 rounded-bl-xl bg-gold-soft px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-gold"
          title="Featured project"
        >
          <Star className="mr-1 inline size-3 -translate-y-px fill-current" />
          Featured
        </span>
      ) : null}

      <div className={`relative z-[1] flex min-w-0 flex-1 flex-col ${isList ? "sm:pr-4" : ""}`}>
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <ProjectIcon name={project.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
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
          isList ? "shrink-0 sm:w-auto" : "mt-5 border-t border-line pt-4"
        }`}
      >
        <UpvoteButton projectId={project.id} votes={project.votes} className="shrink-0" />
        <button
          type="button"
          onClick={() => onView(project)}
          className="btn btn-ghost flex-1"
          aria-label={`View details for ${project.title}`}
        >
          <Eye className="size-4" />
          View
        </button>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary flex-1"
          aria-label={`Open ${project.title} in a new tab`}
        >
          Open
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </article>
  );
}
