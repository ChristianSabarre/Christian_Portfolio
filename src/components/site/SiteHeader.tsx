import Link from "next/link";
import { Compass } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({
  siteTitle,
  linkedInUrl,
}: {
  siteTitle: string;
  linkedInUrl: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-lg shadow-accent/25 transition-transform duration-300 group-hover:scale-105">
            <Compass className="size-[1.15rem]" />
          </span>
          <span className="font-display text-[1.05rem] font-semibold tracking-tight">
            {siteTitle}
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-2">
          <a href="#projects" className="btn btn-ghost hidden sm:inline-flex">
            Browse
          </a>
          {linkedInUrl ? (
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost hidden sm:inline-flex"
            >
              LinkedIn
            </a>
          ) : null}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
