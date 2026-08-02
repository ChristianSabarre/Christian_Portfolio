"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check, Link as LinkIcon, Link2, X } from "lucide-react";
import ProjectIcon from "@/components/ProjectIcon";
import UpvoteButton from "./UpvoteButton";
import { youTubeEmbedUrl } from "@/lib/youtube";
import type { PublicProject } from "@/lib/queries";

export default function ProjectModal({
  project,
  onClose,
}: {
  project: PublicProject | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // No effect resets `copied`: the dialog unmounts on close, so the state is
  // discarded between projects.
  useEffect(() => {
    if (!project) return;

    restoreFocusTo.current = document.activeElement as HTMLElement;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      // Keep Tab inside the dialog.
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    // Lock scroll, compensating for the scrollbar so the page doesn't jump.
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    }, 60);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      window.clearTimeout(focusTimer);
      restoreFocusTo.current?.focus?.();
    };
  }, [project, onClose]);

  async function copyLink() {
    if (!project) return;
    const url = `${window.location.origin}${window.location.pathname}?i=${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API needs a secure context; fall back to a hidden textarea.
      const el = document.createElement("textarea");
      el.value = url;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(el);
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  // Rendered conditionally rather than through AnimatePresence: an exit
  // animation that never completes would leave the dialog permanently open.
  if (!project) return null;

  const embedUrl = youTubeEmbedUrl(project.videoUrl);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-line-strong bg-bg-raised shadow-2xl sm:rounded-3xl"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        <div className="flex items-start gap-4 border-b border-line p-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-accent-soft text-accent">
            <ProjectIcon name={project.icon} className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-faint">{project.platform}</p>
            <h2
              id="project-modal-title"
              className="mt-1 text-pretty font-display text-xl font-semibold leading-tight"
            >
              {project.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost size-9 shrink-0 !px-0"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <p className="eyebrow text-accent">{project.category}</p>

          {/* Above the description on purpose: the video is the richest thing
              here, and the text then explains what you are looking at. */}
          {embedUrl ? (
            <div className="overflow-hidden rounded-xl border border-line bg-black">
              <iframe
                src={embedUrl}
                title={`${project.title} — video`}
                className="aspect-video w-full"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : null}

          <p className="text-[0.95rem] leading-relaxed text-muted">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>

          <p className="flex items-start gap-2 text-sm">
            <LinkIcon className="mt-0.5 size-4 shrink-0 text-faint" />
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-accent hover:underline"
            >
              {project.displayUrl || project.url}
            </a>
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line p-6 sm:flex-row sm:items-center">
          <UpvoteButton
            projectId={project.id}
            votes={project.votes}
            showLabel
            className="sm:mr-auto"
          />
          <button type="button" onClick={copyLink} className="btn btn-ghost">
            {copied ? (
              <Check className="size-4 text-accent-2" />
            ) : (
              <Link2 className="size-4" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </button>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Open project in new tab
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
