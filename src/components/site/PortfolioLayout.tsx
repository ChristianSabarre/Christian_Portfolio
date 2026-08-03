"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LayoutGrid, List, Menu, Search, X } from "lucide-react";
import Sidebar, { ALL_CATEGORIES } from "./Sidebar";
import PixelSprite from "@/components/PixelSprite";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import ContactWidget from "./ContactWidget";
import CustomCursor from "./CustomCursor";
import IntroOverlay from "./IntroOverlay";
import SmoothScroll from "./SmoothScroll";
import Hero from "./Hero";
import NewsletterSection from "./NewsletterSection";
import SiteFooter from "./SiteFooter";
import type { LinkCardRow, PublicProject, SidebarCategory, SiteSettings } from "@/lib/queries";

type SortKey = "featured" | "az" | "za" | "votes";
type ViewMode = "grid" | "list";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "votes", label: "Most upvoted" },
  { value: "az", label: "Title A–Z" },
  { value: "za", label: "Title Z–A" },
];

export default function PortfolioLayout({
  projects,
  categories,
  settings,
  heroStats,
  newsletterCards,
  footerLinks,
  deepLinkId,
}: {
  projects: PublicProject[];
  categories: SidebarCategory[];
  /**
   * Plain data only. The page's sections are rendered inside this client
   * component rather than passed in as server-rendered elements: crossing that
   * boundary made React hydrate the fallback and orphan the real markup.
   */
  settings: SiteSettings;
  heroStats: { value: string; label: string }[];
  newsletterCards: LinkCardRow[];
  footerLinks: LinkCardRow[];
  /** From ?i=<id>, resolved on the server so first render matches. */
  deepLinkId: number | null;
}) {
  const siteTitle = settings.siteTitle;
  const heading = settings.libraryHeading;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Rect of the card that opened the dialog, so it can scale out of it.
  const [origin, setOrigin] = useState<DOMRect | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  // Seeded from the server-resolved ?i=<id>, so the server and client agree on
  // first render and the modal hydrates without a mismatch.
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

  const openModal = useCallback((project: PublicProject, from?: DOMRect) => {
    setOrigin(from ?? null);
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

  function selectCategory(name: string) {
    setCategory(name);
    setDrawerOpen(false);
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = projects.filter((p) => {
      if (category !== ALL_CATEGORIES && p.category !== category) return false;
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
      case "votes":
        return [...filtered].sort((a, b) => b.votes - a.votes || byTitle(a, b));
      default:
        return [...filtered].sort(
          (a, b) => Number(b.featured) - Number(a.featured) || byTitle(a, b),
        );
    }
  }, [projects, query, category, sort]);

  const hasFilters = query.trim() !== "" || category !== ALL_CATEGORIES;

  const sidebar = (
    <Sidebar
      siteTitle={siteTitle}
      subtitle={settings.sidebarSubtitle}
      blurb={settings.tagline}
      categories={categories}
      totalCount={projects.length}
      selected={category}
      onSelect={selectCategory}
      onClose={drawerOpen ? () => setDrawerOpen(false) : undefined}
    />
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[19rem] shrink-0 border-r border-line lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <motion.div
            className="absolute inset-y-0 left-0 w-[19rem] max-w-[85vw] border-r border-line shadow-2xl"
            initial={{ x: reduceMotion ? 0 : "-100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            {sidebar}
          </motion.div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/80 px-5 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn btn-ghost size-9 !px-0"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <span className="truncate font-display font-semibold">{siteTitle}</span>
        </div>

        <main className="min-w-0 flex-1">
          <Hero settings={settings} stats={heroStats} />

          <section id="projects" className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                {category === ALL_CATEGORIES ? heading : category}
              </h2>
              <p className="text-sm tabular-nums text-faint" aria-live="polite">
                {visible.length} of {projects.length} projects shown
              </p>
            </div>

            <div className="sticky top-0 z-20 -mx-5 mb-5 flex flex-col gap-3 border-b border-line bg-bg/85 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:flex-row sm:items-center sm:px-8 lg:top-0">
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

            {visible.length === 0 ? (
              <div className="glass flex flex-col items-center gap-3 rounded-[--radius-card] px-6 py-20 text-center">
                <PixelSprite src="/sprites/chris-idle.png" frames={4} size={96} fps={1.4} />
                <p className="font-display text-lg font-semibold">
                  No projects match those filters
                </p>
                <p className="max-w-sm text-sm text-muted">
                  Try a different search term or clear the filters to see everything.
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory(ALL_CATEGORIES);
                    }}
                    className="btn btn-ghost mt-2"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              <motion.div
                layout={!reduceMotion}
                className={
                  view === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
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
                      delay: reduceMotion ? 0 : Math.min(index, 8) * 0.035,
                    }}
                  >
                    <ProjectCard project={project} view={view} onView={openModal} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          <NewsletterSection settings={settings} cards={newsletterCards} />
        </main>

        <SiteFooter settings={settings} links={footerLinks} />
      </div>

      <ProjectModal project={active} origin={origin} onClose={closeModal} />
      <ContactWidget email={settings.contactEmail} linkedIn={settings.contactLinkedIn} />
      <CustomCursor />
      <IntroOverlay title={siteTitle} />
      <SmoothScroll />
    </div>
  );
}
