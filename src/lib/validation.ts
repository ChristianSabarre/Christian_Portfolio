import { z } from "zod";
import { ICON_NAMES } from "@/lib/icons";

/**
 * Rejects anything that is not http(s) — `javascript:` and `data:` URLs would
 * otherwise end up in a rendered anchor href.
 */
const httpUrl = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2000)
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be a full http:// or https:// URL");

/** Hero/newsletter CTAs may also point at an on-page anchor such as #projects. */
const linkTarget = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (value === "" || value.startsWith("#") || value.startsWith("/")) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be a full URL, an anchor like #projects, or a path like /about");

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  url: httpUrl,
  displayUrl: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().min(10, "Description is required").max(2000),
  icon: z.enum(ICON_NAMES as [string, ...string[]]),
  categoryId: z.coerce.number().int().positive("Pick a category"),
  platformId: z.coerce.number().int().positive("Pick a collection"),
  tagIds: z.array(z.coerce.number().int().positive()).default([]),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
  order: z.coerce.number().int().min(0).max(100000).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const taxonomySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  order: z.coerce.number().int().min(0).max(10000).default(0),
});

export const linkCardSchema = z.object({
  kind: z.enum(["NEWSLETTER", "FOOTER", "SOCIAL"]),
  label: z.string().trim().max(80).default(""),
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().trim().max(1000).default(""),
  url: httpUrl,
  order: z.coerce.number().int().min(0).max(10000).default(0),
  published: z.coerce.boolean().default(true),
});

export const siteSettingSchema = z.object({
  siteTitle: z.string().trim().min(1).max(120),
  ownerName: z.string().trim().max(160).default(""),
  tagline: z.string().trim().max(400).default(""),

  heroEyebrow: z.string().trim().max(120).default(""),
  heroHeadline: z.string().trim().max(300).default(""),
  heroIntro: z.string().trim().max(1200).default(""),
  heroCtaLabel: z.string().trim().max(80).default(""),
  heroCtaUrl: linkTarget.default("#projects"),
  heroAltLabel: z.string().trim().max(80).default(""),
  heroAltUrl: linkTarget.default(""),

  statLabel1: z.string().trim().max(60).default("Projects"),
  statValue1: z.string().trim().max(20).default(""),
  statLabel2: z.string().trim().max(60).default("Collections"),
  statValue2: z.string().trim().max(20).default(""),
  statLabel3: z.string().trim().max(60).default("Hosting platforms"),
  statValue3: z.string().trim().max(20).default(""),

  libraryHeading: z.string().trim().max(120).default("Project Library"),

  newsletterEyebrow: z.string().trim().max(120).default(""),
  newsletterHeading: z.string().trim().max(300).default(""),
  newsletterIntro: z.string().trim().max(1200).default(""),
  newsletterCtaLabel: z.string().trim().max(120).default(""),
  newsletterCtaUrl: linkTarget.default(""),

  footerNote: z.string().trim().max(400).default(""),
});

/** Turns a ZodError into `{ field: "message" }` for rendering next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
