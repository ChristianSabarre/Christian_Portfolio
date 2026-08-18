const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "no-preference",
    colorScheme: "dark",
  });
  await page.goto("https://christian-portfolio-cms.vercel.app", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const info = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button[aria-label]")]
      .filter((b) => /view$/i.test(b.getAttribute("aria-label") || ""))
      .map((b) => {
        const r = b.getBoundingClientRect();
        return {
          label: b.getAttribute("aria-label"),
          pressed: b.getAttribute("aria-pressed"),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          topElAtCentre:
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.tagName +
            "." +
            String(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.className || "").slice(0, 40),
        };
      });
    return btns;
  });
  console.log("VIEW BUTTONS:", JSON.stringify(info, null, 1));

  // Try a direct DOM click and see if world mode appears.
  await page.evaluate(() => {
    document.querySelector('button[aria-label="World view"]')?.click();
  });
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({
    street: !!document.querySelector('[aria-label^="Walkable project street"]'),
    articles: document.querySelectorAll("article").length,
    savedView: localStorage.getItem("portfolio-view"),
  }));
  console.log("AFTER DOM CLICK:", JSON.stringify(after));

  await browser.close();
})();
