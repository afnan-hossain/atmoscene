import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../apps/lab/", import.meta.url)));
const host = process.env.ATMOSCENE_HOST || "127.0.0.1";
const port = Number(process.env.ATMOSCENE_PORT || 8790);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const requested = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const candidate = resolve(root, requested);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  return candidate;
}

const server = createServer(async (request, response) => {
  try {
    const target = safePath(request.url || "/");
    if (!target) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    let file = target;
    const info = await stat(file);
    if (info.isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": extname(file) === ".svg" ? "public, max-age=3600" : "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    response.end(body);
  } catch (error) {
    const status = error?.code === "ENOENT" ? 404 : 500;
    response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(status === 404 ? "Not found" : "Local server error");
  }
});

server.listen(port, host, () => {
  console.log(`Atmoscene local lab: http://${host}:${port}`);
});

