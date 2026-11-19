import { expect, test } from "bun:test";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test.each([
  ["missing token", /  --background: [^;]+;\n/, "", /missing background/],
  ["uppercase suffix", /  --primary: [^;]+;/, "  --primary: var(--primaryFoo);", /undefined reference primaryFoo/],
  ["underscore suffix", /  --primary: [^;]+;/, "  --primary: var(--primary_typo);", /undefined reference primary_typo/],
  ["case-sensitive name", /  --primary: [^;]+;/, "  --primary: var(--Primary);", /undefined reference Primary/],
  ["cyclic reference", /  --primary: [^;]+;/, "  --primary: var(--primary-hover);", /cyclic reference/],
])("rejects %s before a theme is consumed", async (_label, pattern, replacement, reason) => {
  const directory = await mkdtemp(join(tmpdir(), "ui-design-theme-contract-"));
  try {
    for (const name of ["scripts", "tokens", "themes"]) await mkdir(join(directory, name));
    for (const name of ["scripts/check-themes.mjs", "tokens/contract.json"]) {
      await copyFile(new URL(`../${name}`, import.meta.url), join(directory, name));
    }
    const source = await readFile(new URL("../themes/luma-light.css", import.meta.url), "utf8");
    expect(source).toMatch(pattern);
    await writeFile(join(directory, "themes/luma-light.css"), source.replace(pattern, replacement));
    const result = spawnSync(process.execPath, [join(directory, "scripts/check-themes.mjs")], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(reason);
  } finally {
    await rm(directory, { recursive: true });
  }
});

// A service checks its own themes against ui-design's contract by path.
const checker = new URL("./check-themes.mjs", import.meta.url).pathname;
const valid = await readFile(new URL("../themes/luma-light.css", import.meta.url), "utf8");
const named = (name) => valid.replace('[data-theme="luma-light"]', `[data-theme="${name}"]`);
const broken = (name) => named(name).replace(/  --background: [^;]+;\n/, "");

test.each([
  ["a file relative to cwd", { "src/themes/service-light.css": named("service-light") }, ["src/themes/service-light.css"], 0, /^src\/themes\/service-light\.css: \d+ tokens/m],
  ["only CSS directly in a directory", { "src/themes/a.css": named("a"), "src/themes/notes.txt": "x", "src/themes/sub/b.css": broken("b") }, ["src/themes"], 0, /^src\/themes\/a\.css: [^\n]*\n$/],
  ["a file and a directory once each", { "t/a.css": named("a"), "t/b.css": named("b") }, ["t/a.css", "t"], 0, /^t\/a\.css: [^\n]*\nt\/b\.css: [^\n]*\n$/],
  ["a broken theme among valid ones", { "t/a.css": named("a"), "t/b.css": broken("b") }, ["t/a.css", "t/b.css"], 1, /missing background/],
  ["a selector that differs from the file name", { "t/service-light.css": named("template") }, ["t/service-light.css"], 1, /selector name differs from file/],
  ["a missing path", {}, ["nope.css"], 1, /nope\.css: not found/],
  ["a file that is not CSS", { "t/theme.txt": named("theme") }, ["t/theme.txt"], 1, /theme\.txt: not a CSS file/],
  ["a directory without CSS", { "t/notes.txt": "x" }, ["t"], 1, /no theme CSS found/],
])("checks %s", async (_label, files, args, status, output) => {
  const directory = await mkdtemp(join(tmpdir(), "ui-design-theme-args-"));
  try {
    for (const [path, text] of Object.entries(files)) {
      await mkdir(join(directory, path, ".."), { recursive: true });
      await writeFile(join(directory, path), text);
    }
    const result = spawnSync(process.execPath, [checker, ...args], { cwd: directory, encoding: "utf8" });
    expect(result.status).toBe(status);
    expect(status === 0 ? result.stdout : result.stderr).toMatch(output);
  } finally {
    await rm(directory, { recursive: true });
  }
});
