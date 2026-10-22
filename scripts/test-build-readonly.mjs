// Fails if `bun run build` changes anything git can see.
// The build should only validate data and write the ignored dist/ folder;
// data repair and image sync are separate commands you run on purpose.
import { execSync } from "node:child_process";

const status = () =>
  execSync("git status --porcelain --untracked-files=all", { encoding: "utf8" });

const before = status();
execSync("bun run build", { stdio: "inherit" });
const after = status();

if (before !== after) {
  console.error("Build changed files git tracks or sees:");
  console.error(`--- before\n${before || "(clean)\n"}--- after\n${after}`);
  process.exit(1);
}

console.log("Build is read-only.");
