"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import ImageDropzone from "./ImageDropzone";
import {
  BLOCK_TYPES,
  emptyBlock,
  type ArticleBlock,
  type ArticleBlockType,
} from "@/lib/articleBlocks";

/**
 * Ordered block editor for an article body.
 *
 * The parent owns the array and submits it as one JSON field, so add / remove /
 * reorder stay atomic and the server re-validates the whole body in one pass.
 */
export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ArticleBlock[];
  onChange: (next: ArticleBlock[]) => void;
}) {
  function update(index: number, patch: Partial<ArticleBlock>) {
    onChange(
      blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as ArticleBlock) : b)),
    );
  }

  function add(type: ArticleBlockType) {
    onChange([...blocks, emptyBlock(type)]);
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <p className="border border-dashed border-line px-4 py-8 text-center text-sm text-faint">
          No content yet. Add a heading, paragraph, or photo below.
        </p>
      ) : null}

      {blocks.map((block, i) => (
        <div key={i} className="border border-line bg-bg-deep/40 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="eyebrow text-faint">
              {BLOCK_TYPES.find((t) => t.type === block.type)?.label ?? block.type}
            </span>
            <span className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="btn btn-ghost size-8 !px-0 disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === blocks.length - 1}
                className="btn btn-ghost size-8 !px-0 disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="btn btn-danger size-8 !px-0"
                aria-label="Remove block"
              >
                <Trash2 className="size-4" />
              </button>
            </span>
          </div>

          {block.type === "heading" ? (
            <input
              value={block.text}
              onChange={(e) => update(i, { text: e.target.value })}
              className="field font-display"
              placeholder="Section heading"
              aria-label="Heading text"
            />
          ) : null}

          {block.type === "paragraph" ? (
            <textarea
              value={block.text}
              onChange={(e) => update(i, { text: e.target.value })}
              rows={5}
              className="field resize-y"
              placeholder="Write a paragraph…"
              aria-label="Paragraph text"
            />
          ) : null}

          {block.type === "image" ? (
            <div className="space-y-2">
              <ImageDropzone value={block.url} onChange={(url) => update(i, { url })} />
              <input
                value={block.caption}
                onChange={(e) => update(i, { caption: e.target.value })}
                className="field"
                placeholder="Caption (optional)"
                aria-label="Image caption"
              />
            </div>
          ) : null}

          {block.type === "quote" ? (
            <div className="space-y-2">
              <textarea
                value={block.text}
                onChange={(e) => update(i, { text: e.target.value })}
                rows={3}
                className="field resize-y"
                placeholder="Pull quote…"
                aria-label="Quote text"
              />
              <input
                value={block.cite}
                onChange={(e) => update(i, { cite: e.target.value })}
                className="field"
                placeholder="Attribution (optional)"
                aria-label="Quote attribution"
              />
            </div>
          ) : null}

          {block.type === "code" ? (
            <div className="space-y-2">
              <input
                value={block.lang}
                onChange={(e) => update(i, { lang: e.target.value })}
                className="field !w-40"
                placeholder="Language"
                aria-label="Code language"
              />
              <textarea
                value={block.text}
                onChange={(e) => update(i, { text: e.target.value })}
                rows={6}
                spellCheck={false}
                className="field resize-y font-mono !text-xs"
                placeholder="Paste code…"
                aria-label="Code"
              />
            </div>
          ) : null}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        {BLOCK_TYPES.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => add(type)}
            className="btn btn-ghost"
          >
            <Plus className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
