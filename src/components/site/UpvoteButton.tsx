"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "motion/react";
import PixelSprite from "@/components/PixelSprite";
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
  // Incremented per vote to trigger the heart sprite's one-shot burst.
  const [burst, setBurst] = useState(0);
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
    setBurst((b) => b + 1);
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
      className={`btn relative ${voted ? "btn-ghost !border-accent/40 !text-accent" : "btn-ghost"} !disabled:opacity-100 ${className}`}
    >
      {burst > 0 ? (
        <motion.span
          key={burst}
          aria-hidden
          className="pointer-events-none absolute -top-1 left-1/2 font-display text-xs font-bold text-gold"
          initial={{ opacity: 1, y: 0, x: "-50%" }}
          animate={{ opacity: 0, y: -26 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          +1
        </motion.span>
      ) : null}
      {/* Plain heart at rest; the burst plays through to the arrow-struck
          heart on vote, which then stays as the "voted" glyph. */}
      <PixelSprite
        src="/sprites/heart-pop.png"
        frames={6}
        size={18}
        fps={12}
        mode="once"
        playKey={burst}
        restFrame={voted ? 5 : 0}
      />
      <span className="tabular-nums">{count}</span>
      {showLabel ? <span>{voted ? "Upvoted" : "Upvote"}</span> : null}
    </button>
  );
}
