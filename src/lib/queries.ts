import { prisma } from "@/lib/db";

/** Shape handed to the client bundle — flat and JSON-serialisable. */
export type PublicProject = {
  id: number;
  title: string;
  slug: string;
  url: string;
  displayUrl: string;
  description: string;
  icon: string;
  coverImage: string;
  videoUrl: string;
  featured: boolean;
  category: string;
  platform: string;
  tags: string[];
  votes: number;
};

export async function getPublicProjects(): Promise<PublicProject[]> {
  const rows = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { id: "asc" }],
    include: {
      category: { select: { name: true } },
      platform: { select: { name: true } },
      tags: { select: { name: true }, orderBy: { name: "asc" } },
      _count: { select: { votes: true } },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    url: p.url,
    displayUrl: p.displayUrl,
    description: p.description,
    icon: p.icon,
    coverImage: p.coverImage,
    videoUrl: p.videoUrl,
    featured: p.featured,
    category: p.category.name,
    platform: p.platform.name,
    tags: p.tags.map((t) => t.name),
    votes: p._count.votes,
  }));
}

export async function getSiteSettings() {
  // The row is created on first read so a fresh database still renders.
  return prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;

export async function getLinkCards() {
  return prisma.linkCard.findMany({
    where: { published: true },
    orderBy: [{ kind: "asc" }, { order: "asc" }],
  });
}

export type LinkCardRow = Awaited<ReturnType<typeof getLinkCards>>[number];

/** Sidebar entry: name, icon, and how many published projects it holds. */
export type SidebarCategory = { name: string; icon: string; count: number };

export async function getSidebarCategories(): Promise<SidebarCategory[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { projects: { where: { published: true } } } } },
  });
  return rows.map((c) => ({ name: c.name, icon: c.icon, count: c._count.projects }));
}

export function getTaxonomy() {
  return Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.platform.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
  ]);
}
