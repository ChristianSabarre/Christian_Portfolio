"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import PixelSprite from "@/components/PixelSprite";

/** lucide 1.x dropped brand marks, so the LinkedIn glyph is inlined. */
function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.44-2.13 2.93v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export default function ContactWidget({
  email,
  linkedIn,
}: {
  email: string;
  linkedIn: string;
}) {
  const [open, setOpen] = useState(false);
  // Counts opens so the star burst replays each time.
  const [openCount, setOpenCount] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  function toggle() {
    setOpen((v) => {
      if (!v) setOpenCount((c) => c + 1);
      return !v;
    });
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  if (!email && !linkedIn) return null;

  return (
    <div ref={wrapRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open ? (
        <motion.div
          id="contact-options"
          className="glass w-60 origin-bottom-right rounded-2xl p-2 shadow-2xl"
          initial={{ opacity: 0, scale: 0.5, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
        >
          <p className="eyebrow px-2 pb-1 pt-2 text-faint">Get in touch</p>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-surface-hover"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                <PixelSprite src="/sprites/envelope.png" frames={4} size={20} fps={3} />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">Email</span>
                <span className="block truncate text-xs text-faint">{email}</span>
              </span>
            </a>
          ) : null}
          {linkedIn ? (
            <a
              href={linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-surface-hover"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                <LinkedInMark className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">LinkedIn</span>
                <span className="block truncate text-xs text-faint">Connect with me</span>
              </span>
            </a>
          ) : null}
        </motion.div>
      ) : null}

      {/* Star burst fired from the button on each open. */}
      {open ? (
        <span aria-hidden className="pointer-events-none absolute bottom-4 right-4">
          {[
            { x: -46, y: -30, delay: 0 },
            { x: -18, y: -52, delay: 0.05 },
            { x: 16, y: -34, delay: 0.1 },
          ].map((b, i) => (
            <motion.span
              key={`${openCount}-${i}`}
              className="absolute"
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: 0, x: b.x, y: b.y, scale: 1.1 }}
              transition={{ duration: 0.7, delay: b.delay, ease: "easeOut" }}
            >
              <PixelSprite src="/sprites/star-twinkle.png" frames={6} size={18} fps={10} />
            </motion.span>
          ))}
        </span>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="contact-options"
        className="btn btn-primary h-12 rounded-full !px-5 shadow-xl"
      >
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        {open ? "Close" : "Contact me"}
      </button>
    </div>
  );
}
