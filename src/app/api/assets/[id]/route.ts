import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Serves an uploaded image.
 *
 * Public by design — these are portfolio cover images. Rows are immutable, so
 * the response is cached hard: after the first request the CDN answers, and
 * this route (and the database) are not touched again.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assetId = Number(id);
  if (!Number.isInteger(assetId) || assetId <= 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { data: true, contentType: true, bytes: true },
  });
  if (!asset) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(asset.data), {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Length": String(asset.bytes),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
