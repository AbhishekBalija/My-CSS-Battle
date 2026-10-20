import type { Solution, SolutionApproach } from "@/types";
import { getBestApproach } from "./approach-contract";

// Ranking rules live in the shared contract; re-exported for existing callers.
export { compareApproaches, getBestApproach } from "./approach-contract";

const LEGACY_APPROACH_ID = "legacy";

export function getSolutionApproaches(
  solution: Solution,
): SolutionApproach[] {
  if (solution.approaches?.length) {
    return solution.approaches;
  }

  return [
    {
      id: LEGACY_APPROACH_ID,
      label: "",
      score: solution.score,
      match: solution.match,
      characters: solution.characters,
      timestamp: solution.timestamp,
      tags: solution.tags,
      code: solution.code,
    },
  ];
}

export function getOrderedApproaches(solution: Solution): SolutionApproach[] {
  const approaches = getSolutionApproaches(solution);
  const best = getBestApproach(approaches, solution.bestApproachId);

  if (!best || approaches.length < 2) {
    return approaches;
  }

  return [best, ...approaches.filter((approach) => approach.id !== best.id)];
}
