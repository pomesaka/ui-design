// Finds Playwright and launches Chromium for the review and setup scripts.
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";

// require() also honors NODE_PATH, which ESM import does not.
function findPlaywright() {
  const bases = [import.meta.url, `${process.cwd()}/`];
  try {
    // @playwright/cli ships its own playwright (seen in 2026-11); a project
    // without the dependency can still run these scripts where that CLI is installed.
    const finder = process.platform === "win32" ? "where" : "which";
    const cli = execFileSync(finder, ["playwright-cli"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n")[0]?.trim();
    if (cli) bases.push(realpathSync(cli));
  } catch {}
  for (const base of bases) {
    try {
      return createRequire(base)("playwright");
    } catch {}
  }
  return null;
}

/**
 * `channel` names an installed browser (chrome, msedge). Without it,
 * Playwright's own Chromium is used, and an installed Chrome when that
 * separate download is missing.
 */
export async function launchChromium(channel) {
  const playwright = findPlaywright();
  if (!playwright) {
    console.error("Playwright is not available. Install it (npm i -D playwright), install playwright-cli (npm i -g @playwright/cli), run from the package that has it, or set NODE_PATH to its node_modules.");
    process.exit(2);
  }
  if (channel) return playwright.chromium.launch({ channel });
  try {
    return await playwright.chromium.launch();
  } catch (error) {
    try {
      const browser = await playwright.chromium.launch({ channel: "chrome" });
      console.warn("! Playwright's own Chromium is not installed; using the installed Chrome (--channel chooses another)");
      return browser;
    } catch {
      throw error;
    }
  }
}
