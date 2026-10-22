import { describe, expect, it } from "vitest";
import {
  buildApproachBreakdown,
  buildBattleSeries,
  buildRankSeries,
  heatmapLevelFor,
  heatmapThresholds,
  findBiggestCut,
  buildTechniqueBreakdown,
  buildWeeklyScores,
  computeStreaks,
} from "./analytics";
import type { Solution, SolutionApproach } from "@/types";

const makeSolution = (overrides: Partial<Solution>): Solution => ({
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
  url: "",
  targetImage: "",
  code: "<style>&{background:red}",
  ...overrides,
});

const makeApproach = (id: string, code: string): SolutionApproach => ({
  id,
  label: id,
  score: 700,
  match: 100,
  characters: 120,
  timestamp: "2026-08-31T12:00:00.000Z",
  tags: [],
  code,
});

describe("buildApproachBreakdown", () => {
  it("gives each solve exactly one approach, taken from its best approach", () => {
    const solution = makeSolution({
      bestApproachId: "b",
      approaches: [
        { ...makeApproach("a", "<style>&{background:red}"), score: 600 },
        { ...makeApproach("b", "<div></div><style>div{margin:9px}"), score: 700 },
      ],
    });

    const rows = buildApproachBreakdown([solution]);

    expect(rows).toEqual([
      { name: "single element", count: 1, fill: "var(--color-chart-1)" },
    ]);
  });

  it("never lists CSS features as approaches", () => {
    const names = buildApproachBreakdown([
      makeSolution({ code: "<style>&{--a:red;background:var(--a);filter:blur(1px)}" }),
    ]).map((row) => row.name);

    expect(names).not.toContain("css vars");
    expect(names).not.toContain("filter");
  });

  it("gives the first colour to the most used approach", () => {
    const rows = buildApproachBreakdown([
      makeSolution({ id: "1", code: "<style>&{background:red}" }),
      makeSolution({ id: "2", code: "<div></div><style>div{margin:0}" }),
      makeSolution({ id: "3", code: "<div></div><style>div{margin:0}" }),
    ]);

    expect(rows[0]).toMatchObject({ name: "single element", count: 2, fill: "var(--color-chart-1)" });
  });
});

describe("buildTechniqueBreakdown", () => {
  it("counts CSS features from every saved approach, once per solve", () => {
    const solution = makeSolution({
      approaches: [
        makeApproach("a", "<style>&{background:conic-gradient(red,blue)}"),
        makeApproach("b", "<style>&{background:conic-gradient(red,red);filter:blur(1px)}"),
      ],
    });

    const rows = buildTechniqueBreakdown([solution]);

    expect(rows.find((r) => r.name === "conic")?.count).toBe(1);
    expect(rows.map((r) => r.name)).toContain("filter");
  });

  it("leaves out the approach labels", () => {
    const names = buildTechniqueBreakdown([
      makeSolution({ code: "<style>&{background:linear-gradient(red,blue)}" }),
    ]).map((row) => row.name);

    expect(names).toContain("linear");
    expect(names).not.toContain("background only");
  });
});

describe("buildBattleSeries", () => {
  it("returns solved battles ordered by battle number", () => {
    const series = buildBattleSeries([
      makeSolution({ id: "b2", type: "battle", battleNumber: 2, characters: 90 }),
      makeSolution({ id: "b1", type: "battle", battleNumber: 1, characters: 80 }),
      makeSolution({ id: "b3", type: "battle", battleNumber: 3, score: 0 }),
    ]);

    expect(series.map((b) => b.battleNumber)).toEqual([1, 2]);
    expect(series[0]?.chars).toBe(80);
  });
});

