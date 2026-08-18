/**
 * Records an MP4 walkthrough of the live site.
 *
 * Why it is scripted this way:
 *  - reducedMotion is forced to "no-preference": this machine reports
 *    "reduce", which would freeze every animation and yield a still video.
 *  - Playwright's recorder does not draw the OS pointer, so a fake cursor is
 *    injected and moved in step with page.mouse.
 *  - Everything is paced with explicit waits; the goal is a legible tour.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.TOUR_BASE || "https://christian-portfolio-cms.vercel.app";
const OUT_DIR = path.join(process.cwd(), "tour");
const W = 1280;
const H = 800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CURSOR_JS = `
(() => {
  if (document.getElementById('__tour_cursor')) return;
  const c = document.createElement('div');
  c.id = '__tour_cursor';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transition:transform .18s cubic-bezier(.22,1,.36,1)';
  c.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.5 L12 14 L19 14 Z" fill="#ffffff" stroke="#111111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  document.documentElement.appendChild(c);
  window.__tourMove = function (x, y) { c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; };
  window.__tourPing = function () {
    const m = (c.style.transform.match(/-?[0-9.]+/g) || ['0', '0']).map(Number);
    const p = document.createElement('div');
    p.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ee2233;border-radius:999px;width:14px;height:14px;opacity:0.9;transition:all .45s ease-out';
    p.style.left = (m[0] - 4) + 'px';
    p.style.top = (m[1] - 4) + 'px';
    document.documentElement.appendChild(p);
    requestAnimationFrame(function () {
      p.style.width = '46px';
      p.style.height = '46px';
      p.style.left = (m[0] - 20) + 'px';
      p.style.top = (m[1] - 20) + 'px';
      p.style.opacity = '0';
    });
    setTimeout(function () { p.remove(); }, 500);
  };
})();
`;

let STEP = 0;
function step(label) {
  STEP += 1;
  console.log("STEP " + STEP + ": " + label);
}

async function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
    colorScheme: "dark",
    recordVideo: { dir: OUT_DIR, size: { width: W, height: H } },
  });
  await context.addInitScript(CURSOR_JS);
  // The site reads this before first paint; seeding it keeps every route on the
  // signature dark look instead of inheriting the headless default.
  await context.addInitScript(() => {
    try { localStorage.setItem("portfolio-theme", "dark"); } catch {}
  });

  const page = await context.newPage();

  let cx = W / 2;
  let cy = H / 2;

  async function moveTo(x, y, steps) {
    await page.mouse.move(x, y, { steps: steps || 22 });
    cx = x;
    cy = y;
    await page.evaluate(([px, py]) => window.__tourMove && window.__tourMove(px, py), [x, y]).catch(() => {});
  }
  async function clickAt(x, y) {
    await moveTo(x, y);
    await sleep(220);
    await page.evaluate(() => window.__tourPing && window.__tourPing()).catch(() => {});
    await page.mouse.click(x, y);
  }
  async function boxOf(selector, nth) {
    const el = page.locator(selector).nth(nth || 0);
    await el.waitFor({ state: "visible", timeout: 15000 });
    return el.boundingBox();
  }
  async function clickSel(selector, nth) {
    const box = await boxOf(selector, nth);
    if (!box) throw new Error("no box for " + selector);
    await clickAt(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
  }
  async function hoverSel(selector, nth) {
    const box = await boxOf(selector, nth).catch(() => null);
    if (!box) return;
    await moveTo(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
  }
  async function smoothScroll(totalPx, duration) {
    const ms = duration || 1400;
    const steps = Math.max(12, Math.round(ms / 40));
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, totalPx / steps);
      await sleep(ms / steps);
    }
  }
  async function reseatCursor() {
    await page.evaluate(CURSOR_JS).catch(() => {});
    await moveTo(cx, cy, 1);
  }

  // 1. Landing + intro animation
  step("landing + intro");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await reseatCursor();
  await sleep(3200);

  // 2. Hero and stat counters
  step("hero + stats");
  await moveTo(760, 380);
  await sleep(1600);

  // 3. Into the project grid
  step("scroll to grid");
  await smoothScroll(620, 1500);
  await sleep(900);

  // 4. Card hover: tilt + selection outline
  step("card hover");
  await hoverSel("article", 0);
  await sleep(1200);
  await hoverSel("article", 1);
  await sleep(1100);

  // 5. Project dialog
  step("project dialog");
  await clickSel('article button[aria-label^="View details"]', 0);
  await sleep(2600);
  await smoothScroll(260, 700);
  await sleep(1400);
  await page.keyboard.press("Escape");
  await sleep(1000);

  // 6. Upvote: heart burst and floating +1
  step("upvote");
  await clickSel('article button[aria-label*="Upvote this"]', 0);
  await sleep(2200);

  // 7. Filter by collection, then back to everything
  step("collection filter");
  await clickSel("aside nav button", 2);
  await sleep(1800);
  await clickSel("aside nav button", 0);
  await sleep(1400);

  // 8. World mode: walk and open a cabinet
  step("world mode");
  await clickSel('button[aria-label="World view"]');
  await page
    .locator('[aria-label^="Walkable project street"]')
    .waitFor({ state: "visible", timeout: 10000 });
  console.log("  world mode engaged");
  await sleep(1600);
  // Focus the street so its key handlers receive the walk input.
  await clickAt(760, 430);
  await sleep(600);
  await page.keyboard.down("ArrowRight");
  await sleep(1500);
  await page.keyboard.up("ArrowRight");
  await sleep(700);
  await page.keyboard.press("Enter");
  await sleep(600);
  const opened = await page
    .locator('[role="dialog"]')
    .isVisible()
    .catch(() => false);
  console.log("  cabinet opened: " + opened);
  await sleep(2000);
  await page.keyboard.press("Escape");
  await sleep(900);
  await clickSel('button[aria-label="Grid view"]');
  await sleep(1200);

  // 9. Articles: index, then the article itself
  step("articles");
  await clickSel('aside a[href="/articles"]');
  await page.waitForURL("**/articles", { timeout: 20000 });
  await reseatCursor();
  await sleep(2000);

  const articleCount = await page.locator('a[href^="/articles/"]').count();
  console.log("  articles listed: " + articleCount);
  await clickSel('a[href^="/articles/"]', 0);
  await page.waitForURL("**/articles/**", { timeout: 20000 });
  await reseatCursor();
  await sleep(2200);
  await smoothScroll(900, 2200);
  await sleep(1200);
  await smoothScroll(900, 2200);
  await sleep(1600);
  console.log("  article: " + (await page.locator("h1").first().innerText()));

  // 10. Home again: contact panel, then theme
  step("contact + theme");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await reseatCursor();
  await sleep(1500);

  await clickSel('button[aria-controls="contact-options"]');
  await sleep(2400);
  await page.keyboard.press("Escape");
  await sleep(800);

  await clickSel('button[aria-label="Toggle color theme"]');
  await sleep(2200);
  await clickSel('button[aria-label="Toggle color theme"]');
  await sleep(1800);

  const video = page.video();
  await context.close();
  await browser.close();

  const raw = await video.path();
  console.log("RAW_VIDEO=" + raw);
}

main().catch((e) => {
  console.error("TOUR_FAILED:", e.message);
  process.exit(1);
});
