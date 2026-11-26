import { expect, test } from "bun:test";
import { closeRulePairs } from "./page-checks.mjs";

const rule = (element, y, left = 0, right = 400) => ({ element, edge: "top", y, left, right });

test.each([
  ["two rules nearer than the gap", [rule("a", 100), rule("b", 112)], 48, [["a", "b", 12]]],
  ["two rules on the same line", [rule("a", 100), rule("b", 100)], 48, [["a", "b", 0]]],
  ["two rules exactly the gap apart", [rule("a", 100), rule("b", 148)], 48, []],
  ["two rules farther than the gap", [rule("a", 100), rule("b", 300)], 48, []],
  ["a larger gap from the option", [rule("a", 100), rule("b", 160)], 80, [["a", "b", 60]]],
  ["rules side by side without horizontal overlap", [rule("a", 100, 0, 200), rule("b", 104, 200, 400)], 48, []],
  ["order of the input does not matter", [rule("b", 112), rule("a", 100)], 48, [["a", "b", 12]]],
  // Only the nearest rule below is paired, so three stacked rules give two pairs, not three.
  ["three stacked rules", [rule("a", 100), rule("b", 110), rule("c", 120)], 48, [["a", "b", 10], ["b", "c", 10]]],
  ["the nearest overlapping rule is paired, skipping one beside it", [rule("a", 100, 0, 200), rule("b", 105, 300, 400), rule("c", 110, 0, 200)], 48, [["a", "c", 10]]],
])("closeRulePairs: %s", (_label, rules, gap, expected) => {
  const pairs = closeRulePairs(rules, gap).map(({ upper, lower, distance }) => [upper.element, lower.element, distance]);
  expect(pairs).toEqual(expected);
});
