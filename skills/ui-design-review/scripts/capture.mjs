// Screenshot a page at review widths for each theme, full page.
// Usage: node capture.mjs <url> <out-dir> [theme,theme,...]
// Themes are applied by setting data-theme on <html> after load, so any page
// that reads the ui-design themes can be captured without its own switcher.
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

// require() also finds a globally provided Playwright (NODE_PATH), which ESM import does not.
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is not available. Install it in the project (npm i -D playwright) and run again.");
  process.exit(2);
}

const [url, outDir, themeList] = process.argv.slice(2);
if (!url || !outDir) {
  console.error("Usage: node capture.mjs <url> <out-dir> [theme,theme,...]");
  process.exit(2);
}
const themes = themeList ? themeList.split(",").filter((theme) => /^[a-z0-9-]+$/.test(theme)) : [null];
const widths = [390, 768, 1280];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];
try {
  for (const theme of themes) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on("pageerror", (error) => problems.push(`${theme ?? "default"} ${width}px: ${error.message}`));
      await page.goto(url, { waitUntil: "networkidle" });
      if (theme) await page.evaluate((name) => { document.documentElement.dataset.theme = name; }, theme);
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) problems.push(`${theme ?? "default"} ${width}px: horizontal scroll`);
      const file = join(outDir, `${theme ?? "default"}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
for (const problem of problems) console.warn(`! ${problem}`);
