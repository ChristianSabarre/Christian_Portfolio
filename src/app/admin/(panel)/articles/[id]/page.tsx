import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseBlocks } from "@/lib/articleBlocks";
import { deleteArticleAction } from "@/app/admin/actions";
import ArticleForm from "@/components/admin/ArticleForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) notFound();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { projects: { select: { id: true, title: true } } },
  });
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <ArticleForm
        values={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          subtitle: article.subtitle,
          coverImage: article.coverImage,
          footer: article.footer,
          published: article.published,
          blocks: parseBlocks(article.blocks),
        }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="glass flex flex-wrap items-center justify-between gap-3 border-red-500/20 p-5">
          <div>
            <p className="text-sm font-semibold">Delete this article</p>
            <p className="mt-0.5 text-xs text-muted">
              {article.projects.length > 0
                ? `${article.projects.length} project(s) link to it and will simply lose the link.`
                : "Permanent. To hide it instead, untick Published."}
            </p>
          </div>
          <form action={deleteArticleAction}>
            <input type="hidden" name="id" value={article.id} />
            <ConfirmSubmit message={`Permanently delete “${article.title}”?`}>
              <Trash2 className="size-4" />
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </div>
  );
}
