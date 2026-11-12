import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "catalog",
  plugins: [react(), tailwindcss()],
  server: { host: "127.0.0.1", port: Number(process.env.CATALOG_PORT ?? 4318), strictPort: true },
  // The catalog is a local tool, so one bundle is fine.
  build: { outDir: "../dist/catalog", emptyOutDir: true, chunkSizeWarningLimit: 1000 },
});
