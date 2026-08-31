import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  });
}

function compareApproaches(candidate, current) {
  if (candidate.score !== current.score) return candidate.score - current.score;
  if (candidate.characters !== current.characters) {
    return current.characters - candidate.characters;
  }
  return 0;
}

function getBestApproach(approaches, currentBestId) {
  let best = approaches.find((approach) => approach.id === currentBestId)
    ?? approaches[0];
  for (const approach of approaches) {
    if (compareApproaches(approach, best) > 0) best = approach;
  }
  return best;
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const errors = [];

for (const file of walk(dataDir)) {
  const records = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(records)) continue;

  for (const [index, solution] of records.entries()) {
    const label = `${path.relative(root, file)} record ${index + 1}`;
    const hasApproaches = Object.hasOwn(solution, "approaches");
    const hasBestId = Object.hasOwn(solution, "bestApproachId");

    if (!hasApproaches && !hasBestId) continue;
    if (!hasApproaches || !hasBestId) {
      errors.push(`${label}: approaches and bestApproachId must be stored together`);
      continue;
    }
    if (!Array.isArray(solution.approaches) || solution.approaches.length === 0) {
      errors.push(`${label}: approaches must be a non-empty array`);
      continue;
    }
    if (solution.approaches.length > 3) {
      errors.push(`${label}: approaches cannot contain more than 3 items`);
    }

    const ids = new Set();
    const labels = new Set();
    for (const [approachIndex, approach] of solution.approaches.entries()) {
      const approachLabel = `${label} approach ${approachIndex + 1}`;
      if (typeof approach.id !== "string" || approach.id.trim() === "") {
        errors.push(`${approachLabel}: id must be a non-empty string`);
      } else if (ids.has(approach.id)) {
        errors.push(`${approachLabel}: duplicate id ${JSON.stringify(approach.id)}`);
      } else {
        ids.add(approach.id);
      }

      const normalizedLabel = typeof approach.label === "string"
        ? approach.label.trim().toLocaleLowerCase("en")
        : "";
      if (!normalizedLabel || approach.label.length > 80 || approach.label !== approach.label.trim()) {
        errors.push(`${approachLabel}: label must be trimmed and contain 1-80 characters`);
      } else if (labels.has(normalizedLabel)) {
        errors.push(`${approachLabel}: duplicate label ${JSON.stringify(approach.label)}`);
      } else {
        labels.add(normalizedLabel);
      }

      for (const field of ["score", "match", "characters"]) {
        if (typeof approach[field] !== "number" || !Number.isFinite(approach[field])) {
          errors.push(`${approachLabel}: ${field} must be a finite number`);
        }
      }
      if (typeof approach.code !== "string" || approach.code.length === 0) {
        errors.push(`${approachLabel}: code must be a non-empty string`);
      }
      if (typeof approach.timestamp !== "string" || approach.timestamp.length === 0) {
        errors.push(`${approachLabel}: timestamp must be a non-empty string`);
      }
      if (!Array.isArray(approach.tags)) {
        errors.push(`${approachLabel}: tags must be an array`);
      }
    }

    const best = getBestApproach(solution.approaches, solution.bestApproachId);
    if (solution.bestApproachId !== best.id) {
      errors.push(`${label}: bestApproachId must point to ${JSON.stringify(best.id)}`);
    }

    for (const field of ["score", "match", "characters", "timestamp", "tags", "code"]) {
      if (!sameValue(solution[field], best[field])) {
        errors.push(`${label}: top-level ${field} must mirror the best approach`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Solution approach validation failed:\n${errors.join("\n")}`);
  process.exit(1);
}

console.log("Solution approach validation passed.");
