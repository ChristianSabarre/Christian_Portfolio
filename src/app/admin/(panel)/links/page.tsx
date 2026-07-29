import { prisma } from "@/lib/db";
import LinkCardManager, { type LinkCardItem } from "@/components/admin/LinkCardManager";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const cards = await prisma.linkCard.findMany({ orderBy: [{ kind: "asc" }, { order: "asc" }] });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Newsletter &amp; links</h1>
      <p className="mt-1.5 text-sm text-muted">
        Newsletter cards appear in the section above the footer; footer and social links appear in
        the footer.
      </p>
      <div className="mt-6">
        <LinkCardManager items={cards as LinkCardItem[]} />
      </div>
    </div>
  );
}
