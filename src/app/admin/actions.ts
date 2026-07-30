"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import {
  fieldErrors,
  linkCardSchema,
  projectSchema,
  siteSettingSchema,
  taxonomySchema,
} from "@/lib/validation";

export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

/** Refreshes every surface that can show content. */
function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

function checkbox(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true";
}

// ---------------------------------------------------------------- auth

// Crude per-process throttle. Serverless instances are short-lived, so this
// slows down casual guessing rather than acting as a hard rate limiter.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const key = "admin";
  const now = Date.now();
  const record = attempts.get(key);
  if (record && now - record.first < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return { ok: false, message: "Too many attempts. Try again in a few minutes." };
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return {
      ok: false,
      message: "ADMIN_PASSWORD_HASH is not configured on the server.",
    };
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    if (!record || now - record.first >= WINDOW_MS) {
      attempts.set(key, { count: 1, first: now });
    } else {
      record.count += 1;
    }
    return { ok: false, message: "Incorrect password." };
  }

  attempts.delete(key);
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);

  // Only allow same-site relative paths, so ?next= cannot be used as an
  // open redirect.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  redirect(safeNext);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ------------------------------------------------------------- projects

function projectFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    url: formData.get("url"),
    displayUrl: formData.get("displayUrl") ?? "",
    description: formData.get("description"),
    icon: formData.get("icon"),
    categoryId: formData.get("categoryId"),
    platformId: formData.get("platformId"),
    tagIds: formData.getAll("tagIds"),
    featured: checkbox(formData, "featured"),
    published: checkbox(formData, "published"),
    order: formData.get("order") || 0,
  };
}

/** Falls back to the URL's hostname+path when displayUrl is left blank. */
function deriveDisplayUrl(displayUrl: string, url: string): string {
  if (displayUrl.trim()) return displayUrl.trim();
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = projectSchema.safeParse(projectFormValues(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const taken = new Set((await prisma.project.findMany({ select: { slug: true } })).map((p) => p.slug));

  try {
    await prisma.project.create({
      data: {
        title: data.title,
        slug: uniqueSlug(data.title, taken),
        url: data.url,
        displayUrl: deriveDisplayUrl(data.displayUrl, data.url),
        description: data.description,
        icon: data.icon,
        featured: data.featured,
        published: data.published,
        order: data.order,
        categoryId: data.categoryId,
        platformId: data.platformId,
        tags: { connect: data.tagIds.map((id) => ({ id })) },
      },
    });
  } catch {
    return { ok: false, message: "Could not create the project. Check the category and collection." };
  }

  revalidateAll();
  redirect("/admin/projects?created=1");
}

export async function updateProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { ok: false, message: "Invalid project id." };

  const parsed = projectSchema.safeParse(projectFormValues(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const existing = await prisma.project.findUnique({ where: { id }, select: { slug: true, title: true } });
  if (!existing) return { ok: false, message: "That project no longer exists." };

  // Only re-slug when the title actually changed, so shared links stay stable.
  let slug = existing.slug;
  if (existing.title !== data.title) {
    const taken = new Set(
      (await prisma.project.findMany({ where: { NOT: { id } }, select: { slug: true } })).map((p) => p.slug),
    );
    slug = uniqueSlug(data.title, taken);
  }

  try {
    await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        url: data.url,
        displayUrl: deriveDisplayUrl(data.displayUrl, data.url),
        description: data.description,
        icon: data.icon,
        featured: data.featured,
        published: data.published,
        order: data.order,
        categoryId: data.categoryId,
        platformId: data.platformId,
        tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
      },
    });
  } catch {
    return { ok: false, message: "Could not save the project." };
  }

  revalidateAll();
  return { ok: true, message: "Saved." };
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await prisma.project.delete({ where: { id } });
    revalidateAll();
  }
  redirect("/admin/projects?deleted=1");
}

