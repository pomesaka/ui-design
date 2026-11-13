import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { addedKind, parseContract, parseMapping, usedTokens, type AddedKind } from "./token-usage";

const root = new URL("../", import.meta.url);
const contract = parseContract(await readFile(new URL("tokens/contract.json", root), "utf8"));
const mapping = parseMapping(await readFile(new URL("tailwind/tokens.css", root), "utf8"));

test.each([
  ["a color utility", ["bg-primary text-primary-foreground"], ["primary", "primary-foreground"]],
  ["behind variants", ["hover:not-data-disabled:bg-primary-hover aria-[current=page]:bg-header-accent"], ["primary-hover", "header-accent"]],
  ["a type style without its line height and weight", ["text-action"], ["text-action"]],
  ["text color and type style apart", ["text-foreground text-body"], ["foreground", "text-body"]],
  ["a named size", ["h-control size-icon-action"], ["control-height", "icon-size-action"]],
  ["radius, shadow and easing", ["rounded-t-card shadow-md ease-release"], ["radius-card", "shadow-md", "ease-release"]],
  ["a direct reference", ["duration-(--duration-release) rounded-[calc(var(--radius-card)-var(--space-1))]"], ["space-1", "radius-card", "duration-release"]],
  ["several elements in contract order", ["rounded-field", "bg-card"], ["card", "radius-field"]],
  ["nothing for shared recipes, numeric spacing and unknown names", ["focus-visible:focus-ring disabled-dim p-4 gap-2 bg-transparent origin-(--transform-origin) border"], []],
])("lists the tokens of %s", (_case, classes, expected) => {
  expect(usedTokens(classes, mapping, contract)).toEqual(expected);
});

test("keeps a type style's line height and weight in the mapping", () => {
  expect(mapping.get("text")?.get("action")).toEqual(["text-action", "text-action-line-height", "weight-control"]);
});

// Stands in for CSS.supports with the three value shapes the cases use. Colors are keywords: this directory is checked for literal colors.
const supports = (property: string, value: string) =>
  ({ color: /^(gold|gray|black)$/, "font-size": /^[\d.]+px$/, "box-shadow": /^\d+ \d+px/ })[property]?.test(value) ?? false;

test.each([
  ["note-yellow", "gold", "color"],
  ["board-text-muted", "gray", "color"],
  ["board-shadow", "black", "color"],
  ["board-text-s", "12px", "text"],
  ["board-text-gantt-title", "14px", "text"],
  ["board-note-shadow", "0 1px 0 black", "shadow"],
  ["board-gap", "12px", "value"],
  ["context-shadow", "12px", "value"],
  ["board-text-family", "serif", "value"],
] satisfies [string, string, AddedKind][])("draws the added token %s (%s) as %s", (name, value, kind) => {
  expect(addedKind(name, value, supports)).toBe(kind);
});
