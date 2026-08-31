import { describe, expect, it } from "vitest";
import {
  compareApproaches,
  getBestApproach,
  getOrderedApproaches,
  getSolutionApproaches,
} from "./approaches";
import type { Solution, SolutionApproach } from "@/types";

const makeApproach = (
  id: string,
  score: number,
  characters: number,
): SolutionApproach => ({
  id,
  label: id,
  score,
  match: 100,
  characters,
  timestamp: "2026-08-31T12:00:00.000Z",
  tags: [],
  code: `<style>/* ${id} */`,
});

const legacySolution: Solution = {
  id: "target",
  name: "Target",
  type: "daily",
  score: 700,
  match: 100,
  characters: 120,
  colors: [],
  date: "2026-08-31",
  timestamp: "2026-08-31T12:00:00.000Z",
  tags: [],
  url: "https://cssbattle.dev/play/target",
  targetImage: "https://cssbattle.dev/targets/target.png",
  code: "<style>&{background:red}",
};

describe("solution approaches", () => {
  it("wraps a legacy solution without inventing a visible label", () => {
    expect(getSolutionApproaches(legacySolution)).toEqual([
      expect.objectContaining({
        id: "legacy",
        label: "",
        code: legacySolution.code,
      }),
    ]);
  });

  it("prefers a higher score", () => {
    const lower = makeApproach("lower", 700, 90);
    const higher = makeApproach("higher", 710, 130);

    expect(compareApproaches(higher, lower)).toBeGreaterThan(0);
    expect(getBestApproach([lower, higher])).toBe(higher);
  });

  it("uses fewer characters when scores are equal", () => {
    const longer = makeApproach("longer", 710, 130);
    const shorter = makeApproach("shorter", 710, 90);

    expect(getBestApproach([longer, shorter])).toBe(shorter);
  });

  it("keeps the current winner on an exact tie", () => {
    const first = makeApproach("first", 710, 90);
    const second = makeApproach("second", 710, 90);

    expect(getBestApproach([first, second])).toBe(first);
    expect(getBestApproach([first, second], second.id)).toBe(second);
  });

  it("replaces the current winner when another approach is strictly better", () => {
    const current = makeApproach("current", 710, 90);
    const improved = makeApproach("improved", 711, 120);

    expect(getBestApproach([current, improved], current.id)).toBe(improved);
  });

  it("places the best result first and keeps creation order for the rest", () => {
    const first = makeApproach("first", 700, 120);
    const best = makeApproach("best", 720, 140);
    const third = makeApproach("third", 710, 100);
    const solution = {
      ...legacySolution,
      approaches: [first, best, third],
      bestApproachId: best.id,
    };

    expect(getOrderedApproaches(solution).map((approach) => approach.id)).toEqual([
      "best",
      "first",
      "third",
    ]);
  });
});
