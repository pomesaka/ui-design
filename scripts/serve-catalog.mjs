import { readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const themes = (await readdir(new URL("themes/", root)))
  .filter((file) => /^[a-z0-9-]+\.css$/.test(file)).map((file) => file.slice(0, -4)).sort();
const assets = new Map([
  ["/", "catalog/index.html"], ["/catalog/", "catalog/index.html"],
  ...["catalog/index.html", "catalog/catalog.css", "catalog/catalog.js", "components/controls.css", ...themes.map((name) => `themes/${name}.css`)]
    .map((file) => [`/${file}`, file]),
]);
const port = Number(process.env.CATALOG_PORT ?? 4318);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid CATALOG_PORT");
const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    const pathname = new URL(request.url).pathname;
    if (pathname === "/catalog/themes.json") return Response.json(themes, { headers: { "Cache-Control": "no-store" } });
    const path = assets.get(pathname);
    if (path === undefined) return new Response("Not found", { status: 404 });
    const file = Bun.file(new URL(path, root));
    if (!(await file.exists())) return new Response("Asset missing", { status: 404 });
    return new Response(request.method === "HEAD" ? null : file, { headers: { "Content-Type": file.type, "Cache-Control": "no-store" } });
  },
});
console.log(`Catalog: http://127.0.0.1:${server.port}`);
