import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dailyDir = path.join(root, "data", "daily");
const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  });
}

function formatDailyName(date) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const textMatch = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{4})$/.exec(date);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `Daily Target — ${monthNames[Number(month) - 1]} ${Number(day)}, ${year}`;
  }

  if (textMatch) {
    const [, month, day, year] = textMatch;
    return `Daily Target — ${month} ${Number(day)}, ${year}`;
  }

  return null;
}

const fix = process.argv.includes("--fix");
const errors = [];
let fixed = 0;
for (const file of walk(dailyDir)) {
  const records = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const [index, record] of records.entries()) {
    const expectedName = formatDailyName(record.date);
    const label = `${path.relative(root, file)} record ${index + 1}`;
    if (!expectedName) {
      errors.push(`${label}: unsupported date format ${JSON.stringify(record.date)}`);
    } else if (record.name !== expectedName) {
      if (fix) {
        record.name = expectedName;
        changed = true;
        fixed += 1;
      } else {
        errors.push(`${label}: expected ${JSON.stringify(expectedName)}, received ${JSON.stringify(record.name)}`);
      }
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(records, null, 2)}\n`);
}

if (errors.length > 0) {
  console.error(`Daily data validation failed:\n${errors.join("\n")}`);
  process.exit(1);
}

console.log(fix ? `Repaired ${fixed} daily record name(s).` : "Daily data validation passed.");
