import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import { getPublishedArticles, getSiteSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Articles | ${settings.siteTitle}`,
    description: "Write-ups and notes on the projects.",
  };
}

export default async function ArticlesIndexPage() {
  const [articles, settings] = await Promise.all([getPublishedArticles(), getSiteSettings()]);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8">
      <Link href="/" className="btn btn-ghost mb-8">
        <ArrowLeft className="size-4" />
        Back to {settings.siteTitle}
      </Link>

      <h1 className="font-display text-3xl font-bold sm:text-4xl">Articles</h1>
      <p className="mt-3 max-w-xl text-muted">
        Longer write-ups on how these projects were built and what they taught me.
      </p>

      {articles.length === 0 ? (
        <p className="glass mt-10 px-6 py-16 text-center text-sm text-muted">
          No articles published yet — check back soon.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="glass group flex flex-col gap-4 p-5 transition-transform hover:-translate-y-1 sm:flex-row"
              >
                <span
                  className="hidden h-28 w-44 shrink-0 border-2 border-line-strong bg-bg-deep bg-cover bg-center sm:block"
                  style={a.coverImage ? { backgroundImage: `url("${a.coverImage}")` } : undefined}
                  aria-hidden
                >
                  {!a.coverImage ? (
                    <span className="grid h-full place-items-center text-faint">
                      <FileText className="size-7" />
                    </span>
                  ) : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="eyebrow text-faint">
                    {a.minutes} min read
                    {a.publishedAt
                      ? ` · ${a.publishedAt.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : ""}
                  </span>
                  <span className="mt-1 flex items-center gap-2 font-display text-lg font-bold leading-tight">
                    {a.title}
                    <ArrowUpRight className="size-4 shrink-0 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  {a.excerpt ? (
                    <span className="mt-2 block text-sm leading-relaxed text-muted">
                      {a.excerpt}
                    </span>
                  ) : null}
                  {a.projects.length > 0 ? (
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {a.projects.map((p) => (
                        <span key={p.slug} className="chip">
                          {p.title}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
