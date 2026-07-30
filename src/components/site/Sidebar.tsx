"use client";

import Image from "next/image";
import { LayoutGrid, X } from "lucide-react";
import ProjectIcon from "@/components/ProjectIcon";
import ThemeToggle from "./ThemeToggle";
import type { SidebarCategory } from "@/lib/queries";

export const ALL_CATEGORIES = "All Projects";

export default function Sidebar({
  siteTitle,
  subtitle,
  blurb,
  categories,
  totalCount,
  selected,
  onSelect,
  onClose,
}: {
  siteTitle: string;
  subtitle: string;
  blurb: string;
  categories: SidebarCategory[];
  totalCount: number;
  selected: string;
  onSelect: (name: string) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-7 overflow-y-auto bg-bg-deep px-5 py-6">
      <div className="flex items-start gap-3.5">
        {/* Both variants render; CSS picks one off [data-theme] so there is no
            flash of the wrong image and nothing to hydrate. */}
        <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-line-strong">
          <Image
            src="/profile-dark.png"
            alt={siteTitle}
            width={112}
            height={112}
            priority
            className="size-full object-cover light:hidden"
          />
          <Image
            src="/profile-light.png"
            alt=""
            aria-hidden
            width={112}
            height={112}
            className="absolute inset-0 hidden size-full object-cover light:block"
          />
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
          <ProjectIcon name={icon} className="size-[1.05rem]" />
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
