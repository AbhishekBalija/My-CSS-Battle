import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const read = (relativePath) =>
  fs.readFileSync(path.join(dist, relativePath), "utf8");

assert.ok(fs.existsSync(dist), "dist/ is missing; run npm run build first");

const homepage = read("index.html");
assert.match(
  homepage,
  /<h1\b[^>]*>\s*CSSBattle Daily — CSS golf solutions and daily targets\s*<\/h1>/,
  "prerendered homepage must include a meaningful H1",
);

const jsonLdBlocks = [...homepage.matchAll(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
)].map((match) => JSON.parse(match[1]));
const homepageEntities = jsonLdBlocks.flatMap((block) =>
  Array.isArray(block) ? block : [block],
);
assert.ok(
  homepageEntities.some((entity) => entity["@type"] === "WebSite"),
  "homepage JSON-LD must identify the WebSite",
);
assert.ok(
  homepageEntities.some(
    (entity) =>
      entity["@type"] === "Person" && entity.name === "Abhishek Balija",
  ),
  "homepage JSON-LD must identify the archive author",
);

const llms = read("llms.txt");
assert.match(llms, /^# CSSBattle Daily$/m);
assert.match(llms, /^## When to use CSSBattle Daily$/m);
assert.match(llms, /\/openapi\.json/);
assert.match(llms, /do not infer or invent a solution/i);

const openapi = JSON.parse(read("openapi.json"));
assert.equal(openapi.openapi, "3.1.0");
assert.equal(
  openapi.paths["/api/daily/latest.json"].get.operationId,
  "getLatestDailySolution",
);
assert.equal(
  openapi.paths["/api/solutions.json"].get.operationId,
  "listArchivedSolutions",
);
for (const pathItem of Object.values(openapi.paths)) {
  assert.ok(pathItem.get.description, "every operation needs a description");
  assert.ok(
    pathItem.get.responses["200"].content["application/json"].schema,
    "every operation needs a typed JSON response",
  );
}

const latest = JSON.parse(read("api/daily/latest.json"));
const solutions = JSON.parse(read("api/solutions.json"));
assert.ok("generatedAt" in latest && "solution" in latest);
assert.equal(solutions.count, solutions.solutions.length);

console.log("Agent-readiness checks passed.");
