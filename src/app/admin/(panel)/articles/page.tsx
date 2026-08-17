import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseBlocks, readingMinutes } from "@/lib/articleBlocks";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Articles</h1>
          <p className="mt-1.5 text-sm text-muted">
            Long-form write-ups. Attach one to a project from that project&rsquo;s page.
          </p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary">
          <Plus className="size-4" />
          New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="glass mt-6 px-5 py-16 text-center text-sm text-muted">
          No articles yet. Create one to get started.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {articles.map((a) => {
            const minutes = readingMinutes(parseBlocks(a.blocks));
            return (
              <li key={a.id} className="glass flex items-center gap-3 p-3.5">
                <span
                  className="hidden size-14 shrink-0 border border-line bg-bg-deep bg-cover bg-center sm:block"
                  style={a.coverImage ? { backgroundImage: `url("${a.coverImage}")` } : undefined}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="truncate text-xs text-faint">
                    {minutes} min read · {a._count.projects}{" "}
                    {a._count.projects === 1 ? "project" : "projects"} linked
                    {a.publishedAt
                      ? ` · ${a.publishedAt.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : ""}
                  </p>
                </div>

                <span
                  className={`chip shrink-0 ${a.published ? "" : "opacity-70"}`}
                  title={a.published ? "Published" : "Draft"}
                >
                  {a.published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                  {a.published ? "Live" : "Draft"}
                </span>

                <Link
                  href={`/admin/articles/${a.id}`}
                  className="btn btn-ghost shrink-0"
                  aria-label={`Edit ${a.title}`}
                >
                  <Pencil className="size-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
