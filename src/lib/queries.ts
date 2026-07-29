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
  featured: boolean;
  category: string;
  platform: string;
  tags: string[];
};

export async function getPublicProjects(): Promise<PublicProject[]> {
  const rows = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { id: "asc" }],
    include: {
      category: { select: { name: true } },
      platform: { select: { name: true } },
      tags: { select: { name: true }, orderBy: { name: "asc" } },
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
    featured: p.featured,
    category: p.category.name,
    platform: p.platform.name,
    tags: p.tags.map((t) => t.name),
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

export function getTaxonomy() {
  return Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.platform.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
  ]);
}
