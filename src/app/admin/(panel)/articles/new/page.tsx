import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <ArticleForm
      values={{
        title: "",
        subtitle: "",
        coverImage: "",
        footer: "",
        published: false,
        blocks: [{ type: "paragraph", text: "" }],
      }}
    />
  );
}
