/** Token names by kind, as listed in tokens/contract.json. */
export type Contract = Record<string, string[]>;

export function parseContract(text: string): Contract {
  const data: unknown = JSON.parse(text);
  if (typeof data !== "object" || data === null) throw new Error("Token contract must be an object");
  const contract: Contract = {};
  for (const [kind, names] of Object.entries(data)) {
    if (!Array.isArray(names) || !names.every((name): name is string => typeof name === "string")) {
      throw new Error(`Token contract: ${kind} must be a list of names`);
    }
    contract[kind] = names;
  }
  return contract;
}

/**
 * Theme keys of tailwind/tokens.css per namespace, each with the tokens it
 * reads. The first is the token the utility is named after; the rest are its
 * modifiers (a type style's line height and weight).
 */
export type Mapping = Map<string, Map<string, string[]>>;

export function parseMapping(css: string): Mapping {
  const mapping: Mapping = new Map();
  // `--text-body--line-height` belongs to the `text-body` utility, so the modifier folds into its key.
  for (const [, namespace, key, value] of css.matchAll(/--(color|font|text|spacing|radius|shadow|ease)-([a-z0-9-]+?)(?:--[a-z-]+)?:\s*([^;]+);/g)) {
    if (namespace === undefined || key === undefined || value === undefined) continue;
    const tokens = [...value.matchAll(/var\(\s*--([a-z0-9-]+)/g)].flatMap(([, name]) => name ?? []);
    if (tokens.length === 0) continue;
    const keys = mapping.get(namespace) ?? new Map<string, string[]>();
    keys.set(key, [...(keys.get(key) ?? []), ...tokens]);
    mapping.set(namespace, keys);
  }
  return mapping;
}

// Tailwind does not expose which utilities read which theme namespace, so the
// prefixes are kept here. A utility missing from this list only leaves its
// token unlisted; it never lists a token the classes do not use.
const utilityPrefix: Record<string, RegExp> = {
  color: /^(?:bg|text|border(?:-[xytrblse])?|outline|ring|fill|stroke|divide|decoration|caret|accent|shadow|from|via|to)$/,
  font: /^font$/,
  text: /^text$/,
  spacing: /^(?:size|[wh]|(?:min|max)-[wh]|[pm][xytrblse]?|gap(?:-[xy])?|inset(?:-[xy])?|top|right|bottom|left|basis|space-[xy]|translate(?:-[xy])?)$/,
  radius: /^rounded(?:-[trblse]{1,2})?$/,
  shadow: /^shadow$/,
  ease: /^ease$/,
};

/**
 * Tokens that class strings name, in contract order: the token a mapped
 * utility is named after, and direct `--name` references.
 *
 * Left out on purpose, so a part's list shows what sets it apart: a type
 * style's line height and weight (they come with `text-*`), the shared
 * `focus-ring` / `disabled-dim` recipes (the same for every control), and
 * numeric spacing (`p-4` is a multiple of the base step, not a named token).
 */
export function usedTokens(classes: string[], mapping: Mapping, contract: Contract): string[] {
  const names = Object.values(contract).flat();
  const allowed = new Set(names);
  const found = new Set<string>();
  for (const text of classes) {
    for (const [, name] of text.matchAll(/--([a-z][a-z0-9-]*)/g)) {
      if (name !== undefined && allowed.has(name)) found.add(name);
    }
    for (const piece of text.split(/\s+/)) {
      // Variants end at the last colon; `!`, a leading minus and `/50` do not change the token.
      const base = piece.slice(piece.lastIndexOf(":") + 1).replace(/^[-!]+/, "").replace(/\/\d+$/, "");
      for (const [namespace, keys] of mapping) {
        const prefix = utilityPrefix[namespace];
        if (prefix === undefined) continue;
        for (const [key, tokens] of keys) {
          const named = tokens[0];
          if (named !== undefined && base.endsWith(`-${key}`) && prefix.test(base.slice(0, -key.length - 1))) found.add(named);
        }
      }
    }
  }
  return names.filter((name) => found.has(name));
}
