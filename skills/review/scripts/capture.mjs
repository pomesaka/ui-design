// Screenshot pages at review widths for each theme.
// Usage:
//   node capture.mjs <out-dir> <url> [<url> ...] [options]
// Options:
//   --themes a,b        set data-theme on <html> (theme names = files in themes/)
//   --wait <selector>   wait until this selector is visible before capturing
//   --text-scale 2      enlarge root font size (rem-based text) to check 200% text
//   --max-height 2400   clip each screenshot to this height (keeps details readable)
//   --widths 390,768,1280
// One URL per state (for example ?state=error). Prints each file and warns on
// horizontal scroll and page errors.
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

const args = process.argv.slice(2);
const options = { themes: "", wait: "", "text-scale": "1", "max-height": "2400", widths: "390,768,1280" };
const positional = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith("--")) {
    const name = arg.slice(2);
    const value = args[i + 1];
    if (!(name in options) || value === undefined) {
      console.error(`Unknown or incomplete option: ${arg}`);
      process.exit(2);
    }
    options[name] = value;
    i++;
  } else positional.push(arg);
}
const [outDir, ...urls] = positional;
if (!outDir || urls.length === 0) {
  console.error("Usage: node capture.mjs <out-dir> <url> [<url> ...] [--themes a,b] [--wait selector] [--text-scale 2] [--max-height px] [--widths 390,768,1280]");
  process.exit(2);
}
const themes = options.themes ? options.themes.split(",").filter((theme) => /^[a-z0-9-]+$/.test(theme)) : [null];
const widths = options.widths.split(",").map(Number).filter((width) => Number.isInteger(width) && width > 0);
const textScale = Number(options["text-scale"]);
const maxHeight = Number(options["max-height"]);

// File names carry the query so each state is identifiable.
function slug(url) {
  const { pathname, search } = new URL(url);
  const name = `${pathname}${search}`.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return name || "page";
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];
try {
  for (const url of urls) {
    for (const theme of themes) {
      for (const width of widths) {
        const label = `${slug(url)} ${theme ?? "default"} ${width}px`;
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        page.on("pageerror", (error) => problems.push(`${label}: ${error.message}`));
        await page.goto(url, { waitUntil: "networkidle" });
        if (options.wait) await page.locator(options.wait).first().waitFor({ state: "visible" });
        await page.evaluate(({ theme, textScale }) => {
          if (theme) document.documentElement.dataset.theme = theme;
          if (textScale !== 1) document.documentElement.style.fontSize = `${textScale * 100}%`;
        }, { theme, textScale });
        await page.waitForTimeout(200);
        if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) {
          problems.push(`${label}: horizontal scroll`);
        }
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        const file = join(outDir, `${slug(url)}-${theme ?? "default"}-${width}${textScale !== 1 ? `-text${textScale}` : ""}.png`);
        await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(height, maxHeight) } });
        console.log(height > maxHeight ? `${file} (clipped from ${height}px)` : file);
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
for (const problem of problems) console.warn(`! ${problem}`);
