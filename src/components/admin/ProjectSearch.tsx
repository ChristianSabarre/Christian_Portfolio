"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

/** Debounced server-side search — the admin list is queried, not filtered client-side. */
export default function ProjectSearch({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (value === initialQuery) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      startTransition(() => router.replace(`/admin/projects?${params}`));
    }, 300);
    return () => clearTimeout(timer);
  }, [value, initialQuery, router]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search projects by title or description…"
        aria-label="Search projects"
        className="field !pl-10"
      />
      {pending ? (
        <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-faint" />
      ) : null}
    </div>
  );
}
