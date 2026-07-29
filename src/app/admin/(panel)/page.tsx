import Link from "next/link";
import { ArrowRight, FolderKanban, Link2, Star, Tags } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [projects, featured, unpublished, categories, tags, platforms, linkCards, recent] =
    await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { featured: true } }),
      prisma.project.count({ where: { published: false } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.platform.count(),
      prisma.linkCard.count(),
      prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, title: true, updatedAt: true, published: true },
      }),
    ]);

  const stats = [
    { label: "Projects", value: projects, hint: `${unpublished} hidden`, Icon: FolderKanban },
    { label: "Featured", value: featured, hint: "shown first", Icon: Star },
    { label: "Categories & tags", value: `${categories} / ${tags}`, hint: `${platforms} collections`, Icon: Tags },
    { label: "Link cards", value: linkCards, hint: "newsletter & footer", Icon: Link2 },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1.5 text-sm text-muted">Everything on the public site is editable here.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, hint, Icon }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <Icon className="size-5 text-accent" />
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{value}</p>
            <p className="mt-0.5 text-sm text-muted">{label}</p>
            <p className="eyebrow mt-2 text-faint">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 glass rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-semibold">Recently edited</h2>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            All projects
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <ul className="divide-y divide-[color:var(--border)]">
          {recent.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/projects/${p.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-hover"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.title}</span>
                {!p.published ? <span className="chip">Hidden</span> : null}
                <time className="shrink-0 text-xs text-faint" dateTime={p.updatedAt.toISOString()}>
                  {p.updatedAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
