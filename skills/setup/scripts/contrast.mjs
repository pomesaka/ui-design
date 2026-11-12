// Check text contrast of token pairs as the browser computes them (color-mix
// and service overrides included), for each theme.
// Usage: node contrast.mjs <url> --themes a,b [--min 4.5] [--pairs bg/fg,bg/fg]
// Pairs: every `X` / `X-foreground` declared in the page's CSS (service roles
// included), plus secondary text roles on the page and card surfaces.
// Exits with 1 when a pair is below the minimum.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const cwdRequire = createRequire(`${process.cwd()}/`);
let chromium;
for (const load of [require, cwdRequire]) {
  try {
    ({ chromium } = load("playwright"));
    break;
  } catch {}
}
if (!chromium) {
  console.error("Playwright is not available. Install it (npm i -D playwright), run from the package that has it, or set NODE_PATH to its node_modules.");
  process.exit(2);
}

const args = process.argv.slice(2);
const url = args[0];
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index > 0 ? args[index + 1] : undefined;
};
if (!url || url.startsWith("--")) {
  console.error("Usage: node contrast.mjs <url> --themes a,b [--min 4.5] [--pairs bg/fg,bg/fg]");
  process.exit(2);
}
const themes = (option("themes") ?? "").split(",").filter((theme) => /^[a-z0-9-]+$/.test(theme));
const min = Number(option("min") ?? "4.5");
const extraPairs = (option("pairs") ?? "").split(",").filter(Boolean).map((pair) => pair.split("/"));
const defaultExtra = [
  ["background", "foreground"],
  ["background", "reading-secondary"], ["card", "reading-secondary"],
  ["background", "muted-foreground"], ["card", "muted-foreground"],
  ["background", "control-foreground"], ["card", "control-foreground"],
  ["header", "header-muted-foreground"],
];

// Runs in the page: resolve each pair to sRGB through a probe element.
function measure({ theme, extra }) {
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
  const pairs = [...names].filter((name) => names.has(`${name}-foreground`)).map((name) => [name, `${name}-foreground`]);
  for (const pair of extra) if (names.has(pair[0]) && names.has(pair[1])) pairs.push(pair);

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

const browser = await chromium.launch();
let failed = 0;
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  for (const theme of themes.length > 0 ? themes : [null]) {
    const results = await page.evaluate(measure, { theme, extra: [...defaultExtra, ...extraPairs] });
    console.log(`\n${theme ?? "(page theme)"}`);
    for (const { surface, text, ratio } of results.sort((a, b) => a.ratio - b.ratio)) {
      const ok = ratio >= min;
      if (!ok) failed++;
      console.log(`${ok ? "  " : "! "}${ratio.toFixed(2).padStart(6)}  ${text} on ${surface}`);
    }
  }
} finally {
  await browser.close();
}
if (failed > 0) {
  console.log(`\n${failed} pair(s) below ${min}`);
  process.exit(1);
}
