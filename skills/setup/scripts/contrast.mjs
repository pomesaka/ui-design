// Check contrast of surface / foreground token pairs as the browser computes
// them (color-mix and service overrides included), for each theme.
// Usage: node contrast.mjs <url> --themes a,b [--min 4.5] [--pairs surface/foreground,...] [--channel chrome]
// --channel uses an installed browser instead of Playwright's own Chromium.
// --until load is for a page that keeps a connection open and never goes idle.
// Without --pairs: every `X` / `X-foreground` declared in the page's CSS
// (service roles included), plus secondary text roles on the page and card
// surfaces. With --pairs: only those pairs, so borders can be measured with
// --min 3 without lowering the bar for text.
// Exits with 1 when a pair is below the minimum, 2 on bad arguments or a
// --pairs name the page does not declare.
import { launchChromium, openPage, untilStates } from "../../review/scripts/browser.mjs";
import { findUndeclared, formatHeader, formatLine, meetsMinimum, parsePairs, selectPairs } from "./contrast-pairs.mjs";

const usage = "Usage: node contrast.mjs <url> --themes a,b [--min 4.5] [--pairs surface/foreground,...] [--channel chrome] [--until load|domcontentloaded|networkidle]";
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(usage);
  process.exit(0);
}
const url = args[0];
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index > 0 ? args[index + 1] : undefined;
};
if (!url || url.startsWith("--")) {
  console.error(usage);
  process.exit(2);
}
const themes = (option("themes") ?? "").split(",").filter((theme) => /^[a-z0-9-]+$/.test(theme));
const minOption = option("min") ?? "4.5";
const min = Number(minOption);
// Number("") is 0, which would pass every pair.
if (minOption.trim() === "" || !Number.isFinite(min)) {
  console.error(`--min takes a number: ${option("min")}`);
  process.exit(2);
}
const until = option("until") ?? "networkidle";
if (!untilStates.includes(until)) {
  console.error(`Unknown --until: ${until} (${untilStates.join(", ")})`);
  process.exit(2);
}
const parsed = option("pairs") === undefined ? undefined : parsePairs(option("pairs"));
if (parsed?.invalid) {
  console.error(`--pairs takes surface/foreground,...: ${parsed.invalid.join(", ")}`);
  process.exit(2);
}

// Runs in the page: every custom property name declared in its CSS.
function declaredNames() {
  const names = new Set();
  const collect = (rules) => {
    for (const rule of rules) {
      if (rule.style) for (const property of rule.style) if (property.startsWith("--")) names.add(property.slice(2));
      if (rule.cssRules) collect(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    try { collect(sheet.cssRules); } catch {}
  }
  return [...names];
}

// Runs in the page: resolve each pair to sRGB through a probe element.
function measure({ theme, pairs }) {
  const scope = document.createElement("div");
  if (theme) scope.dataset.theme = theme;
  const probe = document.createElement("span");
  scope.append(probe);
  document.body.append(scope);
  const rgb = (value) => {
    const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
    // rgb(r g b / a) uses 0-255; color(srgb r g b / a) uses 0-1.
    const scale = value.startsWith("color(") ? 1 : 255;
    const [r = 0, g = 0, b = 0] = numbers.slice(0, 3).map((n) => n / scale);
    const alpha = numbers.length > 3 ? numbers[3] : 1;
    return { r, g, b, alpha };
  };
  const resolve = (name, property) => {
    probe.style.setProperty(property, `var(--${name})`);
    return rgb(getComputedStyle(probe).getPropertyValue(property));
  };
  const page = resolve("background", "background-color");
  const over = (top, under) => ({
    r: top.r * top.alpha + under.r * (1 - top.alpha),
    g: top.g * top.alpha + under.g * (1 - top.alpha),
    b: top.b * top.alpha + under.b * (1 - top.alpha),
    alpha: 1,
  });
  const luminance = ({ r, g, b }) => {
    const channel = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const results = pairs.map(([surface, text]) => {
    const back = over(resolve(surface, "background-color"), page);
    const fore = over(resolve(text, "color"), back);
    const [hi, lo] = [luminance(back), luminance(fore)].sort((a, b) => b - a);
    return { surface, text, ratio: (hi + 0.05) / (lo + 0.05) };
  });
  scope.remove();
  return results;
}

const browser = await launchChromium(option("channel"));
let failed = 0;
let undeclared = [];
try {
  const page = await browser.newPage();
  await openPage(page, url, until);
  const declared = await page.evaluate(declaredNames);
  const pairs = selectPairs(declared, parsed?.pairs);
  undeclared = findUndeclared(declared, pairs);
  if (undeclared.length === 0) {
    for (const theme of themes.length > 0 ? themes : [null]) {
      const results = await page.evaluate(measure, { theme, pairs });
      console.log(`\n${formatHeader(theme)}`);
      for (const { surface, text, ratio } of results.sort((a, b) => a.ratio - b.ratio)) {
        const ok = meetsMinimum(ratio, min);
        if (!ok) failed++;
        console.log(formatLine([surface, text], ratio, ok));
      }
    }
  }
} finally {
  await browser.close();
}
if (undeclared.length > 0) {
  console.error(`--pairs names not declared in the page's CSS: ${undeclared.join(", ")}`);
  process.exit(2);
}
if (failed > 0) {
  console.log(`\n${failed} pair(s) below ${min}`);
  process.exit(1);
}
