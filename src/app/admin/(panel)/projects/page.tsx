import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import ProjectIcon from "@/components/ProjectIcon";
import { toggleProjectFlagAction } from "../../actions";
import ProjectSearch from "@/components/admin/ProjectSearch";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const projects = await prisma.project.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ featured: "desc" }, { order: "asc" }, { id: "asc" }],
    include: {
      category: { select: { name: true } },
      platform: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Projects</h1>
          <p className="mt-1.5 text-sm text-muted">
            {projects.length} {query ? "matching" : "total"}
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-primary">
          <Plus className="size-4" />
          New project
        </Link>
      </div>

      <div className="mt-6">
        <ProjectSearch initialQuery={query} />
      </div>

      {projects.length === 0 ? (
        <p className="glass mt-5 rounded-2xl px-5 py-16 text-center text-sm text-muted">
          No projects found.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {projects.map((p) => {
            return (
              <li key={p.id} className="glass flex items-center gap-3 rounded-xl p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-accent-soft text-accent">
                  <ProjectIcon name={p.icon} className="size-[1.1rem]" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.title}</p>
                  <p className="truncate text-xs text-faint">
                    {p.platform.name} · {p.category.name} · #{p.id}
                  </p>
                </div>

                <form action={toggleProjectFlagAction} className="shrink-0">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="field" value="featured" />
                  <button
                    type="submit"
                    title={p.featured ? "Remove from featured" : "Mark as featured"}
                    aria-label={p.featured ? "Remove from featured" : "Mark as featured"}
                    className={`grid size-9 place-items-center rounded-lg border transition-colors ${
                      p.featured
                        ? "border-transparent bg-gold-soft text-gold"
                        : "border-line text-faint hover:text-text"
                    }`}
                  >
                    <Star className={`size-4 ${p.featured ? "fill-current" : ""}`} />
                  </button>
                </form>

                <form action={toggleProjectFlagAction} className="shrink-0">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="field" value="published" />
                  <button
                    type="submit"
                    title={p.published ? "Hide from the site" : "Show on the site"}
                    aria-label={p.published ? "Hide from the site" : "Show on the site"}
                    className={`grid size-9 place-items-center rounded-lg border transition-colors ${
                      p.published
                        ? "border-line text-muted hover:text-text"
                        : "border-transparent bg-red-500/10 text-red-400"
                    }`}
                  >
                    {p.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                </form>

                <Link
                  href={`/admin/projects/${p.id}`}
                  className="btn btn-ghost shrink-0"
                  aria-label={`Edit ${p.title}`}
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
