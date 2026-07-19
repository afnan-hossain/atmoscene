import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../apps");
const pages = [
  "lab/index.html",
  "library/index.html",
  "library/catalog.html",
  "library/daylight-sun/index.html",
  "library/night-moon/index.html",
  "library/clouds/index.html",
  "library/rain/index.html",
  "library/storms/index.html",
  "library/wind/index.html",
  "library/fog-haze/index.html",
  "library/snow-ice/index.html",
  "library/aurora-polar/index.html",
  "library/tropical-marine/index.html",
  "library/dust-smoke-ash/index.html",
  "library/rare-celestial/index.html",
  "docs/index.html",
  "docs/api/index.html",
  "api/demo/index.html",
];

const failures = [];
const canonicals = [];
const values = { titles: new Map(), descriptions: new Map(), canonicals: new Map() };
const match = (html, pattern) => html.match(pattern)?.[1]?.trim() || "";

for (const page of pages) {
  const html = await readFile(resolve(root, page), "utf8");
  const title = match(html, /<title>([^<]+)<\/title>/i);
  const description = match(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const canonical = match(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const robots = match(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const h1Count = (html.match(/<h1(?:\s[^>]*)?>/gi) || []).length;

  if (!title || title.length > 65) failures.push(`${page}: missing or overly long title (${title.length})`);
  if (!description || description.length < 70 || description.length > 180) failures.push(`${page}: description should be 70–180 characters (${description.length})`);
  if (!canonical.startsWith("https://")) failures.push(`${page}: missing HTTPS canonical`);
  if (!robots.includes("index") || robots.includes("noindex")) failures.push(`${page}: expected indexable robots directive`);
  if (h1Count !== 1) failures.push(`${page}: expected one H1, found ${h1Count}`);

  for (const script of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(script[1]); } catch (error) { failures.push(`${page}: invalid JSON-LD (${error.message})`); }
  }

  for (const [kind, value] of Object.entries({ titles: title, descriptions: description, canonicals: canonical })) {
    if (values[kind].has(value)) failures.push(`${page}: duplicate ${kind.slice(0, -1)} with ${values[kind].get(value)}`);
    values[kind].set(value, page);
  }
  canonicals.push(canonical);
}

const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
for (const canonical of canonicals) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) failures.push(`sitemap.xml: missing ${canonical}`);
}

if (failures.length) {
  console.error(`SEO checks failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`SEO checks passed for ${pages.length} indexable pages.`);
