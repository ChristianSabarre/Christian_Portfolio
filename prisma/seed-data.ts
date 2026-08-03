/**
 * Starter content. Everything here is editable from the admin panel — these are
 * defaults for a fresh database, not fixed values.
 * `icon` values are lucide-react export names (see src/lib/icons.ts).
 */

export type SeedProject = {
  title: string;
  url: string;
  displayUrl: string;
  description: string;
  category: string;
  icon: string;
  platform: string;
  tags: string[];
  featured: boolean;
};

/** Sidebar collections, in display order. `icon` is a lucide export name. */
export const CATEGORIES: { name: string; icon: string }[] = [
  { name: "Web Development", icon: "pixel:webdev" },
  { name: "Mobile", icon: "pixel:mobile" },
  { name: "Data & Analytics", icon: "pixel:data" },
  { name: "AI & Machine Learning", icon: "pixel:ai" },
  { name: "Design", icon: "pixel:design" },
  { name: "Other", icon: "pixel:other" },
];

export const TAGS = [
  "API",
  "Database",
  "Mobile",
  "Next.js",
  "Python",
  "React",
  "TypeScript",
  "UI/UX",
];

/** The badge shown above each project title. */
export const PLATFORMS = ["Personal", "Coursework", "Client"];

/**
 * Three obviously-placeholder entries so the grid, filters, and detail modal
 * have something to render on a fresh install. Replace or delete them from the
 * admin panel.
 */
export const PROJECTS: SeedProject[] = [
  {
    title: "Sample Project One",
    url: "https://example.com",
    displayUrl: "example.com",
    description:
      "A placeholder entry so the layout has something to show. Open the admin panel to replace this with a real project: set the title, description, link, category, tags, and icon.",
    category: "Web Development",
    icon: "Code2",
    platform: "Personal",
    tags: ["React", "TypeScript"],
    featured: true,
  },
  {
    title: "Sample Project Two",
    url: "https://example.com",
    displayUrl: "example.com",
    description:
      "A second placeholder. Featured projects are pinned to the top of the list, and any project can be hidden from the public site without deleting it.",
    category: "Data & Analytics",
    icon: "BarChart3",
    platform: "Coursework",
    tags: ["Python", "Database"],
    featured: false,
  },
  {
    title: "Sample Project Three",
    url: "https://example.com",
    displayUrl: "example.com",
    description:
      "A third placeholder. Categories drive the filter chips and tags are free-form labels, so you can shape both to match the work you actually want to show.",
    category: "Design",
    icon: "Shapes",
    platform: "Client",
    tags: ["UI/UX"],
    featured: false,
  },
];

/**
 * Copy is intentionally blank so it gets written in the admin panel rather than
 * shipped with filler. Blank stat values are counted live from the database.
 */
export const SITE_SETTING = {
  siteTitle: "Christian Sabarre",
  sidebarSubtitle: "Interactive portfolio",
  ownerName: "Christian Sabarre",
  tagline: "Browse the applications, dashboards, and experiments I've built, in one place.",

  contactEmail: "ianchristiansabarre@gmail.com",
  contactLinkedIn: "https://www.linkedin.com/in/christiansabarre/",

  heroEyebrow: "",
  heroHeadline: "",
  heroIntro: "",
  heroCtaLabel: "View projects",
  heroCtaUrl: "#projects",
  heroAltLabel: "",
  heroAltUrl: "",

  statLabel1: "Projects",
  statValue1: null,
  statLabel2: "Categories",
  statValue2: null,
  statLabel3: "Upvotes",
  statValue3: null,

  libraryHeading: "Projects",

  newsletterEyebrow: "",
  newsletterHeading: "",
  newsletterIntro: "",
  newsletterCtaLabel: "",
  newsletterCtaUrl: "",

  footerNote: "",
};

/** Add your own links from the admin panel under "Newsletter & links". */
export const LINK_CARDS: {
  kind: "NEWSLETTER" | "FOOTER" | "SOCIAL";
  label: string;
  title: string;
  description: string;
  url: string;
  order: number;
}[] = [];
