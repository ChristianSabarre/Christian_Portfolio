"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { ICON_NAMES } from "@/lib/icons";
import ProjectIcon from "@/components/ProjectIcon";
import SubmitButton from "./SubmitButton";
import type { ActionState } from "@/app/admin/actions";

type Option = { id: number; name: string };

export type ProjectFormValues = {
  id?: number;
  title: string;
  url: string;
  displayUrl: string;
  description: string;
  icon: string;
  categoryId: number | "";
  platformId: number | "";
  tagIds: number[];
  featured: boolean;
  published: boolean;
  order: number;
};

const initialState: ActionState = {};

export default function ProjectForm({
  action,
  values,
  categories,
  platforms,
  tags,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  values: ProjectFormValues;
  categories: Option[];
  platforms: Option[];
  tags: Option[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [icon, setIcon] = useState(values.icon);
  const [selectedTags, setSelectedTags] = useState<number[]>(values.tagIds);

  const err = (field: string) => state.errors?.[field];

  function toggleTag(id: number) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {selectedTags.map((id) => (
        <input key={id} type="hidden" name="tagIds" value={id} />
      ))}

      <div className="flex items-center gap-3">
        <Link href="/admin/projects" className="btn btn-ghost" aria-label="Back to projects">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">
          {values.id ? "Edit project" : "New project"}
        </h1>
      </div>

      {state.message ? (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {state.ok ? <Check className="mr-1 inline size-4" /> : null}
          {state.message}
        </p>
      ) : null}

      <section className="glass space-y-4 rounded-2xl p-5">
        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={values.title}
            required
            className="field"
            placeholder="Neural Network Visualizer"
          />
          {err("title") ? <p className="mt-1 text-xs text-red-400">{err("title")}</p> : null}
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={values.description}
            required
            rows={5}
            className="field resize-y"
            placeholder="What the project does and what a visitor can explore in it."
          />
          {err("description") ? (
            <p className="mt-1 text-xs text-red-400">{err("description")}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="url" className="label">
              Project URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              defaultValue={values.url}
              required
              className="field"
              placeholder="https://example.com"
            />
            {err("url") ? <p className="mt-1 text-xs text-red-400">{err("url")}</p> : null}
          </div>
          <div>
            <label htmlFor="displayUrl" className="label">
              Display URL <span className="font-normal text-faint">(optional)</span>
            </label>
            <input
              id="displayUrl"
              name="displayUrl"
              defaultValue={values.displayUrl}
              className="field"
              placeholder="Derived from the URL if left blank"
            />
          </div>
        </div>
      </section>

      <section className="glass space-y-4 rounded-2xl p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className="label">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={values.categoryId}
              required
              className="field cursor-pointer"
            >
              <option value="" disabled>
                Choose a category…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {err("categoryId") ? (
              <p className="mt-1 text-xs text-red-400">{err("categoryId")}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="platformId" className="label">
              Collection
            </label>
            <select
              id="platformId"
              name="platformId"
              defaultValue={values.platformId}
              required
              className="field cursor-pointer"
            >
              <option value="" disabled>
                Choose a collection…
              </option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {err("platformId") ? (
              <p className="mt-1 text-xs text-red-400">{err("platformId")}</p>
            ) : null}
          </div>
        </div>

        <fieldset>
          <legend className="label">Tags</legend>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const on = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    on
                      ? "border-transparent bg-accent text-white"
                      : "border-line text-muted hover:border-line-strong hover:text-text"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Icon</legend>
          <input type="hidden" name="icon" value={icon} />
          <div className="grid max-h-52 grid-cols-6 gap-2 overflow-y-auto rounded-xl border border-line p-2 sm:grid-cols-10">
            {ICON_NAMES.map((name) => {
              const on = icon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIcon(name)}
                  title={name}
                  aria-label={name}
                  aria-pressed={on}
                  className={`grid aspect-square place-items-center rounded-lg border transition-colors ${
                    on
                      ? "border-transparent bg-accent text-white"
                      : "border-transparent text-faint hover:bg-surface-hover hover:text-text"
                  }`}
                >
                  <ProjectIcon name={name} className="size-4" />
                </button>
              );
            })}
          </div>
        </fieldset>
      </section>

      <section className="glass space-y-4 rounded-2xl p-5">
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={values.featured}
              className="size-4 accent-[color:var(--accent)]"
            />
            Featured (pinned to the top of the library)
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={values.published}
              className="size-4 accent-[color:var(--accent)]"
            />
            Visible on the public site
          </label>
        </div>

        <div className="max-w-[10rem]">
          <label htmlFor="order" className="label">
            Sort order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={values.order}
            className="field"
          />
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Link href="/admin/projects" className="btn btn-ghost">
          Cancel
        </Link>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
