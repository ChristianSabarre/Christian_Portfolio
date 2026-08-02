"use client";

import { useRef, useState, type DragEvent } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";

const MAX_EDGE = 1600;
const QUALITY = 0.82;
const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

/**
 * Downscales and re-encodes in the browser before upload.
 *
 * Doing it client-side means the server needs no image library, and a 3 MB
 * phone photo arrives as a ~150 KB WebP instead of being stored whole.
 */
async function compress(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );
  if (!blob) throw new Error("Could not encode the image");
  return { blob, width, height };
}

export default function ImageDropzone({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!ACCEPT.includes(file.type)) {
      setError("That file is not a PNG, JPEG, WebP, GIF, or AVIF image.");
      return;
    }

    setBusy(true);
    try {
      const { blob, width, height } = await compress(file);
      const body = new FormData();
      body.append("file", new File([blob], "cover.webp", { type: "image/webp" }));
      body.append("width", String(width));
      body.append("height", String(height));

      const res = await fetch("/api/admin/assets", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div>
      {/* Not a <button>: it contains one, and a button cannot nest a button. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-label="Upload a cover image"
        className={`relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line hover:border-line-strong hover:bg-surface-hover/50"
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="size-5 animate-spin text-accent" />
            <p className="text-sm text-muted">Compressing and uploading…</p>
          </>
        ) : value ? (
          <>
            {/* Plain img: the URL may point at any host, and next/image would
                need each one whitelisted in next.config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-32 w-full rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <p className="text-xs text-faint">Drop a new image, or click to replace</p>
          </>
        ) : (
          <>
            <ImageUp className="size-6 text-faint" />
            <p className="text-sm font-medium">Drag an image here, or click to browse</p>
            <p className="text-xs text-faint">
              Resized to {MAX_EDGE}px and converted to WebP automatically
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange("");
            setError(null);
          }}
          className="btn btn-ghost mt-2 !py-1.5 text-xs"
        >
          <Trash2 className="size-3.5" />
          Remove image
        </button>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
