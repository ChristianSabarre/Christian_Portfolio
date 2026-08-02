/**
 * Extracts the video id from any common YouTube link shape:
 *   https://www.youtube.com/watch?v=ID          (also &t=, &list=, m.youtube.com)
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/live/ID
 * Returns null for anything that is not a YouTube link.
 */
export function youTubeId(input: string | null | undefined): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\.|^m\./, "").toLowerCase();
  const isValid = (id: string | null | undefined): id is string =>
    !!id && /^[\w-]{11}$/.test(id);

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return isValid(id) ? id : null;
  }

  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;

  const fromQuery = url.searchParams.get("v");
  if (isValid(fromQuery)) return fromQuery;

  const [segment, id] = url.pathname.split("/").filter(Boolean);
  if (["embed", "shorts", "live", "v"].includes(segment ?? "") && isValid(id)) return id;

  return null;
}

/** Privacy-preserving embed URL (youtube-nocookie sets no cookie until play). */
export function youTubeEmbedUrl(input: string | null | undefined): string | null {
  const id = youTubeId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}
