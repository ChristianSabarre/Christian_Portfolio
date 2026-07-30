"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import StatCounter from "./StatCounter";
import type { SiteSettings } from "@/lib/queries";

type Stat = { value: string; label: string };

export default function Hero({
  settings,
  stats,
}: {
  settings: SiteSettings;
  stats: Stat[];
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Aurora wash. Purely decorative, so it is hidden from assistive tech. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-accent/22 blur-[130px] animate-drift" />
        <div className="absolute -right-32 top-24 size-[32rem] rounded-full bg-accent-2/18 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="max-w-3xl">
          {settings.heroEyebrow ? (
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-accent animate-fade-up">
              <Sparkles className="size-3.5" />
              {settings.heroEyebrow}
            </p>
          ) : null}

          {/* Falls back to the site title so a not-yet-written headline still
              renders a sensible page rather than an empty heading. */}
          <h1
            className="gradient-text mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] animate-fade-up sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            {settings.heroHeadline || settings.siteTitle}
          </h1>

          {settings.heroIntro ? (
            <p
              className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted animate-fade-up sm:text-lg"
              style={{ animationDelay: "120ms" }}
            >
              {settings.heroIntro}
            </p>
          ) : null}

          <div
            className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            {settings.heroCtaLabel ? (
              <a href={settings.heroCtaUrl || "#projects"} className="btn btn-primary group">
                {settings.heroCtaLabel}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            ) : null}
            {settings.heroAltLabel && settings.heroAltUrl ? (
              <a
                href={settings.heroAltUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                {settings.heroAltLabel}
              </a>
            ) : null}
          </div>
        </div>

        <div
          className="mt-14 grid max-w-2xl grid-cols-3 gap-4 rounded-2xl border border-line bg-surface p-6 backdrop-blur-xl animate-fade-up sm:gap-8"
          style={{ animationDelay: "240ms" }}
        >
          {stats.map((stat) => (
            <StatCounter key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}