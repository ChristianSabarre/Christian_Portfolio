import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/session";

// Uploads are already resized and re-encoded in the browser, so anything much
// larger than this is either a bypass attempt or a bug worth rejecting.
const MAX_BYTES = 1_500_000;
const ALLOWED = new Set(["image/webp", "image/png", "image/jpeg"]);

/** Verifies the bytes really are the image type the client claims. */
function sniff(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  const b = bytes;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  const riff = String.fromCharCode(b[0], b[1], b[2], b[3]);
  const webp = String.fromCharCode(b[8], b[9], b[10], b[11]);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large after compression" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Trust the magic bytes over the declared Content-Type.
  const contentType = sniff(bytes);
  if (!contentType || !ALLOWED.has(contentType)) {
    return NextResponse.json({ error: "Only PNG, JPEG, or WebP images" }, { status: 415 });
  }

  const width = Number(form?.get("width")) || 0;
  const height = Number(form?.get("height")) || 0;

  const asset = await prisma.asset.create({
    data: {
      data: Buffer.from(bytes),
      contentType,
      width: Math.max(0, Math.min(width, 20000)),
      height: Math.max(0, Math.min(height, 20000)),
      bytes: bytes.length,
    },
    select: { id: true, width: true, height: true, bytes: true },
  });

  return NextResponse.json({ url: `/api/assets/${asset.id}`, ...asset }, { status: 201 });
}
