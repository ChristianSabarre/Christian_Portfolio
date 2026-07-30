"use client";

import { Compass } from "lucide-react";
import type { LinkCardRow, SiteSettings } from "@/lib/queries";

export default function SiteFooter({
  settings,
  links,
}: {
  settings: SiteSettings;
  links: LinkCardRow[];
}) {
  return (
    <footer className="mt-auto border-t border-line bg-bg-deep">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-white">
                <Compass className="size-4" />
              </span>
              <span className="font-display text-base font-semibold">{settings.siteTitle}</span>
            </div>
            {settings.tagline ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">{settings.tagline}</p>
            ) : null}
          </div>

          {links.length > 0 ? (
            <nav aria-label="Footer links">
              <p className="eyebrow text-faint">Elsewhere</p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.ownerName}</p>
          <p>{settings.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}