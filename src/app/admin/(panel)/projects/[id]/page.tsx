import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getTaxonomy } from "@/lib/queries";
import { deleteProjectAction, updateProjectAction } from "@/app/admin/actions";
import ProjectForm from "@/components/admin/ProjectForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();

  const [project, [categories, tags, platforms]] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: { tags: { select: { id: true } } },
    }),
    getTaxonomy(),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <ProjectForm
        action={updateProjectAction}
        categories={categories}
        platforms={platforms}
        tags={tags}
        submitLabel="Save changes"
        values={{
          id: project.id,
          title: project.title,
          url: project.url,
          coverImage: project.coverImage,
          videoUrl: project.videoUrl,
          displayUrl: project.displayUrl,
          description: project.description,
          icon: project.icon,
          categoryId: project.categoryId,
          platformId: project.platformId,
          tagIds: project.tags.map((t) => t.id),
          featured: project.featured,
          published: project.published,
          order: project.order,
        }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border-red-500/20 p-5">
          <div>
            <p className="text-sm font-semibold">Delete this project</p>
            <p className="mt-0.5 text-xs text-muted">
              Permanent. To hide it instead, untick “Visible on the public site”.
            </p>
          </div>
          <form action={deleteProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <ConfirmSubmit message={`Permanently delete “${project.title}”?`}>
              <Trash2 className="size-4" />
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </div>
  );
}
