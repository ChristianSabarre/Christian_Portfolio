import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ArticleBody from "@/components/site/ArticleBody";
import { excerptFrom } from "@/lib/articleBlocks";
import { getArticleBySlug, getSiteSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  const description = article.subtitle || excerptFrom(article.blocks);
  return {
    title: article.title,
    description: description || undefined,
    openGraph: {
      title: article.title,
      description: description || undefined,
      type: "article",
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticleBySlug(slug), getSiteSettings()]);
  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8">
      <Link href="/articles" className="btn btn-ghost mb-8">
        <ArrowLeft className="size-4" />
        All articles
      </Link>

      <article>
        <header className="space-y-4">
          <p className="eyebrow text-faint">
            {article.minutes} min read
            {article.publishedAt
              ? ` · ${article.publishedAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`
              : ""}
          </p>
          <h1 className="text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
            {article.title}
          </h1>
          {article.subtitle ? (
            <p className="text-pretty text-lg leading-relaxed text-muted">{article.subtitle}</p>
          ) : null}
        </header>

        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- author-supplied URL from any host
          <img
            src={article.coverImage}
            alt=""
            className="mt-8 w-full border-2 border-line-strong"
          />
        ) : null}

        <div className="mt-10">
          <ArticleBody blocks={article.blocks} />
        </div>

        {article.footer ? (
          <p className="mt-10 whitespace-pre-wrap border-t border-line pt-6 text-sm leading-relaxed text-muted">
            {article.footer}
          </p>
        ) : null}
      </article>

      {article.projects.length > 0 ? (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="eyebrow text-faint">
            {article.projects.length === 1 ? "Related project" : "Related projects"}
          </h2>
          <ul className="mt-4 space-y-2">
            {article.projects.map((p) => (
              <li key={p.slug}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass flex items-center gap-2 p-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                >
                  {p.title}
                  <ArrowUpRight className="size-4 text-accent" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link href="/" className="btn btn-ghost mt-12">
        <ArrowLeft className="size-4" />
        Back to {settings.siteTitle}
      </Link>
    </main>
  );
}
