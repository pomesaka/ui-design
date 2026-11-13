import { readdirSync } from "node:fs";
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

export default defineConfig({
  plugins: [react(), tailwindcss(), openCatalog],
  server: { host: "127.0.0.1", port: Number(process.env.CATALOG_PORT ?? 4318), strictPort: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: { input: ["catalog/index.html", "materials/index.html", ...examples] },
    // These are local tools, so one bundle per page is fine.
    chunkSizeWarningLimit: 1000,
  },
});
