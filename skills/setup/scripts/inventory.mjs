// Count design values written outside the token contract in a project, so a
// setup can record a baseline and measure the same numbers afterwards.
// Usage: node inventory.mjs <project-dir> [--ignore path,path] [--json out.json]
// No dependencies. Prints a summary table; --json also writes the full result.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const usage = "Usage: node inventory.mjs <project-dir> [--ignore path,path] [--json out.json]";
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(usage);
  process.exit(0);
}
const root = args[0];
if (!root || root.startsWith("--")) {
  console.error(usage);
  process.exit(2);
}
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index > 0 ? args[index + 1] : undefined;
};
// Theme files and service theme overrides (`*theme.css`) define values on
// purpose, so they are not counted. Copies of ui-design itself are excluded
// with --ignore (for example --ignore src/components/ui,src/components/lib).
const ignore = ["node_modules", ".git", "dist", "build", ".next", "coverage", "themes/", ...(option("ignore")?.split(",") ?? [])];
const isThemeFile = (name) => /theme\.css$/.test(name);
const extensions = /\.(tsx?|jsx?|mjs|css|scss|sass|less|html|vue|svelte|astro)$/;

const checks = {
  literalColor: { label: "色の直接指定(hex・rgb・hsl・oklch等)", pattern: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g },
  paletteClass: { label: "Tailwind既定paletteのclass", pattern: /\b(?:bg|text|border|ring|outline|fill|stroke|from|to|via|divide|placeholder|decoration|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\b(?:bg|text|border)-(?:black|white)\b/g },
  arbitraryValue: { label: "Tailwindの任意値のうちtokenを参照しないもの(幅の指定を含む)", pattern: /\b[a-z][a-z-]*-\[[^\]\s]+\]/g, keep: (value) => !value.includes("var(--") },
  offScaleSpacing: { label: "段外の余白(p-5・gap-7・*.5等)", pattern: /(?:^|[\s"'`:])-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(?:5|7|9|10|11|14|0\.5|1\.5|2\.5|3\.5)(?=[\s"'`]|$)/g },
  inlineStyle: { label: "inline style", pattern: /\bstyle=\{\{|\bstyle="/g },
  fontSize: { label: "文字の大きさの直接指定(font-size: 数値)", pattern: /font-size:\s*[\d.]+(?:px|rem|em)|\btext-\[\d/g },
};

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const rel = relative(root, path) + (entry.isDirectory() ? "/" : "");
    if (ignore.some((part) => rel.includes(part))) continue;
    if (entry.isDirectory()) yield* walk(path);
    else if (extensions.test(entry.name) && !isThemeFile(entry.name)) yield path;
  }
}

// Contract names, to find the project's own variables that reuse them. A clash
// means a screen would silently read ui-design's value (or the reverse).
const contractPath = join(dirname(fileURLToPath(import.meta.url)), "../../../tokens/contract.json");
let contractNames = new Set();
try {
  contractNames = new Set(Object.values(JSON.parse(await readFile(contractPath, "utf8"))).flat());
} catch {
  console.warn(`! token contract not found at ${contractPath}; name clashes are not checked`);
}
const clashes = new Map();
const declaration = /--([a-z][a-z0-9-]*)\s*:/g;

const totals = Object.fromEntries(Object.keys(checks).map((key) => [key, 0]));
const byFile = {};
const colors = new Set();
let files = 0;
for await (const path of walk(root)) {
  files++;
  const text = (await readFile(path, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, name] of text.matchAll(declaration)) {
    // Tailwind theme variables map to utilities: --color-primary clashes with "primary".
    const bare = name.replace(/^(?:color|text|radius|shadow|font|spacing|ease)-/, "");
    for (const candidate of new Set([name, bare])) {
      if (contractNames.has(candidate)) (clashes.get(candidate) ?? clashes.set(candidate, new Set()).get(candidate)).add(relative(root, path));
    }
  }
  for (const [key, { pattern, keep }] of Object.entries(checks)) {
    const found = (text.match(pattern) ?? []).filter((value) => !keep || keep(value));
    if (found.length === 0) continue;
    totals[key] += found.length;
    (byFile[relative(root, path)] ??= {})[key] = found.length;
    if (key === "literalColor") for (const value of found) colors.add(value.toLowerCase());
  }
}

console.log(`対象ファイル: ${files}`);
for (const [key, { label }] of Object.entries(checks)) console.log(`${String(totals[key]).padStart(6)}  ${label}`);
console.log(`${String(colors.size).padStart(6)}  色の直接指定の種類`);
console.log(`${String(clashes.size).padStart(6)}  共通契約と同じ名前の変数(移行時に衝突する)`);
const worst = Object.entries(byFile)
  .map(([file, counts]) => [file, Object.values(counts).reduce((a, b) => a + b, 0)])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
if (worst.length > 0) console.log("\n多いファイル:\n" + worst.map(([file, count]) => `${String(count).padStart(6)}  ${file}`).join("\n"));

if (clashes.size > 0) {
  console.log("\n共通契約と同じ名前:\n" + [...clashes].map(([name, files]) => `  --${name}  ${[...files].slice(0, 3).join(", ")}`).join("\n"));
}

const out = option("json");
if (out) {
  await writeFile(out, JSON.stringify({ root, files, totals, distinctColors: colors.size, nameClashes: Object.fromEntries([...clashes].map(([name, set]) => [name, [...set]])), byFile }, null, 2));
  console.log(`\n${out} に保存`);
}
