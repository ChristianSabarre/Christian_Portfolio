import type { Metadata } from "next";
import PortfolioLayout from "@/components/site/PortfolioLayout";
import {
  getLinkCards,
  getPublicProjects,
  getSidebarCategories,
  getSiteSettings,
} from "@/lib/queries";

// Rendered from the database on request; admin mutations revalidate this path.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  // Avoid "Name | Name" when the site title and owner are the same person.
  const title =
    settings.ownerName && settings.ownerName !== settings.siteTitle
      ? `${settings.siteTitle} | ${settings.ownerName}`
      : settings.siteTitle;

  return {
    title,
    description: settings.heroIntro || settings.tagline || undefined,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ i?: string }>;
}) {
  const { i } = await searchParams;
  const requestedId = Number(i);
  const deepLinkId = Number.isInteger(requestedId) && requestedId > 0 ? requestedId : null;

  const [projects, settings, links, categories] = await Promise.all([
    getPublicProjects(),
    getSiteSettings(),
    getLinkCards(),
    getSidebarCategories(),
  ]);

  // A blank stat value means "derive it from the data already loaded above",
  // so the hero numbers cannot drift from what the page actually shows.
  const heroStats = [
    { value: settings.statValue1?.trim() || String(projects.length), label: settings.statLabel1 },
    { value: settings.statValue2?.trim() || String(categories.length), label: settings.statLabel2 },
    {
      value: settings.statValue3?.trim() || String(projects.reduce((n, p) => n + p.votes, 0)),
      label: settings.statLabel3,
    },
  ];

  const newsletterCards = links.filter((l) => l.kind === "NEWSLETTER");
  const footerLinks = links.filter((l) => l.kind === "FOOTER" || l.kind === "SOCIAL");

  return (
    <PortfolioLayout
      projects={projects}
      categories={categories}
      settings={settings}
      heroStats={heroStats}
      newsletterCards={newsletterCards}
      footerLinks={footerLinks}
      deepLinkId={deepLinkId}
    />
  );
}
