import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { findUndeclared, formatHeader, formatLine, meetsMinimum, parsePairs, selectPairs } from "../skills/setup/scripts/contrast-pairs.mjs";

test.each([
  ["one pair keeps surface first", "background/border", { pairs: [["background", "border"]] }],
  ["several pairs", "background/border,card/card-foreground", { pairs: [["background", "border"], ["card", "card-foreground"]] }],
  ["spaces around names", " background / border ", { pairs: [["background", "border"]] }],
  ["no slash", "primary", { invalid: ["primary"] }],
  ["three names", "a/b/c", { invalid: ["a/b/c"] }],
  ["empty surface", "/b", { invalid: ["/b"] }],
  ["empty foreground", "a/", { invalid: ["a/"] }],
  ["trailing comma", "a/b,", { invalid: [""] }],
  ["every bad item", "primary,a/b,x", { invalid: ["primary", "x"] }],
])("parsePairs: %s", (_label, text, expected) => {
  expect(parsePairs(text)).toEqual(expected);
});

const declared = ["background", "foreground", "border", "primary", "primary-foreground", "reading-secondary", "control-foreground", "service-alert", "service-alert-foreground"];

test.each([
  ["requested pairs alone", [["background", "border"]], [["background", "border"]]],
  ["automatic pairs without a request", undefined, [
    ["primary", "primary-foreground"],
    ["service-alert", "service-alert-foreground"],
    ["background", "foreground"],
    ["background", "reading-secondary"],
    ["background", "control-foreground"],
  ]],
])("selectPairs: %s", (_label, requested, expected) => {
  expect(selectPairs(declared, requested)).toEqual(expected);
});

test.each([
  ["all declared", [["background", "border"]], []],
  ["surface missing", [["page", "border"]], ["page"]],
  ["foreground missing", [["background", "edge"]], ["edge"]],
  ["each name once", [["background", "edge"], ["page", "edge"]], ["edge", "page"]],
])("findUndeclared: %s", (_label, pairs, expected) => {
  expect(findUndeclared(declared, pairs)).toEqual(expected);
});

test.each([
  [4.49, 4.5, false],
  [4.5, 4.5, true],
  [3, 3, true],
  [2.99, 3, false],
])("meetsMinimum(%p, %p) is %p", (ratio, min, expected) => {
  expect(meetsMinimum(ratio, min)).toBe(expected);
});

test("prints pairs in the --pairs order, surface first", () => {
  expect(formatHeader("luma-light")).toBe("luma-light  ratio  surface / foreground");
  expect(formatLine(["background", "border"], 3.2, true)).toBe("    3.20  background / border");
  expect(formatLine(["background", "border"], 2.5, false)).toBe("!   2.50  background / border");
});

// Argument errors stop before a browser is needed.
const script = fileURLToPath(new URL("../skills/setup/scripts/contrast.mjs", import.meta.url));
test.each([
  ["malformed --pairs", ["--pairs", "primary"], /--pairs takes surface\/foreground.*primary/],
  ["non-numeric --min", ["--min", "abc"], /--min takes a number: abc/],
  ["empty --min", ["--min", ""], /--min takes a number/],
])("contrast.mjs rejects %s with exit 2", (_label, extra, reason) => {
  const result = spawnSync(process.execPath, [script, "http://localhost:1", ...extra], { encoding: "utf8" });
  expect(result.status).toBe(2);
  expect(result.stderr).toMatch(reason);
});
