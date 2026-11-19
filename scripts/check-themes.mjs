// Usage: bun scripts/check-themes.mjs [theme file or directory ...]
// Without arguments, checks this repository's themes/. A service passes its own
// theme files to check them against the same contract.
import { readFile, readdir, stat } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const contractUrl = new URL("../tokens/contract.json", import.meta.url);
const inputs = process.argv.slice(2);
const targets = inputs.length > 0 ? inputs.map((input) => resolve(input)) : [fileURLToPath(new URL("../themes/", import.meta.url))];
const contract = JSON.parse(await readFile(contractUrl, "utf8"));
const groups = Object.values(contract);
if (!groups.every((group) => Array.isArray(group) && group.length > 0)) {
  throw new Error("Token contract must contain non-empty name groups");
}
const names = groups.flat();
if (!names.every((name) => typeof name === "string" && /^[a-z][a-z0-9-]*$/.test(name))) {
  throw new Error("Invalid token name in contract");
}
const required = new Set(names);
if (required.size !== names.length) throw new Error("Duplicate token name in contract");
const display = (path) => {
  const fromCwd = relative(process.cwd(), path);
  return fromCwd.startsWith("..") ? path : fromCwd;
};
const files = [];
for (const target of targets) {
  const info = await stat(target).catch(() => undefined);
  if (!info) throw new Error(`${display(target)}: not found`);
  if (info.isDirectory()) {
    const found = (await readdir(target)).filter((name) => name.endsWith(".css")).sort();
    if (found.length === 0) throw new Error(`${display(target)}: no theme CSS found`);
    files.push(...found.map((name) => join(target, name)));
  } else if (target.endsWith(".css")) {
    files.push(target);
  } else {
    throw new Error(`${display(target)}: not a CSS file`);
  }
}

for (const path of new Set(files)) {
  const filename = display(path);
  const text = (await readFile(path, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
  // Themes deliberately contain one flat rule, so every scope owns a complete set.
  // Inheriting missing names from a surrounding theme would hide an incomplete theme.
  const match = text.match(/^\s*\[data-theme="([a-z0-9-]+)"\]\s*\{([^{}]*)\}\s*$/);
  if (!match) throw new Error(`${filename}: expected one data-theme rule`);
  const [, themeName, body] = match;
  if (basename(path) !== `${themeName}.css`) throw new Error(`${filename}: selector name differs from file`);
  const values = new Map();
  let scheme;
  for (const declaration of body.split(";")) {
    if (!declaration.trim()) continue;
    const colon = declaration.indexOf(":");
    if (colon < 0) throw new Error(`${filename}: malformed declaration`);
    const property = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (!value) throw new Error(`${filename}: empty ${property}`);
    if (property === "color-scheme") {
      if (scheme !== undefined) throw new Error(`${filename}: duplicate color-scheme`);
      scheme = value;
      continue;
    }
    if (!property.startsWith("--")) throw new Error(`${filename}: unexpected property ${property}`);
    const name = property.slice(2);
    if (!required.has(name)) throw new Error(`${filename}: unknown token ${name}`);
    if (values.has(name)) throw new Error(`${filename}: duplicate token ${name}`);
    values.set(name, value);
  }
  if (scheme !== "light" && scheme !== "dark") throw new Error(`${filename}: invalid color-scheme`);
  const missing = names.filter((name) => !values.has(name));
  if (missing.length > 0) throw new Error(`${filename}: missing ${missing.join(", ")}`);
  const visited = new Set();
  const visiting = new Set();
  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) throw new Error(`${filename}: cyclic reference at ${name}`);
    const value = values.get(name);
    if (value === undefined) throw new Error(`${filename}: undefined reference ${name}`);
    visiting.add(name);
    for (const reference of value.matchAll(/var\(\s*--([^\s,)]+)/g)) visit(reference[1]);
    visiting.delete(name);
    visited.add(name);
  }
  for (const name of names) visit(name);
  console.log(`${filename}: ${values.size} tokens, references valid`);
}
