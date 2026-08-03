"use client";

import { useEffect, useState } from "react";
import { ChevronsLeft, LayoutGrid, X } from "lucide-react";
import ProjectIcon from "@/components/ProjectIcon";
import PixelSprite from "@/components/PixelSprite";
import ThemeToggle from "./ThemeToggle";
import type { SidebarCategory } from "@/lib/queries";

export const ALL_CATEGORIES = "All Projects";

/** How long the entry wave lasts: 4 frames at 4fps, plus a beat on the held
    final pose before the talk loop takes over. */
const WAVE_MS = 4 * 250 + 500;

export default function Sidebar({
  siteTitle,
  subtitle,
  blurb,
  categories,
  totalCount,
  selected,
  onSelect,
  onClose,
  onCollapse,
}: {
  siteTitle: string;
  subtitle: string;
  blurb: string;
  categories: SidebarCategory[];
  totalCount: number;
  selected: string;
  onSelect: (name: string) => void;
  onClose?: () => void;
  /** Desktop collapse control; rendering is lg-only. */
  onCollapse?: () => void;
}) {
  // Entry greeting: the wave plays exactly once (one-shot, held on the final
  // raised-hand frame) and only then hands off to the talking loop. Looping it
  // on a mismatched timer made the two sheets fight mid-cycle.
  const [wavePlay, setWavePlay] = useState(0);
  const [greeting, setGreeting] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the one-shot after mount so the client actually sees frame 0 first
    setWavePlay(1);
    const t = window.setTimeout(() => setGreeting(false), WAVE_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="flex h-full flex-col gap-7 overflow-y-auto bg-bg-deep px-5 py-6">
      <div className="flex items-start gap-3.5">
        {/* Animated pixel avatar. The sheet has a transparent background, so
            one asset works in both themes over the soft accent tile. */}
        <span className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-accent-soft ring-1 ring-line-strong">
          {greeting ? (
            <PixelSprite
              src="/sprites/chris-wave.png"
              frames={4}
              size={60}
              fps={4}
              mode="once"
              playKey={wavePlay}
              restFrame={0}
              alt={siteTitle}
            />
          ) : (
            <PixelSprite
              src="/sprites/chris-talk.png"
              frames={6}
              size={60}
              fps={5}
              alt={siteTitle}
            />
          )}
          {greeting ? (
            <span aria-hidden className="pixel-bubble absolute -right-3 -top-2 z-10">
              HI!
            </span>
          ) : null}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-semibold leading-tight">
            {siteTitle}
          </h1>
          {subtitle ? <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p> : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost size-9 shrink-0 !px-0 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        ) : null}
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            className="btn btn-ghost hidden size-9 shrink-0 !px-0 lg:inline-flex"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronsLeft className="size-4" />
          </button>
        ) : null}
      </div>

      {blurb ? <p className="text-sm leading-relaxed text-muted">{blurb}</p> : null}

      <nav aria-label="Filter by collection">
        <p className="eyebrow mb-3 text-faint">Collections</p>
        <ul className="space-y-1">
          <li>
            <SidebarItem
              label={ALL_CATEGORIES}
              count={totalCount}
              selected={selected === ALL_CATEGORIES}
              onSelect={() => onSelect(ALL_CATEGORIES)}
            />
          </li>
          {categories.map((c) => (
            <li key={c.name}>
              <SidebarItem
                label={c.name}
                icon={c.icon}
                count={c.count}
                selected={selected === c.name}
                onSelect={() => onSelect(c.name)}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <span className="eyebrow text-faint">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  count,
  selected,
  onSelect,
}: {
  label: string;
  icon?: string;
  count: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
        selected
          ? "border-line-strong bg-surface-hover font-medium text-text"
          : "border-transparent text-muted hover:bg-surface-hover/60 hover:text-text"
      }`}
    >
      <span className={selected ? "text-accent" : "text-faint"}>
        {icon ? (
          <ProjectIcon name={icon} className="size-[18px]" />
        ) : (
          <LayoutGrid className="size-[1.05rem]" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-pretty">{label}</span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums ${
          selected ? "bg-accent text-white" : "bg-surface text-faint"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
