import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// The catalog, the materials and every screen example are separate pages of one dev server.
const examples = readdirSync("examples", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `examples/${entry.name}/index.html`);

const openCatalog: Plugin = {
  name: "open-catalog",
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (request.url !== "/") return next();
      response.statusCode = 302;
      response.setHeader("Location", "/catalog/");
      response.end();
    });
  },
};

// CATALOG_THEMES lists a project's theme CSS files (comma separated) to draw instead of themes/.
// Several files may share one [data-theme]: a project keeps the roles it adds beside the contract values.
const themePaths = process.env.CATALOG_THEMES
  ? process.env.CATALOG_THEMES.split(",").map((path) => resolve(path.trim()))
  : readdirSync("themes")
      .filter((name) => name.endsWith(".css"))
      .map((name) => resolve("themes", name));

const projectThemesId = "virtual:project-themes";

const projectThemes: Plugin = {
  name: "project-themes",
  resolveId: (id) => (id === projectThemesId ? `\0${projectThemesId}` : undefined),
  load(id) {
    if (id !== `\0${projectThemesId}`) return undefined;
    const declared: Record<string, string[]> = {};
    for (const path of themePaths) {
      const css = readFileSync(path, "utf8");
      const properties = [...css.matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].flatMap((match) => match[1] ?? []);
      for (const match of css.matchAll(/\[data-theme="([^"]+)"\]/g)) {
        const theme = match[1];
        if (theme !== undefined) declared[theme] = [...new Set([...(declared[theme] ?? []), ...properties])];
      }
    }
    return [
      ...themePaths.map((path) => `import ${JSON.stringify(path)};`),
      `export const declared = ${JSON.stringify(declared)};`,
      "export const themes = Object.keys(declared).sort();",
    ].join("\n");
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), openCatalog, projectThemes],
  server: {
    host: "127.0.0.1",
    port: Number(process.env.CATALOG_PORT ?? 4318),
    strictPort: true,
    fs: { allow: [".", ...themePaths.map((path) => dirname(path))] },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: { input: ["catalog/index.html", "materials/index.html", ...examples] },
    // These are local tools, so one bundle per page is fine.
    chunkSizeWarningLimit: 1000,
  },
});
