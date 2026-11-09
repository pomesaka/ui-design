import { readFile, readdir } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const contractUrl = new URL("../tokens/contract.json", import.meta.url);
const themesUrl = new URL("../themes/", import.meta.url);
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
const files = (await readdir(themesUrl)).filter((name) => name.endsWith(".css")).sort();
if (files.length === 0) throw new Error("No themes found");

for (const filename of files) {
  const text = (await readFile(new URL(filename, themesUrl), "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
  // Themes deliberately contain one flat rule, so every scope owns a complete set.
  // Inheriting missing names from a surrounding theme would hide an incomplete theme.
  const match = text.match(/^\s*\[data-theme="([a-z0-9-]+)"\]\s*\{([^{}]*)\}\s*$/);
  if (!match) throw new Error(`${filename}: expected one data-theme rule`);
  const [, themeName, body] = match;
  if (filename !== `${themeName}.css`) throw new Error(`${filename}: selector name differs from file`);
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
  console.log(`${basename(fileURLToPath(themesUrl))}/${filename}: ${values.size} tokens, references valid`);
}
