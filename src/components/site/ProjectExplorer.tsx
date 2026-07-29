"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { LayoutGrid, List, Search, SearchX, X } from "lucide-react";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import type { PublicProject } from "@/lib/queries";

type SortKey = "featured" | "az" | "za" | "category";
type ViewMode = "grid" | "list";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "az", label: "Title A–Z" },
  { value: "za", label: "Title Z–A" },
  { value: "category", label: "Category" },
];

const ALL = "All";

export default function ProjectExplorer({
  projects,
  categories,
  heading,
}: {
  projects: PublicProject[];
  categories: string[];
  heading: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");

  const searchRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  // Seeded from ?i=<id> so shared links open the right project. Read during
  // render rather than in an effect: useSearchParams resolves identically on
  // the server and the client, so the modal hydrates without a mismatch.
  const deepLinkId = Number(useSearchParams().get("i"));
  const [active, setActive] = useState<PublicProject | null>(
    () => projects.find((p) => p.id === deepLinkId) ?? null,
  );

  // Restore the saved view preference. This has to happen after hydration
  // rather than in the initial state: the server has no access to
  // localStorage, so seeding from it during render would mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio-view");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time preference restore, see above
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {
      // Storage unavailable — stick with the default grid.
    }
  }, []);

  function changeView(next: ViewMode) {
    setView(next);
    try {
      localStorage.setItem("portfolio-view", next);
    } catch {
      // Non-fatal.
    }
  }

  // "/" focuses the search box, as in most search-led interfaces.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const openModal = useCallback((project: PublicProject) => {
    setActive(project);
    // replaceState keeps the deep link shareable without a scroll-resetting nav.
    const url = new URL(window.location.href);
    url.searchParams.set("i", String(project.id));
    window.history.replaceState({}, "", url);
  }, []);

  const closeModal = useCallback(() => {
    setActive(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("i");
    window.history.replaceState({}, "", url);
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = projects.filter((p) => {
      if (category !== ALL && p.category !== category) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.platform.toLowerCase().includes(needle) ||
        p.tags.some((t) => t.toLowerCase().includes(needle))
      );
    });

    const byTitle = (a: PublicProject, b: PublicProject) => a.title.localeCompare(b.title);

    switch (sort) {
      case "az":
        return [...filtered].sort(byTitle);
      case "za":
        return [...filtered].sort((a, b) => byTitle(b, a));
      case "category":
        return [...filtered].sort(
          (a, b) => a.category.localeCompare(b.category) || byTitle(a, b),
        );
      default:
        return [...filtered].sort(
          (a, b) => Number(b.featured) - Number(a.featured) || byTitle(a, b),
        );
    }
  }, [projects, query, category, sort]);

  const hasFilters = query.trim() !== "" || category !== ALL;

  function reset() {
    setQuery("");
    setCategory(ALL);
  }

  return (
    <section id="projects" className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{heading}</h2>
        <p className="text-sm tabular-nums text-faint" aria-live="polite">
          {visible.length} of {projects.length} projects shown
        </p>
      </div>

      {/* Sticky control bar — search, sort, and view mode. */}
      <div className="sticky top-16 z-30 -mx-5 mb-5 border-y border-line bg-bg/80 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, topic, technology, or description…"
              aria-label="Search projects"
              className="field !pl-10 !pr-16"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-faint transition hover:text-text"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-bg-deep px-1.5 py-0.5 font-mono text-[0.7rem] text-faint sm:block">
                /
              </kbd>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="project-sort" className="sr-only">
              Sort projects
            </label>
            <select
              id="project-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="field !w-auto cursor-pointer !py-[0.55rem]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <div
              className="flex items-center gap-1 rounded-xl border border-line bg-bg-deep/60 p-1"
              role="group"
              aria-label="View mode"
            >
              {(
                [
                  { mode: "grid" as const, Icon: LayoutGrid, label: "Grid view" },
                  { mode: "list" as const, Icon: List, label: "List view" },
                ]
              ).map(({ mode, Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => changeView(mode)}
                  aria-label={label}
                  aria-pressed={view === mode}
                  className={`relative grid size-8 place-items-center rounded-lg transition-colors ${
                    view === mode ? "text-white" : "text-faint hover:text-text"
                  }`}
                >
                  {view === mode ? (
                    <motion.span
                      layoutId="view-pill"
                      className="absolute inset-0 rounded-lg bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <Icon className="relative size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category chips. */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[ALL, ...categories].map((name) => {
            const selected = category === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                aria-pressed={selected}
                className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-transparent text-white"
                    : "border-line text-muted hover:border-line-strong hover:text-text"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-accent-2"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="relative">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-[--radius-card] px-6 py-20 text-center">
          <SearchX className="size-8 text-faint" />
          <p className="font-display text-lg font-semibold">No projects match those filters</p>
          <p className="max-w-sm text-sm text-muted">
            Try a different search term or clear the filters to see the full library.
          </p>
          {hasFilters ? (
            <button type="button" onClick={reset} className="btn btn-ghost mt-2">
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <motion.div
          layout={!reduceMotion}
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {/* Deliberately not wrapped in AnimatePresence: filtered-out cards must
              unmount immediately. Relying on exit callbacks to remove them leaves
              orphans whenever the animation never completes (e.g. reduced motion). */}
          {visible.map((project, index) => (
            <motion.div
              key={project.id}
              layout={!reduceMotion}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 30,
                // Stagger only the first screenful; later cards pop in at once.
                delay: reduceMotion ? 0 : Math.min(index, 8) * 0.035,
              }}
            >
              <ProjectCard project={project} view={view} onInspect={openModal} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <ProjectModal project={active} onClose={closeModal} />
    </section>
  );
}
