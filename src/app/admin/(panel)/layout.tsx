import Link from "next/link";
import { Compass, ExternalLink, LogOut } from "lucide-react";
import { logoutAction } from "../actions";
import AdminNav from "@/components/admin/AdminNav";
import ThemeToggle from "@/components/site/ThemeToggle";

export const metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-line bg-bg-deep lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-6 p-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white">
              <Compass className="size-[1.15rem]" />
            </span>
            <span className="font-display font-semibold">Admin</span>
          </Link>

          <AdminNav />

          <div className="mt-auto space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost w-full justify-start"
            >
              <ExternalLink className="size-4" />
              View site
            </a>
            <div className="flex gap-2">
              <form action={logoutAction} className="flex-1">
                <button type="submit" className="btn btn-ghost w-full justify-start">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
