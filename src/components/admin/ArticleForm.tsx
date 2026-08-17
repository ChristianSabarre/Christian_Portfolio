"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import BlockEditor from "./BlockEditor";
import ImageDropzone from "./ImageDropzone";
import SubmitButton from "./SubmitButton";
import { saveArticleAction, type ActionState } from "@/app/admin/actions";
import { readingMinutes, type ArticleBlock } from "@/lib/articleBlocks";

const initialState: ActionState = {};

export type ArticleFormValues = {
  id?: number;
  slug?: string;
  title: string;
  subtitle: string;
  coverImage: string;
  footer: string;
  published: boolean;
  blocks: ArticleBlock[];
};

export default function ArticleForm({ values }: { values: ArticleFormValues }) {
  const [state, formAction] = useActionState(saveArticleAction, initialState);
  const [blocks, setBlocks] = useState<ArticleBlock[]>(values.blocks);
  const [cover, setCover] = useState(values.coverImage);

  const err = (field: string) => state.errors?.[field];
  const minutes = readingMinutes(blocks);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {/* The whole body travels as one JSON field — see saveArticleAction. */}
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      <input type="hidden" name="coverImage" value={cover} />

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/articles" className="btn btn-ghost" aria-label="Back to articles">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">
          {values.id ? "Edit article" : "New article"}
        </h1>
        <span className="chip">{minutes} min read</span>
        {values.id && values.slug && values.published ? (
          <a
            href={`/articles/${values.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost ml-auto"
          >
            <ExternalLink className="size-4" />
            View live
          </a>
        ) : null}
      </div>

      {state.message ? (
        <p
          role="status"
          className={`border px-3 py-2 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {state.ok ? <Check className="mr-1 inline size-4" /> : null}
          {state.message}
        </p>
      ) : null}

      <section className="glass space-y-4 p-5">
        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={values.title}
            required
            className="field font-display"
            placeholder="How I built the maze solver"
          />
          {err("title") ? <p className="mt-1 text-xs text-red-400">{err("title")}</p> : null}
        </div>

        <div>
          <label htmlFor="subtitle" className="label">
            Standfirst <span className="font-normal text-faint">(optional)</span>
          </label>
          <textarea
            id="subtitle"
            name="subtitle"
            defaultValue={values.subtitle}
            rows={2}
            className="field resize-y"
            placeholder="One line under the title, also used as the card excerpt."
          />
          {err("subtitle") ? <p className="mt-1 text-xs text-red-400">{err("subtitle")}</p> : null}
        </div>

        <div>
          <span className="label">
            Header image <span className="font-normal text-faint">(optional)</span>
          </span>
          <ImageDropzone value={cover} onChange={setCover} />
          {err("coverImage") ? (
            <p className="mt-1 text-xs text-red-400">{err("coverImage")}</p>
          ) : null}
        </div>
      </section>

      <section className="glass space-y-3 p-5">
        <h2 className="font-display text-base font-semibold">Body</h2>
        <p className="-mt-1 text-xs text-faint">
          Build the article out of blocks. Photos sit inline wherever you place them.
        </p>
        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </section>

      <section className="glass space-y-4 p-5">
        <div>
          <label htmlFor="footer" className="label">
            Footer <span className="font-normal text-faint">(optional)</span>
          </label>
          <textarea
            id="footer"
            name="footer"
            defaultValue={values.footer}
            rows={3}
            className="field resize-y"
            placeholder="Closing note, credits, or a call to action."
          />
          {err("footer") ? <p className="mt-1 text-xs text-red-400">{err("footer")}</p> : null}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={values.published}
            className="size-4 accent-[color:var(--accent)]"
          />
          Published — visible on the site and linkable from projects
        </label>
      </section>

      <div className="flex justify-end gap-2">
        <Link href="/admin/articles" className="btn btn-ghost">
          Cancel
        </Link>
        <SubmitButton>{values.id ? "Save changes" : "Create article"}</SubmitButton>
      </div>
    </form>
  );
}
