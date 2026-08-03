"use client";

import { Moon, Sun } from "lucide-react";
import { track } from "@/lib/achievements";

/**
 * Stateless by design: which glyph shows is decided by CSS off the
 * `data-theme` attribute that the pre-paint script sets, so there is nothing
 * to hydrate and no flash of the wrong icon.
 */
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    track.theme();
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {
      // Private browsing with storage disabled — the theme just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost relative h-9 w-9 shrink-0 !px-0"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className="absolute size-[1.05rem] rotate-90 scale-50 opacity-0 transition-all duration-300 light:rotate-0 light:scale-100 light:opacity-100" />
      <Moon className="absolute size-[1.05rem] rotate-0 scale-100 opacity-100 transition-all duration-300 light:-rotate-90 light:scale-50 light:opacity-0" />
    </button>
  );
}
