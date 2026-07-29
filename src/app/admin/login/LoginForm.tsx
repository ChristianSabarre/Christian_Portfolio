"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass, Loader2, LockKeyhole } from "lucide-react";
import { loginAction, type ActionState } from "../actions";

const initialState: ActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const next = useSearchParams().get("next") ?? "/admin";

  return (
    <div className="glass w-full max-w-sm rounded-[--radius-card] p-8">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-lg shadow-accent/25">
          <Compass className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Admin</h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to manage the portfolio.</p>
      </div>

      <form action={formAction} className="mt-7 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••••"
              className="field !pl-10"
            />
          </div>
        </div>

        {state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
          >
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-faint transition-colors hover:text-text"
      >
        <ArrowLeft className="size-3.5" />
        Back to the site
      </Link>
    </div>
  );
}
