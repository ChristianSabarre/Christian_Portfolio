"use client";

import { ArrowUpRight } from "lucide-react";
import type { LinkCardRow, SiteSettings } from "@/lib/queries";

export default function NewsletterSection({
  settings,
  cards,
}: {
  settings: SiteSettings;
  cards: LinkCardRow[];
}) {
  if (cards.length === 0 && !settings.newsletterHeading) return null;

  return (
    <section className="relative border-t border-line bg-bg-deep/50">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div>
            {settings.newsletterEyebrow ? (
              <p className="eyebrow text-accent">{settings.newsletterEyebrow}</p>
            ) : null}
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight">
              {settings.newsletterHeading}
            </h2>
            {settings.newsletterIntro ? (
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">
                {settings.newsletterIntro}
              </p>
            ) : null}
            {settings.newsletterCtaLabel && settings.newsletterCtaUrl ? (
              <a
                href={settings.newsletterCtaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-7 group"
              >
                {settings.newsletterCtaLabel}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            {cards.map((card) => (
              <a
                key={card.id}
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group rounded-[--radius-card] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-xl hover:shadow-black/20"
              >
                {card.label ? <p className="eyebrow text-faint">{card.label}</p> : null}
                <h3 className="mt-2 flex items-center gap-2 font-display text-lg font-semibold">
                  {card.title}
                  <ArrowUpRight className="size-4 shrink-0 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </h3>
                {card.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}