import { expect, test } from "bun:test";
import { readFile, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const contract = JSON.parse(await readFile(new URL("tokens/contract.json", root), "utf8"));
const mapping = await readFile(new URL("tailwind/theme.css", root), "utf8");

test("every contract color is a Tailwind color utility", () => {
  const missing = contract.color.filter((name) => !mapping.includes(`--color-${name}: var(--${name});`));
  expect(missing).toEqual([]);
});

// Components must take values from tokens so themes and services can change them.
// Literal colors would silently ignore the theme.
const literalColor = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/;
// Tailwind default palette names are cleared by the mapping; using one is a mistake.
const paletteClass = /\b(?:bg|text|border|ring|outline|fill|stroke|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d+)?\b/;

for (const dir of ["components/ui", "components/lib", "catalog"]) {
  const files = (await readdir(new URL(`${dir}/`, root))).filter((file) => /\.(tsx?|css)$/.test(file) && !file.endsWith(".test.tsx"));
  test.each(files)(`${dir}/%s uses tokens instead of literal colors`, async (file) => {
    const text = await readFile(new URL(`${dir}/${file}`, root), "utf8");
    expect(text.match(literalColor)?.[0]).toBeUndefined();
    expect(text.match(paletteClass)?.[0]).toBeUndefined();
  });
}
