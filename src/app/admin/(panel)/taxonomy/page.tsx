import { prisma } from "@/lib/db";
import TaxonomyManager from "@/components/admin/TaxonomyManager";

export const dynamic = "force-dynamic";

export default async function TaxonomyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [categories, tags, platforms] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { projects: true } } },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true } } },
    }),
    prisma.platform.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { projects: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Categories &amp; tags</h1>
      <p className="mt-1.5 text-sm text-muted">
        These drive the filter controls on the public site.
      </p>

      {error === "in-use" ? (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
        >
          That item is still assigned to one or more projects. Reassign them first.
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        <TaxonomyManager
          kind="category"
          title="Collections"
          description="Each project has exactly one. These are the sidebar entries, with their icons."
          withIcon
          items={categories.map((c) => ({
            id: c.id,
            name: c.name,
            order: c.order,
            icon: c.icon,
            usage: c._count.projects,
          }))}
        />

        <TaxonomyManager
          kind="platform"
          title="Groupings"
          description="The small badge above each project title, e.g. Personal or Coursework."
          items={platforms.map((p) => ({
            id: p.id,
            name: p.name,
            order: p.order,
            usage: p._count.projects,
          }))}
        />

        <TaxonomyManager
          kind="tag"
          title="Tags"
          description="Free-form chips. A project can have any number."
          ordered={false}
          items={tags.map((t) => ({ id: t.id, name: t.name, usage: t._count.projects }))}
        />
      </div>
    </div>
  );
}
