// Typed entry point for the shared approach contract.
// The rules live in shared/approach-contract.js so the extension can use the
// exact same file; this wrapper only adds TypeScript types.
import "../../shared/approach-contract.js";
import type { Solution, SolutionApproach } from "@/types";

interface ApproachContract {
  MAX_APPROACHES: number;
  LABEL_MAX: number;
  INSIGHT_MAX: number;
  compareApproaches(candidate: SolutionApproach, current: SolutionApproach): number;
  getBestApproach(
    approaches: readonly SolutionApproach[],
    currentBestId?: string,
  ): SolutionApproach | null;
  normalizeLabel(label: string): string;
  normalizeInsight(value: unknown): string | undefined;
  mirrorBestApproach(solution: Solution, approaches: SolutionApproach[]): Solution;
  validateSolutionRecord(record: Solution): string[];
}

declare global {
  var __cssbattleApproachContract: ApproachContract;
}

const contract = globalThis.__cssbattleApproachContract;

export const {
  MAX_APPROACHES,
  LABEL_MAX,
  INSIGHT_MAX,
  compareApproaches,
  getBestApproach,
  normalizeLabel,
  normalizeInsight,
  mirrorBestApproach,
  validateSolutionRecord,
} = contract;
