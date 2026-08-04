"use client";

/**
 * Achievement definitions, persistence, and a tiny event bus.
 *
 * Everything lives in localStorage; unlocks dispatch a CustomEvent that the
 * toast component listens for. Every function is safe to call on the server
 * (no-ops) and safe when storage is blocked.
 */

export type Achievement = {
  id: string;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "new-challenger", title: "NEW CHALLENGER", description: "Entered the portfolio" },
  { id: "explorer", title: "EXPLORER", description: "Viewed 3 projects" },
  { id: "completionist", title: "COMPLETIONIST", description: "Viewed every project" },
  { id: "critic", title: "CRITIC", description: "Cast an upvote" },
  { id: "superfan", title: "SUPERFAN", description: "Upvoted 3 projects" },
  { id: "taxonomist", title: "TAXONOMIST", description: "Filtered by collection" },
  { id: "lights", title: "LIGHT SWITCH", description: "Toggled the theme" },
  { id: "networker", title: "NETWORKER", description: "Opened the contact panel" },
  { id: "pathfinder", title: "PATHFINDER", description: "Explored the world" },
];

export const ACHIEVEMENT_EVENT = "portfolio:achievement";

const UNLOCK_KEY = "portfolio-achievements";
const VIEWED_KEY = "portfolio-viewed-projects";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked — achievements just won't persist.
  }
}

export function unlockedAchievements(): Record<string, number> {
  return readJson<Record<string, number>>(UNLOCK_KEY, {});
}

function unlock(id: string) {
  if (typeof window === "undefined") return;
  const unlocked = unlockedAchievements();
  if (unlocked[id]) return;

  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement) return;

  unlocked[id] = Date.now();
  writeJson(UNLOCK_KEY, unlocked);
  window.dispatchEvent(new CustomEvent(ACHIEVEMENT_EVENT, { detail: achievement }));
}

/** Call sites sprinkle these; each decides its own thresholds. */
export const track = {
  visit() {
    unlock("new-challenger");
  },
  viewProject(id: number, totalPublished: number) {
    const viewed = new Set(readJson<number[]>(VIEWED_KEY, []));
    viewed.add(id);
    writeJson(VIEWED_KEY, [...viewed]);
    if (viewed.size >= 3) unlock("explorer");
    if (totalPublished > 0 && viewed.size >= totalPublished) unlock("completionist");
  },
  vote(totalVotedProjects: number) {
    unlock("critic");
    if (totalVotedProjects >= 3) unlock("superfan");
  },
  filter() {
    unlock("taxonomist");
  },
  theme() {
    unlock("lights");
  },
  contact() {
    unlock("networker");
  },
  world() {
    unlock("pathfinder");
  },
};
