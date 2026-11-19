// Which surface / foreground pairs contrast.mjs measures, and how it prints
// them. Kept apart from the browser so the choices can be tested directly.

// Secondary text roles that have no `X-foreground` partner of their own.
const supportingPairs = [
  ["background", "foreground"],
  ["background", "reading-secondary"], ["card", "reading-secondary"],
  ["background", "muted-foreground"], ["card", "muted-foreground"],
  ["background", "control-foreground"], ["card", "control-foreground"],
  ["header", "header-muted-foreground"],
];

const tokenName = /^[a-z0-9-]+$/;

// "surface/foreground,..." → { pairs } or { invalid } listing the bad items.
export function parsePairs(text) {
  const items = text.split(",").map((item) => item.trim());
  const pairs = [];
  const invalid = [];
  for (const item of items) {
    const names = item.split("/").map((name) => name.trim());
    if (names.length === 2 && names.every((name) => tokenName.test(name))) pairs.push(names);
    else invalid.push(item);
  }
  return invalid.length > 0 ? { invalid } : { pairs };
}

// Requested pairs are measured alone, so an outline run with --min 3 does not
// judge text pairs by 3. Without a request: every declared `X` / `X-foreground`
// and the supporting pairs whose both names are declared.
export function selectPairs(declared, requested) {
  if (requested) return requested;
  const names = new Set(declared);
  const pairs = [...names].filter((name) => names.has(`${name}-foreground`)).map((name) => [name, `${name}-foreground`]);
  for (const pair of supportingPairs) {
    if (names.has(pair[0]) && names.has(pair[1]) && !pairs.some(([s, f]) => s === pair[0] && f === pair[1])) pairs.push(pair);
  }
  return pairs;
}

// Requested names the page does not declare. A typo would otherwise drop the
// pair and report a pass.
export function findUndeclared(declared, pairs) {
  const names = new Set(declared);
  return [...new Set(pairs.flat())].filter((name) => !names.has(name));
}

export function meetsMinimum(ratio, min) {
  return ratio >= min;
}

// Same order as --pairs, so a border pair does not read as the surface.
export function formatHeader(theme) {
  return `${theme ?? "(page theme)"}  ratio  surface / foreground`;
}

export function formatLine([surface, foreground], ratio, ok) {
  return `${ok ? "  " : "! "}${ratio.toFixed(2).padStart(6)}  ${surface} / ${foreground}`;
}
