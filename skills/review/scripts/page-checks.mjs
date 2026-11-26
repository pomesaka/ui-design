// Checks that capture.mjs runs on each captured page. A review script that
// reaches a state by operating the page can run the same ones:
//   import { visibleText } from "<this directory>/page-checks.mjs";
//   const text = await page.evaluate(visibleText);
// visibleText and collectRules run in the page, so they reference nothing
// outside their own bodies.

/**
 * Runs in the page. The text a reader can see, as `innerText` lays it out.
 * innerText also returns what is not on screen: the content of a section
 * collapsed to zero size, `inert` and `aria-hidden="true"` subtrees, and every
 * option of a closed select. Those are hidden while innerText is read, then
 * restored. A closed select is read as its selected option: innerText lists
 * the options even when they are hidden, so the select is swapped for that text.
 */
export function visibleText() {
  const hidden = new Set(document.body.querySelectorAll('[inert], [aria-hidden="true"]'));
  const standIns = [];
  for (const select of document.body.querySelectorAll("select")) {
    // A list box shows all its options; a dropdown only the selected one.
    if (select.multiple || select.size > 1) continue;
    const standIn = document.createElement("span");
    standIn.textContent = select.selectedOptions[0]?.textContent ?? "";
    select.after(standIn);
    standIns.push(standIn);
    hidden.add(select);
  }
  for (const element of document.body.querySelectorAll("*")) {
    if (element.tagName === "BR" || element.tagName === "WBR" || element.tagName === "OPTION") continue;
    const style = getComputedStyle(element);
    if (style.display === "contents") continue;
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) continue;
    // A zero-size box clips its content only when it does not let it overflow;
    // with overflow visible (an anchor for absolutely placed children) the text shows.
    if (style.overflowX !== "visible" || style.overflowY !== "visible") hidden.add(element);
  }
  const restore = [];
  for (const element of hidden) {
    if (!(element instanceof HTMLElement)) continue;
    restore.push([element, element.style.getPropertyValue("display"), element.style.getPropertyPriority("display")]);
    element.style.setProperty("display", "none", "important");
  }
  try {
    return document.body.innerText.split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
  } finally {
    for (const [element, value, priority] of restore) element.style.setProperty("display", value, priority);
    for (const standIn of standIns) standIn.remove();
  }
}

/**
 * Runs in the page. The horizontal rules at least half the viewport wide:
 * `hr` and the top and bottom borders of elements. An element that also has a
 * left or right border draws a box (a card, a field), not a rule, and is left out.
 * Coordinates are in document pixels.
 */
export function collectRules() {
  const half = window.innerWidth / 2;
  const transparent = (color) => color === "transparent" || /,\s*0\)$/.test(color) || /\/\s*0\)$/.test(color);
  const drawn = (style, side) =>
    parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
    !["none", "hidden"].includes(style.getPropertyValue(`border-${side}-style`)) &&
    !transparent(style.getPropertyValue(`border-${side}-color`));
  const describe = (element) => {
    const id = element.id ? `#${element.id}` : "";
    const classes = [...element.classList].slice(0, 3).map((name) => `.${name}`).join("");
    const text = (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 20);
    return `${element.tagName.toLowerCase()}${id}${classes}${text ? ` "${text}"` : ""}`;
  };
  const rules = [];
  for (const element of document.body.querySelectorAll("*")) {
    const rect = element.getBoundingClientRect();
    if (rect.width < half || rect.height === 0 && element.tagName !== "HR") continue;
    const style = getComputedStyle(element);
    if (style.visibility !== "visible" || parseFloat(style.opacity) === 0) continue;
    const left = Math.round(rect.left + window.scrollX);
    const right = Math.round(rect.right + window.scrollX);
    const top = rect.top + window.scrollY;
    const name = describe(element);
    if (element.tagName === "HR") {
      rules.push({ element: name, edge: "middle", y: Math.round(top + rect.height / 2), left, right });
      continue;
    }
    if (drawn(style, "left") || drawn(style, "right")) continue;
    if (drawn(style, "top")) rules.push({ element: name, edge: "top", y: Math.round(top), left, right });
    if (drawn(style, "bottom")) rules.push({ element: name, edge: "bottom", y: Math.round(top + rect.height), left, right });
  }
  return rules;
}

/**
 * Pairs each rule with the nearest rule below it that overlaps it
 * horizontally, when the two are less than `gap` pixels apart. Two rules that
 * close read as one doubled line, or as a strip with no content in it.
 */
export function closeRulePairs(rules, gap) {
  const sorted = [...rules].sort((a, b) => a.y - b.y);
  const pairs = [];
  sorted.forEach((upper, index) => {
    const lower = sorted.slice(index + 1).find((rule) => Math.min(upper.right, rule.right) > Math.max(upper.left, rule.left));
    if (lower && lower.y - upper.y < gap) pairs.push({ upper, lower, distance: lower.y - upper.y });
  });
  return pairs;
}
