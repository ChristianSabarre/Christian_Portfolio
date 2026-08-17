import type { ArticleBlock } from "@/lib/articleBlocks";

/**
 * Renders an article body.
 *
 * Every block is emitted as React text — nothing authored is ever interpreted
 * as HTML, so a write-up cannot inject markup into the page.
 */
export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="pt-4 font-display text-xl font-bold sm:text-2xl">
                {block.text}
              </h2>
            );

          case "paragraph":
            return (
              // Preserve deliberate line breaks without allowing markup.
              <p key={i} className="whitespace-pre-wrap text-[0.98rem] leading-relaxed text-muted">
                {block.text}
              </p>
            );

          case "image":
            return (
              <figure key={i} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied URLs from any host; next/image would need each whitelisted */}
                <img
                  src={block.url}
                  alt={block.caption || ""}
                  loading="lazy"
                  className="w-full border-2 border-line-strong"
                />
                {block.caption ? (
                  <figcaption className="text-center text-xs text-faint">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );

          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-accent bg-surface px-5 py-4"
              >
                <p className="font-display text-base leading-relaxed">{block.text}</p>
                {block.cite ? (
                  <cite className="eyebrow mt-2 block not-italic text-faint">— {block.cite}</cite>
                ) : null}
              </blockquote>
            );

          case "code":
            return (
              <div key={i} className="border-2 border-line-strong bg-bg-deep">
                {block.lang ? (
                  <p className="eyebrow border-b border-line px-3 py-1.5 text-faint">
                    {block.lang}
                  </p>
                ) : null}
                <pre className="overflow-x-auto p-4">
                  <code className="font-mono text-xs leading-relaxed">{block.text}</code>
                </pre>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
