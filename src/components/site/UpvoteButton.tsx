"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowBigUp } from "lucide-react";
import { upvoteProject } from "@/app/actions/vote";

const STORAGE_KEY = "portfolio-upvotes";

function readVoted(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function rememberVoted(id: number) {
  try {
    const next = Array.from(new Set([...readVoted(), id]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — the server-side unique constraint still holds.
  }
}

export default function UpvoteButton({
  projectId,
  votes,
  className = "",
  showLabel = false,
}: {
  projectId: number;
  votes: number;
  className?: string;
  showLabel?: boolean;
}) {
  // Locally known count: the optimistic bump, then the server's authoritative
  // number. Derived rather than mirrored from the prop, so a revalidation that
  // raises `votes` (someone else voted) still wins — counts only ever grow.
  const [known, setKnown] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [pending, startTransition] = useTransition();
  const count = Math.max(votes, known ?? 0);

  // Local record of what this browser has voted for. Read after hydration
  // rather than during render: the server cannot see localStorage, so seeding
  // initial state from it would produce a markup mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted state, see above
    if (readVoted().includes(projectId)) setVoted(true);
  }, [projectId]);

  function vote() {
    if (voted || pending) return;
    setKnown(count + 1);
    setVoted(true);
    rememberVoted(projectId);

    startTransition(async () => {
      const result = await upvoteProject(projectId);
      if (!result.error) setKnown(result.votes);
    });
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || pending}
      aria-pressed={voted}
      title={voted ? "You already upvoted this" : "Upvote this project"}
      aria-label={voted ? `Upvoted, ${count} total` : `Upvote this project, ${count} so far`}
      className={`btn ${voted ? "btn-ghost !border-accent/40 !text-accent" : "btn-ghost"} !disabled:opacity-100 ${className}`}
    >
      <ArrowBigUp className={`size-4 ${voted ? "fill-current" : ""}`} />
      <span className="tabular-nums">{count}</span>
      {showLabel ? <span>{voted ? "Upvoted" : "Upvote"}</span> : null}
    </button>
  );
}
