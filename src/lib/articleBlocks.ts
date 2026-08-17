import { z } from "zod";

/**
 * An article body is an ordered list of typed blocks rather than a string of
 * markup. Photos are therefore first-class positions in the flow, the admin
 * never types syntax, and nothing user-authored is ever interpreted as HTML —
 * every block renders through React as text.
 */
export const articleBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    text: z.string().trim().min(1, "Heading needs text").max(200),
  }),
  z.object({
    type: z.literal("paragraph"),
    text: z.string().trim().min(1, "Paragraph needs text").max(6000),
  }),
  z.object({
    type: z.literal("image"),
    url: z.string().trim().min(1, "Pick an image"),
    caption: z.string().trim().max(300).default(""),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().trim().min(1, "Quote needs text").max(1000),
    cite: z.string().trim().max(160).default(""),
  }),
  z.object({
    type: z.literal("code"),
    text: z.string().min(1, "Code block is empty").max(8000),
    lang: z.string().trim().max(30).default(""),
  }),
]);

export type ArticleBlock = z.infer<typeof articleBlockSchema>;
export type ArticleBlockType = ArticleBlock["type"];

export const BLOCK_TYPES: { type: ArticleBlockType; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "image", label: "Photo" },
  { type: "quote", label: "Quote" },
  { type: "code", label: "Code" },
];

export const articleBlocksSchema = z.array(articleBlockSchema).max(300);

/** A fresh block of the given type, for the editor's "add" menu. */
export function emptyBlock(type: ArticleBlockType): ArticleBlock {
  switch (type) {
    case "heading":
      return { type: "heading", text: "" };
    case "image":
      return { type: "image", url: "", caption: "" };
    case "quote":
      return { type: "quote", text: "", cite: "" };
    case "code":
      return { type: "code", text: "", lang: "" };
    default:
      return { type: "paragraph", text: "" };
  }
}

/**
 * Reads blocks back out of the database.
 *
 * The column is Json, so its contents are whatever was written — possibly by
 * an older version of this schema. Anything that no longer parses is dropped
 * rather than thrown, so one bad block cannot take down a whole article.
 */
export function parseBlocks(value: unknown): ArticleBlock[] {
  if (!Array.isArray(value)) return [];
  const out: ArticleBlock[] = [];
  for (const raw of value) {
    const parsed = articleBlockSchema.safeParse(raw);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** Rough reading time, shown on cards. ~200 words per minute. */
export function readingMinutes(blocks: ArticleBlock[]): number {
  const words = blocks.reduce((total, block) => {
    const text = block.type === "image" ? block.caption : block.text;
    return total + (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);
  return Math.max(1, Math.round(words / 200));
}

/** First paragraph, trimmed — used as the card excerpt when none is set. */
export function excerptFrom(blocks: ArticleBlock[], max = 180): string {
  const paragraph = blocks.find((b) => b.type === "paragraph");
  if (!paragraph || paragraph.type !== "paragraph") return "";
  const text = paragraph.text.trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