describe("findBiggestCut", () => {
  const withApproaches = (id: string, steps: [string, number, number][]) =>
    makeSolution({
      id,
      approaches: steps.map(([time, score, characters], i) => ({
        ...makeApproach(`a${i}`, "<style>"),
        timestamp: time,
        score,
        characters,
      })),
    });

  it("picks the solve where the best approach saved the most chars over the first one", () => {
    const cut = findBiggestCut([
      withApproaches("small", [["2026-09-01", 700, 120], ["2026-09-02", 710, 110]]),
      withApproaches("big", [["2026-09-01", 650, 200], ["2026-09-03", 720, 150]]),
    ]);

    expect(cut).toMatchObject({ from: 200, to: 150 });
    expect(cut?.solution.id).toBe("big");
  });

  it("ignores solves where the first approach was already the best", () => {
    const cut = findBiggestCut([
      withApproaches("worse-later", [["2026-09-01", 720, 100], ["2026-09-02", 650, 180]]),
    ]);

    expect(cut).toBeNull();
  });
});

describe("buildWeeklyScores", () => {
  it("averages solved dailies per week, weeks starting on Sunday", () => {
    const weeks = buildWeeklyScores([
      makeSolution({ id: "sun", date: "2026-10-11", score: 600 }),
      makeSolution({ id: "sat", date: "2026-10-17", score: 700 }),
      makeSolution({ id: "next-sun", date: "2026-10-18", score: 650 }),
    ]);

    expect(weeks).toEqual([
      { weekStart: "2026-10-11", avgScore: 650, solved: 2 },
      { weekStart: "2026-10-18", avgScore: 650, solved: 1 },
    ]);
  });

  it("skips unsolved dailies", () => {
    const weeks = buildWeeklyScores([
      makeSolution({ id: "a", date: "2026-10-12", score: 700 }),
      makeSolution({ id: "b", date: "2026-10-13", score: 0 }),
    ]);

    expect(weeks).toEqual([{ weekStart: "2026-10-11", avgScore: 700, solved: 1 }]);
  });
});

describe("buildRankSeries", () => {
  it("keeps the last snapshot of each day, oldest day first", () => {
    const series = buildRankSeries([
      { rank: 900, snapshotDate: "2026-10-02T08:00:00.000Z" },
      { rank: 1000, snapshotDate: "2026-10-01T08:00:00.000Z" },
      { rank: 950, snapshotDate: "2026-10-01T20:00:00.000Z" },
    ]);

    expect(series).toEqual([
      { date: "2026-10-01", rank: 950 },
      { date: "2026-10-02", rank: 900 },
    ]);
  });
});

describe("heatmap levels", () => {
  it("splits your own char counts into quarters", () => {
    expect(heatmapThresholds([100, 120, 140, 160, 180, 200, 220, 240])).toEqual([
      120, 160, 200,
    ]);
  });

  it("gives the shortest quarter the strongest colour", () => {
    const t: [number, number, number] = [120, 160, 200];

    expect(heatmapLevelFor(110, t)).toBe(4);
    expect(heatmapLevelFor(150, t)).toBe(3);
    expect(heatmapLevelFor(190, t)).toBe(2);
    expect(heatmapLevelFor(300, t)).toBe(1);
  });
});

describe("computeStreaks", () => {
  const now = new Date("2026-10-22T10:00:00.000Z");
  const daily = (date: string) => makeSolution({ id: date, date });

  it("counts consecutive days up to today", () => {
    const dailies = ["2026-10-20", "2026-10-21", "2026-10-22"].map(daily);
    expect(computeStreaks(dailies, [], now)).toEqual({ current: 3, longest: 3 });
  });

  it("breaks the streak on a missing day", () => {
    const dailies = ["2026-10-17", "2026-10-18", "2026-10-19", "2026-10-21", "2026-10-22"].map(daily);
    expect(computeStreaks(dailies, [], now)).toEqual({ current: 2, longest: 3 });
  });

  it("counts a day played on CSSBattle even without its code", () => {
    const dailies = ["2026-10-20", "2026-10-22"].map(daily);
    expect(computeStreaks(dailies, ["2026-10-21"], now)).toEqual({ current: 3, longest: 3 });
  });

  it("doesn't break the current streak when today isn't played yet", () => {
    const dailies = ["2026-10-20", "2026-10-21"].map(daily);
    expect(computeStreaks(dailies, [], now).current).toBe(2);
  });
});
