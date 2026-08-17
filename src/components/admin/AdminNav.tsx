"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderKanban, LayoutDashboard, Link2, Tags, Type } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", Icon: FolderKanban },
  { href: "/admin/articles", label: "Articles", Icon: FileText },
  { href: "/admin/taxonomy", label: "Categories & tags", Icon: Tags },
  { href: "/admin/content", label: "Site content", Icon: Type },
  { href: "/admin/links", label: "Newsletter & links", Icon: Link2 },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {LINKS.map(({ href, label, Icon }) => {
        // "/admin" would otherwise match every nested route.
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-surface-hover hover:text-text"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
