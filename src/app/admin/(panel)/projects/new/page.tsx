import { getTaxonomy } from "@/lib/queries";
import { createProjectAction } from "@/app/admin/actions";
import ProjectForm from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [categories, tags, platforms] = await getTaxonomy();

  return (
    <ProjectForm
      action={createProjectAction}
      categories={categories}
      platforms={platforms}
      tags={tags}
      submitLabel="Create project"
      values={{
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
