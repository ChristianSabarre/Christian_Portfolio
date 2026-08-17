import { prisma } from "@/lib/db";
import { excerptFrom, parseBlocks, readingMinutes, type ArticleBlock } from "@/lib/articleBlocks";

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
  article: { slug: string; title: string } | null;
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
      article: { select: { slug: true, title: true, published: true } },
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
    // Only surface the link once the article itself is published.
    article:
      p.article && p.article.published
        ? { slug: p.article.slug, title: p.article.title }
        : null,
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

export type ArticleCard = {
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  excerpt: string;
  minutes: number;
  publishedAt: Date | null;
  projects: { title: string; slug: string }[];
};

export async function getPublishedArticles(): Promise<ArticleCard[]> {
  const rows = await prisma.article.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    include: { projects: { select: { title: true, slug: true }, where: { published: true } } },
  });

  return rows.map((a) => {
    const blocks = parseBlocks(a.blocks);
    return {
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      coverImage: a.coverImage,
      excerpt: a.subtitle || excerptFrom(blocks),
      minutes: readingMinutes(blocks),
      publishedAt: a.publishedAt,
      projects: a.projects,
    };
  });
}

export type ArticleDetail = {
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  footer: string;
  blocks: ArticleBlock[];
  minutes: number;
  publishedAt: Date | null;
  projects: { title: string; slug: string; url: string }[];
};

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const article = await prisma.article.findFirst({
    where: { slug, published: true },
    include: {
      projects: { select: { title: true, slug: true, url: true }, where: { published: true } },
    },
  });
  if (!article) return null;

  const blocks = parseBlocks(article.blocks);
  return {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    coverImage: article.coverImage,
    footer: article.footer,
    blocks,
    minutes: readingMinutes(blocks),
    publishedAt: article.publishedAt,
    projects: article.projects,
  };
}

/** Slugs for generateStaticParams-style needs and admin duplicate checks. */
export function getAllArticleSlugs() {
  return prisma.article.findMany({ select: { slug: true } });
}
