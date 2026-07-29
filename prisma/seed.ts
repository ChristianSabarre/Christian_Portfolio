import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify, uniqueSlug } from "../src/lib/slug.js";
import { CATEGORIES, LINK_CARDS, PLATFORMS, PROJECTS, SITE_SETTING, TAGS } from "./seed-data.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log("Seeding…");

  // Taxonomy is upserted, so re-running tops up the lists without touching
  // anything that has been renamed or added by hand.
  for (const [i, name] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), order: i },
    });
  }

  for (const [i, name] of PLATFORMS.entries()) {
    await prisma.platform.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), order: i },
    });
  }

  for (const name of TAGS) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...SITE_SETTING },
  });

  for (const card of LINK_CARDS) {
    const existing = await prisma.linkCard.findFirst({
      where: { kind: card.kind, title: card.title },
    });
    if (!existing) await prisma.linkCard.create({ data: card });
  }

  // Sample projects are only inserted into an empty library, so running the
  // seed again never overwrites or duplicates real entries.
  const existingProjects = await prisma.project.count();
  if (existingProjects > 0) {
    console.log(`Skipped sample projects — ${existingProjects} already present.`);
  } else {
    const categories = new Map((await prisma.category.findMany()).map((c) => [c.name, c.id]));
    const platforms = new Map((await prisma.platform.findMany()).map((p) => [p.name, p.id]));
    const taken = new Set<string>();

    for (const [i, p] of PROJECTS.entries()) {
      const categoryId = categories.get(p.category);
      const platformId = platforms.get(p.platform);
      if (!categoryId) throw new Error(`Unknown category "${p.category}"`);
      if (!platformId) throw new Error(`Unknown collection "${p.platform}"`);

      const slug = uniqueSlug(p.title, taken);
      taken.add(slug);

      await prisma.project.create({
        data: {
          title: p.title,
          slug,
          url: p.url,
          displayUrl: p.displayUrl,
          description: p.description,
          icon: p.icon,
          featured: p.featured,
          order: i,
          published: true,
          categoryId,
          platformId,
          tags: { connect: p.tags.map((name) => ({ name })) },
        },
      });
    }
  }

  console.log("Seed complete:", {
    projects: await prisma.project.count(),
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    collections: await prisma.platform.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
