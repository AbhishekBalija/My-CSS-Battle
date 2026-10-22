import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../shared/approach-contract.js";

const { validateSolutionRecord } = globalThis.__cssbattleApproachContract;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Optional --data <dir> lets tests point the validator at fixture files.
const dataFlag = process.argv.indexOf("--data");
const dataDir = dataFlag === -1
  ? path.join(root, "data")
  : path.resolve(process.argv[dataFlag + 1]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  });
}

const errors = [];

for (const file of walk(dataDir)) {
  const records = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(records)) continue;

  const relativeFile = path.relative(root, file);
  const dailyFileMatch = relativeFile.match(
    /^data\/daily\/(\d{4})\/(\d{2})-[a-z]+\.json$/,
  );

  for (const [index, solution] of records.entries()) {
    const label = `${relativeFile} record ${index + 1}`;

    // The month check depends on the file path, so it stays here.
    if (dailyFileMatch) {
      const expectedMonth = `${dailyFileMatch[1]}-${dailyFileMatch[2]}`;
      if (typeof solution.date !== "string" || !solution.date.startsWith(`${expectedMonth}-`)) {
        errors.push(`${label}: date must belong to ${expectedMonth}`);
      }
    }

    for (const error of validateSolutionRecord(solution)) {
      errors.push(`${label}: ${error}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Solution approach validation failed:\n${errors.join("\n")}`);
  process.exit(1);
}

console.log("Solution approach validation passed.");
