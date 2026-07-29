import { getSiteSettings } from "@/lib/queries";
import SiteContentForm from "@/components/admin/SiteContentForm";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Site content</h1>
      <p className="mt-1.5 text-sm text-muted">
        Hero copy, stat counters, and the newsletter section on the public page.
      </p>
      <div className="mt-6">
        <SiteContentForm settings={settings} />
      </div>
    </div>
  );
}
