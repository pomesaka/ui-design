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
