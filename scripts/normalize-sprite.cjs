/**
 * Normalises a messy sprite sheet into a clean one-row RGBA sheet:
 *
 *   node scripts/normalize-sprite.cjs <in.png> <out.png> [options]
 *
 * Options:
 *   --grid CxR        Treat the sheet as C columns × R rows (e.g. 2x2).
 *                     Without it, frames are detected as content islands
 *                     separated by fully-background columns.
 *   --scrub-corner    Erase content touching the top-left ~12% of each cell
 *                     (removes baked-in frame-number labels).
 *   --cell N          Output cell size (square). Default: fits the largest frame.
 *
 * What it fixes:
 *   - Opaque backgrounds: the background colour is sampled from the corners and
 *     removed with an edge-connected flood fill, so enclosed light regions
 *     (teeth, eye highlights, cursor fills) are preserved.
 *   - Uneven layouts: each frame's content is re-centred on a uniform cell.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain-node build script, not app code
const sharp = require("sharp");

const [, , inPath, outPath, ...rest] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node scripts/normalize-sprite.cjs <in.png> <out.png> [--grid CxR] [--scrub-corner] [--cell N]");
  process.exit(1);
}

const opt = {
  grid: null,
  scrubCorner: rest.includes("--scrub-corner"),
  cell: null,
};
const gridArg = rest[rest.indexOf("--grid") + 1];
if (rest.includes("--grid") && /^\d+x\d+$/.test(gridArg || "")) {
  const [c, r] = gridArg.split("x").map(Number);
  opt.grid = { cols: c, rows: r };
}
const cellArg = rest[rest.indexOf("--cell") + 1];
if (rest.includes("--cell") && /^\d+$/.test(cellArg || "")) opt.cell = Number(cellArg);

async function main() {
  const { data, info } = await sharp(inPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const px = (x, y) => (y * W + x) * 4;

  // Background = average of the four corners.
  const corners = [px(0, 0), px(W - 1, 0), px(0, H - 1), px(W - 1, H - 1)];
  const bg = [0, 1, 2].map((c) => Math.round(corners.reduce((s, i) => s + data[i + c], 0) / 4));
  const TOL = 28;
  // Near-white also counts as background: flattened exports leave white halo
  // lumps attached to the art from outside. Enclosed whites (teeth, cursor
  // bodies) sit behind outlines the flood cannot cross, so they survive.
  const isBg = (i) =>
    (Math.abs(data[i] - bg[0]) <= TOL &&
      Math.abs(data[i + 1] - bg[1]) <= TOL &&
      Math.abs(data[i + 2] - bg[2]) <= TOL) ||
    (data[i] >= 232 && data[i + 1] >= 232 && data[i + 2] >= 232);

  // Edge-connected flood fill marking background pixels transparent.
  const seen = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) { stack.push(x, 0, x, H - 1); }
  for (let y = 0; y < H; y++) { stack.push(0, y, W - 1, y); }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const idx = y * W + x;
    if (seen[idx]) continue;
    seen[idx] = 1;
    const i = idx * 4;
    if (data[i + 3] !== 0 && !isBg(i)) continue; // hit real content — stop
    data[i + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // Slice into cells.
  const cells = [];
  if (opt.grid) {
    const cw = Math.floor(W / opt.grid.cols);
    const ch = Math.floor(H / opt.grid.rows);
    for (let r = 0; r < opt.grid.rows; r++)
      for (let c = 0; c < opt.grid.cols; c++)
        cells.push({ x0: c * cw, y0: r * ch, x1: (c + 1) * cw, y1: (r + 1) * ch });
  } else {
    // Column-gap detection: a column is "empty" if it has no opaque pixels.
    const colHasContent = new Array(W).fill(false);
    for (let x = 0; x < W; x++)
      for (let y = 0; y < H; y++)
        if (data[px(x, y) + 3] > 8) { colHasContent[x] = true; break; }
    let start = null;
    for (let x = 0; x <= W; x++) {
      const has = x < W && colHasContent[x];
      if (has && start === null) start = x;
      if (!has && start !== null) {
        cells.push({ x0: start, y0: 0, x1: x, y1: H });
        start = null;
      }
    }
  }

  if (opt.scrubCorner) {
    for (const cell of cells) {
      const sw = Math.round((cell.x1 - cell.x0) * 0.13);
      const sh = Math.round((cell.y1 - cell.y0) * 0.1);
      for (let y = cell.y0; y < cell.y0 + sh; y++)
        for (let x = cell.x0; x < cell.x0 + sw; x++) data[px(x, y) + 3] = 0;
    }
  }

  // Content bounding box per cell; drop empty cells (stray dust < 12 px wide).
  const frames = [];
  for (const cell of cells) {
    let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
    for (let y = cell.y0; y < cell.y1; y++)
      for (let x = cell.x0; x < cell.x1; x++)
        if (data[px(x, y) + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
    if (maxX - minX > 12 && maxY - minY > 12) frames.push({ minX, minY, maxX, maxY });
  }
  if (frames.length === 0) throw new Error("No frames detected — is the background uniform?");

  // Uniform square cell that fits every frame, plus a little breathing room.
  const maxW = Math.max(...frames.map((f) => f.maxX - f.minX + 1));
  const maxH = Math.max(...frames.map((f) => f.maxY - f.minY + 1));
  const cellSize = opt.cell ?? Math.ceil((Math.max(maxW, maxH) * 1.06) / 2) * 2;

  const rgba = Buffer.from(data.buffer);
  const composites = [];
  for (const [i, f] of frames.entries()) {
    const fw = f.maxX - f.minX + 1;
    const fh = f.maxY - f.minY + 1;
    const frameBuf = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
      .extract({ left: f.minX, top: f.minY, width: fw, height: fh })
      .png()
      .toBuffer();
    // Scale down only if a frame overflows the cell; never scale up.
    const fitted =
      fw > cellSize || fh > cellSize
        ? await sharp(frameBuf).resize(cellSize, cellSize, { fit: "inside", kernel: "nearest" }).png().toBuffer()
        : frameBuf;
    const meta = await sharp(fitted).metadata();
    composites.push({
      input: fitted,
      // Centre horizontally, anchor to the bottom so characters share a floor.
      left: i * cellSize + Math.round((cellSize - meta.width) / 2),
      top: cellSize - meta.height,
    });
  }

  await sharp({
    create: { width: cellSize * frames.length, height: cellSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`${outPath}: ${frames.length} frames @ ${cellSize}x${cellSize} (bg ${bg.join(",")} keyed)`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
