import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/site/Hero";
import NewsletterSection from "@/components/site/NewsletterSection";
import ProjectExplorer from "@/components/site/ProjectExplorer";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { getLinkCards, getPublicProjects, getSiteSettings, getTaxonomy } from "@/lib/queries";

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

export default async function HomePage() {
  const [projects, settings, links, [categories, , platforms]] = await Promise.all([
    getPublicProjects(),
    getSiteSettings(),
    getLinkCards(),
    getTaxonomy(),
  ]);

  // A blank stat value means "derive it from the data already loaded above",
  // so the hero numbers cannot drift from what the page actually shows.
  const heroStats = [
    { value: settings.statValue1?.trim() || String(projects.length), label: settings.statLabel1 },
    { value: settings.statValue2?.trim() || String(categories.length), label: settings.statLabel2 },
    { value: settings.statValue3?.trim() || String(platforms.length), label: settings.statLabel3 },
  ];

  const newsletterCards = links.filter((l) => l.kind === "NEWSLETTER");
  const footerLinks = links.filter((l) => l.kind === "FOOTER" || l.kind === "SOCIAL");

  return (
    <>
      <SiteHeader siteTitle={settings.siteTitle} linkedInUrl={settings.heroAltUrl} />
      <main>
        <Hero settings={settings} stats={heroStats} />
        {/* Suspense boundary is required because ProjectExplorer reads
            useSearchParams() to resolve the ?i=<id> deep link. */}
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <ProjectExplorer
            projects={projects}
            categories={categories.map((c) => c.name)}
            heading={settings.libraryHeading}
          />
        </Suspense>
        <NewsletterSection settings={settings} cards={newsletterCards} />
      </main>
      <SiteFooter settings={settings} links={footerLinks} />
    </>
  );
}
