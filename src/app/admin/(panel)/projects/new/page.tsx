import { getTaxonomy } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { createProjectAction } from "@/app/admin/actions";
import ProjectForm from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [[categories, tags, platforms], articles] = await Promise.all([
    getTaxonomy(),
    prisma.article.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, published: true },
    }),
  ]);

  return (
    <ProjectForm
      action={createProjectAction}
      categories={categories}
      platforms={platforms}
      tags={tags}
      articles={articles}
      submitLabel="Create project"
      values={{
        articleId: "",
        title: "",
        url: "",
        coverImage: "",
        videoUrl: "",
        displayUrl: "",
        description: "",
        icon: "Box",
        categoryId: "",
        platformId: "",
        tagIds: [],
        featured: false,
        published: true,
        order: 0,
      }}
    />
  );
}
