import type { Solution, SolutionApproach } from "@/types";

const LEGACY_APPROACH_ID = "legacy";

export function compareApproaches(
  candidate: SolutionApproach,
  current: SolutionApproach,
): number {
  if (candidate.score !== current.score) {
    return candidate.score - current.score;
  }

  if (candidate.characters !== current.characters) {
    return current.characters - candidate.characters;
  }

  return 0;
}

export function getBestApproach(
  approaches: readonly SolutionApproach[],
  currentBestId?: string,
): SolutionApproach | null {
  let best =
    approaches.find((approach) => approach.id === currentBestId) ?? null;

  for (const approach of approaches) {
    if (!best || compareApproaches(approach, best) > 0) {
      best = approach;
    }
  }

  return best;
}

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
