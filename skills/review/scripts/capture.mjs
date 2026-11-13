// Screenshot pages at review widths for each theme.
// Usage:
//   node capture.mjs <out-dir> <url> [<url> ...] [options]
// Options:
//   --themes a,b        set data-theme on <html> (theme names = files in themes/)
//   --wait <selector>   wait until this selector is visible before capturing
//   --text-scale 2      enlarge root font size (rem-based text) to check 200% text
//   --max-height 2400   clip each screenshot to this height (keeps details readable)
//   --widths 390,768,1280
//   --storage-state f   Playwright storage state (cookies, localStorage) for screens behind a login
//   --scroll <selector> the element that scrolls in an app shell; the viewport is
//                       grown by its hidden height so the whole content is captured
//   --channel chrome    use an installed browser instead of Playwright's own Chromium
// Playwright is found as browser.mjs describes.
// One URL per state (for example ?state=error). Prints each file and warns on
// horizontal scroll and page errors.
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { launchChromium } from "./browser.mjs";

const usage = "Usage: node capture.mjs <out-dir> <url> [<url> ...] [--themes a,b] [--wait selector] [--text-scale 2] [--max-height px] [--widths 390,768,1280] [--storage-state file] [--scroll selector] [--channel chrome]";
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(usage);
  process.exit(0);
}
const options = { themes: "", wait: "", "text-scale": "1", "max-height": "2400", widths: "390,768,1280", "storage-state": "", scroll: "", channel: "" };
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
  console.error(usage);
  process.exit(2);
}
const themes = options.themes ? options.themes.split(",").filter((theme) => /^[a-z0-9-]+$/.test(theme)) : [null];
const widths = options.widths.split(",").map(Number).filter((width) => Number.isInteger(width) && width > 0);
const textScale = Number(options["text-scale"]);
const maxHeight = Number(options["max-height"]);
const storageState = options["storage-state"] || undefined;
if (storageState && !existsSync(storageState)) {
  console.error(`Storage state not found: ${storageState}`);
  process.exit(2);
}

// File names carry the query so each state is identifiable.
function slug(url) {
  const { pathname, search } = new URL(url);
  const name = `${pathname}${search}`.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return name || "page";
}

// Runs in the page. Finds the elements that actually widen the document:
// among those whose right edge passes the viewport, hide each briefly and keep
// the deepest ones whose removal shrinks the page. Elements clipped inside a
// scrolling wrapper do not count; an absolutely positioned element (such as
// sr-only text) whose ancestors set no position, and so escapes it, does.
function findOverflow() {
  const root = document.documentElement;
  const limit = window.innerWidth;
  const width = () => root.scrollWidth;
  const full = width();
  if (full <= limit) return null;
  const depth = (element) => { let n = 0; for (let e = element; e; e = e.parentElement) n++; return n; };
  const candidates = [...document.body.querySelectorAll("*")]
    .filter((element) => element.getBoundingClientRect().right > limit + 1)
    .sort((a, b) => depth(b) - depth(a))
    .slice(0, 300);
  const causes = [];
  for (const element of candidates) {
    if (causes.some((cause) => element.contains(cause))) continue;
    const previous = element.style.getPropertyValue("display");
    element.style.setProperty("display", "none", "important");
    const shrinks = width() < full;
    element.style.setProperty("display", previous);
    if (shrinks) causes.push(element);
  }
  const describe = (element) => {
    const id = element.id ? `#${element.id}` : "";
    const classes = [...element.classList].slice(0, 3).map((name) => `.${name}`).join("");
    const text = (element.textContent ?? "").trim().slice(0, 20);
    return `${element.tagName.toLowerCase()}${id}${classes}${text ? ` "${text}"` : ""}`;
  };
  return causes.slice(0, 5).map(describe).join(", ") || "not found (check elements outside the body)";
}

await mkdir(outDir, { recursive: true });
const browser = await launchChromium(options.channel || undefined);
const problems = [];
try {
  for (const url of urls) {
    for (const theme of themes) {
      for (const width of widths) {
        const label = `${slug(url)} ${theme ?? "default"} ${width}px`;
        const context = await browser.newContext({ viewport: { width, height: 900 }, storageState });
        const page = await context.newPage();
        page.on("pageerror", (error) => problems.push(`${label}: ${error.message}`));
        await page.goto(url, { waitUntil: "networkidle" });
        if (options.wait) await page.locator(options.wait).first().waitFor({ state: "visible" });
        await page.evaluate(({ theme, textScale }) => {
          if (theme) document.documentElement.dataset.theme = theme;
          if (textScale !== 1) document.documentElement.style.fontSize = `${textScale * 100}%`;
        }, { theme, textScale });
        await page.waitForTimeout(200);
        const overflow = await page.evaluate(findOverflow);
        if (overflow) problems.push(`${label}: horizontal scroll caused by ${overflow}`);
        if (options.scroll) {
          // An app shell keeps the document at viewport height; grow the viewport
          // by the inner element's hidden part so its content lays out in full.
          const hidden = await page.locator(options.scroll).first().evaluate((element) => element.scrollHeight - element.clientHeight);
          await page.setViewportSize({ width, height: Math.min(maxHeight, 900 + Math.max(0, hidden)) });
          await page.waitForTimeout(200);
        }
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        const file = join(outDir, `${slug(url)}-${theme ?? "default"}-${width}${textScale !== 1 ? `-text${textScale}` : ""}.png`);
        await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(height, maxHeight) } });
        console.log(height > maxHeight ? `${file} (clipped from ${height}px)` : file);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
for (const problem of problems) console.warn(`! ${problem}`);
