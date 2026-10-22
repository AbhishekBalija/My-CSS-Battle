import { describe, expect, it } from "vitest";
import {
  compareApproaches,
  getBestApproach,
  mirrorBestApproach,
  normalizeInsight,
  validateSolutionRecord,
} from "./approach-contract";
import type { Solution, SolutionApproach } from "@/types";

const makeApproach = (
  id: string,
  score: number,
  characters: number,
  extra: Partial<SolutionApproach> = {},
): SolutionApproach => ({
  id,
  label: id,
  score,
  match: 100,
  characters,
  timestamp: "2026-08-31T12:00:00.000Z",
  tags: [],
  code: `<style>/* ${id} */`,
  ...extra,
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

// Builds a valid named record so each test only changes the field it is about.
function makeRecord(approaches: SolutionApproach[]): Solution {
  return mirrorBestApproach(legacySolution, approaches);
}

const insightError = "approach 1: insight must be trimmed plain text with 1-200 characters";

describe("approach ranking", () => {
  it("prefers higher score", () => {
    const lower = makeApproach("lower", 700, 90);
    const higher = makeApproach("higher", 710, 130);
    expect(compareApproaches(higher, lower)).toBeGreaterThan(0);
    expect(getBestApproach([lower, higher])).toBe(higher);
  });

  it("prefers fewer characters on equal score", () => {
    const longer = makeApproach("longer", 710, 130);
    const shorter = makeApproach("shorter", 710, 90);
    expect(getBestApproach([longer, shorter])).toBe(shorter);
  });

  it("keeps current best on exact tie", () => {
    const first = makeApproach("first", 710, 90);
    const second = makeApproach("second", 710, 90);
    expect(getBestApproach([first, second])).toBe(first);
    expect(getBestApproach([first, second], second.id)).toBe(second);
  });
});

describe("normalizeInsight", () => {
  it("trims and collapses whitespace including line breaks", () => {
    expect(normalizeInsight("  a\n b  ")).toBe("a b");
  });

  it("treats blank and non-string values as no insight", () => {
    expect(normalizeInsight("   ")).toBeUndefined();
    expect(normalizeInsight(42)).toBeUndefined();
  });
});

describe("validateSolutionRecord", () => {
  it("accepts a legacy record", () => {
    expect(validateSolutionRecord(legacySolution)).toEqual([]);
  });

  it("accepts approach with 200-char insight", () => {
    const record = makeRecord([makeApproach("grid", 700, 90, { insight: "x".repeat(200) })]);
    expect(validateSolutionRecord(record)).toEqual([]);
  });

  it("rejects 201-char insight", () => {
    const record = makeRecord([makeApproach("grid", 700, 90, { insight: "x".repeat(201) })]);
    expect(validateSolutionRecord(record)).toContain(insightError);
  });

  it("rejects insight with line break", () => {
    const record = makeRecord([makeApproach("grid", 700, 90, { insight: "a\nb" })]);
    expect(validateSolutionRecord(record)).toContain(insightError);
  });

  it("rejects untrimmed or empty-string insight", () => {
    for (const insight of [" a", ""]) {
      const record = makeRecord([makeApproach("grid", 700, 90, { insight })]);
      expect(validateSolutionRecord(record)).toContain(insightError);
    }
  });

  it("rejects duplicate labels case-insensitively", () => {
    const record = makeRecord([
      makeApproach("a", 700, 90, { label: "grid" }),
      makeApproach("b", 690, 90, { label: "Grid" }),
    ]);
    expect(validateSolutionRecord(record)).toContain('approach 2: duplicate label "Grid"');
  });

  it("rejects more than 3 approaches", () => {
    const record = makeRecord(
      ["a", "b", "c", "d"].map((id, index) => makeApproach(id, 700 - index, 90)),
    );
    expect(validateSolutionRecord(record)).toContain("approaches cannot contain more than 3 items");
  });

  it("rejects bestApproachId not pointing at best", () => {
    const record = {
      ...makeRecord([makeApproach("best", 710, 90), makeApproach("worse", 700, 90)]),
      bestApproachId: "worse",
    };
    expect(validateSolutionRecord(record)).toContain('bestApproachId must point to "best"');
  });

  it("rejects top-level code not mirroring best", () => {
    const record = { ...makeRecord([makeApproach("grid", 700, 90)]), code: "<style>other" };
    expect(validateSolutionRecord(record)).toContain("top-level code must mirror the best approach");
  });
});

describe("mirrorBestApproach", () => {
  it("does not copy insight to top level", () => {
    const record = makeRecord([makeApproach("grid", 700, 90, { insight: "one line trick" })]);
    expect(record).not.toHaveProperty("insight");
    expect(record.bestApproachId).toBe("grid");
    expect(record.code).toBe("<style>/* grid */");
  });
});