export async function toggleProjectFlagAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const field = String(formData.get("field"));
  if (!Number.isInteger(id) || (field !== "featured" && field !== "published")) return;

  const project = await prisma.project.findUnique({ where: { id }, select: { featured: true, published: true } });
  if (!project) return;

  await prisma.project.update({ where: { id }, data: { [field]: !project[field] } });
  revalidateAll();
}

// ------------------------------------------------------------- taxonomy

type TaxonomyKind = "category" | "tag" | "platform";

function taxonomyDelegate(kind: TaxonomyKind) {
  if (kind === "category") return prisma.category;
  if (kind === "tag") return prisma.tag;
  return prisma.platform;
}

const taxonomyKind = z.enum(["category", "tag", "platform"]);

export async function saveTaxonomyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const kindResult = taxonomyKind.safeParse(formData.get("kind"));
  if (!kindResult.success) return { ok: false, message: "Unknown item type." };
  const kind = kindResult.data;

  const parsed = taxonomySchema.safeParse({
    name: formData.get("name"),
    order: formData.get("order") || 0,
    icon: formData.get("icon") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;
  const delegate = taxonomyDelegate(kind);
  const base = { name: parsed.data.name, slug: slugify(parsed.data.name) };
  // Tags have no explicit ordering; only categories carry a sidebar icon.
  const data =
    kind === "tag"
      ? base
      : kind === "category"
        ? { ...base, order: parsed.data.order, ...(parsed.data.icon ? { icon: parsed.data.icon } : {}) }
        : { ...base, order: parsed.data.order };

  try {
    if (id) {
      // @ts-expect-error — delegates differ structurally but share these fields.
      await delegate.update({ where: { id }, data });
    } else {
      // @ts-expect-error — see above.
      await delegate.create({ data });
    }
  } catch {
    return { ok: false, message: `A ${kind} with that name already exists.` };
  }

  revalidateAll();
  return { ok: true, message: "Saved." };
}

export async function deleteTaxonomyAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const kindResult = taxonomyKind.safeParse(formData.get("kind"));
  const id = Number(formData.get("id"));
  if (!kindResult.success || !Number.isInteger(id)) return;

  try {
    // @ts-expect-error — delegates differ structurally but share `delete`.
    await taxonomyDelegate(kindResult.data).delete({ where: { id } });
    revalidateAll();
  } catch {
    // Restricted by a project still referencing it; the page shows usage counts.
    redirect(`/admin/taxonomy?error=in-use`);
  }
  redirect("/admin/taxonomy?deleted=1");
}

// ------------------------------------------------------------ link cards

export async function saveLinkCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = linkCardSchema.safeParse({
    kind: formData.get("kind"),
    label: formData.get("label") ?? "",
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    url: formData.get("url"),
    order: formData.get("order") || 0,
    published: checkbox(formData, "published"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;

  if (id) {
    await prisma.linkCard.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.linkCard.create({ data: parsed.data });
  }

  revalidateAll();
  return { ok: true, message: "Saved." };
}

export async function deleteLinkCardAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await prisma.linkCard.delete({ where: { id } });
    revalidateAll();
  }
  redirect("/admin/links?deleted=1");
}

// --------------------------------------------------------- site settings

export async function saveSiteSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const raw = Object.fromEntries(
    Object.keys(siteSettingSchema.shape).map((key) => [key, formData.get(key) ?? ""]),
  );

  const parsed = siteSettingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }

  // Blank stat values mean "count from the database", stored as NULL.
  const { statValue1, statValue2, statValue3, ...rest } = parsed.data;
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {
      ...rest,
      statValue1: statValue1 || null,
      statValue2: statValue2 || null,
      statValue3: statValue3 || null,
    },
    create: {
      id: 1,
      ...rest,
      statValue1: statValue1 || null,
      statValue2: statValue2 || null,
      statValue3: statValue3 || null,
    },
  });

  revalidateAll();
  return { ok: true, message: "Saved." };
}
